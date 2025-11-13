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
    desc: "คุย/แนบไฟล์ ซิงก์สองทางกับ Supabase Realtime พร้อมสถานะกำลังพิมพ์",
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

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // พื้นหลังดวงดาววิ่งช้า ๆ
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const size = () => {
      const wrap = canvas.parentElement!;
      const w = wrap.clientWidth;
      const h = Math.max(820, wrap.clientHeight);
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    size();
    const onResize = () => size();
    window.addEventListener("resize", onResize);

    const N = Math.max(90, Math.floor((window.innerWidth * window.innerHeight) / 24000));
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
      const w = canvas.width,
        h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const g = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.1, w * 0.5, h * 0.5, h * 0.95);
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
          const dx = P[i].x - P[j].x,
            dy = P[i].y - P[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const a = 0.05 * (1 - d2 / (R * R));
            ctx.strokeStyle = `rgba(86,123,255,${a})`;
            ctx.beginPath();
            ctx.moveTo(P[i].x, P[i].y);
            ctx.lineTo(P[j].x, P[j].y);
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
      {/* ออโรร่าทั่วหน้า (เพิ่มจาก background หลักให้ฟีล homepage พิเศษขึ้น) */}
      <div className="bg">
        <div className="bg-gradient" />
        <div className="bg-blob a" />
        <div className="bg-blob b" />
        <div className="bg-blob c" />
      </div>

      {/* โซนดวงดาว: การ์ดโปรแกรม + การ์ดฟีเจอร์ */}
      <section className="stars-wrap">
        <canvas ref={canvasRef} className="stars-canvas" />

        {/* BRAND MARQUEE */}
        <div className="brand-marquee" aria-hidden="true">
          <div className="marquee-track">
            <span>
              “It is better to be hated for what you are than to be loved for what you are not.”
            </span>
            <span aria-hidden></span>
          </div>
        </div>

        {/* การ์ด hero */}
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
            <a className="btn btn-ghost" href="#demo">
              ทดลองใช้งาน
            </a>
            {/* ปุ่ม login/signup แสดงเฉพาะจอใหญ่ — จอเล็กไปใช้เมนู 3 ขีดแทน */}
            <Link className="btn btn-outline only-desktop" href="/login">
              เข้าสู่ระบบ
            </Link>
            <Link className="btn btn-link only-desktop" href="/signup">
              สมัครใช้งาน
            </Link>
          </div>
        </div>

        {/* การ์ดฟีเจอร์ */}
        <div className="card features-card" id="demo">
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <Link key={f.title} href={f.href ?? "#"} className="feature-card" aria-label={f.title}>
                <span className="f-badge">{f.badge}</span>
                <span className="f-title">{f.title}</span>
                <span className="f-desc">{f.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100dvh;
          position: relative;
          overflow-x: hidden;
        }

        /* extra aurora เฉพาะหน้า home */
        .bg {
          position: fixed;
          inset: 0;
          z-index: -3;
          pointer-events: none;
        }
        .bg-gradient {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(1200px 800px at 10% 10%, #3d66ff22, transparent 60%),
            radial-gradient(800px 1000px at 90% 30%, #a855f722, transparent 60%),
            radial-gradient(900px 700px at 50% 90%, #00e6a822, transparent 60%);
          filter: blur(20px);
        }
        .bg-blob {
          position: absolute;
          width: 60vmax;
          height: 60vmax;
          border-radius: 50%;
          opacity: 0.12;
          filter: blur(60px);
          mix-blend-mode: screen;
          animation: float 18s ease-in-out infinite;
        }
        .bg-blob.a {
          background: linear-gradient(135deg, #3d66ff, #00e6a8);
          top: -20vmax;
          left: -10vmax;
        }
        .bg-blob.b {
          background: linear-gradient(135deg, #a855f7, #3d66ff);
          bottom: -25vmax;
          right: -10vmax;
          animation-delay: 3s;
        }
        .bg-blob.c {
          background: linear-gradient(135deg, #00e6a8, #a855f7);
          top: 10vmax;
          right: 20vmax;
          animation-delay: 6s;
        }
        @keyframes float {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(2vmax, -2vmax, 0);
          }
        }

        .stars-wrap {
          position: relative;
          padding: 96px 14px 64px;
          display: grid;
          gap: 16px;
          place-items: center;
        }
        .stars-canvas {
          position: absolute;
          inset: 0;
          z-index: -1;
        }

        /* marquee cat quote */
        .brand-marquee {
          width: min(1800px, 96vw);
          height: 32px;
          overflow: hidden;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.03);
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
          font-weight: 900;
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

        .card {
          width: min(1800px, 96vw);
          border-radius: 22px;
          padding: 22px 20px;
          background:
            radial-gradient(1200px 800px at 50% 0%, rgba(168, 85, 247, 0.12), transparent 60%),
            radial-gradient(900px 600px at 50% 100%, rgba(93, 180, 255, 0.14), transparent 60%),
            linear-gradient(180deg, rgba(18, 26, 42, 0.7), rgba(18, 26, 42, 0.55));
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          box-shadow: 0 36px 110px rgba(0, 0, 0, 0.52);
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
          opacity: 0.26;
          animation: borderSpin 22s linear infinite;
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

        .hero-card {
          text-align: center;
          padding-top: 28px;
          padding-bottom: 22px;
        }
        .title-split {
          margin: 0;
          line-height: 1.06;
        }
        .title-line {
          display: block;
        }
        .title-line.main {
          font-size: clamp(28px, 8vw, 60px);
        }
        .title-line.glow {
          font-size: clamp(24px, 7vw, 48px);
          background: linear-gradient(90deg, #a855f7, #3d66ff, #00e6a8);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0 0 18px rgba(61, 102, 255, 0.28));
          animation: hue 9s linear infinite;
        }
        @keyframes hue {
          0% {
            filter: drop-shadow(0 0 18px rgba(61, 102, 255, 0.28));
          }
          50% {
            filter: drop-shadow(0 0 22px rgba(168, 85, 247, 0.3));
          }
          100% {
            filter: drop-shadow(0 0 18px rgba(61, 102, 255, 0.28));
          }
        }
        .subtitle {
          margin: 6px 0 10px;
          opacity: 0.92;
          font-size: clamp(14px, 3.4vw, 18px);
        }

        .cta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin: 8px 0 6px;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          padding: 10px 14px;
          border-radius: 14px;
          font-weight: 900;
          letter-spacing: 0.2px;
          text-decoration: none;
          border: 1px solid transparent;
          font-size: clamp(13px, 3.6vw, 15px);
          transition: box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease;
        }
        .btn-primary {
          background: linear-gradient(135deg, #3d66ff, #6b8cff);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.06);
        }
        .btn-ghost {
          color: #e6eeff;
          border-color: rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
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
          padding-inline: 8px;
        }
        .btn:hover {
          box-shadow: 0 12px 28px rgba(61, 102, 255, 0.26);
        }

        .features-card {
          padding-top: 18px;
          padding-bottom: 22px;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          width: 100%;
        }
        .feature-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 14px;
          border-radius: 16px;
          background: linear-gradient(180deg, rgba(12, 18, 30, 0.75), rgba(12, 18, 30, 0.55));
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow:
            0 16px 40px rgba(0, 0, 0, 0.32),
            inset 0 0 0 1px rgba(255, 255, 255, 0.02);
          text-decoration: none;
          color: inherit;
          transition:
            border-color 0.22s ease,
            box-shadow 0.22s ease,
            transform 0.22s ease;
        }
        .feature-card::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          pointer-events: none;
          background: conic-gradient(
            from 0deg at 50% 50%,
            rgba(91, 140, 255, 0.22),
            rgba(168, 85, 247, 0.22),
            rgba(0, 255, 213, 0.18),
            rgba(91, 140, 255, 0.22)
          );
          filter: blur(10px);
          mix-blend-mode: screen;
          opacity: 0.2;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(86, 123, 255, 0.42);
          box-shadow:
            0 22px 60px rgba(61, 102, 255, 0.22),
            inset 0 0 0 1px rgba(255, 255, 255, 0.03);
        }
        .f-badge {
          align-self: flex-end;
          padding: 5px 8px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 12px;
          color: #a9b6d6;
          background: rgba(255, 255, 255, 0.05);
        }
        .f-title {
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 0.2px;
        }
        .f-desc {
          color: #c9d6ff;
          opacity: 0.95;
          font-size: 13px;
          line-height: 1.6;
        }

        /* ===== มือถือ ===== */
        @media (max-width: 600px) {
          .stars-wrap {
            padding: 80px 10px 52px;
            gap: 12px;
          }
          .card {
            border-radius: 18px;
            padding: 18px 16px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
          }
          .brand-marquee {
            height: 28px;
          }
          .marquee-track {
            gap: 24px;
            padding: 0 12px;
          }

          /* ปุ่ม full width และซ่อน login/signup ใน hero */
          .cta {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          .btn {
            width: 100%;
            min-height: 44px;
          }
          .only-desktop {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
            transform: translate3d(0, -50%, 0);
          }
          .card::before {
            animation: none;
          }
          .btn:hover {
            box-shadow: none;
          }
        }
      `}</style>
    </main>
  );
}
