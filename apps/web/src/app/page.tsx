"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 md:px-8" id="top">
      <section className="hero mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-center leading-tight md:leading-snug">
          โปรแกรมทำสำนวนการสอบสวน
        </h1>

        <p className="hero-sub text-sm md:text-base mt-2">
          เอกสารอัตโนมัติ แชท realtime และ OCR — รวมอยู่ที่นี่
        </p>

        <div className="cta flex flex-col sm:flex-row justify-center gap-2 mt-3">
          <a className="btn primary" href="#download">
            ดาวน์โหลด
          </a>
          <a className="btn outline" href="#demo">
            ทดลองใช้งาน
          </a>
          <Link className="btn ghost" href="/login">
            เข้าสู่ระบบ
          </Link>
        </div>

        <ul className="hero-features mt-3 list-disc list-inside text-left sm:text-center">
          <li>เอกสารอัตโนมัติ</li>
          <li>OCR อ่านบัตร/เอกสาร</li>
          <li>แชท realtime + sync</li>
        </ul>
      </section>

      {/* preview section */}
      <section className="preview mt-8">
        {[
          { title: "สร้างสำนวนการสอบสวน", key: "criminal" },
          { title: "คดีจราจร", key: "traffic" },
          { title: "คดียาเสพติด", key: "drug" },
        ].map((group) => (
          <div key={group.key} className="preview-group mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-center mb-2">
              {group.title}
            </h2>

            <div className="preview-row flex flex-wrap gap-3 justify-center">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 min-w-[160px] max-w-[520px] flex flex-col items-center"
                >
                  <Image
                    src="/assets/cover.png"
                    alt={`${group.title} - ${i}`}
                    width={520}
                    height={920}
                    priority
                    className="w-full h-auto object-cover rounded-md"
                  />
                  {i === 1 && group.key === "criminal" && (
                    <h4 className="mt-2 text-center text-sm md:text-base font-medium">
                      การสร้างสำนวนการสอบสวนทำได้โดยง่าย
                    </h4>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section
        id="features"
        className="features container-section flex flex-col sm:flex-row justify-center gap-4 mt-8"
      >
        <div className="card flex-1 text-center p-4 border rounded-md">
          <h3 className="font-semibold">เอกสาร</h3>
          <p className="mt-1 text-sm">สร้างคำร้อง หมายเรียก และสำนวนอัตโนมัติ</p>
        </div>
        <div className="card flex-1 text-center p-4 border rounded-md">
          <h3 className="font-semibold">OCR</h3>
          <p className="mt-1 text-sm">อ่านบัตรประชาชน ใบอนุญาต แบบแม่นยำ</p>
        </div>
        <div className="card flex-1 text-center p-4 border rounded-md">
          <h3 className="font-semibold">Realtime Chat</h3>
          <p className="mt-1 text-sm">คุย/แชร์ไฟล์ และซิงก์กับ Supabase</p>
        </div>
      </section>
    </main>
  );
}
