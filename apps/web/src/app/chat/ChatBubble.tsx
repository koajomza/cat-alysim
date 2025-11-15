// apps/web/src/app/chat/ChatBubble.tsx
"use client";

import type { ChatMessage } from "./types";

type ChatBubbleProps = {
  message: ChatMessage;
  isMine: boolean;
  timeLabel: string;
  onAvatarClick?: (senderId: string | null, username?: string | null) => void;
};

export function ChatBubble({ message, isMine, timeLabel, onAvatarClick }: ChatBubbleProps) {
  const handleAvatarClick = () => {
    if (onAvatarClick) {
      onAvatarClick(message.sender_id, message.username ?? undefined);
    }
  };

  const initials = (message.username ?? "?").slice(0, 2);

  const bubbleBg = isMine ? "#00d08433" : "#101823";
  const bubbleBorder = isMine ? "#00d08455" : "#1f2b3a";

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
          alignItems: "flex-start",
        }}
      >
        {/* avatar ทุกข้อความ ไม่ group ตามชื่อแล้ว */}
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
              ? `ดูโปรไฟล์ของ ${message.username || "anonymous"}`
              : undefined
          }
        >
          {initials}
        </button>

        <div
          style={{
            background: bubbleBg,
            borderRadius: 16,
            padding: "6px 10px 6px",
            border: `1px solid ${bubbleBorder}`,
            minWidth: 0,
          }}
        >
          {/* header: ชื่อ + เวลา → ทุกข้อความมีของตัวเอง */}
          <div
            style={{
              fontSize: 11,
              color: isMine ? "#c7f7de" : "#9aa3ad",
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
                fontWeight: isMine ? 600 : 500,
                cursor: message.sender_id ? "pointer" : "default",
                textAlign: "left",
              }}
            >
              {message.username || "anonymous"}
            </button>
            <span>{timeLabel}</span>
          </div>

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
      </div>
    </div>
  );
}
