// apps/web/src/app/signup/page.tsx
"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/**
 * Signup page (CAT-ALYSIM)
 * - username, email, password, confirm
 * - password strength meter
 * - show/hide password
 * - terms modal
 * - client-side validation
 * - Supabase signUp -> upsert profiles(username) -> redirect /login
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function scorePassword(pwd: string) {
  let score = 0;
  if (pwd.length >= 8) score += 20;
  if (pwd.length >= 12) score += 10;
  if (/[A-Z]/.test(pwd)) score += 15;
  if (/[a-z]/.test(pwd)) score += 15;
  if (/\d/.test(pwd)) score += 20;
  if (/\W/.test(pwd)) score += 20;
  return Math.min(score, 100);
}
function scoreLabel(v: number) {
  if (v < 30) return "กากมาก 🥲";
  if (v < 60) return "พอได้ 🫡";
  if (v < 85) return "แน่นใช้ได้ 💪";
  return "แข็งโป๊ก 🛡️";
}

export default function SignupPage() {
  const router = useRouter();

  // form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);

  // ui states
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);

  // strength
  const score = useMemo(() => scorePassword(pw), [pw]);

  // ถ้ามี session อยู่แล้วไม่ต้องสมัคร ซิ่งไปแดชบอร์ด
  useEffect(() => {
    supabase.auth.getUser().then((r) => {
      if (r.data.user) router.replace("/dashboard");
    });
  }, [router]);

  const setMsg = useCallback((m: string) => {
    setNotice(m);
    return false;
  }, []);

  const validate = useCallback((): boolean => {
    setNotice(null);
    const u = username.trim();
    if (!u) return setMsg("❌ กรุณากรอก Username");
    if (/\s/.test(u)) return setMsg("❌ Username ห้ามมีช่องว่าง");
    if (!/^[a-z0-9_]+$/.test(u)) return setMsg("❌ ใช้ a-z, 0-9, _ เท่านั้น (ตัวเล็ก)");

    const em = email.trim();
    if (!EMAIL_RE.test(em)) return setMsg("❌ รูปแบบอีเมลไม่ถูกต้อง (เช่น name@example.com)");

    if (pw.length < 8) return setMsg("❌ รหัสผ่านต้องยาวอย่างน้อย 8 ตัว");
    if (!/[A-Z]/.test(pw) || !/\d/.test(pw) || !/\W/.test(pw))
      return setMsg("❌ รหัสผ่านควรมี ตัวใหญ่ ≥1, ตัวเลข ≥1 และสัญลักษณ์ ≥1");
    if (pw !== confirm) return setMsg("❌ ช่องยืนยันรหัสผ่านไม่ตรงกัน");
    if (pw.toLowerCase() === u.toLowerCase() || pw.toLowerCase() === em.toLowerCase())
      return setMsg("❌ ห้ามใช้รหัสผ่านตรงกับ Username หรือ Email");

    if (!agree) return setMsg("❌ กรุณาติ๊กยอมรับเงื่อนไขก่อนสมัคร");
    return true;
  }, [username, email, pw, confirm, agree, setMsg]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    setNotice("⏳ สมัครบัญชี...");

    try {
      // 1) Sign up
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pw,
        options: {
          emailRedirectTo:
            typeof window !== "undefined" ? `${location.origin}/auth/callback` : undefined,
        },
      });
      if (error) {
        setLoading(false);
        return setMsg("❌ สมัครไม่สำเร็จ: " + (error.message || String(error)));
      }

      // 2) Upsert โปรไฟล์เก็บ username
      const uid = data.user?.id;
      if (uid) {
        const { error: upErr } = await supabase
          .from("profiles")
          .upsert(
            { id: uid, username: username.trim(), updated_at: new Date().toISOString() },
            { onConflict: "id" }
          );
        if (upErr) console.warn("profiles upsert failed:", upErr.message);
      }

      // 3) แจ้งผู้ใช้และพากลับหน้า login
      setNotice("✅ สมัครเรียบร้อย! โปรดตรวจสอบอีเมลเพื่อยืนยัน (ถ้าเปิด verify)");
      setTimeout(() => router.replace("/login"), 1100);
    } catch (err: any) {
      setMsg("❌ เกิดข้อผิดพลาด: " + (err?.message || String(err)));
      setLoading(false);
    }
  };

  // ===== พื้นหลังหิมะ (เต็มจอ) =====
  const snowRef = useRef<HTMLCanvasElement | null>(null);
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
      const count = Math.min(280, base + 100);
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
    <main className="signup-root">
      {/* BG: หิมะอย่างเดียว */}
      <canvas ref={snowRef} className="snow" aria-hidden="true" />

      <section className="center">
        <div className="card">
          {/* Header: “สมัครสมาชิก” (ไม่มี X/ไม่มีอีโมจิ) */}
          <div className="card-head">
            <div className="brand">สมัครสมาชิก</div>
          </div>

          <div className="sub">กรอกข้อมูลให้ครบ เพื่อเปิดใช้งานบัญชี</div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="form">
            {/* Username */}
            <label className="label">Username</label>
            <input
              autoComplete="username"
              placeholder="ตัวอย่าง: somchai_01"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              required
            />
            <div className="hint">ใช้ a-z, 0-9, _ เท่านั้น (ห้ามเว้นวรรค)</div>

            {/* Email */}
            <label className="label">Email</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
            <div className="hint">ใช้อีเมลจริง เพราะต้องยืนยัน/ติดต่อกลับ</div>

            {/* Password */}
            <label className="label">Password</label>
            <div className="input-wrap">
              <input
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="รหัสผ่าน (≥8 ตัว, A-Z, ตัวเลข, สัญลักษณ์)"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="input pr"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-pressed={showPw}
                className="eye-btn"
              >
                {showPw ? "🙈 Hide" : "👁 Show"}
              </button>
            </div>
            <div className="hint">แนะนำ: ≥12 ตัว ผสม A-Z, a-z, ตัวเลข และสัญลักษณ์</div>

            {/* Strength */}
            <div className="strength">
              <progress max={100} value={score} />
              <div className="strength-label">ความแข็ง: {score}% — {scoreLabel(score)}</div>
            </div>

            {/* Confirm */}
            <label className="label">Confirm Password</label>
            <input
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="พิมพ์รหัสผ่านอีกครั้ง"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input"
              required
            />
            <div className="hint">ต้องตรงกับช่อง Password</div>

            {/* Terms */}
            <div className="terms">
              <input
                id="agree"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label htmlFor="agree">
                ฉันยอมรับ{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="link-btn"
                >
                  เงื่อนไขการใช้งาน
                </button>
              </label>
            </div>

            {/* CTA */}
            <button className="btn primary full" type="submit" disabled={loading}>
              {loading ? "กำลังสมัคร..." : "เปิดบัญชี"}
            </button>
          </form>

          {/* Status */}
          {notice && <div className="status">{notice}</div>}

          <div className="switch">
            มีบัญชีแล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
          </div>
        </div>
      </section>

      {/* Terms modal */}
      {showTerms && (
        <div role="dialog" aria-modal="true" onClick={() => setShowTerms(false)} className="modal-bg">
          <div onClick={(e) => e.stopPropagation()} className="modal-card">
            <h3 style={{ marginTop: 0 }}>ข้อกำหนดการใช้งาน (สรุป)</h3>
            <ol style={{ color: "#AFC6FF", lineHeight: 1.6 }}>
              <li>คุณยืนยันว่าอีเมลนี้เป็นของคุณและเข้าถึงได้จริง</li>
              <li>ห้ามใช้รหัสผ่านเดาง่าย เช่น 12345678, password</li>
              <li>ห้ามใช้ระบบเพื่อการผิดกฎหมาย หรือทำให้ผู้อื่นเสียหาย</li>
              <li>ข้อมูลส่วนตัวถูกเก็บตามนโยบายความเป็นส่วนตัว</li>
              <li>ทีมพัฒนามีสิทธิ์ระงับบัญชีที่ฝ่าฝืนเงื่อนไข</li>
            </ol>
            <div className="modal-actions">
              <button onClick={() => setShowTerms(false)} className="btn ghost">ปิด</button>
              <button
                onClick={() => { setAgree(true); setShowTerms(false); }}
                className="btn primary"
              >
                ยอมรับและปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles เฉพาะหน้านี้ */}
      <style jsx>{`
        :root{
          --panel:#121a2a; --text:#e6eeff; --muted:#a9b6d6;
          --line:rgba(255,255,255,0.10);
        }
        *{box-sizing:border-box}
        html,body{height:100%}
        body{margin:0;-webkit-text-size-adjust: 100%; /* ปิดการขยายอัตโนมัติของ Safari */,
          text-size-adjust: 100%; color:var(--text); background:#050607; font-family:Inter,system-ui,-apple-system,"Segoe UI","Noto Sans Thai",sans-serif;}

        .signup-root{position:relative; min-height:100svh;}
        .snow{position:fixed; inset:0; z-index:0; pointer-events:none;}

        .center{position:relative; z-index:1; min-height:100svh; display:grid; place-items:center; padding:24px;}
        .card{
          width:100%; max-width:520px;
          background: linear-gradient(180deg, rgba(20,30,48,.9), rgba(15,22,36,.82));
          border-radius:22px; padding:24px;
          border:1px solid var(--line);
          box-shadow: 0 30px 120px rgba(0,0,0,.65), inset 0 0 0 1px rgba(255,255,255,.03);
        }

        .card-head{display:flex; align-items:center; justify-content:center;}
        .brand{font-weight:900; font-size:26px; letter-spacing:.5px; color:#e9f2ff; text-shadow:0 0 26px rgba(61,102,255,.28);}
        .sub{margin-top:6px; font-size:13px; color:#cfe0ff; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}

        .form{margin-top:14px; display:flex; flex-direction:column; gap:10px;}
        .label{font-size:13px; color:#AFC6FF; margin-bottom:6px; margin-top:6px;}
        .hint{font-size:12px; color:var(--muted); margin-bottom:8px; margin-top:-2px;}

        .input{
          width:100%;
          background:rgba(255,255,255,0.06); color:var(--text);
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

        .strength{margin-top:2px;}
        .strength progress{ width:100%; height:12px; appearance:none; border-radius:8px; overflow:hidden; }
        .strength-label{ font-size:12px; color:#A9B6D6; margin-top:6px; }

        .terms{ display:flex; align-items:center; gap:10px; margin-top:6px; color:#AFC6FF; font-size:14px; }
        .link-btn{ background:transparent; border:none; color:#AFC6FF; text-decoration:underline; cursor:pointer; }

        .btn{ padding:12px 14px; border-radius:12px; font-weight:900; letter-spacing:.2px; text-align:center; transition:.2s; border:1px solid transparent; }
        .btn.primary{ background:linear-gradient(135deg, #3d66ff, #6b8cff); color:#fff; box-shadow: 0 16px 42px rgba(61,102,255,.28); }
        .btn.primary.full{ width:100%; margin-top:6px; }
        .btn.primary:disabled{ opacity:.7; cursor:not-allowed; box-shadow:none; }
        .btn.ghost{ background:rgba(255,255,255,.03); color:#e3f0ff; border-color:#6b8cff; }

        .status{ margin-top:12px; font-size:14px; color:#d7e6ff; }
        .switch{ margin-top:12px; color:#AFC6FF; }

        .modal-bg{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.6); z-index:1000; }
        .modal-card{
          width:min(760px, 94%); max-height:80vh; overflow:auto;
          background:#121A2A; padding:20px; border-radius:12px; border:1px solid rgba(255,255,255,0.10);
          box-shadow:0 30px 60px rgba(0,0,0,0.6); color:#E6EEFF;
        }
        .modal-actions{ margin-top:12px; display:flex; justify-content:flex-end; gap:8px;}
      `}</style>
    </main>
  );
}
