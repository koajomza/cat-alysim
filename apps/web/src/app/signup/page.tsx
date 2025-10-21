// apps/web/src/app/signup/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/**
 * Signup page - โค้ดเต็ม
 * - username, email, password, confirm
 * - password strength meter
 * - show/hide password
 * - terms checkbox + view terms modal
 * - client-side validation + Supabase signUp
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordScore(pwd: string) {
  // คืนค่า 0-100
  let score = 0;
  if (pwd.length >= 8) score += 20;
  if (pwd.length >= 12) score += 10;
  if (/[A-Z]/.test(pwd)) score += 15;
  if (/[a-z]/.test(pwd)) score += 15;
  if (/\d/.test(pwd)) score += 20;
  if (/\W/.test(pwd)) score += 20;
  return Math.min(score, 100);
}

function scoreLabel(score: number) {
  if (score < 30) return "กากมาก 🥲";
  if (score < 60) return "พอได้ 🫡";
  if (score < 85) return "แน่นใช้ได้ 💪";
  return "แข็งโป๊ก 🛡️";
}

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);

  const score = useMemo(() => passwordScore(pw), [pw]);

  const validate = (): boolean => {
    setNotice(null);

    if (!username.trim()) {
      setNotice("❌ กรุณากรอก Username");
      return false;
    }
    if (/\s/.test(username)) {
      setNotice("❌ Username ห้ามมีช่องว่าง");
      return false;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setNotice("❌ รูปแบบอีเมลไม่ถูกต้อง (ตัวอย่าง: name@example.com)");
      return false;
    }
    if (pw.length < 8) {
      setNotice("❌ รหัสผ่านต้องยาวอย่างน้อย 8 ตัว");
      return false;
    }
    // ตัวอย่างกฎพื้นฐาน: A-Z ≥1, 0-9 ≥1, symbol ≥1
    if (!/[A-Z]/.test(pw) || !/\d/.test(pw) || !/\W/.test(pw)) {
      setNotice("❌ รหัสผ่านควรมี ตัวใหญ่ (A-Z) อย่างน้อย 1 ตัว, ตัวเลข 1 ตัว และสัญลักษณ์ 1 ตัว");
      return false;
    }
    if (pw !== confirm) {
      setNotice("❌ ช่องยืนยันรหัสผ่านไม่ตรงกัน");
      return false;
    }
    const lowerPw = pw.toLowerCase();
    if (lowerPw === username.toLowerCase() || lowerPw === email.toLowerCase()) {
      setNotice("❌ ห้ามตั้งรหัสผ่านให้ตรงกับ Username หรือ Email");
      return false;
    }
    if (!agree) {
      setNotice("❌ กรุณายอมรับเงื่อนไขการใช้งานก่อนสมัคร");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setNotice("⏳ สมัครบัญชี...");

    try {
      // Supabase signUp (v2)
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pw,
      });

      if (error) {
        setNotice("❌ สมัครไม่สำเร็จ: " + (error.message || String(error)));
        setLoading(false);
        return;
      }

      // ถ้าอยากเก็บ username ใน profile table ต้องเรียก RPC หรือ insert เข้า users table
      // แต่ที่นี่เราแค่ signup และบอกให้ user ไป login/ยืนยันอีเมล
      setNotice("✅ สมัครเรียบร้อย! โปรดตรวจสอบอีเมลเพื่อยืนยัน (ถ้ามี)");
      setLoading(false);

      // redirect ไป login หลังแป๊บหนึ่ง
      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (err: any) {
      setNotice("❌ เกิดข้อผิดพลาด: " + (err?.message || String(err)));
      setLoading(false);
    }
  };

  return (
    <main className="container auth-page">
      <section className="auth-card" aria-labelledby="signup-title">
        <h2 id="signup-title">เปิดบัญชีใหม่</h2>
        <p className="kicker">สร้างบัญชีเพื่อใช้งานระบบ CAT-ALYSIM</p>

        <form className="status-form" onSubmit={handleSubmit} noValidate>
          <label style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
            Username
          </label>
          <input
            autoComplete="username"
            placeholder="ตัวอย่าง: somchai_01"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className=""
            required
          />
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
            ใช้ a-z, 0-9, _ — ห้ามเว้นวรรค
          </div>

          <label style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
            ใช้อีเมลจริง เพราะต้องยืนยันหรือติดต่อกลับ
          </div>

          <label style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>
            Password
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="รหัสผ่าน (≥8 ตัว, A-Z, ตัวเลข, สัญลักษณ์)"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              aria-pressed={showPw}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--muted)",
                cursor: "pointer",
                padding: 6,
                borderRadius: 6,
              }}
            >
              {showPw ? "🙈" : "👁"}
            </button>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
            คำแนะนำ: อย่างน้อย 8 ตัว, แนะนำ ≥12 ตัว ผสม A-Z, a-z, ตัวเลข และสัญลักษณ์
          </div>

          {/* Strength bar */}
          <div style={{ marginTop: 8, marginBottom: 6 }}>
            <progress
              max={100}
              value={score}
              style={{
                width: "100%",
                height: 12,
                appearance: "none",
                borderRadius: 8,
                overflow: "hidden",
              }}
            />
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
              ความแข็ง: {score}% — {scoreLabel(score)}
            </div>
          </div>

          <label style={{ fontSize: 13, color: "var(--muted)", marginTop: 6, marginBottom: 6 }}>
            Confirm Password
          </label>
          <input
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            placeholder="พิมพ์รหัสผ่านอีกครั้ง"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
            ต้องตรงกับช่อง Password
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
            <input
              id="agree"
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label htmlFor="agree" style={{ color: "var(--muted)", fontSize: 14 }}>
              ฉันยอมรับ <button type="button" onClick={() => setShowTerms(true)} style={{ background: "transparent", border: "none", color: "var(--muted)", textDecoration: "underline", cursor: "pointer" }}>เงื่อนไขการใช้งาน</button>
            </label>
          </div>

          <button className="btn primary" type="submit" disabled={loading} style={{ marginTop: 14 }}>
            {loading ? "กำลังสมัคร..." : "เปิดบัญชี"}
          </button>
        </form>

        {notice && (
          <div className="status" role="status" aria-live="polite" style={{ marginTop: 12 }}>
            {notice}
          </div>
        )}

        <div style={{ marginTop: 12, color: "var(--muted)" }}>
          มีบัญชีแล้ว? <a href="/login">เข้าสู่ระบบ</a>
        </div>

        {/* Terms modal (simple) */}
        {showTerms && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.6)",
              zIndex: 1000,
            }}
            onClick={() => setShowTerms(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(760px, 94%)",
                maxHeight: "80vh",
                overflow: "auto",
                background: "var(--card)",
                padding: 20,
                borderRadius: 10,
                border: "1px solid var(--line)",
                boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
                color: "var(--text)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>ข้อกำหนดการใช้งาน (สรุป)</h3>
              <ol style={{ color: "var(--muted)", lineHeight: 1.6 }}>
                <li>คุณยืนยันว่าอีเมลนี้เป็นของคุณและเข้าถึงได้จริง</li>
                <li>ห้ามใช้รหัสผ่านเดาง่าย เช่น 12345678, password</li>
                <li>ห้ามใช้ระบบเพื่อการผิดกฎหมาย หรือทำให้ผู้อื่นได้รับความเสียหาย</li>
                <li>ข้อมูลส่วนตัวถูกเก็บตามนโยบายความเป็นส่วนตัว</li>
                <li>ทีมพัฒนามีสิทธิ์ระงับบัญชีที่ฝ่าฝืนเงื่อนไข</li>
              </ol>
              <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => setShowTerms(false)} className="btn outline">ปิด</button>
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
      </section>
    </main>
  );
}
