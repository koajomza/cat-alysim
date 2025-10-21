// app/login/page.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loginText, setLoginText] = useState(""); // email หรือ username
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const looksLikeEmail = (s: string) => /\S+@\S+\.\S+/.test(s);

  const resolveEmail = useCallback(async (input: string): Promise<string> => {
    // ถ้าดูเหมือนอีเมลอยู่แล้ว ไม่ต้อง RPC
    if (looksLikeEmail(input)) return input.trim().toLowerCase();

    // เรียก RPC resolve_login_email เพื่อแปลง username -> email
    // (ต้องมี function ฝั่ง DB ตามโปรเจกต์เดสก์ท็อปของนาย)
    try {
      const { data, error } = await supabase.rpc("resolve_login_email", {
        _login: input.trim(),
      });
      if (error) throw error;
      if (typeof data === "string" && data.includes("@")) {
        return data.toLowerCase();
      }
      // กันตาย: ถ้า RPC ไม่ได้ ↩️ input เดิม (ให้ไป fail ตอน sign-in)
      return input.trim().toLowerCase();
    } catch (e) {
      return input.trim().toLowerCase();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMsg("⏳ กำลังเข้าสู่ระบบ...");

    try {
      const email = await resolveEmail(loginText);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMsg("❌ " + (error.message || "เข้าสู่ระบบไม่สำเร็จ"));
        setLoading(false);
        return;
      }

      // เหมือนเดสก์ท็อป: ensure profile + grant/confirm trial
      try {
        await supabase.rpc("ensure_profile", { uid: data.user?.id });
      } catch {}
      try {
        await supabase.rpc("grant_or_confirm_trial", {
          uid: data.user?.id,
          days: 7,
        });
      } catch {}

      setMsg("✅ เข้าสู่ระบบสำเร็จ: " + (data.user?.email ?? email));
      router.replace("/dashboard");
    } catch (err: any) {
      setMsg("❌ " + (err?.message ?? "เกิดข้อผิดพลาดที่ไม่รู้จัก"));
      setLoading(false);
    }
  };

  // ถ้ามี session แล้ว ส่งไป /dashboard เลย
  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      if (res.data.user) router.replace("/dashboard");
    });
  }, [router]);

  return (
    <main className="container">
      <section className="hero">
        <div className="hero-text" style={{ maxWidth: 420 }}>
          <h1>เข้าสู่ระบบ</h1>
          <form
            onSubmit={handleLogin}
            className="status-form"
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <input
              type="text"
              placeholder="อีเมล หรือ Username"
              required
              value={loginText}
              onChange={(e) => setLoginText(e.target.value)}
            />
            <div style={{ position: "relative" }}>
              <input
                type={show ? "text" : "password"}
                placeholder="รหัสผ่าน"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", paddingRight: 72 }}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: 6,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                {show ? "🙈 Hide" : "👁 Show"}
              </button>
            </div>

            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? "กำลังเข้า..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          {!!msg && (
            <div className="status" style={{ marginTop: 12 }}>
              {msg}
            </div>
          )}

          <div style={{ marginTop: 16, fontSize: 14, opacity: 0.8 }}>
            ยังไม่มีบัญชี? <a href="/signup">สมัครใช้งาน</a>
          </div>
        </div>
      </section>
    </main>
  );
}
