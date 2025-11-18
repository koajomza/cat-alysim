// apps/web/src/app/auth/confirm/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Status = "idle" | "working" | "ok" | "error" | "missing";

function parseHash() {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash || "";
  if (!hash.startsWith("#")) return null;
  const params = new URLSearchParams(hash.substring(1));
  const access_token = params.get("access_token") || "";
  const refresh_token = params.get("refresh_token") || "";
  const type = params.get("type") || "";
  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token, type };
}

export default function ConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string>("กำลังตรวจสอบลิงก์ยืนยันอีเมล...");

  useEffect(() => {
    const run = async () => {
      setStatus("working");
      const parsed = parseHash();
      if (!parsed) {
        setStatus("missing");
        setMsg("ลิงก์ไม่ถูกต้อง หรือขาดข้อมูล access_token / refresh_token");
        return;
      }

      try {
        const { access_token, refresh_token, type } = parsed;
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          console.error("[confirm] setSession error", error);
          setStatus("error");
          setMsg(`ไม่สามารถยืนยันได้: ${error.message}`);
          return;
        }

        // type=signup / magiclink / recovery
        if (type === "recovery") {
          // จริง ๆ ควรไปหน้า reset, แต่ถ้ามาหลงที่นี่ก็แจ้งให้ไปหน้า reset
          setStatus("ok");
          setMsg(
            "ลิงก์รีเซ็ตรหัสผ่านถูกต้องแล้ว แต่คุณมาอยู่หน้าคอนเฟิร์มเมล\n" +
              "กรุณากลับไปใช้ลิงก์ที่ชี้ไป /auth/reset แทน"
          );
          return;
        }

        setStatus("ok");
        setMsg("ยืนยันอีเมลเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบได้");
        // auto redirect เบา ๆ
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      } catch (e: any) {
        console.error("[confirm] unexpected error", e);
        setStatus("error");
        setMsg(`เกิดข้อผิดพลาด: ${e?.message || e}`);
      }
    };

    run();
  }, [router]);

  const title =
    status === "ok"
      ? "ยืนยันอีเมลสำเร็จ"
      : status === "error"
      ? "ยืนยันไม่สำเร็จ"
      : status === "missing"
      ? "ลิงก์ไม่ถูกต้อง"
      : "กำลังตรวจสอบ...";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050507",
        color: "#e6eef8",
        padding: 16,
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: "#0a0f12",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 20px 45px rgba(0,0,0,0.5)",
          border: "1px solid rgba(148,163,184,0.25)",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
          {title}
        </div>
        <p
          style={{
            fontSize: 14,
            color: "#9ca3af",
            whiteSpace: "pre-line",
            marginBottom: 16,
          }}
        >
          {msg}
        </p>

        <button
          type="button"
          onClick={() => router.push("/login")}
          style={{
            width: "100%",
            marginTop: 8,
            padding: "8px 14px",
            borderRadius: 999,
            border: "none",
            background: "#00d084",
            color: "#050507",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ไปหน้าเข้าสู่ระบบ
        </button>
      </div>
    </main>
  );
}
