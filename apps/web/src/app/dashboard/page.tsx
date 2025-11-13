// apps/web/src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// ---------- Types (ปรับชื่อ field ให้ตรง DB ตัวเองได้) ---------- //
type ProfileRow = {
  id: string;
  username: string | null;
  full_name?: string | null;
  display_name?: string | null;
  role?: string | null;
  created_at?: string | null;
};

type OrderRow = {
  id: string;
  product_name: string | null;
  serial_key: string | null;
  status: string | null;
  created_at: string | null;
  expires_at?: string | null;
};

type LicenseRow = {
  id: string;
  plan_name: string | null;
  serial_key: string | null;
  status: string | null;
  expires_at: string | null;
};

// ---------- Helpers ---------- //
function formatDate(s?: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadgeClass(statusRaw: string | null | undefined) {
  const s = (statusRaw || "").toLowerCase();
  if (["active", "paid", "ok"].some((k) => s.includes(k))) return "badge badge-ok";
  if (["pending", "waiting"].some((k) => s.includes(k))) return "badge badge-pending";
  if (["expired"].some((k) => s.includes(k))) return "badge badge-expired";
  if (["cancel", "failed"].some((k) => s.includes(k))) return "badge badge-bad";
  return "badge";
}

// ---------- Component ---------- //
export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      // 1) เช็ค user จาก Supabase auth
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        // ไม่มี session → เด้งไปหน้า login
        router.replace("/login?next=/dashboard");
        return;
      }

      const user = userRes.user;
      if (cancelled) return;
      setEmail(user.email ?? null);

      // 2) ดึงโปรไฟล์ (ตาราง profiles)
      const { data: profileRow, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!cancelled) {
        if (pErr) {
          console.warn("load profile failed", pErr);
          setError("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ");
        } else {
          setProfile(profileRow as ProfileRow);
        }
      }

      // 3) ดึงสิทธิ์ / serial (เช่น จากตาราง licenses — ตั้งชื่อตามใจ)
      const { data: licenseRows, error: lErr } = await supabase
        .from("licenses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!cancelled) {
        if (lErr) {
          console.warn("load licenses failed", lErr);
        } else {
          setLicenses((licenseRows ?? []) as LicenseRow[]);
        }
      }

      // 4) ดึงประวัติคำสั่งซื้อ (orders)
      const { data: orderRows, error: oErr } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!cancelled) {
        if (oErr) {
          console.warn("load orders failed", oErr);
        } else {
          setOrders((orderRows ?? []) as OrderRow[]);
        }
        setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const displayName =
    profile?.display_name ||
    profile?.full_name ||
    profile?.username ||
    email ||
    "ผู้ใช้งาน";

  const mainSerial = licenses[0]?.serial_key ?? "—";
  const mainStatus = licenses[0]?.status ?? "ไม่มีข้อมูล";

  return (
    <main className="client-root">
      <section className="client-wrap">
        {/* หัวหน้าแดชบอร์ด */}
        <header className="client-head">
          <div className="client-title">
            <div className="avatar">
              <span>{displayName?.[0]?.toUpperCase() || "C"}</span>
            </div>
            <div>
              <h1>พื้นที่ลูกค้า</h1>
              <p>ดูข้อมูลบัญชี, หมายเลข Serial และประวัติการสั่งซื้อของคุณ</p>
            </div>
          </div>
          <div className="client-head-right">
            <div className="serial-chip">
              <div className="chip-label">Serial หลัก</div>
              <div className="chip-value">{mainSerial || "—"}</div>
              <span className={statusBadgeClass(mainStatus)}>{mainStatus}</span>
            </div>
          </div>
        </header>

        {/* ถ้ามี error เล็ก ๆ */}
        {error && <div className="error-banner">⚠️ {error}</div>}

        {/* Layout สองคอลัมน์ (บนมือถือจะซ้อนลงมา) */}
        <div className="client-grid">
          {/* ซ้าย: ข้อมูลผู้ใช้ + สิทธิ์ใช้งาน */}
          <section className="panel panel-main">
            <h2>ข้อมูลบัญชี</h2>
            {loading ? (
              <div className="skeleton-block" />
            ) : (
              <div className="profile-grid">
                <div className="profile-row">
                  <span className="label">ชื่อแสดงผล</span>
                  <span className="value">{displayName}</span>
                </div>
                <div className="profile-row">
                  <span className="label">อีเมล</span>
                  <span className="value">{email ?? "—"}</span>
                </div>
                <div className="profile-row">
                  <span className="label">Username</span>
                  <span className="value">{profile?.username ?? "—"}</span>
                </div>
                <div className="profile-row">
                  <span className="label">สิทธิ์ / Role</span>
                  <span className="value">{profile?.role ?? "user"}</span>
                </div>
                <div className="profile-row">
                  <span className="label">เริ่มใช้งาน</span>
                  <span className="value">
                    {formatDate(profile?.created_at ?? undefined)}
                  </span>
                </div>
              </div>
            )}

            <div className="panel-sub">
              <h3>สิทธิ์การใช้งาน &amp; Serial</h3>
              {loading ? (
                <div className="skeleton-list" />
              ) : licenses.length === 0 ? (
                <p className="muted">
                  ยังไม่มีข้อมูล serial / license ในระบบ — ติดต่อแอดมินเพื่อเปิดสิทธิ์
                </p>
              ) : (
                <div className="license-list">
                  {licenses.map((lic) => (
                    <div key={lic.id} className="license-item">
                      <div className="license-main">
                        <div className="license-title">
                          {lic.plan_name || "License"}
                        </div>
                        <div className="license-serial">
                          Serial: <code>{lic.serial_key}</code>
                        </div>
                      </div>
                      <div className="license-meta">
                        <span className={statusBadgeClass(lic.status)}>
                          {lic.status ?? "unknown"}
                        </span>
                        <span className="license-exp">
                          หมดอายุ: {formatDate(lic.expires_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ขวา: ประวัติการสั่งซื้อ */}
          <section className="panel panel-orders">
            <h2>ประวัติการสั่งซื้อ</h2>
            {loading ? (
              <div className="skeleton-table" />
            ) : orders.length === 0 ? (
              <p className="muted">ยังไม่มีคำสั่งซื้อในระบบ</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>วันที่</th>
                      <th>สินค้า</th>
                      <th>Serial</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{formatDate(o.created_at)}</td>
                        <td>{o.product_name ?? "CAT-ALYSIM"}</td>
                        <td>
                          <code>{o.serial_key ?? "—"}</code>
                        </td>
                        <td>
                          <span className={statusBadgeClass(o.status)}>
                            {o.status ?? "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </section>

      {/* Styles */}
      <style jsx>{`
        .client-root {
          min-height: 100dvh;
          display: flex;
          justify-content: center;
          padding: 18px clamp(10px, 3vw, 24px);
        }

        .client-wrap {
          width: 100%;
          max-width: 1120px;
          border-radius: 24px;
          padding: 18px 18px 22px;
          background:
            radial-gradient(
              1200px 800px at 0% 0%,
              rgba(99, 132, 255, 0.16),
              transparent 60%
            ),
            radial-gradient(
              900px 600px at 100% 100%,
              rgba(0, 208, 132, 0.12),
              transparent 60%
            ),
            linear-gradient(
              180deg,
              rgba(10, 16, 30, 0.96),
              rgba(8, 12, 24, 0.94)
            );
          border: 1px solid rgba(180, 200, 255, 0.22);
          box-shadow:
            0 26px 80px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(18px);
        }

        .client-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .client-title {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .avatar {
          width: 46px;
          height: 46px;
          border-radius: 999px;
          background: radial-gradient(
              circle at 30% 20%,
              rgba(255, 255, 255, 0.24),
              transparent 60%
            ),
            linear-gradient(135deg, #3d66ff, #00d084);
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 20px;
          color: #f5f7ff;
          box-shadow: 0 0 24px rgba(61, 102, 255, 0.5);
        }

        .client-title h1 {
          margin: 0;
          font-size: clamp(20px, 3.6vw, 26px);
        }
        .client-title p {
          margin: 2px 0 0;
          font-size: 13px;
          color: #a9b6d6;
        }

        .client-head-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .serial-chip {
          padding: 10px 14px;
          border-radius: 14px;
          background: rgba(7, 13, 30, 0.96);
          border: 1px solid rgba(151, 174, 255, 0.4);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 220px;
        }
        .serial-chip .chip-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #9fb0e8;
        }
        .serial-chip .chip-value {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
          font-size: 13px;
          color: #eaf0ff;
          word-break: break-all;
        }

        .client-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.2fr);
          gap: 14px;
          margin-top: 8px;
        }

        .panel {
          position: relative;
          border-radius: 18px;
          padding: 14px 14px 16px;
          background: radial-gradient(
              circle at 0% 0%,
              rgba(96, 129, 255, 0.16),
              transparent 55%
            ),
            rgba(9, 13, 27, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            0 18px 44px rgba(0, 0, 0, 0.72),
            inset 0 0 0 1px rgba(255, 255, 255, 0.02);
        }

        .panel h2 {
          margin: 0 0 8px;
          font-size: 16px;
        }

        .panel-sub {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .panel-sub h3 {
          margin: 0 0 6px;
          font-size: 14px;
          color: #cdd9ff;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 6px;
        }
        .profile-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 13px;
        }
        .profile-row .label {
          color: #9fb0e8;
        }
        .profile-row .value {
          color: #e6eeff;
          text-align: right;
        }

        .license-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .license-item {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          padding: 8px 9px;
          border-radius: 12px;
          background: rgba(4, 8, 22, 0.9);
          border: 1px solid rgba(110, 140, 255, 0.34);
        }
        .license-main {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .license-title {
          font-size: 13px;
          font-weight: 600;
        }
        .license-serial {
          font-size: 12px;
          color: #b7c6ff;
        }
        .license-serial code {
          font-size: inherit;
        }
        .license-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        .license-exp {
          font-size: 11px;
          color: #a5b3da;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #dfe6ff;
          background: rgba(14, 20, 50, 0.9);
        }
        .badge-ok {
          border-color: rgba(52, 211, 153, 0.7);
          background: rgba(16, 185, 129, 0.14);
          color: #6ee7b7;
        }
        .badge-pending {
          border-color: rgba(250, 204, 21, 0.7);
          background: rgba(251, 191, 36, 0.14);
          color: #fde68a;
        }
        .badge-expired {
          border-color: rgba(148, 163, 184, 0.7);
          background: rgba(15, 23, 42, 0.8);
          color: #e5e7eb;
        }
        .badge-bad {
          border-color: rgba(239, 68, 68, 0.7);
          background: rgba(185, 28, 28, 0.28);
          color: #fecaca;
        }

        .panel-orders {
          overflow: hidden;
        }
        .table-wrap {
          margin-top: 6px;
          border-radius: 12px;
          overflow: auto;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          min-width: 420px;
        }
        th,
        td {
          padding: 7px 9px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        th {
          font-size: 12px;
          font-weight: 600;
          color: #b4c4ff;
          background: rgba(15, 23, 42, 0.9);
          position: sticky;
          top: 0;
          z-index: 1;
        }
        tbody tr:nth-child(even) td {
          background: rgba(15, 23, 42, 0.5);
        }
        code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        }

        .muted {
          font-size: 13px;
          color: #9aa6c0;
        }

        .error-banner {
          margin-bottom: 10px;
          padding: 6px 8px;
          border-radius: 8px;
          font-size: 13px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.7);
          color: #fecaca;
        }

        /* skeleton แบบง่าย ๆ */
        .skeleton-block,
        .skeleton-table,
        .skeleton-list {
          border-radius: 10px;
          background: linear-gradient(
            90deg,
            rgba(148, 163, 184, 0.08),
            rgba(148, 163, 184, 0.2),
            rgba(148, 163, 184, 0.08)
          );
          background-size: 200% 100%;
          animation: shimmer 1.6s infinite;
        }
        .skeleton-block {
          height: 120px;
          margin-top: 4px;
        }
        .skeleton-list {
          height: 80px;
          margin-top: 4px;
        }
        .skeleton-table {
          height: 160px;
          margin-top: 4px;
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* มือถือ */
        @media (max-width: 720px) {
          .client-wrap {
            padding: 14px 12px 18px;
            border-radius: 18px;
          }
          .client-head {
            flex-direction: column;
            align-items: flex-start;
          }
          .client-grid {
            grid-template-columns: minmax(0, 1fr);
          }
          .serial-chip {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
