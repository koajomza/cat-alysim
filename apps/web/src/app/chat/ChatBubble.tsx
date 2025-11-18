// apps/web/src/app/chat/ChatBubble.tsx
"use client";

import type React from "react";
import type { ChatMessage } from "./types";

type ChatBubbleProps = {
  message: ChatMessage;
  isMine: boolean;
  timeLabel: string;
  onAvatarClick?: (userId: string | null, nameHint?: string | null) => void;
  isFirstOfGroup: boolean;
  displayName: string;
  avatarUrl?: string | null;
};

const AVATAR_SIZE = 30;
const AVATAR_GAP = 6;

export function ChatBubble(props: ChatBubbleProps) {
  const {
    message,
    isMine,
    timeLabel,
    onAvatarClick,
    isFirstOfGroup,
    displayName,
    avatarUrl,
  } = props;

  const text = message.content || "";

  // base style ของ bubble
  const bubbleBase: React.CSSProperties = {
    maxWidth: "72%",
    padding: "6px 10px",
    borderRadius: 14,
    fontSize: 13,
    lineHeight: 1.4,
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  };

  const mineBubble: React.CSSProperties = {
    ...bubbleBase,
    background:
      "linear-gradient(135deg, rgba(0,208,132,0.18), rgba(0,208,132,0.32))",
    border: "1px solid #00d08488",
    color: "#e6eef8",
    borderBottomRightRadius: 4,
  };

  const otherBubble: React.CSSProperties = {
    ...bubbleBase,
    background: "#0a0f12",
    border: "1px solid #1c2833",
    color: "#e6eef8",
    borderBottomLeftRadius: 4,
  };

  const timeStyle: React.CSSProperties = {
    fontSize: 10,
    color: "#9aa3ad",
    opacity: 0.9,
    whiteSpace: "nowrap",
  };

  const nameStyle: React.CSSProperties = {
    fontSize: 11,
    color: "#9aa3ad",
    marginBottom: 2,
  };

  const initials =
    (displayName || "??")
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("") || "??";

  // ✅ สำหรับฝั่งคนอื่น: โชว์ avatar ทุกบับเบิล
  const showAvatar = !isMine;

  const avatarElement = showAvatar ? (
    <button
      type="button"
      onClick={() => onAvatarClick?.(message.sender_id, displayName)}
      style={{
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: "50%",
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
            border: "1px solid #243243",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "#1c2833",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#e6eef8",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {initials}
        </div>
      )}
    </button>
  ) : null;

  // ================= ฝั่งเรา (sender) =================
  // ไม่มี avatar / เวลาอยู่นอก bubble ด้านซ้าย / bubble ชิดขวา
  if (isMine) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 6,
            maxWidth: "100%",
          }}
        >
          <span style={timeStyle}>{timeLabel}</span>
          <div style={mineBubble}>{text}</div>
        </div>
      </div>
    );
  }

  // ================= ฝั่งคนอื่น =================
  // avatar | (ชื่อ + [bubble + เวลา])
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: 2,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: AVATAR_GAP,
          maxWidth: "100%",
        }}
      >
        {avatarElement}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "100%",
          }}
        >
          {isFirstOfGroup && <div style={nameStyle}>{displayName}</div>}

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
              maxWidth: "100%",
            }}
          >
            <div style={otherBubble}>{text}</div>
            <span style={timeStyle}>{timeLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
