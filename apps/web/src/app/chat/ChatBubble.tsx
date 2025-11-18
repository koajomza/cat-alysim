// apps/web/src/app/chat/ChatBubble.tsx
"use client";

import type { ChatMessage } from "./types";

type ChatBubbleProps = {
  message: ChatMessage;
  isMine: boolean;
  timeLabel: string;
  onAvatarClick?: (senderId: string | null, username?: string | null) => void;
  isFirstOfGroup?: boolean;
  displayName: string;
  avatarUrl?: string | null;
};

export function ChatBubble({
  message,
  isMine,
  timeLabel,
  onAvatarClick,
  isFirstOfGroup = true,
  displayName,
  avatarUrl,
}: ChatBubbleProps) {
  const handleAvatarClick = () => {
    if (onAvatarClick && message.sender_id) {
      onAvatarClick(message.sender_id, displayName || undefined);
    }
  };

  const initials = (displayName || message.username || "?")
    .slice(0, 2)
    .toUpperCase();

  const bubbleBg = isMine ? "#00d08433" : "#101823";
  const bubbleBorder = isMine ? "#00d08455" : "#1f2b3a";

  // avatar / spacer
  let avatarNode: React.ReactNode = (
    <div style={{ width: 28, height: 28 }} />
  );

  if (isFirstOfGroup) {
    const hasAvatar = !!avatarUrl;

    if (hasAvatar) {
      // มีรูป → ใช้ img
      avatarNode = (
        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={!message.sender_id}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            overflow: "hidden",
            border: "1px solid #243243",
            flexShrink: 0,
            padding: 0,
            background: "transparent",
            cursor: message.sender_id ? "pointer" : "default",
          }}
          title={
            message.sender_id
              ? `ดูโปรไฟล์ของ ${displayName || "anonymous"}`
              : undefined
          }
        >
          <img
            src={avatarUrl as string}
            alt={displayName || "avatar"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </button>
      );
    } else {
      // ไม่มีรูป → ใช้ตัวอักษรย่อ
      avatarNode = (
        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={!message.sender_id}
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: isMine ? "#00d08433" : "#1c2833",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            flexShrink: 0,
            cursor: message.sender_id ? "pointer" : "default",
            border: "none",
            padding: 0,
          }}
          title={
            message.sender_id
              ? `ดูโปรไฟล์ของ ${displayName || "anonymous"}`
              : undefined
          }
        >
          {initials}
        </button>
      );
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          display: "flex",
          gap: 8,
          flexDirection: isMine ? "row-reverse" : "row",
          alignItems: "flex-end",
        }}
      >
        {/* avatar / spacer */}
        {avatarNode}

        {/* bubble + timestamp */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isMine ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{
              background: bubbleBg,
              borderRadius: 16,
              padding: "6px 10px 6px",
              border: `1px solid ${bubbleBorder}`,
              minWidth: 0,
            }}
          >
            {/* header: ชื่อ + เวลา (เฉพาะคนอื่น) */}
            {!isMine && (
              <div
                style={{
                  fontSize: 11,
                  color: "#9aa3ad",
                  marginBottom: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={!message.sender_id}
                  style={{
                    padding: 0,
                    margin: 0,
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    fontSize: "inherit",
                    fontWeight: 500,
                    cursor: message.sender_id ? "pointer" : "default",
                    textAlign: "left",
                  }}
                >
                  {displayName || "anonymous"}
                </button>
                <span>{timeLabel}</span>
              </div>
            )}

            {/* เนื้อข้อความ */}
            <div
              style={{
                fontSize: 13,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {message.content}
            </div>
          </div>

          {/* เวลาของตัวเองอยู่ข้างล่าง */}
          {isMine && (
            <div
              style={{
                marginTop: 2,
                fontSize: 11,
                color: "#9aa3ad",
              }}
            >
              {timeLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
