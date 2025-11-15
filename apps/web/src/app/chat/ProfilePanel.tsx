// apps/web/src/app/chat/ProfilePanel.tsx
"use client";

import type { Profile, InspectProfileState } from "./types";

type ProfilePanelProps = {
  inspectProfile: InspectProfileState | null;
  fallbackProfile: Profile | null;
  fallbackDisplayName: string;
  onBackToSelf: () => void;
};

export function ProfilePanel({
  inspectProfile,
  fallbackProfile,
  fallbackDisplayName,
  onBackToSelf,
}: ProfilePanelProps) {
  const isSelfProfile = inspectProfile?.self ?? true;
  const loading = inspectProfile?.loading ?? false;
  const currentName =
    inspectProfile?.username || fallbackDisplayName || "ไม่ระบุ";

  const currentProfile: Profile | null =
    inspectProfile?.profile || fallbackProfile;

  const initials = currentName.slice(0, 2);

  return (
    <aside
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <section
        style={{
          borderRadius: 16,
          border: "1px solid #1c2833",
          background:
            "linear-gradient(135deg, rgba(12,18,26,0.98), rgba(6,9,14,0.98))",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          fontSize: 13,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <div style={{ fontWeight: 600 }}>
            {isSelfProfile ? "โปรไฟล์ของคุณ" : "โปรไฟล์ผู้ใช้"}
          </div>
          {!isSelfProfile && (
            <button
              type="button"
              onClick={onBackToSelf}
              style={{
                fontSize: 11,
                padding: "4px 8px",
                borderRadius: 999,
                border: "1px solid #1f2933",
                background: "transparent",
                color: "#9aa3ad",
                cursor: "pointer",
              }}
            >
              กลับไปโปรไฟล์ตัวเอง
            </button>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "#00d08433",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {initials}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{currentName}</div>
            {loading && (
              <div style={{ fontSize: 11, color: "#9aa3ad" }}>
                กำลังโหลดโปรไฟล์...
              </div>
            )}
          </div>
        </div>

        {currentProfile && (
          <div
            style={{
              marginTop: 6,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {currentProfile.full_name && (
              <div style={{ color: "#cfd7e3" }}>
                ชื่อ-สกุล: {currentProfile.full_name}
              </div>
            )}
            {currentProfile.username && (
              <div style={{ color: "#9aa3ad" }}>
                username: {currentProfile.username}
              </div>
            )}
            {currentProfile.email && (
              <div style={{ color: "#9aa3ad" }}>
                อีเมล: {currentProfile.email}
              </div>
            )}
          </div>
        )}

        {!currentProfile && !loading && (
          <div style={{ marginTop: 4, color: "#9aa3ad", fontSize: 12 }}>
            ไม่พบข้อมูลโปรไฟล์เพิ่มเติม
          </div>
        )}
      </section>
    </aside>
  );
}
