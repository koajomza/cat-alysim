"use client";

import Image from "next/image";

export default function HomePage() {
  return (
    <main className="container" id="top">
      <section className="hero">
        <div className="hero-text">
          <h1>ระบบจัดการคดีแบบครบวงจร</h1>
          <p>เอกสารอัตโนมัติ แชท realtime และ OCR—all in one.</p>
          <div className="cta">
            <a className="btn primary" href="#download">ดาวน์โหลด</a>
            <a className="btn ghost" href="#account">ตรวจสอบไลเซนส์</a>
          </div>
        </div>

        <div className="hero-img">
          <Image
            src="/assets/conver.png"   // 👈 ใช้ชื่อ conver.png
            alt="CAT-ALYSIM preview"
            width={808}
            height={808}
            priority
          />
        </div>
      </section>
    </main>
  );
}
