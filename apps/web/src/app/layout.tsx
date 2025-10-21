// apps/web/src/app/layout.tsx
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
<body>
<header className="nav">
<div className="container nav-inner">
{/* LEFT: brand + primary links */}
<div className="nav-left">
<Link href="/" className="brand" aria-label="กลับหน้าแรก">
<span className="brand-letters">CAT-ALYSIM</span>
</Link>


<nav className="primary-links" aria-label="เมนูหลัก">
<Link href="#features" className="nav-link">ฟีเจอร์</Link>
<Link href="#download" className="nav-link">ดาวน์โหลด</Link>
<Link href="/docs" className="nav-link">คู่มือการใช้งาน</Link>
<Link href="/contact" className="nav-link">ติดต่อ</Link>
</nav>
</div>


{/* RIGHT: actions only */}
<div className="nav-actions">
<Link href="/signup" className="btn nav-btn signup">
เปิดบัญชี
</Link>
<Link href="/login" className="btn nav-btn login">
เข้าสู่ระบบ
</Link>
</div>
</div>
</header>


{children}


<footer className="footer">
<div className="container footer-inner">
<span>© {new Date().getFullYear()} CAT-ALYSIM</span>
<a href="#top" className="back-top">กลับขึ้นบน</a>
</div>
</footer>


{/* small decorative canvas for subtle animated particles */}
<div className="bg-decor" aria-hidden="true"></div>
</body>
</html>
);
}