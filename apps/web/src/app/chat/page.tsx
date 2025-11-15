// apps/web/src/app/chat/page.tsx
"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { ChatBubble } from "./ChatBubble";
import { ProfilePanel } from "./ProfilePanel";
import type { ChatMessage, Profile, InspectProfileState } from "./types";

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

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatDateLabel(iso: string) {
  try {
    const d = new Date(iso);
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    const dayDiff = Math.floor(
      (new Date(d.toDateString()).getTime() -
        new Date(today.toDateString()).getTime()) /
        oneDay,
    );

    if (dayDiff === 0) return "วันนี้";
    if (dayDiff === -1) return "เมื่อวาน";

    const dd = String(d.getDate()).padStart(2, "0");
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
    // ลอง user_profiles ก่อน
    let { data, error } = await supabase
      .from("user_profiles")
      .select("id, username, nickname, full_name, og_name, email, avatar_url")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.warn("[chat] user_profiles error, fallback to profiles:", error.message);
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

export default function ChatPage() {
  const router = useRouter();

  const [userLoaded, setUserLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [username, setUsername] = useState<string>(""); // display name self
  const [profile, setProfile] = useState<Profile | null>(null);

  const [inspectProfile, setInspectProfile] =
    useState<InspectProfileState | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ---------- helper: เลื่อนลงล่างสุด ----------
  const scrollToBottom = useCallback(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, []);

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

      // default inspector = โปรไฟล์ตัวเอง
      setInspectProfile({
        userId: u.id,
        username: displayName,
        profile:
          prof ||
          ({
            id: u.id,
            username: null,
            nickname: null,
            full_name: null,
            og_name: null,
            email: u.email ?? null,
            avatar_url: undefined,
          } as Profile),
        loading: false,
        self: true,
      });

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

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("id, room_id, sender_id, username, content, message, created_at")
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
          setTimeout(scrollToBottom, 10);
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
        (payload: any) => {
          const row = (payload.new ?? payload.record ?? payload) as any;
          if (!row) return;
          const msg = mapRow(row);
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setTimeout(scrollToBottom, 10);
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
    };
  }, [scrollToBottom]);

  // ---------- เปิดดูโปรไฟล์ตัวเอง ----------
  const openSelfProfile = () => {
    if (!userId) return;
    const myDisplayName =
      resolveDisplayName(profile, profile?.email ?? null) || username;
    setInspectProfile({
      userId,
      username: myDisplayName,
      profile,
      loading: false,
      self: true,
    });
  };

  // ---------- เปิดโปรไฟล์จาก message (คนอื่น) ----------
  const openProfileByUser = async (
    targetId: string | null,
    nameHint?: string | null,
  ) => {
    if (!targetId) return;

    if (targetId === userId) {
      openSelfProfile();
      return;
    }

    const hint = nameHint || "unknown";
    setInspectProfile({
      userId: targetId,
      username: hint,
      profile: null,
      loading: true,
      self: false,
    });

    const prof = await fetchProfileById(targetId);
    const displayName = resolveDisplayName(prof, prof?.email ?? null) || hint;

    setInspectProfile({
      userId: targetId,
      username: displayName,
      profile: prof,
      loading: false,
      self: false,
    });
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  // สำหรับ panel โปรไฟล์
  const currentProfileName =
    inspectProfile?.username || myDisplayName || username || "ไม่ระบุ";

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
          maxWidth: 1100,
          display: "flex",
          flexDirection: "row",
          gap: 16,
        }}
      >
        {/* ฝั่งซ้าย = แชท */}
        <div
          style={{
            flex: 2,
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

            {/* bubble ตัวเองมุมขวา */}
            <button
              type="button"
              onClick={openSelfProfile}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 10px",
                background: "#0a0f12",
                borderRadius: 999,
                border: "1px solid #1c2833",
                cursor: "pointer",
              }}
            >
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
              <span style={{ fontSize: 13 }}>{myDisplayName}</span>
            </button>
          </header>

          {/* การ์ดแชท */}
          <section
            style={{
              flex: 1,
              minHeight: "60vh",
              display: "flex",
              flexDirection: "column",
              background:
                "linear-gradient(145deg, rgba(10,15,18,0.96), rgba(6,8,12,0.98))",
              borderRadius: 20,
              border: "1px solid #1c2833",
              boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
              overflow: "hidden",
            }}
          >
            {/* messages list */}
            <div
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

              {/* แบ่งตามวันที่ */}
              {messages.map((m, idx) => {
                const isMine = m.sender_id && m.sender_id === userId;
                const timeLabel = formatTime(m.created_at);

                const currentDateKey = new Date(m.created_at)
                  .toISOString()
                  .slice(0, 10);
                const prev = idx > 0 ? messages[idx - 1] : null;
                const prevDateKey = prev
                  ? new Date(prev.created_at).toISOString().slice(0, 10)
                  : null;

                const showDateHeader = currentDateKey !== prevDateKey;
                const dateLabel = formatDateLabel(m.created_at);

                return (
                  <Fragment key={m.id}>
                    {showDateHeader && (
                      <div
                        style={{
                          textAlign: "center",
                          margin: "8px 0 4px",
                          fontSize: 11,
                          color: "#9aa3ad",
                          position: "relative",
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
                    />
                  </Fragment>
                );
              })}

              <div ref={bottomRef} />
            </div>

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
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: sending || !input.trim() ? "not-allowed" : "pointer",
                  opacity: sending || !input.trim() ? 0.5 : 1,
                  background: "#00d084",
                  color: "#020305",
                  whiteSpace: "nowrap",
                }}
              >
                {sending ? "กำลังส่ง..." : "ส่ง"}
              </button>
            </div>
          </section>
        </div>

        {/* ฝั่งขวา = โปรไฟล์ / inspector */}
        <ProfilePanel
          inspectProfile={inspectProfile}
          fallbackProfile={profile}
          fallbackDisplayName={currentProfileName}
          onBackToSelf={openSelfProfile}
        />
      </div>
    </main>
  );
}
