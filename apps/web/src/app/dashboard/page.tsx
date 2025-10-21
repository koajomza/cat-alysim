// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }
      setEmail(user.email ?? null); // 👈 กัน undefined ให้เป็น null
    })();
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <main className="container">
      <section className="hero">
        <div className="hero-text">
          <h1>แดชบอร์ด</h1>
          <p>ยินดีต้อนรับ {email ?? "..."}</p>
          <div className="cta">
            <button className="btn ghost" onClick={signOut}>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
