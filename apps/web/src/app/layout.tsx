import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CAT-ALYSIM",
  description: "ระบบสอบสวนออนไลน์ - เอกสารอัตโนมัติ + แชท realtime",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="flex flex-col min-h-screen">
        {/* HEADER */}
        <header className="nav bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between p-4">
            
            {/* LEFT: brand + primary links */}
            <div className="nav-left flex flex-col sm:flex-row items-center sm:gap-6 w-full sm:w-auto">
              <Link href="/" className="brand mb-2 sm:mb-0" aria-label="กลับหน้าแรก">
                <span className="brand-letters text-xl font-bold">CAT-ALYSIM</span>
              </Link>

              <nav className="primary-links flex flex-col sm:flex-row gap-2 sm:gap-4 text-center sm:text-left">
                <Link href="#features" className="nav-link hover:underline">ฟีเจอร์</Link>
                <Link href="#download" className="nav-link hover:underline">ดาวน์โหลด</Link>
                <Link href="/docs" className="nav-link hover:underline">คู่มือการใช้งาน</Link>
                <Link href="/contact" className="nav-link hover:underline">ติดต่อ</Link>
              </nav>
            </div>

            {/* RIGHT: actions */}
            <div className="nav-actions flex gap-2 mt-2 sm:mt-0">
              <Link href="/signup" className="btn nav-btn signup">
                เปิดบัญชี
              </Link>
              <Link href="/login" className="btn nav-btn login">
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1">{children}</main>

        {/* FOOTER */}
        <footer className="footer bg-gray-50 mt-auto py-4 border-t">
          <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
            <span>© {new Date().getFullYear()} CAT-ALYSIM</span>
            <a href="#top" className="back-top hover:underline">กลับขึ้นบน</a>
          </div>
        </footer>

        {/* small decorative canvas */}
        <div className="bg-decor" aria-hidden="true"></div>
      </body>
    </html>
  );
}
