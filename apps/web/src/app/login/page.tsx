// app/login/page.tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const looksLikeEmail = (s: string) => /\S+@\S+\.\S+/.test(s);

export default function LoginPage() {
  const router = useRouter();

  const [loginText, setLoginText] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // พื้นหลัง: หิมะเต็มจอ
  const snowRef = useRef<HTMLCanvasElement | null>(null);

  // username -> email (RPC)
  const resolveEmail = useCallback(async (input: string): Promise<string> => {
    const raw = (input || "").trim();
    if (looksLikeEmail(raw)) return raw.toLowerCase();
    try {
      const { data, error } = await supabase.rpc("resolve_login_email", { _login: raw });
      if (error) throw error;
      if (typeof data === "string" && data.includes("@")) return data.trim().toLowerCase();
      return raw.toLowerCase();
    } catch {
      return raw.toLowerCase();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMsg("⏳ กำลังเข้าสู่ระบบ...");

    try {
      const email = await resolveEmail(loginText);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMsg("❌ " + (error.message || "เข้าสู่ระบบไม่สำเร็จ"));
        setLoading(false);
        return;
      }
      try { await supabase.rpc("ensure_profile", { uid: data.user?.id }); } catch {}
      try { await supabase.rpc("grant_or_confirm_trial", { uid: data.user?.id, days: 7 }); } catch {}
      setMsg("✅ เข้าสู่ระบบสำเร็จ: " + (data.user?.email ?? email));
      router.replace("/dashboard");
    } catch (err: any) {
      setMsg("❌ " + (err?.message ?? "เกิดข้อผิดพลาดที่ไม่รู้จัก"));
      setLoading(false);
    }
  };

  // ถ้ามี session แล้วไปแดชบอร์ด
  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      if (res.data.user) router.replace("/dashboard");
    });
  }, [router]);

  // ===== Snow FX (พื้นหลังอย่างเดียว) =====
  useEffect(() => {
    const canvas = snowRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const size = () => {
      const w = window.innerWidth;
      const h = Math.max(680, window.innerHeight);
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    size();
    const onResize = () => size();
    window.addEventListener("resize", onResize);

    const prefersReduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    type Flake = {
      x: number; y: number; z: number;
      r: number; vy: number; swayAmp: number; swayFreq: number; phase: number; twinkle: number;
    };

    const WIND_MAX = 0.45 * DPR;
    let wind = 0, windTarget = 0, t = 0;
    let flakes: Flake[] = [];

    const spawn = (): Flake => {
      const z = Math.random();
      const r = (0.9 + z * 2.4) * DPR;
      const vy = (0.32 + z * 1.05) * DPR;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z,
        r,
        vy,
        swayAmp: (2 + Math.random() * 10) * DPR,
        swayFreq: 0.5 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.5 + Math.random() * 0.45,
      };
    };

    const init = () => {
      const base = Math.floor((canvas.width / DPR) * (canvas.height / DPR) / 12000);
      const count = Math.min(280, prefersReduce ? Math.max(70, Math.floor(base * 0.5)) : base + 100);
      flakes = Array.from({ length: count }, () => spawn());
    };
    init();

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const w = canvas.width, h = canvas.height;
      t += 0.016;

      if (Math.random() < 0.006) windTarget = (Math.random() * 2 - 1) * WIND_MAX;
      wind += (windTarget - wind) * 0.01;

      // พื้นหลังทึบเข้มมากๆ เพื่อให้หิมะเด่น
      ctx.fillStyle = "#050607";
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        const sway = Math.sin(t * f.swayFreq + f.phase) * f.swayAmp + wind * (0.6 + f.z * 0.8);
        f.y += f.vy * (0.78 + f.z * 0.72);
        f.x += sway * 0.02;

        if (f.y - f.r > h) {
          flakes[i] = { ...f, x: Math.random() * w, y: -f.r - Math.random() * 40, phase: Math.random() * Math.PI * 2 };
        }
        if (f.x < -20) f.x = w + 20;
        if (f.x > w + 20) f.x = -20;

        const alpha = Math.max(0.14, f.twinkle + Math.sin(t * (0.8 + f.z)) * 0.16);

        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 2.6);
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(1, `rgba(180,200,255,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 2.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(f.x, f.y, Math.max(0.6, f.r * 0.9), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,250,255,${alpha})`;
        ctx.fill();
      }
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <main className="login-root">
      {/* BG: หิมะอย่างเดียว */}
      <canvas ref={snowRef} className="snow" aria-hidden="true" />

      <section className="center">
        <div className="card">
          {/* Header: “เข้าสู่ระบบ” (ไม่มีปุ่ม X) */}
          <div className="card-head">
            <div className="brand">เข้าสู่ระบบ</div>
          </div>

          <div className="sub">
            A broken wing simply means, you have to find another way to fly
          </div>

          {/* ฟอร์ม */}
          <form onSubmit={handleLogin} className="form">
            <input
              type="text"
              placeholder="อีเมล หรือ Username"
              required
              value={loginText}
              onChange={(e) => setLoginText(e.target.value)}
              autoComplete="username"
              className="input"
            />

            <div className="input-wrap">
              <input
                type={show ? "text" : "password"}
                placeholder="รหัสผ่าน"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="input pr"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="eye-btn"
                aria-label={show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {show ? "🙈 Hide" : "👁 Show"}
              </button>
            </div>

            {/* แถวเดียว: ลืมรหัสผ่าน + สมัครใช้งาน (กึ่งกลาง) */}
            <div className="inline-links">
              <span>ลืมรหัสผ่าน ? </span>
              <Link href="/reset-by-serial" className="tiny-link">คลิกที่นี่</Link>
              <span className="dot">•</span>
              <Link href="/signup" className="tiny-link">สมัครใช้งาน</Link>
            </div>

            {/* ปุ่มหลัก: login เต็มความกว้าง */}
            <button className="btn primary full" type="submit" disabled={loading}>
              {loading ? "กำลังเข้า..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          {!!msg && <div className="status">{msg}</div>}
        </div>
      </section>

      {/* Styles เฉพาะหน้านี้ */}
      <style jsx>{`
        :root{
          --panel:#121a2a; --text:#e6eeff; --muted:#a9b6d6;
          --line:rgba(255,255,255,0.10); --accent:#3d66ff;
        }
        *{box-sizing:border-box}
        html,body{height:100%}
        body{
          margin:0;
          color:var(--text);
          font-family:Inter,system-ui,-apple-system,"Segoe UI","Noto Sans Thai",sans-serif;
          background:#050607; /* กันจอว่างตอน canvas ยังไม่วาด */
        }

        .login-root{position:relative; min-height:100svh;}
        .snow{position:fixed; inset:0; z-index:0; pointer-events:none;}

        .center{
          position:relative; z-index:1;
          min-height:100svh; display:grid; place-items:center; padding:24px;
        }
        .card{
          width:100%; max-width:520px;
          background: linear-gradient(180deg, rgba(20,30,48,.9), rgba(15,22,36,.82));
          border-radius:22px; padding:24px;
          border:1px solid var(--line);
          box-shadow: 0 30px 120px rgba(0,0,0,.65), inset 0 0 0 1px rgba(255,255,255,.03);
        }
        .card-head{display:flex;align-items:center;justify-content:center;}
        .brand{font-weight:900;font-size:26px;letter-spacing:.5px;color:#e9f2ff;text-shadow:0 0 26px rgba(61,102,255,.28);}
        .sub{margin-top:6px;font-size:13px;color:#cfe0ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center;}

        .form{margin-top:14px;display:flex;flex-direction:column;gap:12px;}
        .input{
          width:100%; background:rgba(255,255,255,0.06); color:var(--text);
          border:1px solid rgba(255,255,255,0.10); border-radius:12px; padding:10px 12px;
          outline:none; font-size:14px; transition:border-color .15s ease, box-shadow .15s ease;
        }
        .input:focus{ border-color:#6b8cff; box-shadow:0 0 0 3px rgba(107,140,255,.25); }
        .input.pr{ padding-right:88px; }

        .input-wrap{position:relative}
        .eye-btn{
          position:absolute; right:8px; top:6px; padding:6px 10px; border-radius:10px;
          border:1px solid #6b8cff; background:transparent; color:#dbe6ff;
          cursor:pointer; font-weight:800; font-size:13px;
          transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
        }
        .eye-btn:hover{ transform:translateY(-1px); box-shadow:0 10px 24px rgba(107,140,255,.25); border-color:#87a0ff; }

        .inline-links{
          display:flex; align-items:center; justify-content:center; gap:8px;
          font-size:13px; color:var(--muted);
        }
        .inline-links .tiny-link{
          display:inline-block; padding:4px 10px; border-radius:10px; border:1px solid #6b8cff;
          color:#cfe0ff; font-weight:800; background:rgba(255,255,255,.03);
        }
        .inline-links .dot{opacity:.6; margin:0 2px;}

        .btn.primary.full{
          width:100%; padding:12px 14px; border-radius:12px; font-weight:900; letter-spacing:.2px;
          border:1px solid transparent; background:linear-gradient(135deg, #3d66ff, #6b8cff); color:#fff;
          box-shadow: 0 16px 42px rgba(61,102,255,.28); margin-top:6px;
        }
        .btn.primary.full:disabled{ opacity:.7; cursor:not-allowed; box-shadow:none; }

        .status{ margin-top:12px; font-size:14px; color:#d7e6ff; }

        @media (max-width:540px){
          .card{padding:18px;border-radius:18px;}
          .brand{font-size:22px}
        }
      `}</style>
    </main>
  );
}
