// apps/web/src/app/contact/page.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="contact-root">
      <section className="contact-wrap">
        {/* header + breadcrumb */}
        <header className="contact-head">
          <div>
            <p className="breadcrumb">
              <Link href="/">CAT-ALYSIM</Link> <span>/</span> ติดต่อเรา
            </p>
            <h1>ติดต่อบริษัท</h1>
            <p className="lead">
              ถ้ามีข้อสงสัย เรื่องใบอนุญาต การใช้งานระบบ หรืออยากคุยเรื่องฟีเจอร์ใหม่ ๆ
              ทักมาได้เลย ทีม dev ยังไม่ตาย 💻
            </p>
          </div>
        </header>

        <div className="contact-grid">
          {/* ซ้าย: ข้อมูลติดต่อหลัก */}
          <section className="panel main-info">
            <h2>ข้อมูลบริษัท</h2>

            <div className="info-group">
              <div className="info-label">ชื่อบริษัท</div>
              <div className="info-value">บริษัท ABC จำกัด</div>
            </div>

            <div className="info-group">
              <div className="info-label with-icon">
                <span className="icon">📍</span>
                <span>ที่อยู่</span>
              </div>
              <div className="info-value">
                123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย<br />
                กรุงเทพฯ 10110
              </div>
            </div>

            <div className="info-group">
              <div className="info-label with-icon">
                <span className="icon">📞</span>
                <span>โทรศัพท์</span>
              </div>
              <div className="info-value">
                <a href="tel:+6621234567" className="link">
                  +66 2 123 4567
                </a>
              </div>
            </div>

            <div className="info-group">
              <div className="info-label with-icon">
                <span className="icon">📧</span>
                <span>อีเมล</span>
              </div>
              <div className="info-value">
                <a href="mailto:contact@abccompany.com" className="link">
                  contact@abccompany.com
                </a>
              </div>
            </div>

            <div className="info-group">
              <div className="info-label with-icon">
                <span className="icon">⏰</span>
                <span>เวลาทำการ</span>
              </div>
              <div className="info-value">
                จันทร์ – ศุกร์ เวลา 09.00 – 17.00 น.<br />
                (หยุดเสาร์–อาทิตย์ และวันนักขัตฤกษ์)
              </div>
            </div>

            <div className="info-note">
              ถ้าเป็นเคสด่วนมาก ๆ แนะนำโทรคุยจะเร็วสุด
              ส่วนเรื่อง feature request / bug report ส่งเข้าอีเมลได้เลย
            </div>
          </section>

          {/* ขวา: mockup ฟอร์ม + แผนที่ placeholder */}
          <section className="panel side">
            <div className="sub-panel">
              <h2>ส่งข้อความหาเรา</h2>
              <p className="sub-text">
                ฟอร์มนี้ยังเป็น mockup อยู่ แต่อนาคตจะผูกกับ Supabase / email จริง
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("ยังเป็น mockup อยู่ เดี๋ยวค่อยต่อ backend 😎");
                }}
                className="form"
              >
                <label className="field">
                  <span>ชื่อของคุณ</span>
                  <input placeholder="เช่น ดลธรรม ศรีจันทร์ทอง" />
                </label>
                <label className="field">
                  <span>อีเมลสำหรับติดต่อกลับ</span>
                  <input type="email" placeholder="you@example.com" />
                </label>
                <label className="field">
                  <span>เรื่อง</span>
                  <input placeholder="เช่น ขอใบเสนอราคา / แจ้งปัญหา / เสนอฟีเจอร์" />
                </label>
                <label className="field">
                  <span>ข้อความ</span>
                  <textarea rows={4} placeholder="พิมพ์รายละเอียดที่อยากคุยกับทีมงาน..." />
                </label>
                <button type="submit" className="btn primary">
                  ส่งข้อความ (mockup)
                </button>
              </form>
            </div>

            <div className="sub-panel map-panel">
              <div className="map-head">
                <span className="map-title">แผนที่ / สาขา</span>
                <span className="map-tag">Mockup</span>
              </div>
              <div className="map-box">
                <div className="map-overlay">
                  <span>Google Maps Placeholder</span>
                  <small>จะฝังแผนที่จริงไว้ตรงนี้ภายหลัง</small>
                </div>
              </div>
              <p className="map-note">
                ออฟฟิศอยู่โซนสุขุมวิท เดินทางได้ทั้ง BTS, มอเตอร์ไซค์ และรถยนต์ส่วนตัว
              </p>
            </div>
          </section>
        </div>
      </section>

      <style jsx>{`
        .contact-root {
          min-height: 100dvh;
          display: flex;
          justify-content: center;
          padding: 18px clamp(10px, 3vw, 26px);
        }

        .contact-wrap {
          width: 100%;
          max-width: 1120px;
          border-radius: 26px;
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
              rgba(10, 16, 30, 0.96),
              rgba(8, 12, 24, 0.94)
            );
          border: 1px solid rgba(180, 200, 255, 0.22);
          box-shadow:
            0 26px 80px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(18px);
        }

        .contact-head {
          margin-bottom: 16px;
        }

        .breadcrumb {
          margin: 0 0 4px;
          font-size: 12px;
          color: #9aa6c6;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .breadcrumb span {
          opacity: 0.6;
        }
        .breadcrumb a {
          text-decoration: none;
          color: #c7d5ff;
        }
        .breadcrumb a:hover {
          text-decoration: underline;
        }

        h1 {
          margin: 0;
          font-size: clamp(22px, 3.8vw, 28px);
        }
        .lead {
          margin: 6px 0 0;
          font-size: 13px;
          color: #a9b6d6;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 1.2fr);
          gap: 14px;
          margin-top: 8px;
        }

        .panel {
          border-radius: 18px;
          padding: 14px 14px 16px;
          background: radial-gradient(
              circle at 0% 0%,
              rgba(96, 129, 255, 0.16),
              transparent 55%
            ),
            rgba(9, 13, 27, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow:
            0 18px 44px rgba(0, 0, 0, 0.72),
            inset 0 0 0 1px rgba(255, 255, 255, 0.02);
        }

        .panel h2 {
          margin: 0 0 10px;
          font-size: 16px;
        }

        .info-group {
          margin-bottom: 10px;
        }

        .info-label {
          font-size: 12px;
          color: #9fb0e8;
          margin-bottom: 2px;
        }
        .info-label.with-icon {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .icon {
          font-size: 14px;
        }

        .info-value {
          font-size: 13px;
          color: #e6eeff;
        }

        .link {
          color: #c7d5ff;
          text-decoration: none;
        }
        .link:hover {
          text-decoration: underline;
        }

        .info-note {
          margin-top: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          font-size: 12px;
          color: #dbe6ff;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 255, 0.4);
        }

        .side {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sub-panel {
          border-radius: 14px;
          padding: 10px 10px 12px;
          background: rgba(3, 7, 18, 0.9);
          border: 1px solid rgba(148, 163, 255, 0.25);
        }

        .sub-text {
          margin: 2px 0 8px;
          font-size: 12px;
          color: #9aa6c6;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: #c7d5ff;
        }

        .field input,
        .field textarea {
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 10px;
          font-size: 13px;
          background: rgba(15, 23, 42, 0.9);
          color: #e6eeff;
          outline: none;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease,
            background 0.15s ease;
        }

        .field input::placeholder,
        .field textarea::placeholder {
          color: rgba(148, 163, 184, 0.9);
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #6b8cff;
          box-shadow: 0 0 0 1px rgba(107, 140, 255, 0.7),
            0 0 0 5px rgba(107, 140, 255, 0.18);
          background: rgba(15, 23, 42, 1);
        }

        .btn.primary {
          margin-top: 4px;
          width: 100%;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 800;
          border: 0;
          cursor: pointer;
          color: #fff;
          background: linear-gradient(135deg, #3d66ff, #6b8cff);
          box-shadow:
            0 18px 40px rgba(61, 102, 255, 0.46),
            0 0 0 1px rgba(255, 255, 255, 0.03);
          transition:
            transform 0.14s ease,
            box-shadow 0.14s ease,
            filter 0.12s ease;
        }
        .btn.primary:hover {
          transform: translateY(-1px);
          box-shadow:
            0 22px 56px rgba(61, 102, 255, 0.68),
            0 0 0 1px rgba(255, 255, 255, 0.06);
          filter: saturate(1.05);
        }
        .btn.primary:active {
          transform: translateY(1px);
          box-shadow: 0 10px 30px rgba(61, 102, 255, 0.55);
        }

        .map-panel {
          margin-top: 10px;
        }

        .map-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .map-title {
          font-size: 13px;
          font-weight: 600;
        }
        .map-tag {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.7);
          color: #cbd5f5;
          background: rgba(15, 23, 42, 0.9);
        }

        .map-box {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          height: 170px;
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
          border: 1px solid rgba(148, 163, 255, 0.6);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
        }

        .map-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 4px;
          background: radial-gradient(
            circle at 50% 0%,
            rgba(15, 23, 42, 0.2),
            rgba(15, 23, 42, 0.86)
          );
          color: #dbe6ff;
        }

        .map-overlay span {
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        .map-overlay small {
          font-size: 11px;
          color: #9aa6c6;
        }

        .map-note {
          margin: 6px 0 0;
          font-size: 12px;
          color: #9aa6c6;
        }

        /* mobile */
        @media (max-width: 768px) {
          .contact-wrap {
            padding: 14px 12px 18px;
            border-radius: 20px;
          }
          .contact-grid {
            grid-template-columns: minmax(0, 1fr);
          }
          .side {
            order: -1;
          }
        }
      `}</style>
    </main>
  );
}
