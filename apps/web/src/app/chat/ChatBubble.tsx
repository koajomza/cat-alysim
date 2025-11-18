// apps/web/src/app/chat/ChatBubble.tsx
"use client";

import type { ChatMessage } from "./types";

type ChatBubbleProps = {
  message: ChatMessage;
  isMine: boolean;
  timeLabel?: string;
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
}: ChatBubbleProps) {
  const displayName = message.username || "anonymous";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleAvatarClick = () => {
    if (onAvatarClick && message.sender_id) {
      onAvatarClick(message.sender_id, message.username ?? undefined);
    }
  };

  const bubbleBg = isMine ? "#00d08433" : "#101823";
  const bubbleBorder = isMine ? "#00d08455" : "#1f2b3a";

  // แสดง avatar / ชื่อเฉพาะ "คนอื่น" + ข้อความแรกของกลุ่ม
  const showAvatar = !isMine && isFirstOfGroup;
  const showName = !isMine && isFirstOfGroup;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        marginTop: isFirstOfGroup ? 6 : 2,
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
        {/* avatar เฉพาะคนอื่น */}
        {!isMine && (
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={!message.sender_id}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#1c2833",
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
              visibility: showAvatar ? "visible" : "hidden",
            }}
            title={
              message.sender_id
                ? `ดูโปรไฟล์ของ ${displayName}`
                : undefined
            }
          >
            {initials}
          </button>
        )}

        {/* เนื้อหา bubble + ชื่อ + เวลา */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isMine ? "flex-end" : "flex-start",
            flex: 1,
            minWidth: 0,
          }}
        >
          {/* ชื่อคนอื่น แค่บรรทัดแรกของกลุ่ม */}
          {showName && (
            <div
              style={{
                fontSize: 11,
                color: "#9aa3ad",
                marginBottom: 2,
              }}
            >
              {displayName}
            </div>
          )}

          {/* แถว bubble + เวลา อยู่ในบรรทัดเดียวกัน */}
          <div
            style={{
              display: "flex",
              flexDirection: isMine ? "row-reverse" : "row",
              alignItems: "flex-end",
              gap: 4,
            }}
          >
            {/* bubble */}
            <div
              style={{
                background: bubbleBg,
                borderRadius: 16,
                padding: "6px 10px 6px",
                border: `1px solid ${bubbleBorder}`,
                minWidth: 0,
              }}
            >
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

            {/* เวลา ข้าง ๆ bubble */}
            {timeLabel && (
              <div
                style={{
                  fontSize: 10,
                  color: "#9aa3ad",
                  whiteSpace: "nowrap",
                }}
              >
                {timeLabel}
              </div>
            )}
          </div>
        </div>

        {/* ฝั่งตรงข้ามของตัวเอง: เว้นช่องนิดหน่อยให้บาลานซ์ */}
        {isMine && <div style={{ width: 28 }} />}
      </div>
    </div>
  );
}
