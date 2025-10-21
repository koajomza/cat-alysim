// apps/web/src/components/UserMenu.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Profile = {
  username?: string | null;
  avatar_url?: string | null;
};

export default function UserMenu() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // โหลด user + profile ตอน mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function load() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        if (isMounted) {
          setProfile(null);
          setUserId(null);
          setLoading(false);
        }
        return;
      }
      if (isMounted) setUserId(user.id);

      // ดึง profile จากตาราง user_profiles (สมมติมีคอลัมน์ id = auth user id)
      try {
        const { data: p, error } = await supabase
          .from("user_profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) {
          // ถ้าไม่มี profile ให้ fallback (ยังคงแสดง email หรือ placeholder)
          console.warn("No profile found:", error.message);
          if (isMounted) setProfile({ username: null, avatar_url: null });
        } else {
          if (isMounted) setProfile(p as Profile);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setProfile({ username: null, avatar_url: null });
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    // subscribe to auth state (ล็อกอิน/ล็อกเอาท์เปลี่ยน) เพื่ออัพเดตเมนูแบบ realtime
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // ถ้า session หาย = logout -> รีเฟรชหน้า (หรือเซ็ต profile null)
      if (!session) {
        setProfile(null);
        setUserId(null);
        setLoading(false);
      } else {
        // ถ้ามี session ใหม่ ให้รีโหลด profile
        load();
      }
    });

    // คลิกข้างนอกปิด dropdown
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDoc);

    return () => {
      isMounted = false;
      sub?.subscription.unsubscribe();
      document.removeEventListener("click", onDoc);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // หลัง sign out ให้ redirect ไปหน้า home หรือ login
    router.replace("/");
  };

  const goProfileEdit = () => {
    router.push("/profile/edit"); // สร้างหน้าแก้โปรไฟล์เองตามต้องการ
    setOpen(false);
  };

  // ถ้ายังโหลด -> แสดงปุ่มเข้าสู่ระบบ/สมัคร (fallback)
  if (loading) {
    return (
      <div className="nav-actions">
        <a href="/signup" className="btn nav-btn signup">เปิดบัญชี</a>
        <a href="/login" className="btn nav-btn login">เข้าระบบ</a>
      </div>
    );
  }

  // ถ้าไม่มี user (guest)
  if (!userId) {
    return (
      <div className="nav-actions">
        <a href="/signup" className="btn nav-btn signup">เปิดบัญชี</a>
        <a href="/login" className="btn nav-btn login">เข้าสู่ระบบ</a>
      </div>
    );
  }

  // ถ้ามี user -> แสดง avatar + username
  const avatarUrl = profile?.avatar_url || `/assets/default-avatar.png`; // ใส่ default ใน public/assets
  const name = profile?.username || "ผู้ใช้";

  return (
    <div className="user-menu" ref={rootRef}>
      <button
        className="user-button"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <img src={avatarUrl} alt="avatar" className="avatar" />
        <span className="username">{name}</span>
        <svg className="chev" width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="dropdown" role="menu">
          <button className="dropdown-item" onClick={() => { router.push("/account"); setOpen(false); }}>
            โปรไฟล์ของฉัน
          </button>
          <button className="dropdown-item" onClick={goProfileEdit}>
            แก้ไขโปรไฟล์
          </button>
          <div className="dropdown-sep" />
          <button className="dropdown-item danger" onClick={handleSignOut}>
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}
