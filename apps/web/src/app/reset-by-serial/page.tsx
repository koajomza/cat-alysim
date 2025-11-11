// apps/web/src/app/reset-by-serial/page.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// --- helpers ---
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const looksLikeEmail = (s: string) => EMAIL_RE.test((s || "").trim());

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

export default function ResetBySerialPage() {
  const router = useRouter();

  // ถ้ามี session อยู่แล้ว ไม่ควรต้องรีเซ็ต เด้งไปแดชบอร์ด
  useEffect(() => {
    supabase.auth.getUser().then((r) => {
      if (r.data.user) router.replace("/dashboard");
    });
  }, [router]);

  const [loginText, setLoginText] = useState("");   // username หรือ email
  const [serial, setSerial] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const score = useMemo(() => scorePassword(pw), [pw]);

  const resolveEmail = async (input: string): Promise<string> => {
    const t = (input || "").trim();
    if (looksLikeEmail(t)) return t.toLowerCase();
    // map username -> email ผ่าน RPC ให้เหมือนเดสก์ท็อป
    try {
      const { data, error } = await supabase.rpc("resolve_login_email", { _login: t });
      if (error) throw error;
      if (typeof data === "string" && data.includes("@")) return data.toLowerCase();
      return t.toLowerCase(); // ปล่อยไป fail ที่ RPC reset ถ้าไม่ใช่อีเมลจริง
    } catch {
      return t.toLowerCase();
    }
  };

  const validate = (): boolean => {
    setNotice(null);
    if (!loginText.trim()) return setMsg("❌ กรุณากรอก Username หรือ Email");
    if (!serial.trim()) return setMsg("❌ กรุณากรอก Serial");
    if (pw.length < 8) return setMsg("❌ รหัสผ่านต้องยาวอย่างน้อย 8 ตัว");
    if (!/[A-Z]/.test(pw) || !/\d/.test(pw) || !/\W/.test(pw))
      return setMsg("❌ รหัสผ่านควรมี ตัวใหญ่ (A-Z) ≥1, ตัวเลข ≥1 และสัญลักษณ์ ≥1");
    if (pw !== confirm) return setMsg("❌ ช่องยืนยันรหัสผ่านไม่ตรงกัน");
    if (pw.toLowerCase() === loginText.trim().toLowerCase())
      return setMsg("❌ อย่าตั้งรหัสผ่านให้ตรงกับ Username/Email");
    return true;
  };
  const setMsg = (m: string) => { setNotice(m); return false; };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    setNotice("⏳ กำลังรีเซ็ตรหัสผ่าน...");

    try {
      const email = await resolveEmail(loginText);

      // เรียก RPC รีเซ็ตด้วย Serial (เหมือนที่ฝั่งเดสก์ท็อปทำ)
      // คาดว่า signature: reset_password_with_serial(email text, serial text, new_password text)
      const { data, error } = await supabase.rpc("reset_password_with_serial", {
        email,
        serial: serial.trim(),
        new_password: pw,
      });

      if (error) {
        setLoading(false);
        return setMsg("❌ รีเซ็ตไม่สำเร็จ: " + (error.message || String(error)));
      }

      setNotice("✅ เปลี่ยนรหัสผ่านสำเร็จ! ไปล็อกอินได้เลย");
      setTimeout(() => router.replace("/login"), 1000);
    } catch (err: any) {
      setMsg("❌ เกิดข้อผิดพลาด: " + (err?.message || String(err)));
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "linear-gradient(135deg,#0B1220 0%,#0e1424 100%)",
        color: "#E6EEFF",
      }}
    >
      <section style={{ width: "100%", maxWidth: 860, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 560,
            background: "#121A2A",
            borderRadius: 18,
            padding: 24,
            boxShadow: "18px 22px 40px rgba(0,0,0,.55)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 22 }}>🔐 รีเซ็ตรหัสผ่านด้วย Serial</div>
            <div style={{ marginLeft: "auto" }}>
              <Link
                href="/login"
                aria-label="กลับไปหน้าเข้าสู่ระบบ"
                style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  borderRadius: 8,
                  color: "#FF5C5C",
                }}
              >
                ✕
              </Link>
            </div>
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "#AFC6FF",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            กรอก Username/Email + Serial ที่ได้รับทางอีเมล แล้วตั้งรหัสผ่านใหม่
          </div>

          <form
            onSubmit={handleReset}
            noValidate
            style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}
          >
            <label style={labelStyle}>Username หรือ Email</label>
            <input
              placeholder="ตัวอย่าง: somchai_01 หรือ name@example.com"
              value={loginText}
              onChange={(e) => setLoginText(e.target.value)}
              style={inputStyle}
              required
            />

            <label style={labelStyle}>Serial</label>
            <input
              placeholder="CAT-YYYYMM-XXXX-XXXX"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              style={inputStyle}
              required
            />

            <label style={labelStyle}>รหัสผ่านใหม่</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="≥8 ตัว, มีตัวใหญ่ เลข และสัญลักษณ์"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                style={{ ...inputStyle, paddingRight: 82 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-pressed={showPw}
                style={eyeBtnStyle}
              >
                {showPw ? "🙈 Hide" : "👁 Show"}
              </button>
            </div>

            {/* strength */}
            <div>
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
              <div style={{ fontSize: 12, color: "#A9B6D6", marginTop: 6 }}>
                ความแข็ง: {score}% — {scoreLabel(score)}
              </div>
            </div>

            <label style={labelStyle}>ยืนยันรหัสผ่านใหม่</label>
            <input
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="พิมพ์รหัสผ่านอีกครั้ง"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={inputStyle}
              required
            />

            <button type="submit" disabled={loading} style={primaryBtn}>
              {loading ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัส"}
            </button>
          </form>

          {notice && (
            <div style={{ marginTop: 12, fontSize: 14, color: "#9FB5E8" }}>{notice}</div>
          )}

          <div style={{ marginTop: 12, color: "#AFC6FF" }}>
            ย้อนกลับไป <Link href="/login">เข้าสู่ระบบ</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// ---- styles ----
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.06)",
  color: "#E6EEFF",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "10px 12px",
  outline: "none",
  fontSize: 14,
};
const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#AFC6FF",
  marginBottom: 6,
  marginTop: 6,
};
const primaryBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  background: "#3D66FF",
  color: "white",
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
  marginTop: 10,
};
const eyeBtnStyle: React.CSSProperties = {
  position: "absolute",
  right: 8,
  top: 6,
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #567BFF",
  background: "transparent",
  color: "#AFC6FF",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
};
