"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ใช้ env ที่มึงเซ็ตไว้ใน .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("⏳ กำลังเข้าสู่ระบบ...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ เข้าสู่ระบบสำเร็จ: " + data.user?.email);
      // redirect ไป dashboard ก็ได้ เช่น:
      // window.location.href = "/dashboard";
    }
  };

  return (
    <main className="container">
      <section className="hero">
        <div className="hero-text">
          <h1>เข้าสู่ระบบ</h1>
          <form
            onSubmit={handleLogin}
            className="status-form"
            style={{ flexDirection: "column", gap: "12px" }}
          >
            <input
              type="email"
              placeholder="อีเมล"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="รหัสผ่าน"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn primary" type="submit">
              เข้าสู่ระบบ
            </button>
          </form>
          {message && <div className="status">{message}</div>}
        </div>
      </section>
    </main>
  );
}
