// apps/web/src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CAT-ALYSIM",
  description: "ระบบสอบสวนออนไลน์ - เอกสารอัตโนมัติ + แชท realtime",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <header className="nav">
          <div className="container">
            <div className="brand">CAT-ALYSIM</div>
            <nav>
              <a href="#features">ฟีเจอร์</a>
              <a href="#gallery">แกลเลอรี</a>
              <a href="#download">ดาวน์โหลด</a>
              <a href="#account">บัญชี</a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="footer">
          <div className="container">
            <span>© {new Date().getFullYear()} CAT-ALYSIM</span>
            <a href="#top">กลับขึ้นบน</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
