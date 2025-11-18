// apps/web/src/app/auth/reset/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Stage = "checking" | "ready" | "done" | "error" | "missing";

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

export default function ResetPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("checking");
  const [msg, setMsg] = useState<string>("กำลังตรวจสอบลิงก์รีเซ็ตรหัสผ่าน...");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      const parsed = parseHash();
      if (!parsed) {
        setStage("missing");
        setMsg("ลิงก์ไม่ถูกต้อง หรือขาดข้อมูล access_token / refresh_token");
        return;
      }

      try {
        const { access_token, refresh_token, type } = parsed;
        console.log("[reset] parsed", { type });

        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          console.error("[reset] setSession error", error);
          setStage("error");
          setMsg(`ไม่สามารถใช้ลิงก์รีเซ็ตได้: ${error.message}`);
          return;
        }

        if (type !== "recovery") {
          // technicallyไม่ใช่ลิงก์ reset แต่ก็ให้คนเปลี่ยนได้อยู่ดี
          console.warn("[reset] type is not recovery:", type);
        }

        setStage("ready");
        setMsg("กรุณาตั้งรหัสผ่านใหม่สำหรับบัญชีนี้");
      } catch (e: any) {
        console.error("[reset] unexpected error", e);
        setStage("error");
        setMsg(`เกิดข้อผิดพลาด: ${e?.message || e}`);
      }
    };

    run();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (stage !== "ready") return;

    const newPwd = pwd.trim();
    const confirmPwd = pwd2.trim();

    if (!newPwd) {
      setMsg("กรุณากรอกรหัสผ่านใหม่");
      return;
    }
    if (newPwd.length < 8) {
      setMsg("รหัสผ่านควรมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (newPwd !== confirmPwd) {
      setMsg("รหัสผ่านยืนยันไม่ตรงกัน");
      return;
    }

    setSubmitting(true);
    setMsg("กำลังอัปเดตรหัสผ่าน...");

    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) {
        console.error("[reset] updateUser error", error);
        setStage("error");
        setMsg(`เปลี่ยนรหัสผ่านไม่สำเร็จ: ${error.message}`);
        setSubmitting(false);
        return;
      }

      setStage("done");
      setMsg("ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว คุณสามารถกลับไปล็อกอินในแอป/เว็บได้");
      setSubmitting(false);

      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (e: any) {
      console.error("[reset] unexpected error", e);
      setStage("error");
      setMsg(`เกิดข้อผิดพลาด: ${e?.message || e}`);
      setSubmitting(false);
    }
  };

  const title =
    stage === "ready"
      ? "ตั้งรหัสผ่านใหม่"
      : stage === "done"
      ? "เปลี่ยนรหัสผ่านสำเร็จ"
      : stage === "missing"
      ? "ลิงก์ไม่ถูกต้อง"
      : stage === "error"
      ? "เกิดข้อผิดพลาด"
      : "กำลังตรวจสอบลิงก์...";

  const disabled = submitting || !(stage === "ready");

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

        {stage === "ready" && (
          <form onSubmit={onSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    marginBottom: 4,
                    color: "#e5e7eb",
                  }}
                >
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #4b5563",
                    background: "#020617",
                    color: "#e5e7eb",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    marginBottom: 4,
                    color: "#e5e7eb",
                  }}
                >
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={pwd2}
                  onChange={(e) => setPwd2(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #4b5563",
                    background: "#020617",
                    color: "#e5e7eb",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={disabled}
                style={{
                  marginTop: 6,
                  width: "100%",
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "none",
                  background: disabled ? "#4b5563" : "#00d084",
                  color: "#050507",
                  fontWeight: 600,
                  cursor: disabled ? "default" : "pointer",
                }}
              >
                {submitting ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
              </button>
            </div>
          </form>
        )}

        {(stage === "missing" || stage === "error" || stage === "done") && (
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
            กลับไปหน้าเข้าสู่ระบบ
          </button>
        )}
      </div>
    </main>
  );
}
