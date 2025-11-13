// apps/web/src/app/docs/page.tsx
"use client";

import Link from "next/link";

type DocLink = {
  title: string;
  desc: string;
  href: string;
  tag: string;
};

const DOC_LINKS: DocLink[] = [
  {
    title: "เริ่มต้นใช้งาน CAT-ALYSIM",
    desc: "ติดตั้งโปรแกรม, login ครั้งแรก, เชื่อมฐานข้อมูล, sync กับ Supabase (overview).",
    href: "/docs/getting-started",
    tag: "เริ่มต้น",
  },
  {
    title: "ติดตั้ง · อัปเดตเวอร์ชัน",
    desc: "โหลดไฟล์ติดตั้ง, วิธีอัปเดตแบบไม่ต้องลบของเก่า, เช็ค version / changelog.",
    href: "/docs/install-update",
    tag: "Setup",
  },
  {
    title: "วิดีโอสอนการใช้งาน (Video Tutorials)",
    desc: "รวมลิงก์ YouTube/คลิปสอน: เพิ่มคดี, กรอกสำนวน, สร้าง Word/PDF อัตโนมัติ ฯลฯ",
    href: "/docs/video-tutorials",
    tag: "คลิปสอน",
  },
  {
    title: "Tips & Tricks – ทำงานให้เร็วขึ้น",
    desc: "ช็อตคัต, ทริกกรอกข้อมูลเร็ว, Template ที่ควรเซตไว้, วิธีลดงานซ้ำ ๆ.",
    href: "/docs/tips",
    tag: "Tips",
  },
  {
    title: "ปัญหาที่เจอบ่อย (FAQ)",
    desc: "ตอบคำถามยอดฮิต: ลงโปรแกรมไม่ผ่าน, login ไม่ได้, serial ใช้กับหลายเครื่องได้ไหม ฯลฯ",
    href: "/docs/faq",
    tag: "FAQ",
  },
  {
    title: "แก้ปัญหาเบื้องต้น (Troubleshooting)",
    desc: "โปรแกรมค้าง, ขึ้น error เวลา generate Word, ต่อเน็ตแต่ Supabase ไม่ sync ฯลฯ",
    href: "/docs/troubleshooting",
    tag: "แก้ Error",
  },
];

export default function DocsPage() {
  return (
    <main className="docs-root">
      <section className="docs-wrap">
        {/* Head + quick intro */}
        <header className="docs-head">
          <div className="head-left">
            <p className="eyebrow">Documentation · คู่มือการใช้งาน CAT-ALYSIM</p>
            <h1>คู่มือ & วิดีโอสอนการใช้งาน</h1>
            <p className="lead">
              รวมลิงก์อ่าน, คลิปสอน, Tips และปัญหาที่เจอบ่อย
              เอาไว้ที่เดียวให้หาง่าย ไม่ต้องนั่งเดาเองให้หัวร้อน
            </p>

            <div className="quick-tags">
              <span className="tag">ติดตั้งโปรแกรม</span>
              <span className="tag">ทำสำนวน</span>
              <span className="tag">Generate เอกสาร</span>
              <span className="tag">Supabase / ออนไลน์</span>
            </div>
          </div>

          <aside className="head-right">
            <div className="mini-panel">
              <h2>เริ่มจากตรงไหนดี ?</h2>
              <ol>
                <li>
                  <Link href="/docs/getting-started">อ่าน “เริ่มต้นใช้งาน”</Link>
                </li>
                <li>
                  <Link href="/docs/video-tutorials">เปิดคลิปสอนที่สนใจ</Link>
                </li>
                <li>
                  <Link href="/docs/faq">เช็ค FAQ ถ้ามีปัญหาพื้นฐาน</Link>
                </li>
                <li>
                  <Link href="/contact">ติดต่อทีม dev ถ้ายังไม่จบ</Link>
                </li>
              </ol>
              <p className="note">
                * หน้าพวกนี้ยัง mockup ได้ก่อน แล้วค่อยใส่เนื้อจริง / ลิงก์ YouTube ภายหลัง
              </p>
            </div>
          </aside>
        </header>

        {/* main links */}
        <section className="docs-grid">
          {DOC_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="doc-card">
              <div className="doc-tag">{item.tag}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <span className="doc-more">ดูรายละเอียด →</span>
            </Link>
          ))}
        </section>

        {/* video mockup / FAQ preview */}
        <section className="docs-lower">
          <div className="video-panel">
            <div className="video-header">
              <span className="chip">Video Hub</span>
              <span className="video-caption">พื้นที่รวมคลิปสอน (ยังเป็น mockup)</span>
            </div>
            <div className="video-grid">
              {/* 3 ช่อง mockup: เอาไว้ใส่ลิงก์ YouTube จริงทีหลัง */}
              <div className="video-card">
                <div className="thumb">
                  <div className="play">▶</div>
                </div>
                <div className="video-text">
                  <div className="video-title">ติดตั้ง + ตั้งค่าครั้งแรก</div>
                  <div className="video-sub">แนะนำตั้งแต่โหลดไฟล์จนเข้า Dashboard ได้</div>
                  <div className="video-meta">ความยาว ~10–15 นาที • ยังไม่ใส่ลิงก์</div>
                </div>
              </div>
              <div className="video-card">
                <div className="thumb">
                  <div className="play">▶</div>
                </div>
                <div className="video-text">
                  <div className="video-title">เพิ่มคดีใหม่ + กรอกข้อมูลผู้ต้องหา</div>
                  <div className="video-sub">โชว์ flow เต็ม ๆ ตั้งแต่หน้าแรกจนสร้างเอกสาร</div>
                  <div className="video-meta">ความยาว ~20 นาที • ยังไม่ใส่ลิงก์</div>
                </div>
              </div>
              <div className="video-card">
                <div className="thumb">
                  <div className="play">▶</div>
                </div>
                <div className="video-text">
                  <div className="video-title">Generate Word/PDF อัตโนมัติ</div>
                  <div className="video-sub">เลือก template, map field, ตรวจเช็คก่อนพิมพ์จริง</div>
                  <div className="video-meta">ความยาว ~15 นาที • ยังไม่ใส่ลิงก์</div>
                </div>
              </div>
            </div>
          </div>

          <aside className="faq-panel">
            <h2>ปัญหาที่เจอบ่อย ๆ</h2>
            <ul>
              <li>❓ ลงโปรแกรมแล้วเปิดไม่ได้ / ขึ้น error แปลก ๆ</li>
              <li>❓ login ไม่ได้ ทั้งที่สมัครแล้ว / ลืมรหัสผ่าน</li>
              <li>❓ serial ใช้กับหลายเครื่องยังไง / ย้ายเครื่องต้องทำอะไรบ้าง</li>
              <li>❓ กด generate Word แล้วค้าง / template ไม่ตรง</li>
              <li>❓ sync Supabase ไม่ขึ้น ทั้งที่เน็ตใช้งานได้</li>
            </ul>
            <p className="faq-note">
              เดี๋ยวในหน้า <Link href="/docs/faq">FAQ</Link> กับ{" "}
              <Link href="/docs/troubleshooting">Troubleshooting</Link>{" "}
              จะไล่ตอบทีละอันแบบ step-by-step ให้
            </p>
          </aside>
        </section>
      </section>

      <style jsx>{`
        .docs-root {
          min-height: 100dvh;
          display: flex;
          justify-content: center;
          padding: 18px clamp(10px, 3vw, 26px);
        }

        .docs-wrap {
          width: 100%;
          max-width: 1180px;
          border-radius: 28px;
          padding: 18px 18px 22px;
          background:
            radial-gradient(
              1200px 800px at 0% 0%,
              rgba(99, 132, 255, 0.16),
              transparent 60%
            ),
            radial-gradient(
              900px 600px at 100% 100%,
              rgba(0, 208, 132, 0.12),
              transparent 60%
            ),
            linear-gradient(
              180deg,
              rgba(8, 13, 28, 0.98),
              rgba(6, 10, 22, 0.95)
            );
          border: 1px solid rgba(180, 200, 255, 0.22);
          box-shadow:
            0 26px 80px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
        }

        .docs-head {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
          gap: 18px;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .eyebrow {
          margin: 0 0 4px;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9aa6c6;
        }

        h1 {
          margin: 0;
          font-size: clamp(22px, 4vw, 30px);
        }

        .lead {
          margin: 6px 0 10px;
          font-size: 13px;
          color: #a9b6d6;
        }

        .quick-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag {
          font-size: 11px;
          padding: 4px 9px;
          border-radius: 999px;
          border: 1px solid rgba(151, 174, 255, 0.7);
          background: rgba(8, 12, 28, 0.9);
          color: #dbe6ff;
        }

        .head-right {
          display: flex;
          justify-content: flex-end;
        }

        .mini-panel {
          border-radius: 16px;
          padding: 12px 12px 10px;
          background: rgba(5, 9, 22, 0.96);
          border: 1px solid rgba(148, 163, 255, 0.6);
          box-shadow: 0 16px 42px rgba(0, 0, 0, 0.72);
          font-size: 13px;
          max-width: 320px;
          width: 100%;
        }

        .mini-panel h2 {
          margin: 0 0 6px;
          font-size: 14px;
        }

        .mini-panel ol {
          margin: 0;
          padding-left: 16px;
        }

        .mini-panel li {
          margin-bottom: 4px;
        }

        .mini-panel a {
          color: #c7d5ff;
          text-decoration: none;
        }

        .mini-panel a:hover {
          text-decoration: underline;
        }

        .note {
          margin: 6px 0 0;
          font-size: 11px;
          color: #9aa6c6;
        }

        /* grid of main doc links */
        .docs-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin: 8px 0 16px;
        }

        .doc-card {
          position: relative;
          border-radius: 16px;
          padding: 12px 12px 13px;
          background: linear-gradient(
            180deg,
            rgba(12, 18, 32, 0.9),
            rgba(12, 18, 32, 0.7)
          );
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            0 18px 40px rgba(0, 0, 0, 0.6),
            inset 0 0 0 1px rgba(255, 255, 255, 0.02);
          color: inherit;
          text-decoration: none;
          overflow: hidden;
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            border-color 0.18s ease;
        }

        .doc-card::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: conic-gradient(
            from 0deg at 50% 50%,
            rgba(0, 255, 213, 0.18),
            rgba(91, 140, 255, 0.25),
            rgba(168, 85, 247, 0.23),
            rgba(0, 255, 213, 0.18)
          );
          mix-blend-mode: screen;
          filter: blur(12px);
          opacity: 0.2;
          pointer-events: none;
        }

        .doc-card:hover {
          transform: translateY(-3px);
          box-shadow:
            0 22px 56px rgba(61, 102, 255, 0.4),
            inset 0 0 0 1px rgba(255, 255, 255, 0.03);
          border-color: rgba(86, 123, 255, 0.7);
        }

        .doc-tag {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 255, 0.8);
          font-size: 11px;
          color: #dbe4ff;
          background: rgba(15, 23, 42, 0.95);
          margin-bottom: 6px;
          position: relative;
          z-index: 1;
        }

        .doc-card h3 {
          margin: 0 0 4px;
          font-size: 14px;
          position: relative;
          z-index: 1;
        }

        .doc-card p {
          margin: 0 0 6px;
          font-size: 12px;
          color: #c9d6ff;
          position: relative;
          z-index: 1;
        }

        .doc-more {
          font-size: 12px;
          color: #a8c0ff;
          position: relative;
          z-index: 1;
        }

        /* lower section */
        .docs-lower {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
          gap: 14px;
        }

        .video-panel {
          border-radius: 18px;
          padding: 12px 12px 14px;
          background: rgba(3, 7, 18, 0.96);
          border: 1px solid rgba(148, 163, 255, 0.7);
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.72);
        }

        .video-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          gap: 6px;
        }

        .chip {
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid rgba(74, 222, 128, 0.8);
          font-size: 11px;
          color: #bbf7d0;
          background: rgba(22, 163, 74, 0.25);
        }

        .video-caption {
          font-size: 11px;
          color: #9aa6c6;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .video-card {
          border-radius: 12px;
          padding: 6px;
          background: linear-gradient(
            180deg,
            rgba(15, 23, 42, 0.98),
            rgba(15, 23, 42, 0.9)
          );
          border: 1px solid rgba(148, 163, 255, 0.45);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .thumb {
          position: relative;
          border-radius: 9px;
          background-image: linear-gradient(
              135deg,
              rgba(148, 163, 184, 0.4),
              transparent
            ),
            repeating-linear-gradient(
              0deg,
              rgba(15, 23, 42, 1),
              rgba(15, 23, 42, 1) 10px,
              rgba(30, 64, 175, 0.4) 10px,
              rgba(30, 64, 175, 0.4) 11px
            );
          aspect-ratio: 16 / 9;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .play {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(248, 250, 252, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 0 20px rgba(248, 250, 252, 0.5);
        }

        .video-text {
          font-size: 11px;
        }

        .video-title {
          font-weight: 600;
          margin-bottom: 2px;
        }

        .video-sub {
          color: #a9b6d6;
          margin-bottom: 2px;
        }

        .video-meta {
          color: #94a3b8;
          font-size: 10px;
        }

        .faq-panel {
          border-radius: 18px;
          padding: 12px 12px 14px;
          background: rgba(9, 9, 18, 0.98);
          border: 1px solid rgba(248, 250, 252, 0.08);
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.76);
        }

        .faq-panel h2 {
          margin: 0 0 6px;
          font-size: 14px;
        }

        .faq-panel ul {
          margin: 0 0 8px;
          padding-left: 16px;
          font-size: 12px;
          color: #e5e7eb;
        }

        .faq-panel li {
          margin-bottom: 4px;
        }

        .faq-note {
          margin: 0;
          font-size: 11px;
          color: #9aa6c6;
        }

        .faq-note a {
          color: #c7d5ff;
          text-decoration: none;
        }

        .faq-note a:hover {
          text-decoration: underline;
        }

        /* responsive */
        @media (max-width: 960px) {
          .docs-head {
            grid-template-columns: minmax(0, 1fr);
          }
          .head-right {
            justify-content: flex-start;
          }
          .mini-panel {
            max-width: 100%;
          }
          .docs-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .docs-lower {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 640px) {
          .docs-root {
            padding: 14px 10px;
          }
          .docs-wrap {
            padding: 14px 12px 18px;
            border-radius: 20px;
          }
          .docs-grid {
            grid-template-columns: minmax(0, 1fr);
          }
          .video-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>
    </main>
  );
}
