// apps/web/src/app/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type Feature = {
  title: string;
  desc: string;
  badge: string;
  href?: string;
};

const FEATURES: Feature[] = [
  {
    title: "เอกสารอัตโนมัติ",
    desc: "กดครั้งเดียว สร้างคำร้อง/หมายเรียก/สำนวน — ดึงข้อมูลข้ามโมดูลแบบเนียน ๆ",
    badge: "Doc Engine",
    href: "#feature-doc",
  },
  {
    title: "OCR อัจฉริยะ",
    desc: "อ่านบัตร/แบบฟอร์มไทยได้คมชัด รองรับ post-processing ใส่ฐานข้อมูลได้ทันที",
    badge: "Typhoon OCR",
    href: "#feature-ocr",
  },
  {
    title: "Realtime Chat",
    desc: "คุย / แนบไฟล์ ซิงก์สองทางกับ Supabase Realtime พร้อมสถานะกำลังพิมพ์",
    badge: "Sync",
    href: "#feature-chat",
  },
  {
    title: "Client Area",
    desc: "แดชบอร์ดหลังล็อกอินสวย ๆ เช็คโปรไฟล์ สิทธิ์ใช้งาน และลิงก์ลัด",
    badge: "Dashboard",
    href: "#feature-client",
  },
];

// ====== URL ดาวน์โหลดจาก Supabase / ENV ======
// ถ้าตั้ง NEXT_PUBLIC_INSTALLER_URL / NEXT_PUBLIC_MANUAL_URL ไว้ จะใช้ค่านั้น
// ถ้าไม่ตั้ง จะ fallback เป็น Supabase app-updates bucket ตาม project ที่ให้มา
const INSTALLER_URL =
  process.env.NEXT_PUBLIC_INSTALLER_URL ||
  "https://download.cat-alysim.com/CAT-ALYSIM_Setup.exe";

const MANUAL_URL =
  process.env.NEXT_PUBLIC_MANUAL_URL ||
  "https://aqjomvjzmvgwlvdhficv.supabase.co/storage/v1/object/public/app-updates/CAT-ALYSIM-Manual.pdf";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "dev";

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // พื้นหลังดวงดาววิ่งช้า ๆ (เฉพาะ hero section)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const size = () => {
      const wrap = canvas.parentElement!;
      const w = wrap.clientWidth;
      const h = Math.max(640, wrap.clientHeight); // ให้ hero ไม่ยาวเวอร์บนมือถือ
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    size();
    const onResize = () => size();
    window.addEventListener("resize", onResize);

    const N = Math.max(
      80,
      Math.floor((window.innerWidth * window.innerHeight) / 26000)
    );
    const P = new Array(N).fill(0).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35 * DPR,
      vy: (Math.random() - 0.5) * 0.35 * DPR,
      r: (0.8 + Math.random() * 1.8) * DPR,
      a: 0.2 + Math.random() * 0.5,
    }));

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const g = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        h * 0.1,
        w * 0.5,
        h * 0.5,
        h * 0.95
      );
      g.addColorStop(0, "rgba(61,102,255,0.08)");
      g.addColorStop(1, "rgba(255,255,255,0.02)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (const p of P) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(175,198,255,${p.a})`;
        ctx.fill();
      }

      ctx.lineWidth = 0.6 * DPR;
      const R = 130 * DPR;
      for (let i = 0; i < P.length; i++) {
        for (let j = i + 1; j < P.length; j++) {
          const dx = P[i].x - P[j].x;
          const dy = P[i].y - P[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const a = 0.05 * (1 - d2 / (R * R));
            ctx.strokeStyle = `rgba(86,123,255,${a})`;
            ctx.beginPath();
            ctx.moveTo(P[i].x, P[i].y);
            ctx.lineTo(P[j].x, P[j].y); // fixed lineTo bug
            ctx.stroke();
          }
        }
      }
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <main className="page">
      {/* ==== HERO (ด้านบน) ==== */}
      <section className="stars-wrap">
        <canvas ref={canvasRef} className="stars-canvas" />

        {/* แถบ quote วิ่งเล่น */}
        <div className="brand-marquee" aria-hidden="true">
          <div className="marquee-track">
            <span>
              “It is better to be hated for what you are than to be loved for
              what you are not.”
            </span>
            <span aria-hidden>
              · CAT-ALYSIM · ทำสำนวนให้เสร็จ แล้วไปพักบ้างเถอะ ·
            </span>
          </div>
        </div>

        {/* การ์ด hero: โปรแกรมทำสำนวน */}
        <div className="card hero-card">
          <h1 className="title-split">
            <span className="title-line main">โปรแกรมทำสำนวนการสอบสวน</span>
            <span className="title-line glow">เรื่องของกู ไม่ต้องเสือกนะ</span>
          </h1>
          <p className="subtitle">
            เอกสารอัตโนมัติ · OCR ระดับเทพ · แชทซิงก์เรียลไทม์ · เชื่อม Supabase
          </p>

          <div className="cta">
            <a className="btn btn-primary" href="#get">
              ดาวน์โหลด
            </a>
            <a className="btn btn-ghost" href="#features">
              ดูตัวอย่างฟีเจอร์
            </a>
            <Link className="btn btn-outline" href="/login">
              เข้าสู่ระบบ
            </Link>
            <Link className="btn btn-link" href="/signup">
              สมัครใช้งาน
            </Link>
          </div>
        </div>
      </section>

      {/* ==== FEATURE SECTION: text + GIF สลับซ้ายขวา ==== */}
      <section id="features" className="feature-section">
        <div className="card feature-shell">
          {/* Row 1: Doc Engine (text ซ้าย / gif ขวา) */}
          <div className="feature-row">
            <div className="feature-text">
              <span className="feature-badge">{FEATURES[0].badge}</span>
              <h2 className="feature-title">{FEATURES[0].title}</h2>
              <p className="feature-desc">
                ดึงข้อมูลจากคดีเดียวกันมาใส่ทุกเอกสารให้ครบในทีเดียว
                แก้จุดเดียววิ่งทั้งสำนวน ลดงานกรอกซ้ำ ๆ
                แล้วกันพลาดเรื่องวันที่หมายเลขคดี.
              </p>
              <ul className="feature-list">
                <li>รองรับคำร้อง / หมายเรียก / บันทึก / รายงานการสอบสวน</li>
                <li>ลากข้อมูลข้ามโมดูล (ยาเสพติด, จราจร, แพ่ง) ได้</li>
                <li>Template แก้ได้เอง ปรับตามสไตล์โรงพักมึง</li>
              </ul>
            </div>
            <div className="feature-media">
              <div className="feature-media-frame">
                {/* TODO: เอา GIF จริงมาใส่ path นี้ */}
                <img
                  src="/img/feature-doc.gif"
                  alt="ตัวอย่าง Doc Engine กรอกทีเดียววิ่งทั้งสำนวน"
                  className="feature-media-img"
                />
              </div>
            </div>
          </div>

          {/* Row 2: OCR (gif ซ้าย / text ขวา) */}
          <div className="feature-row reverse">
            <div className="feature-media">
              <div className="feature-media-frame">
                <img
                  src="/img/feature-ocr.gif"
                  alt="ตัวอย่าง Typhoon OCR อ่านบัตรและแบบฟอร์มไทย"
                  className="feature-media-img"
                />
              </div>
            </div>
            <div className="feature-text">
              <span className="feature-badge">{FEATURES[1].badge}</span>
              <h2 className="feature-title">{FEATURES[1].title}</h2>
              <p className="feature-desc">
                ถ่ายบัตร / แบบฟอร์ม / ใบแจ้งความ แล้วให้ระบบอ่านภาษาไทยให้
                แปลงเป็นฟิลด์พร้อมโยนเข้าฐานข้อมูล ไม่ต้องนั่งพิมพ์เองทีละตัว.
              </p>
              <ul className="feature-list">
                <li>รองรับเลขบัตร ปชช. ชื่อ-สกุล ที่อยู่ วันเดือนปีเกิด</li>
                <li>
                  ดึงข้อมูลออกมา post-process ต่อได้ (เช่น แยกตำบล/อำเภอ/จังหวัด)
                </li>
                <li>ต่อยอดไปอ่านสำเนาบัตร, TR14, Passport ได้ในอนาคต</li>
              </ul>
            </div>
          </div>

          {/* Row 3: Realtime Chat (text ซ้าย / gif ขวา) */}
          <div className="feature-row">
            <div className="feature-text">
              <span className="feature-badge">{FEATURES[2].badge}</span>
              <h2 className="feature-title">{FEATURES[2].title}</h2>
              <p className="feature-desc">
                แชทคุยงานคดีในทีมเดียวกัน แนบไฟล์แนบรูปได้
                sync ขึ้น Supabase Realtime
                เห็นสถานะใครกำลังพิมพ์แบบ real-time.
              </p>
              <ul className="feature-list">
                <li>ห้องคุยแยกตามคดี / แผนก / ทีมสืบสวน</li>
                <li>แนบเอกสาร Word / PDF จากโปรแกรมได้เลย</li>
                <li>เก็บ log การสนทนาเป็นหลักฐานภายในหน่วยงาน</li>
              </ul>
            </div>
            <div className="feature-media">
              <div className="feature-media-frame">
                <img
                  src="/img/feature-chat.gif"
                  alt="ตัวอย่าง realtime chat ซิงก์กับ Supabase"
                  className="feature-media-img"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Client Area (gif ซ้าย / text ขวา) */}
          <div className="feature-row reverse">
            <div className="feature-media">
              <div className="feature-media-frame">
                <img
                  src="/img/feature-client.gif"
                  alt="ตัวอย่าง Client Area หลังล็อกอิน"
                  className="feature-media-img"
                />
              </div>
            </div>
            <div className="feature-text">
              <span className="feature-badge">{FEATURES[3].badge}</span>
              <h2 className="feature-title">{FEATURES[3].title}</h2>
              <p className="feature-desc">
                ล็อกอินหน้าเว็บแล้วเห็นโปรไฟล์ของตัวเอง, serial โปรแกรม,
                สถานะการต่ออายุ รวมถึงลิงก์โหลดตัวติดตั้งล่าสุด.
              </p>
              <ul className="feature-list">
                <li>ดึงข้อมูลจาก Supabase profiles มาโชว์ username / ยศ / สังกัด</li>
                <li>แสดง serial / license ที่ผูกกับบัญชี</li>
                <li>ลิงก์ลัดไปยัง docs / contact / support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ==== DOWNLOAD SECTION (#get) ==== */}
      <section id="get" className="download-section">
        <div className="card download-card">
          <div className="download-left">
            <h2 className="download-title">ดาวน์โหลด CAT-ALYSIM</h2>
            <p className="download-sub">
              เวอร์ชันเดสก์ท็อปสำหรับ Windows — ติดตั้งแล้วล็อกอินด้วยบัญชีที่สมัครหน้าเว็บนี้
            </p>

            <div className="download-buttons">
              <a
                className="btn btn-primary full"
                href={INSTALLER_URL}
                // ให้ browser รู้ว่าเป็นไฟล์ดาวน์โหลดใหญ่
                rel="noreferrer"
              >
                ดาวน์โหลดสำหรับ Windows (.exe)
              </a>
              <a
                className="btn btn-ghost full"
                href={MANUAL_URL}
                target="_blank"
                rel="noreferrer"
              >
                คู่มือการติดตั้ง / การใช้งาน (PDF)
              </a>
            </div>

            <div className="download-note">
              เวอร์ชันปัจจุบัน:{" "}
              <code>{APP_VERSION}</code>{" "}
              · ไฟล์ถูกดึงจาก Supabase bucket <code>app-updates</code> —
              ถ้ากดแล้วโหลดไม่ได้ ให้เช็ค URL ใน <code>.env</code>{" "}
              (NEXT_PUBLIC_INSTALLER_URL / NEXT_PUBLIC_MANUAL_URL)
            </div>
          </div>

          <div className="download-right">
            <div className="mini-card">
              <h3>สเปกขั้นต่ำ (แนะนำ)</h3>
              <ul>
                <li>Windows 10 ขึ้นไป (64-bit)</li>
                <li>RAM 8 GB ขึ้นไป</li>
                <li>พื้นที่ว่างอย่างน้อย 2 GB สำหรับฐานข้อมูล + เอกสาร</li>
                <li>.NET Runtime / VC++ ตามตัวติดตั้งจัดการให้</li>
              </ul>
            </div>

            <div className="mini-card">
              <h3>ขั้นตอนติดตั้งคร่าว ๆ</h3>
              <ol>
                <li>ดาวน์โหลดไฟล์ติดตั้งจากปุ่มด้านซ้าย</li>
                <li>ดับเบิลคลิก &gt; กดยอมรับ / Next ไปเรื่อย ๆ</li>
                <li>เปิดโปรแกรม &gt; ล็อกอินด้วยอีเมล/รหัสผ่านที่สมัครไว้</li>
                <li>เริ่มสร้างคดี ทดลองสร้างเอกสารอัตโนมัติได้เลย</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Styles ของหน้านี้ ===== */}
      <style jsx>{`
        :root {
          --text: #e6eef8;
          --muted: #a9b6d6;
        }
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100dvh;
          position: relative;
          overflow-x: hidden;
          color: var(--text);
          font-family: Inter, system-ui, -apple-system, "Segoe UI",
            "Noto Sans Thai", sans-serif;
        }

        /* HERO WRAP */
        .stars-wrap {
          position: relative;
          padding: 72px 12px 40px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          justify-content: center;
          min-height: calc(100dvh - 120px); /* ดัน hero ให้อยู่กลางจอ */
        }
        .stars-canvas {
          position: absolute;
          inset: 0;
          z-index: -1;
        }

        /* BRAND MARQUEE */
        .brand-marquee {
          width: min(1800px, 96vw);
          height: 30px;
          overflow: hidden;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(5, 8, 20, 0.92);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
          position: relative;
          mask-image: linear-gradient(
            to right,
            transparent,
            #000 8%,
            #000 92%,
            transparent
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            #000 8%,
            #000 92%,
            transparent
          );
        }
        .marquee-track {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translate3d(100%, -50%, 0);
          display: flex;
          align-items: center;
          gap: 36px;
          width: max-content;
          padding: 0 18px;
          animation: marquee 18s linear infinite;
          will-change: transform;
        }
        .brand-marquee span {
          white-space: nowrap;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #afc6ff;
          opacity: 0.95;
          text-shadow: 0 0 12px rgba(91, 140, 255, 0.22);
          font-size: clamp(11px, 2.8vw, 14px);
        }
        @keyframes marquee {
          0% {
            transform: translate3d(100%, -50%, 0);
          }
          100% {
            transform: translate3d(-100%, -50%, 0);
          }
        }

        /* CARD BASE */
        .card {
          width: min(1800px, 96vw);
          border-radius: 22px;
          padding: 20px 18px;
          background:
            radial-gradient(
              1200px 800px at 50% 0%,
              rgba(168, 85, 247, 0.12),
              transparent 60%
            ),
            radial-gradient(
              900px 600px at 50% 100%,
              rgba(93, 180, 255, 0.14),
              transparent 60%
            ),
            linear-gradient(
              180deg,
              rgba(18, 26, 42, 0.78),
              rgba(18, 26, 42, 0.6)
            );
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
          position: relative;
          overflow: hidden;
        }
        .card::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          pointer-events: none;
          background: conic-gradient(
            from 0deg at 50% 50%,
            rgba(0, 255, 213, 0.18),
            rgba(91, 140, 255, 0.22),
            rgba(168, 85, 247, 0.22),
            rgba(0, 255, 213, 0.18)
          );
          filter: blur(14px) saturate(120%);
          mix-blend-mode: screen;
          opacity: 0.22;
          animation: borderSpin 20s linear infinite;
        }
        .card::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
        }
        @keyframes borderSpin {
          to {
            transform: rotate(1turn);
          }
        }

        /* HERO CARD */
        .hero-card {
          text-align: center;
          padding-top: 26px;
          padding-bottom: 20px;
        }
        .title-split {
          margin: 0;
          line-height: 1.06;
        }
        .title-line {
          display: block;
        }
        .title-line.main {
          font-size: clamp(26px, 6.4vw, 42px);
        }
        .title-line.glow {
          margin-top: 4px;
          font-size: clamp(22px, 6vw, 34px);
          background: linear-gradient(90deg, #a855f7, #3d66ff, #00e6a8);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0 0 18px rgba(61, 102, 255, 0.28));
        }
        .subtitle {
          margin: 8px 0 10px;
          opacity: 0.92;
          font-size: clamp(13px, 3.4vw, 16px);
        }

        .cta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin: 10px 0 4px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 38px;
          padding: 9px 13px;
          border-radius: 14px;
          font-weight: 800;
          letter-spacing: 0.2px;
          text-decoration: none;
          font-size: clamp(13px, 3.2vw, 15px);
          border: 1px solid transparent;
          transition: box-shadow 0.18s ease, border-color 0.18s ease,
            background 0.18s ease, transform 0.12s ease;
        }
        .btn-primary {
          background: linear-gradient(135deg, #3d66ff, #6b8cff);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.06);
        }
        .btn-ghost {
          color: #e6eeff;
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
        }
        .btn-outline {
          color: #afc6ff;
          border-color: #567bff99;
          background: rgba(255, 255, 255, 0.03);
        }
        .btn-link {
          color: #a8c0ff;
          text-decoration: underline;
          background: transparent;
          padding-inline: 6px;
          border: 0;
        }
        .btn:hover {
          box-shadow: 0 10px 26px rgba(61, 102, 255, 0.26);
          transform: translateY(-1px);
        }
        .btn.full {
          width: 100%;
        }

        /* FEATURE SECTION */
        .feature-section {
          padding: 0 12px 40px;
          display: flex;
          justify-content: center;
        }
        .feature-shell {
          padding-top: 18px;
          padding-bottom: 18px;
        }
        .feature-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 12px 0;
        }
        .feature-row + .feature-row {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .feature-row.reverse {
          flex-direction: row-reverse;
        }

        .feature-text {
          flex: 1.1;
          min-width: 0;
        }
        .feature-media {
          flex: 1;
          min-width: 0;
          display: flex;
          justify-content: center;
        }
        .feature-media-frame {
          width: 100%;
          max-width: 420px;
          border-radius: 18px;
          padding: 6px;
          background: radial-gradient(
              circle at 0% 0%,
              rgba(168, 85, 247, 0.22),
              transparent 55%
            ),
            radial-gradient(
              circle at 100% 100%,
              rgba(56, 189, 248, 0.2),
              transparent 60%
            ),
            rgba(3, 7, 18, 0.92);
          border: 1px solid rgba(148, 163, 250, 0.4);
          box-shadow: 0 22px 60px rgba(15, 23, 42, 0.9);
        }
        .feature-media-img {
          width: 100%;
          display: block;
          border-radius: 14px;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          background: radial-gradient(
            circle at 50% 0%,
            rgba(148, 163, 250, 0.4),
            rgba(15, 23, 42, 1)
          );
        }

        .feature-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 9px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 250, 0.5);
          font-size: 12px;
          color: #c7d2fe;
          background: radial-gradient(
              100% 100% at 0 0,
              rgba(59, 130, 246, 0.3),
              transparent
            ),
            rgba(15, 23, 42, 0.96);
          margin-bottom: 6px;
        }
        .feature-title {
          margin: 0 0 4px;
          font-size: clamp(18px, 4.2vw, 22px);
        }
        .feature-desc {
          margin: 0 0 8px;
          color: var(--muted);
          font-size: 14px;
        }
        .feature-list {
          margin: 0;
          padding-left: 18px;
          font-size: 13px;
          color: #cbd5ff;
        }
        .feature-list li + li {
          margin-top: 3px;
        }

        /* DOWNLOAD SECTION */
        .download-section {
          padding: 0 12px 40px;
          display: flex;
          justify-content: center;
        }
        .download-card {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
          gap: 18px;
          align-items: flex-start;
        }

        .download-left {
          position: relative;
          z-index: 1;
        }
        .download-title {
          margin: 0 0 6px;
          font-size: clamp(20px, 4.5vw, 26px);
        }
        .download-sub {
          margin: 0 0 14px;
          color: var(--muted);
          font-size: 14px;
        }
        .download-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .download-note {
          margin-top: 10px;
          font-size: 12px;
          color: #9aa8c8;
        }
        .download-note code {
          font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo,
            Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 11px;
          padding: 1px 5px;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .download-right {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mini-card {
          position: relative;
          border-radius: 14px;
          padding: 10px 11px;
          background: linear-gradient(
            180deg,
            rgba(8, 14, 26, 0.94),
            rgba(8, 14, 26, 0.82)
          );
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
          font-size: 13px;
        }
        .mini-card h3 {
          margin: 0 0 6px;
          font-size: 13px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          color: #cfe2ff;
        }
        .mini-card ul,
        .mini-card ol {
          margin: 0;
          padding-left: 18px;
          color: #c7d4ff;
        }
        .mini-card li + li {
          margin-top: 3px;
        }

        /* RESPONSIVE */
        @media (max-width: 960px) {
          .stars-wrap {
            padding-top: 64px;
            min-height: calc(100dvh - 110px);
          }
          .feature-row {
            align-items: flex-start;
          }
        }

        @media (max-width: 768px) {
          .stars-wrap {
            padding: 64px 10px 32px;
            min-height: calc(100dvh - 110px);
          }
          .card {
            border-radius: 18px;
            padding: 16px 14px;
          }
          .hero-card {
            padding-top: 18px;
            padding-bottom: 16px;
          }
          .cta {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          .btn {
            width: 100%;
          }
          .feature-row,
          .feature-row.reverse {
            flex-direction: column;
          }
          .feature-media-frame {
            max-width: none;
          }
          .download-card {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 480px) {
          .stars-wrap {
            padding: 56px 8px 28px;
            gap: 10px;
            min-height: calc(100dvh - 100px);
          }
          .brand-marquee {
            height: 26px;
          }
          .card {
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.5);
          }
        }
      `}</style>
    </main>
  );
}
