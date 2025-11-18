// apps/web/src/app/chat/page.tsx
"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { UIEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { ChatBubble } from "./ChatBubble";
import type { ChatMessage, Profile } from "./types";

// ===== helper: format date/time =====
const TH_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

// force +7 ชั่วโมง (Bangkok)
const BKK_OFFSET_MS = 7 * 60 * 60 * 1000;

function toBangkokDate(iso: string): Date {
  const base = new Date(iso);
  if (Number.isNaN(base.getTime())) return new Date();
  return new Date(base.getTime() + BKK_OFFSET_MS);
}

function formatTime(iso: string) {
  try {
    const d = toBangkokDate(iso);
    return d.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "";
  }
}

function formatDateLabel(iso: string) {
  try {
    const d = toBangkokDate(iso);
    if (Number.isNaN(d.getTime())) return "";

    const targetStr = d.toLocaleDateString("th-TH");

    // today / yesterday (Bangkok)
    const now = new Date();
    const nowBkk = new Date(now.getTime() + BKK_OFFSET_MS);
    const todayStr = nowBkk.toLocaleDateString("th-TH");

    const yesterdayBkk = new Date(nowBkk.getTime());
    yesterdayBkk.setDate(yesterdayBkk.getDate() - 1);
    const yesterdayStr = yesterdayBkk.toLocaleDateString("th-TH");

    if (targetStr === todayStr) return "วันนี้";
    if (targetStr === yesterdayStr) return "เมื่อวาน";

    const dd = d
      .toLocaleDateString("th-TH", { day: "2-digit" })
      .padStart(2, "0");
    const mm = TH_MONTHS_SHORT[d.getMonth()] ?? "";
    const yy = d.getFullYear() + 543; // BE

    return `${dd} ${mm} ${yy}`;
  } catch {
    return "";
  }
}

function resolveDisplayName(
  p: Partial<Profile> | null,
  fallbackEmail?: string | null,
) {
  return (
    (p?.nickname as string) ||
    (p?.full_name as string) ||
    (p?.og_name as string) ||
    (p?.username as string) ||
    (fallbackEmail ?? "").split("@")[0] ||
    "anon"
  );
}

async function fetchProfileById(id: string): Promise<Profile | null> {
  try {
    let { data, error } = await supabase
      .from("user_profiles")
      .select(
        "id, username, nickname, full_name, og_name, email, avatar_url",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.warn(
        "[chat] user_profiles error, fallback to profiles:",
        error.message,
      );
    }

    if (!data) {
      const res2 = await supabase
        .from("profiles")
        .select("id, username, nickname, full_name, email, avatar_url")
        .eq("id", id)
        .maybeSingle();
      data = res2.data as any;
    }

    if (!data) return null;

    return {
      id: (data.id as string) ?? id,
      username: (data.username as string) ?? null,
      nickname: (data.nickname as string) ?? null,
      full_name: (data.full_name as string) ?? null,
      og_name: (data.og_name as string) ?? null,
      email: (data.email as string) ?? null,
      avatar_url: (data.avatar_url as string) ?? undefined,
    };
  } catch (e) {
    console.error("[chat] fetchProfileById exception:", e);
    return null;
  }
}

// emoji ชุดเล็ก ๆ เอาไว้จิ้มเล่น
const EMOJIS = [
  "😀",
  "😂",
  "🤣",
  "😊",
  "😍",
  "😅",
  "😎",
  "🤔",
  "😭",
  "👍",
  "🙏",
  "🔥",
  "💬",
  "🚓",
  "⚖️",
  "📄",
];

export default function ChatPage() {
  const router = useRouter();

  const [userLoaded, setUserLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [username, setUsername] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const isAtBottomRef = useRef(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // profile cache ของทุก sender
  const [profileMap, setProfileMap] = useState<Record<string, Profile>>(
    {},
  );
  const profileMapRef = useRef<Record<string, Profile>>({});
  useEffect(() => {
    profileMapRef.current = profileMap;
  }, [profileMap]);

  // detect mobile (เอาไว้ย้ายตำแหน่ง toast)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showToast = (text: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(text);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ---------- helper: เลื่อนลงล่างสุด ----------
  const scrollToBottom = useCallback(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, []);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const threshold = 80;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;

    setIsAtBottom(atBottom);
    isAtBottomRef.current = atBottom;

    if (atBottom) {
      setHasNewMessages(false);
      setNewMessagesCount(0);
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // ---------- โหลด user / profile ตัวเอง ----------
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push("/login");
        return;
      }
      if (cancelled) return;

      const u = data.user;
      setUserId(u.id);

      const prof = await fetchProfileById(u.id);
      const displayName = resolveDisplayName(prof, u.email);

      if (cancelled) return;

      setUsername(displayName);
      setProfile(
        prof || {
          id: u.id,
          username: null,
          nickname: null,
          full_name: null,
          og_name: null,
          email: u.email ?? null,
          avatar_url: undefined,
        },
      );

      setUserLoaded(true);
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // ---------- โหลด history + subscribe realtime ----------
  useEffect(() => {
    let cancelled = false;

    const mapRow = (row: any): ChatMessage => ({
      id: String(row.id ?? crypto.randomUUID()),
      room_id: String(row.room_id ?? "global"),
      sender_id: row.sender_id ?? null,
      username: row.username ?? null,
      content: row.content ?? row.message ?? "",
      created_at: row.created_at ?? new Date().toISOString(),
    });

    const prefetchProfilesForMessages = async (rows: ChatMessage[]) => {
      const ids = Array.from(
        new Set(
          rows
            .map((m) => m.sender_id)
            .filter(
              (id): id is string =>
                !!id && (!userId || id !== userId),
            ),
        ),
      );
      if (!ids.length) return;

      // ตัดตัวที่มีใน cache แล้วออก
      const missing = ids.filter((id) => !profileMapRef.current[id]);
      if (!missing.length) return;

      const { data, error } = await supabase
        .from("user_profiles")
        .select(
          "id, username, nickname, full_name, og_name, email, avatar_url",
        )
        .in("id", missing);

      if (error) {
        console.warn("[chat] prefetchProfiles error:", error.message);
        return;
      }

      const next: Record<string, Profile> = {};
      for (const row of data ?? []) {
        const p: Profile = {
          id: row.id as string,
          username: (row.username as string) ?? null,
          nickname: (row.nickname as string) ?? null,
          full_name: (row.full_name as string) ?? null,
          og_name: (row.og_name as string) ?? null,
          email: (row.email as string) ?? null,
          avatar_url: (row.avatar_url as string) ?? undefined,
        };
        if (!p.id) {
          continue;
        }
        next[p.id] = p;
      }

      if (!cancelled) {
        setProfileMap((prev) => ({ ...prev, ...next }));
      }
    };

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select(
            "id, room_id, sender_id, username, content, message, created_at",
          )
          .eq("room_id", "global")
          .order("created_at", { ascending: true })
          .limit(200);

        if (error) {
          console.error("load chat error:", error);
        }

        if (!cancelled && data) {
          const mapped = data.map(mapRow);
          setMessages(mapped);
          setLoading(false);
          setTimeout(() => {
            scrollToBottom();
            setIsAtBottom(true);
            isAtBottomRef.current = true;
          }, 10);

          prefetchProfilesForMessages(mapped);
        }
      } catch (e) {
        console.error("load chat exception:", e);
        if (!cancelled) setLoading(false);
      }
    };

    load();

    const channel = supabase
      .channel("chat-global")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: "room_id=eq.global",
        },
        async (payload: any) => {
          const row = (payload.new ?? payload.record ?? payload) as any;
          if (!row) return;
          const msg = mapRow(row);

          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });

          const senderId = msg.sender_id;

          // ถ้ายังไม่มี profile ของ sender ให้โหลดเพิ่ม
          if (
            senderId &&
            (!userId || senderId !== userId) &&
            !profileMapRef.current[senderId]
          ) {
            const p = await fetchProfileById(senderId);
            if (p) {
              const pid = p.id || senderId;
              setProfileMap((prev) => {
                if (prev[pid]) return prev;
                return { ...prev, [pid]: { ...p, id: pid } };
              });
            }
          }

          const isMine = !!(senderId && senderId === userId);

          if (isMine) {
            // ข้อความของเราเอง แค่เลื่อนลง ไม่ต้องแจ้งเตือน
            setTimeout(() => {
              scrollToBottom();
              setIsAtBottom(true);
              isAtBottomRef.current = true;
              setHasNewMessages(false);
              setNewMessagesCount(0);
            }, 10);
          } else if (isAtBottomRef.current && !isMobile) {
            // เดสก์ท็อป + อยู่ท้ายสุด → เลื่อนลงเฉย ๆ ไม่ต้อง toast
            setTimeout(() => {
              scrollToBottom();
              setIsAtBottom(true);
              isAtBottomRef.current = true;
              setHasNewMessages(false);
              setNewMessagesCount(0);
            }, 10);
          } else {
            // มือถือ หรือ เราเลื่อนขึ้นไปดูของเก่า → โชว์ toast + แถบ "มีข้อความใหม่"
            setHasNewMessages(true);
            setNewMessagesCount((c) => c + 1);

            const previewText =
              (msg.content || "").length > 40
                ? msg.content.slice(0, 40) + "…"
                : msg.content || "ข้อความใหม่";

            const senderProfile =
              (senderId && profileMapRef.current[senderId]) || null;
            const senderLabel =
              msg.username ||
              resolveDisplayName(senderProfile, senderProfile?.email);

            showToast(`${senderLabel}: ${previewText}`);
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[chat] realtime subscribed (global)");
        }
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [scrollToBottom, userId, isMobile]);

  // avatar click (ยังไม่ทำอะไรพิเศษ)
  const openProfileByUser = async (
    targetId: string | null,
    _nameHint?: string | null,
  ) => {
    if (!targetId) return;
    console.log("[chat] avatar clicked:", targetId);
  };

  // ---------- ส่งข้อความ ----------
  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      const payload: any = {
        room_id: "global",
        content: text,
        username: username || "anon",
      };
      if (userId) payload.sender_id = userId;

      const { error } = await supabase.from("chat_messages").insert(payload);
      if (error) {
        console.error("send error:", error);
      } else {
        setInput("");
      }
    } catch (e) {
      console.error("send exception:", e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!userLoaded) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050507",
          color: "#e6eef8",
        }}
      >
        กำลังโหลด...
      </main>
    );
  }

  const myDisplayName =
    resolveDisplayName(profile, profile?.email ?? null) || username;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        display: "flex",
        justifyContent: "center",
        background: "#050507",
        color: "#e6eef8",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              Global Chat
            </div>
            <div style={{ fontSize: 12, color: "#9aa3ad" }}>
              ห้องรวมแชท CAT-ALYSIM — room_id: <code>global</code>
            </div>
          </div>

          {/* โปรไฟล์ตัวเอง */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              background: "#0a0f12",
              borderRadius: 999,
              border: "1px solid #1c2833",
            }}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={myDisplayName}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #243243",
                }}
              />
            ) : (
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#00d08422",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {(myDisplayName || "ME").slice(0, 2)}
              </div>
            )}

            <span style={{ fontSize: 13 }}>{myDisplayName}</span>
          </div>
        </header>

        {/* การ์ดแชท */}
        <section
          style={{
            height: "80vh",
            display: "flex",
            flexDirection: "column",
            background:
              "linear-gradient(145deg, rgba(10,15,18,0.96), rgba(6,8,12,0.98))",
            borderRadius: 20,
            border: "1px solid #1c2833",
            boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* messages list */}
          <div
            ref={messagesRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              padding: "16px 16px 8px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {loading && (
              <div
                style={{
                  fontSize: 13,
                  color: "#9aa3ad",
                  textAlign: "center",
                }}
              >
                กำลังโหลดแชท...
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div
                style={{
                  fontSize: 13,
                  color: "#9aa3ad",
                  textAlign: "center",
                }}
              >
                ยังไม่มีข้อความ ลองพิมพ์อะไรซักอย่างดูดิ
              </div>
            )}

            {messages.map((m, idx) => {
              const isMine = m.sender_id && m.sender_id === userId;
              const timeLabel = formatTime(m.created_at);

              const d = toBangkokDate(m.created_at);
              const currentDateKey = d.toLocaleDateString("th-TH");

              const prev = idx > 0 ? messages[idx - 1] : null;
              const prevDateKey = prev
                ? toBangkokDate(prev.created_at).toLocaleDateString("th-TH")
                : null;

              const showDateHeader = currentDateKey !== prevDateKey;
              const dateLabel = formatDateLabel(m.created_at);

              let isFirstOfGroup = true;
              if (
                prev &&
                prev.sender_id === m.sender_id &&
                prevDateKey === currentDateKey
              ) {
                isFirstOfGroup = false;
              }

              // ดึง profile ของ sender
              const senderId = m.sender_id;
              let senderProfile: Profile | null = null;

              if (senderId && profileMap[senderId]) {
                senderProfile = profileMap[senderId];
              } else if (isMine) {
                senderProfile = profile;
              }

              const displayName = isMine
                ? myDisplayName
                : m.username ||
                  resolveDisplayName(
                    senderProfile,
                    senderProfile?.email ?? null,
                  );

              const avatarUrl =
                senderProfile?.avatar_url ??
                (isMine ? profile?.avatar_url ?? null : null);

              return (
                <Fragment key={m.id}>
                  {showDateHeader && (
                    <div
                      style={{
                        textAlign: "center",
                        margin: "8px 0 4px",
                        fontSize: 11,
                        color: "#9aa3ad",
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 8px",
                          background:
                            "linear-gradient(135deg, rgba(5,7,10,0.98), rgba(8,12,18,0.96))",
                          borderRadius: 999,
                          border: "1px solid #1c2833",
                        }}
                      >
                        {dateLabel}
                      </span>
                    </div>
                  )}

                  <ChatBubble
                    message={m}
                    isMine={!!isMine}
                    timeLabel={timeLabel}
                    onAvatarClick={openProfileByUser}
                    isFirstOfGroup={isFirstOfGroup}
                    displayName={displayName}
                    avatarUrl={avatarUrl}
                  />
                </Fragment>
              );
            })}

            <div ref={bottomRef} />
          </div>

          {/* แถบเทา "มีข้อความใหม่..." บนช่องพิมพ์ */}
          {hasNewMessages && !isAtBottom && (
            <div
              style={{
                padding: "4px 12px 0",
                background:
                  "linear-gradient(180deg, rgba(5,7,10,0.4), rgba(5,7,10,0))",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  scrollToBottom();
                  setHasNewMessages(false);
                  setNewMessagesCount(0);
                  setIsAtBottom(true);
                  isAtBottomRef.current = true;
                  setToastMessage(null);
                }}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid #243243",
                  background: "#111822",
                  color: "#e6eef8",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#00d084",
                    flexShrink: 0,
                  }}
                />
                <span>
                  มีข้อความใหม่
                  {newMessagesCount > 0
                    ? ` ${newMessagesCount} ข้อความ`
                    : ""}
                  — แตะเพื่อเลื่อนไปท้ายสุด
                </span>
              </button>
            </div>
          )}

          {/* input */}
          <div
            style={{
              padding: 12,
              borderTop: "1px solid #1c2833",
              background: "rgba(5,7,10,0.9)",
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="พิมพ์ข้อความแล้วกด Enter เพื่อส่ง (Shift+Enter ขึ้นบรรทัดใหม่)"
              style={{
                flex: 1,
                resize: "none",
                minHeight: 40,
                maxHeight: 120,
                padding: "8px 10px",
                borderRadius: 14,
                border: "1px solid #243243",
                background: "#05070b",
                color: "#e6eef8",
                fontSize: 13,
                outline: "none",
              }}
            />

            {/* ปุ่ม emoji */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker((v) => !v)}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1px solid #243243",
                background: "#05070b",
                color: "#e6eef8",
                fontSize: 18,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              😊
            </button>

            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor:
                  sending || !input.trim() ? "not-allowed" : "pointer",
                opacity: sending || !input.trim() ? 0.5 : 1,
                background: "#00d084",
                color: "#020305",
                whiteSpace: "nowrap",
              }}
            >
              {sending ? "กำลังส่ง..." : "ส่ง"}
            </button>
          </div>

          {/* emoji picker เล็ก ๆ */}
          {showEmojiPicker && (
            <div
              style={{
                position: "absolute",
                right: 80,
                bottom: 70,
                padding: 8,
                borderRadius: 12,
                border: "1px solid #1c2833",
                background: "rgba(5,7,10,0.98)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.8)",
                maxWidth: 220,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {EMOJIS.map((emo) => (
                  <button
                    key={emo}
                    type="button"
                    onClick={() => handleInsertEmoji(emo)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: "1px solid #243243",
                      background: "#05070b",
                      fontSize: 18,
                      cursor: "pointer",
                    }}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* toast: เด้งแถว ๆ เหนือช่องพิมพ์ ทั้งเดสก์ท็อปและมือถือ */}
          {toastMessage && (
            <button
              type="button"
              onClick={() => {
                scrollToBottom();
                setHasNewMessages(false);
                setNewMessagesCount(0);
                setToastMessage(null);
                setIsAtBottom(true);
                isAtBottomRef.current = true;
              }}
              style={{
                position: "absolute",
                zIndex: 30,
                right: isMobile ? 16 : 24,
                left: isMobile ? 16 : "auto",
                top: "auto",
                bottom: 90,
                maxWidth: isMobile ? "calc(100% - 32px)" : 320,
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #243243",
                background: "#111822",
                color: "#e6eef8",
                fontSize: 12,
                textAlign: "left",
                boxShadow: "0 14px 30px rgba(0,0,0,0.8)",
                cursor: "pointer",
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  marginTop: 2,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#00d084",
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 2,
                    fontSize: 12,
                  }}
                >
                  ข้อความใหม่
                </div>
                <div style={{ fontSize: 12 }}>{toastMessage}</div>
              </div>
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
