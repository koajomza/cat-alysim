// app/(client)/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [loadingOut, setLoadingOut] = useState(false);

  // ถ้าไม่มี session ให้เด้งกลับ /login
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then((res) => {
      const user = res.data.user;
      if (!user) {
        router.replace("/login");
        return;
      }
      if (mounted) setEmail(user.email ?? null);
    });
    return () => {
      mounted = false;
    };
  }, [router]);

  const signOut = async () => {
    if (loadingOut) return;
    setLoadingOut(true);
    try {
      await supabase.auth.signOut();
      router.replace("/login");
    } finally {
      setLoadingOut(false);
    }
  };

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className="px-3 py-2 rounded-lg"
        style={{
          color: active ? "#E6EEFF" : "#A9B6D6",
          background: active ? "rgba(255,255,255,0.08)" : "transparent",
          border: active ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "linear-gradient(135deg,#0B1220 0%,#0E1424 100%)",
        color: "#E6EEFF",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(10,14,28,0.7)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link href="/dashboard" style={{ fontWeight: 800, fontSize: 20 }}>
          🐱 CAT-ALYSIM
        </Link>
        <nav style={{ display: "flex", gap: 6, marginLeft: 12 }}>
          {navLink("/dashboard", "ภาพรวม")}
          {navLink("/cases", "คดีของฉัน")}
          {navLink("/documents", "เอกสาร")}
          {navLink("/settings", "ตั้งค่า")}
        </nav>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#AFC6FF" }}>
            {email ?? "กำลังโหลด..."}
          </span>
          <button
            onClick={signOut}
            disabled={loadingOut}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #567BFF",
              background: "transparent",
              color: "#AFC6FF",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {loadingOut ? "ออกระบบ..." : "ออกระบบ"}
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>{children}</main>

      {/* Footer เล็ก ๆ */}
      <footer
        style={{
          marginTop: 24,
          padding: 16,
          textAlign: "center",
          opacity: 0.7,
          fontSize: 13,
        }}
      >
        © {new Date().getFullYear()} CAT-ALYSIM • v{process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0"} •
        Last update: {process.env.NEXT_PUBLIC_LAST_UPDATE ?? "—"}
      </footer>
    </div>
  );
}
