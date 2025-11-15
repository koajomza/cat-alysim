// apps/web/src/components/NavAuth.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type NavAuthProps = {
  mode: "desktop" | "mobile";
};

type UserMiniProfile = {
  id: string;
  displayName: string;
};

async function loadDisplayName(userId: string, email: string | null): Promise<string> {
  try {
    // ลอง user_profiles ก่อน
    let { data, error } = await supabase
      .from("user_profiles")
      .select("username, nickname, full_name, og_name, email")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("[NavAuth] user_profiles error:", error.message);
    }

    if (!data) {
      const res2 = await supabase
        .from("profiles")
        .select("username, nickname, full_name, email")
        .eq("id", userId)
        .maybeSingle();
      data = res2.data as any;
    }

    const display =
      (data?.nickname as string) ||
      (data?.full_name as string) ||
      (data?.og_name as string) ||
      (data?.username as string) ||
      (data?.email as string)?.split("@")[0] ||
      (email ?? "").split("@")[0] ||
      "สมาชิก";

    return display;
  } catch (e) {
    console.warn("[NavAuth] loadDisplayName fallback:", e);
    return (email ?? "").split("@")[0] || "สมาชิก";
  }
}

export default function NavAuth({ mode }: NavAuthProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserMiniProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false); // ใช้เฉพาะ desktop

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          if (!cancelled) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const u = data.user;
        const displayName = await loadDisplayName(u.id, u.email ?? null);
        if (!cancelled) {
          setUser({ id: u.id, displayName });
          setLoading(false);
        }
      } catch (e) {
        console.error("[NavAuth] load user error:", e);
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("[NavAuth] logout error:", e);
    } finally {
      setMenuOpen(false);
      // ปิด hamburger ถ้าอยู่บนมือถือ
      if (typeof document !== "undefined") {
        const toggle = document.getElementById("nav-toggle") as HTMLInputElement | null;
        if (toggle) toggle.checked = false;
      }
      router.push("/login");
    }
  }, [router]);

  // ========== Desktop ==========
  if (mode === "desktop") {
    if (loading) {
      return (
        <div className="nav-actions">
          <div
            style={{
              width: 120,
              height: 32,
              borderRadius: 999,
              background: "rgba(255,255,255,0.04)",
            }}
          />
        </div>
      );
    }

    // ยังไม่ล็อกอิน -> แสดง เปิดบัญชี / เข้าสู่ระบบ เหมือนเดิม
    if (!user) {
      return (
        <div className="nav-actions">
          <Link href="/signup" className="nav-btn signup">
            เปิดบัญชี
          </Link>
          <Link href="/login" className="nav-btn login">
            เข้าสู่ระบบ
          </Link>
        </div>
      );
    }

    const initials = user.displayName.slice(0, 2).toUpperCase();

    // ล็อกอินแล้ว -> แสดงชื่อ + dropdown
    return (
      <div className="nav-user">
        <button
          type="button"
          className="nav-user-btn"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <div className="nav-user-avatar">{initials}</div>
          <span className="nav-user-name">{user.displayName}</span>
          <span className="nav-user-caret">▾</span>
        </button>

        {menuOpen && (
          <div className="nav-user-menu">
            <Link href="/account" className="nav-user-item">
              พื้นที่สมาชิก
            </Link>
            <button type="button" className="nav-user-item" onClick={signOut}>
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    );
  }

  // ========== Mobile (เมนูในเบอร์เกอร์) ==========
  if (loading) {
    return null;
  }

  if (!user) {
    // ยังไม่ล็อกอิน -> login / signup
    return (
      <>
        <Link href="/login" className="nav-mobile-link">
          เข้าสู่ระบบ
        </Link>
        <Link href="/signup" className="nav-mobile-link primary">
          สมัครสมาชิก
        </Link>
      </>
    );
    }

  // ล็อกอินแล้ว -> พื้นที่สมาชิก / ออกจากระบบ
  return (
    <>
      <Link href="/account" className="nav-mobile-link">
        พื้นที่สมาชิก
      </Link>
      <button
        type="button"
        onClick={signOut}
        className="nav-mobile-link"
        style={{
          textAlign: "left",
          border: "none",
          background: "transparent",
          padding: "9px 12px",
        }}
      >
        ออกจากระบบ
      </button>
    </>
  );
}
