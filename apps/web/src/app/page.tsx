// apps/web/src/app/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container" id="top" style={{ padding: 0 }}>
      <section className="hero" style={{ marginBottom: 0 }}>
        <div className="hero-text">
          <h1>โปรแกรมทำสำนวนการสอบสวน</h1>
          <p className="hero-sub">
            เอกสารอัตโนมัติ แชท realtime และ OCR — รวมอยู่ที่นี่
          </p>

          <div className="cta" style={{ marginTop: 12 }}>
            <a className="btn primary" href="#download" style={{ marginRight: 8 }}>ดาวน์โหลด</a>
            <a className="btn outline" href="#demo" style={{ marginRight: 8 }}>ทดลองใช้งาน</a>
            <Link className="btn ghost" href="/login">เข้าสู่ระบบ</Link>
          </div>

          <div className="hero-features" style={{ marginTop: 12 }}>
            <ul style={{ paddingLeft: 18 }}>
              <li>เอกสารอัตโนมัติ</li>
              <li>OCR อ่านบัตร/เอกสาร</li>
              <li>แชท realtime + sync</li>
            </ul>
          </div>
        </div>
      </section>

      {/* preview section - each category has a title + a row of 3 images */}
      <section className="preview" id="center" style={{ marginTop: 8 }}>
        <div
          className="program-preview"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          {/* --- คดีอาญา --- */}
          <div className="preview-group" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ margin: 0 }}>คดีอาญา</h2>

            <div
              className="preview-row"
              style={{
                display: "flex",
                gap: 12,
                alignItems: "stretch",
                flexWrap: "wrap", // ห่อเมื่อหน้าจอแคบ
              }}
            >
              <div style={{ flex: "1 1 calc(33.333% - 8px)", minWidth: 160, maxWidth: 520 }}>
                <Image
                  src="/assets/cover.png"
                  alt="คดีอาญา - 1"
                  width={520}
                  height={920}
                  priority
                  style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: 6 }}
                />
              </div>

              <div style={{ flex: "1 1 calc(33.333% - 8px)", minWidth: 160, maxWidth: 520 }}>
                <Image
                  src="/assets/cover.png"
                  alt="คดีอาญา - 2"
                  width={520}
                  height={920}
                  priority
                  style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: 6 }}
                />
              </div>

              <div style={{ flex: "1 1 calc(33.333% - 8px)", minWidth: 160, maxWidth: 520 }}>
                <Image
                  src="/assets/cover.png"
                  alt="คดีอาญา - 3"
                  width={520}
                  height={920}
                  priority
                  style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: 6 }}
                />
              </div>
            </div>
          </div>

          {/* --- คดีจราจร --- */}
          <div className="preview-group" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ margin: 0 }}>คดีจราจร</h2>

            <div
              className="preview-row"
              style={{
                display: "flex",
                gap: 12,
                alignItems: "stretch",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 calc(33.333% - 8px)", minWidth: 160, maxWidth: 520 }}>
                <Image
                  src="/assets/cover.png"
                  alt="คดีจราจร - 1"
                  width={520}
                  height={920}
                  priority
                  style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: 6 }}
                />
              </div>

              <div style={{ flex: "1 1 calc(33.333% - 8px)", minWidth: 160, maxWidth: 520 }}>
                <Image
                  src="/assets/cover.png"
                  alt="คดีจราจร - 2"
                  width={520}
                  height={920}
                  priority
                  style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: 6 }}
                />
              </div>

              <div style={{ flex: "1 1 calc(33.333% - 8px)", minWidth: 160, maxWidth: 520 }}>
                <Image
                  src="/assets/cover.png"
                  alt="คดีจราจร - 3"
                  width={520}
                  height={920}
                  priority
                  style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: 6 }}
                />
              </div>
            </div>
          </div>

          {/* --- คดียาเสพติด --- */}
          <div className="preview-group" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={{ margin: 0 }}>คดียาเสพติด</h2>

            <div
              className="preview-row"
              style={{
                display: "flex",
                gap: 12,
                alignItems: "stretch",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 calc(33.333% - 8px)", minWidth: 160, maxWidth: 520 }}>
                <Image
                  src="/assets/cover.png"
                  alt="คดียาเสพติด - 1"
                  width={520}
                  height={920}
                  priority
                  style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: 6 }}
                />
              </div>

              <div style={{ flex: "1 1 calc(33.333% - 8px)", minWidth: 160, maxWidth: 520 }}>
                <Image
                  src="/assets/cover.png"
                  alt="คดียาเสพติด - 2"
                  width={520}
                  height={920}
                  priority
                  style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: 6 }}
                />
              </div>

              <div style={{ flex: "1 1 calc(33.333% - 8px)", minWidth: 160, maxWidth: 520 }}>
                <Image
                  src="/assets/cover.png"
                  alt="คดียาเสพติด - 3"
                  width={520}
                  height={920}
                  priority
                  style={{ width: "100%", height: "auto", objectFit: "cover", borderRadius: 6 }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features container-section" style={{ marginTop: 32 }}>
        <div className="card">
          <h3>เอกสาร</h3>
          <p>สร้างคำร้อง หมายเรียก และสำนวนอัตโนมัติ</p>
        </div>
        <div className="card">
          <h3>OCR</h3>
          <p>อ่านบัตรประชาชน ใบอนุญาต แบบแม่นยำ</p>
        </div>
        <div className="card">
          <h3>Realtime Chat</h3>
          <p>คุย/แชร์ไฟล์ และซิงก์กับ Supabase</p>
        </div>
      </section>
    </main>
  );
}
