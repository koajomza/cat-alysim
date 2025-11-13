// app/(client)/login/page.tsx
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
    const onResize = () => { 
      size(); 
      init(); 
    };
    window.addEventListener("resize", onResize);

    const prefersReduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isNarrow = () => window.innerWidth <= 430;
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
      const mobileFactor = isNarrow() ? 0.6 : 1;
      const count = Math.min(
        240,
        prefersReduce ? Math.max(60, Math.floor(base * 0.45)) : Math.floor((base + 90) * mobileFactor)
      );
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
        :root {
          --panel:#050815;
          --panel-soft:#0b1020;
          --text:#e7eeff;
          --muted:#9ba3c7;
          --line:rgba(255,255,255,0.10);
          --accent:#3d66ff;
          --accent-soft:rgba(61,102,255,0.25);
          --danger:#ff4b6b;
          --success:#33d29b;
          --r-pad: 24px;      /* base spacing */
          --r-radius: 22px;   /* base radius */
          --r-font: 14px;     /* base font */
        }

        * {
          box-sizing: border-box;
        }

        :global(html),
        :global(body) {
          height: 100%;
        }

        :global(body) {
          margin: 0;
          color: var(--text);
          font-family: Inter, system-ui, -apple-system, "Segoe UI", "Noto Sans Thai", sans-serif;
          background:
            radial-gradient(120% 140% at 0% 0%, #101b3c 0%, #05060a 45%, #020308 100%);
          -webkit-tap-highlight-color: transparent;
          -webkit-text-size-adjust: 100%;
          text-size-adjust: 100%;
        }

        .login-root {
          position: relative;
          min-height: 100dvh;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .snow {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .center {
          position: relative;
          z-index: 1;
          min-height: 100dvh;
          display: grid;
          place-items: center;
          padding: var(--r-pad);
        }
        .card {
          position: relative;
          width: 100%;
          max-width: 520px;
          background:
            radial-gradient(circle at 0% 0%, rgba(99, 132, 255, 0.18), transparent 55%),
            radial-gradient(circle at 100% 0%, rgba(88, 216, 198, 0.14), transparent 55%),
            linear-gradient(180deg, rgba(12, 18, 34, 0.98), rgba(7, 10, 20, 0.96));
          border-radius: 32px;
          padding: 24px 28px 22px;   /* top 24 / left-right 28 / bottom 22 → เว้นขอบซ้ายขวาจาก input */
          border: 1px solid rgba(151, 174, 255, 0.18);
          box-shadow:
            0 26px 80px rgba(0, 0, 0, 0.75),
            0 0 0 1px rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(26px);
          -webkit-backdrop-filter: blur(26px);
          overflow: hidden;
        }

        /* โกลว์ขอบการ์ดด้านบน */
        .card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(99, 132, 255, 0.7), rgba(70, 219, 184, 0.35));
          mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          mask-composite: exclude;
          -webkit-mask-composite: xor;
          opacity: 0.75;
          pointer-events: none;
        }

        .card-head {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .brand {
          font-weight: 900;
          outline: none;
          border: none;
          box-shadow: none;
          font-size: clamp(22px, 5.4vw, 28px);
          letter-spacing: 0.5px;
          color: #f0f4ff;
          text-shadow:
            0 0 22px rgba(61, 102, 255, 0.55),
            0 0 40px rgba(0, 0, 0, 0.8);
        }


          /* ฆ่าฟิล “แท็ก/ป้าย” ทิ้งให้หมด */
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
          display: inline-block;
        }


        .sub {
          margin-top: 8px;
          font-size: clamp(12px, 3.4vw, 13px);
          color: #c4d3ff;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          opacity: 0.9;
        }

        .form {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .label {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 4px;
          letter-spacing: 0.2px;
        }

        .label span.main {
          font-weight: 600;
          color: #dde5ff;
        }

        .label span.hint {
          opacity: 0.75;
        }
        .input-wrap {
          position: relative;
          width: 100%;
          margin-top: 7px;          /* กันไม่ให้ input ชน label มากไป */
        }

        .input {
          width: 100%;
          background: radial-gradient(circle at 0% 0%, rgba(84, 112, 255, 0.22), transparent 55%),
            rgba(7, 11, 24, 0.98);
          color: var(--text);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 15px;
          padding: 11px 14px;
          padding-right: 80px;
          outline: none;
          font-size: clamp(14px, 3.6vw, var(--r-font));
          transition:
            border-color 0.16s ease,
            box-shadow 0.16s ease,
            background 0.16s ease,
            transform 0.08s ease;
        }

        .input.pr {
          padding-right: 82px; /* password + eye button */
        }

        .input:hover {
          border-color: rgba(158, 176, 255, 0.6);
          background: radial-gradient(circle at 0% 0%, rgba(96, 129, 255, 0.32), transparent 55%),
            rgba(9, 13, 27, 0.98);
        }

        .input:focus {
          border-color: var(--accent);
          box-shadow:
            0 0 0 1px rgba(61, 102, 255, 0.85),
            0 0 0 6px rgba(61, 102, 255, 0.22);
          transform: translateY(-0.5px);
        }

        .input::placeholder {
          color: rgba(171, 186, 222, 0.7);
        }

        /* state: error / success (เผื่อใช้กับ confirm password / validate) */
        .input.error {
          border-color: var(--danger);
          box-shadow: 0 0 0 1px rgba(255, 75, 107, 0.7), 0 0 0 4px rgba(255, 75, 107, 0.13);
        }

        .input.ok {
          border-color: var(--success);
          box-shadow: 0 0 0 1px rgba(51, 210, 155, 0.7), 0 0 0 4px rgba(51, 210, 155, 0.14);
        }

        .eye-btn {
          position: absolute;
          right: 10px;
          top: 8px;
          padding: 6px 10px;
          border-radius: 10px;
          border: 1px solid rgba(124, 151, 255, 0.9);
          background: radial-gradient(circle at 0% 0%, rgba(129, 140, 248, 0.32), transparent 52%),
            rgba(6, 10, 26, 0.96);
          color: #e0e7ff;
          cursor: pointer;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition:
            transform 0.12s ease,
            box-shadow 0.12s ease,
            border-color 0.12s ease,
            background 0.12s ease;
        }

        .eye-btn:hover {
          box-shadow: 0 8px 20px rgba(61, 102, 255, 0.36);
          border-color: rgba(151, 174, 255, 1);
          background: radial-gradient(circle at 0% 0%, rgba(151, 174, 255, 0.4), transparent 55%),
            rgba(9, 13, 34, 0.98);
        }

        .eye-btn:active {
          transform: translateY(1px);
          box-shadow: none;
        }

        .inline-links {
          margin-top: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: clamp(11px, 3.2vw, 13px);
          color: var(--muted);
          flex-wrap: wrap;
        }

        .inline-links .tiny-link {
          display: inline-block;
          padding: 4px 9px;
          border-radius: 999px;
          border: 1px solid rgba(151, 174, 255, 0.8);
          color: #dbe4ff;
          font-weight: 800;
          background:
            radial-gradient(circle at 0% 0%, rgba(129, 140, 248, 0.32), transparent 55%),
            rgba(8, 12, 28, 0.94);
          text-decoration: none;
          letter-spacing: 0.3px;
        }

        .inline-links .tiny-link:hover {
          background:
            radial-gradient(circle at 0% 0%, rgba(151, 174, 255, 0.46), transparent 55%),
            rgba(11, 16, 35, 0.98);
        }

        .inline-links .dot {
          opacity: 0.6;
          margin: 0 2px;
        }

        .btn.primary.full {
          width: 100%;
          margin-top: 10px;
          padding: 12px 16px;
          border-radius: 15px;
          font-weight: 900;
          letter-spacing: 0.3px;
          border: 0;
          background:
            linear-gradient(135deg, #3d66ff, #6b8cff);
          color: #fff;
          box-shadow:
            0 18px 40px rgba(61, 102, 255, 0.46),
            0 0 0 1px rgba(255, 255, 255, 0.03);
          font-size: clamp(14px, 3.6vw, 15px);
          cursor: pointer;
          transition:
            transform 0.14s ease,
            box-shadow 0.14s ease,
            filter 0.12s ease;
        }

        .btn.primary.full:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            0 22px 56px rgba(61, 102, 255, 0.68),
            0 0 0 1px rgba(255, 255, 255, 0.06);
          filter: saturate(1.1);
        }

        .btn.primary.full:active:not(:disabled) {
          transform: translateY(1px);
          box-shadow: 0 10px 30px rgba(61, 102, 255, 0.55);
        }

        .btn.primary.full:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          box-shadow: none;
        }

        .status {
          margin-top: 10px;
          font-size: clamp(12px, 3.4vw, 13px);
          color: #d7e6ff;
          min-height: 18px;
          line-height: 1.4;
        }

        .status.error {
          color: var(--danger);
        }

        .status.ok {
          color: var(--success);
        }

        /* ===== มือถือเล็กมาก (≤ 400px) ===== */
        @media (max-width: 400px) {
          :root {
            --r-pad: 18px;
            --r-radius: 18px;
            --r-font: 13px;
          }

          .card {
            padding: 18px 16px;
            box-shadow: 0 18px 52px rgba(0, 0, 0, 0.7);
          }

          .btn.primary.full {
            margin-top: 8px;
            padding-block: 11px;
          }

          .eye-btn {
            font-size: 10px;
            padding: 5px 8px;
            top: 5px;
          }
        }

        /* Reduce Motion */
        @media (prefers-reduced-motion: reduce) {
          .btn.primary.full,
          .eye-btn,
          .input {
            transition: none;
          }
        }
      `}</style>

    </main>
  );
}
