// app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  full_name: string | null;
  og_name: string | null;        // หน่วย/สถานี
  role: string | null;           // เช่น "investigator"
  created_at: string | null;
};

type TrialInfo = {
  is_active: boolean;
  days_left: number;
  expires_at: string | null;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trial, setTrial] = useState<TrialInfo | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // โหลด user + โปรไฟล์ + สถานะ trial/license
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      // 1) เอา user ก่อน
      const ures = await supabase.auth.getUser();
      const user = ures.data.user;
      if (!user) {
        // layout จะรีไดเรกต์ให้เอง แต่กันเหนียว
        window.location.href = "/login";
        return;
      }
      if (!mounted) return;
      setEmail(user.email ?? null);

      // 2) ensure_profile กันไว้ (ถ้าเคยทำใน login แล้ว อันนี้จะเร็ว)
      try {
        await supabase.rpc("ensure_profile", { uid: user.id });
      } catch {}

      // 3) ดึงโปรไฟล์จากตาราง profiles
      const { data: profRows } = await supabase
        .from("profiles")
        .select("id, full_name, og_name, role, created_at")
        .eq("id", user.id)
        .limit(1)
        .maybeSingle();

      if (mounted) setProfile(profRows ?? null);

      // 4) RPC สถานะ trial/license (ถ้าไม่มีใน DB ให้ fallback)
      let tri: TrialInfo | null = null;
      try {
        const { data, error } = await supabase.rpc("get_trial_status", { uid: user.id });
        if (error) throw error;
        if (data && typeof data === "object") {
          tri = {
            is_active: !!data.is_active,
            days_left: Math.max(0, Number(data.days_left ?? 0)),
            expires_at: data.expires_at ?? null,
          };
        }
      } catch {
        // fallback ง่าย ๆ
        tri = { is_active: true, days_left: 7, expires_at: null };
      }
      if (mounted) setTrial(tri);

      setLoading(false);
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const trialBadge = useMemo(() => {
    if (!trial) return null;
    const color = trial.is_active ? "#16a34a" : "#ef4444";
    const label = trial.is_active ? `Trial เหลือ ${trial.days_left} วัน` : "Trial หมดอายุ";
    return (
      <span
        style={{
          display: "inline-block",
          padding: "6px 10px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.06)",
          fontSize: 13,
          color,
          fontWeight: 700,
        }}
        title={trial.expires_at ? `หมดอายุ: ${trial.expires_at}` : undefined}
      >
        {label}
      </span>
    );
  }, [trial]);

  const Card = (props: { title: string; children: React.ReactNode; footer?: React.ReactNode }) => (
    <section
      style={{
        background: "#121A2A",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 18,
        padding: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>{props.title}</h3>
        <div style={{ marginLeft: "auto" }}>{props.footer}</div>
      </div>
      <div>{props.children}</div>
    </section>
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>ภาพรวม</h1>
        {trialBadge}
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#A9B6D6" }}>
          เวอร์ชัน {process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0"} •
          อัปเดตล่าสุด {process.env.NEXT_PUBLIC_LAST_UPDATE ?? "—"}
        </div>
      </div>

      {/* แถวบน: โปรไฟล์ + Quick actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 16,
        }}
      >
        <Card
          title="โปรไฟล์ผู้ใช้"
          footer={
            <Link
              href="/settings"
              style={{
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid #567BFF",
                color: "#AFC6FF",
              }}
            >
              จัดการโปรไฟล์
            </Link>
          }
        >
          {loading ? (
            <div style={{ opacity: 0.7 }}>กำลังโหลด...</div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, lineHeight: 1.8 }}>
              <li>
                <strong>อีเมล:</strong> {email ?? "—"}
              </li>
              <li>
                <strong>ชื่อ-นามสกุล:</strong> {profile?.full_name ?? "—"}
              </li>
              <li>
                <strong>สังกัด:</strong> {profile?.og_name ?? "—"}
              </li>
              <li>
                <strong>บทบาท:</strong> {profile?.role ?? "—"}
              </li>
              <li>
                <strong>เริ่มใช้งาน:</strong>{" "}
                {profile?.created_at ? new Date(profile.created_at).toLocaleString() : "—"}
              </li>
            </ul>
          )}
        </Card>

        <Card title="เริ่มต้นเร็ว ๆ นี้">
          <div style={{ display: "grid", gap: 8 }}>
            <Link href="/cases" style={quickBtn}>
              เปิดคดีของฉัน
            </Link>
            <Link href="/documents" style={quickBtn}>
              สร้างเอกสาร
            </Link>
            <Link href="/smartchat" style={quickBtn}>
              Smart Chat
            </Link>
          </div>
        </Card>
      </div>

      {/* แถวล่าง: สถานะสิทธิ์/ไลเซนส์ + บันทึกล่าสุด/อัปเดต */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <Card title="สถานะสิทธิ์ใช้งาน (Trial/License)">
          {trial ? (
            <div style={{ lineHeight: 1.8 }}>
              <div>
                <strong>สถานะ:</strong> {trial.is_active ? "ใช้งานได้" : "หมดอายุ"}
              </div>
              <div>
                <strong>คงเหลือ:</strong> {trial.days_left} วัน
              </div>
              {trial.expires_at && (
                <div>
                  <strong>หมดอายุ:</strong>{" "}
                  {new Date(trial.expires_at).toLocaleString()}
                </div>
              )}
              {!trial.is_active && (
                <div style={{ marginTop: 10 }}>
                  <Link
                    href="/billing"
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: "#3D66FF",
                      color: "white",
                      border: "none",
                      fontWeight: 700,
                    }}
                  >
                    ต่ออายุ/ชำระเงิน
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div style={{ opacity: 0.7 }}>—</div>
          )}
        </Card>

        <Card title="ประกาศ & อัปเดตเวอร์ชัน">
          <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
            <li>
              <strong>v{process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0"}</strong> —{" "}
              ปรับหน้า Login และ Client Area •{" "}
              <span style={{ opacity: 0.8 }}>
                {process.env.NEXT_PUBLIC_LAST_UPDATE ?? "2025-11-11"}
              </span>
            </li>
            <li>เพิ่มปุ่มลัดไป Smart Chat, เอกสาร, คดี</li>
            <li>ปรับโทนสีเข้ม อ่านง่ายขึ้น</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

const quickBtn: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 12px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  color: "#E6EEFF",
  border: "1px solid rgba(255,255,255,0.10)",
  textAlign: "center",
  fontWeight: 700,
};
