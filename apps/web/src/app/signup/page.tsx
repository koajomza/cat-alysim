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
          flakes[i] = {
            ...f,
            x: Math.random() * w,
            y: -f.r - Math.random() * 40,
            phase: Math.random() * Math.PI * 2,
          };
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
          {/* Header */}
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
              <div className="strength-label">
                ความแข็ง: {score}% — {scoreLabel(score)}
              </div>
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
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowTerms(false)}
          className="modal-bg"
        >
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
              <button onClick={() => setShowTerms(false)} className="btn ghost">
                ปิด
              </button>
              <button
                onClick={() => {
                  setAgree(true);
                  setShowTerms(false);
                }}
                className="btn primary"
              >
                ยอมรับและปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
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
          --r-pad: 24px;
          --r-radius: 22px;
          --r-font: 14px;
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

        .signup-root {
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
          padding: 24px 28px 22px;
          border: 1px solid rgba(151, 174, 255, 0.18);
          box-shadow:
            0 26px 80px rgba(0, 0, 0, 0.75),
            0 0 0 1px rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(26px);
          -webkit-backdrop-filter: blur(26px);
          overflow: hidden;
        }

        .card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(
            135deg,
            rgba(99, 132, 255, 0.7),
            rgba(70, 219, 184, 0.35)
          );
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

        .card-head .brand {
          font-weight: 900;
          font-size: clamp(22px, 5.4vw, 28px);
          letter-spacing: 0.5px;
          color: #f0f4ff;
          text-shadow:
            0 0 22px rgba(61, 102, 255, 0.55),
            0 0 40px rgba(0, 0, 0, 0.8);
          background: transparent;
          border-radius: 0;
          padding: 0;
          border: none;
          box-shadow: none;
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
          gap: 10px;
        }

        .label {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 4px;
          letter-spacing: 0.2px;
        }

        .hint {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 8px;
          margin-top: -2px;
        }

        .input-wrap {
          position: relative;
          width: 100%;
          margin-top: 7px;
        }

        .input {
          width: 100%;
          background:
            radial-gradient(circle at 0% 0%, rgba(84, 112, 255, 0.22), transparent 55%),
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
          padding-right: 82px;
        }

        .input:hover {
          border-color: rgba(158, 176, 255, 0.6);
          background:
            radial-gradient(circle at 0% 0%, rgba(96, 129, 255, 0.32), transparent 55%),
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

        .input.error {
          border-color: var(--danger);
          box-shadow:
            0 0 0 1px rgba(255, 75, 107, 0.7),
            0 0 0 4px rgba(255, 75, 107, 0.13);
        }

        .input.ok {
          border-color: var(--success);
          box-shadow:
            0 0 0 1px rgba(51, 210, 155, 0.7),
            0 0 0 4px rgba(51, 210, 155, 0.14);
        }

        .eye-btn {
          position: absolute;
          right: 10px;
          top: 8px;
          padding: 6px 10px;
          border-radius: 10px;
          border: 1px solid rgba(124, 151, 255, 0.9);
          background:
            radial-gradient(circle at 0% 0%, rgba(129, 140, 248, 0.32), transparent 52%),
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
          background:
            radial-gradient(circle at 0% 0%, rgba(151, 174, 255, 0.4), transparent 55%),
            rgba(9, 13, 34, 0.98);
        }

        .eye-btn:active {
          transform: translateY(1px);
          box-shadow: none;
        }

        .strength {
          margin-top: 2px;
        }

        .strength progress {
          width: 100%;
          height: 12px;
          appearance: none;
          border-radius: 8px;
          overflow: hidden;
        }

        .strength progress::-webkit-progress-bar {
          background: rgba(11, 16, 32, 0.9);
        }

        .strength progress::-webkit-progress-value {
          background: linear-gradient(90deg, #3d66ff, #6b8cff);
        }

        .strength-label {
          font-size: 12px;
          color: #a9b6d6;
          margin-top: 6px;
        }

        .terms {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
          color: #afc6ff;
          font-size: 14px;
        }

        .link-btn {
          background: transparent;
          border: none;
          color: #afc6ff;
          text-decoration: underline;
          cursor: pointer;
          padding: 0;
          font: inherit;
        }

        .btn {
          padding: 12px 14px;
          border-radius: 12px;
          font-weight: 900;
          letter-spacing: 0.2px;
          text-align: center;
          transition: 0.2s;
          border: 1px solid transparent;
          cursor: pointer;
        }

        .btn.primary {
          background: linear-gradient(135deg, #3d66ff, #6b8cff);
          color: #fff;
          box-shadow: 0 16px 42px rgba(61, 102, 255, 0.28);
        }

        .btn.primary.full {
          width: 100%;
          margin-top: 6px;
        }

        .btn.primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn.ghost {
          background: rgba(255, 255, 255, 0.03);
          color: #e3f0ff;
          border-color: #6b8cff;
        }

        .status {
          margin-top: 12px;
          font-size: 14px;
          color: #d7e6ff;
        }

        .switch {
          margin-top: 12px;
          color: #afc6ff;
        }

        .switch a {
          color: #dbe4ff;
          font-weight: 600;
        }

        .modal-bg {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1000;
        }

        .modal-card {
          width: min(760px, 94%);
          max-height: 80vh;
          overflow: auto;
          background: #121a2a;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
          color: #e6eeff;
        }

        .modal-actions {
          margin-top: 12px;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

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
