// apps/web/src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Kanit } from "next/font/google";

export const metadata: Metadata = {
  title: "CAT-ALYSIM",
  description: "ระบบสอบสวนออนไลน์ - เอกสารอัตโนมัติ + แชท realtime",
  metadataBase: new URL("https://cat-alysim.com"),
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";
  const lastUpdate = process.env.NEXT_PUBLIC_LAST_UPDATE ?? "—";

  // CSS ทั้งหมดอยู่ในตัวไฟล์ ไม่พึ่ง globals.css และไม่ใช้ styled-jsx
  const css = `
  :root {
    --bg:#050507; --panel:#0a0f12; --text:#e6eef8; --muted:#9aa3ad;
    --accent:#00d084; --accent-600:#00c176; --accent-700:#00a868;
    --card:#0e1520; --line:rgba(255,255,255,0.06); --glass:rgba(255,255,255,0.04);
    --shadow:rgba(0,0,0,0.6); --grid:rgba(140,180,255,0.08);
  }
  html, body {
    padding:0; margin:0; background:var(--bg); color:var(--text);
    min-height:100%; text-rendering:optimizeLegibility; -webkit-font-smoothing:antialiased;
  }
  *, *::before, *::after { box-sizing:border-box; }
  a{ color:inherit; text-decoration:none; }

  .sr-only {
    position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden;
    clip:rect(0,0,0,0); white-space:nowrap; border:0;
  }

  /* ===== Background layers ===== */
  .bg-wrap {
    position:fixed; inset:0; pointer-events:none; z-index:-1;
    background: radial-gradient(1200px 800px at 70% -10%, #0a2240 0%, transparent 60%),
                radial-gradient(800px 600px at 20% 110%, #1a0f2e 0%, transparent 55%),
                linear-gradient(180deg, #06080a 0%, #050507 100%);
  }
  .bg-grad {
    position:absolute; inset:-10%;
    background: conic-gradient(from 200deg at 70% 30%, rgba(0,208,132,0.12), transparent 40%),
                radial-gradient(600px 400px at 80% 20%, rgba(0,208,132,0.20), transparent 60%),
                radial-gradient(700px 420px at 30% 80%, rgba(120,110,255,0.18), transparent 60%);
    filter: blur(40px);
    animation: floatSlow 28s ease-in-out infinite alternate;
  }
  .bg-aurora {
    position:absolute; inset:-20%;
    background: radial-gradient(60% 18% at 50% 0%, rgba(0,208,132,0.18), transparent 70%),
                radial-gradient(70% 22% at 40% 10%, rgba(70,180,255,0.16), transparent 70%);
    mix-blend-mode: screen; filter: blur(20px);
  }
  .bg-aurora.a { animation: aurora 24s ease-in-out infinite; }
  .bg-aurora.b { animation: aurora 30s ease-in-out infinite reverse; }
  .bg-aurora.c { animation: aurora 40s ease-in-out infinite; opacity:.6; }
  .bg-blob {
    position:absolute; width:46vw; height:46vw; border-radius:50%;
    background: radial-gradient(circle at 30% 30%, rgba(0,208,132,0.12), transparent 60%);
    filter: blur(26px);
  }
  .bg-blob.a { left:-10vw; top:10vh; animation: drift 36s linear infinite; }
  .bg-blob.b { right:-12vw; top:22vh; animation: drift 42s linear infinite reverse; }
  .bg-blob.c { left:20vw; bottom:-14vh; animation: drift 48s linear infinite; opacity:.7; }
  .bg-grid {
    position:absolute; inset:0; mask-image: radial-gradient(80% 80% at 50% 40%, black 40%, transparent 90%);
    background-image:
      linear-gradient(to right, var(--grid) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid) 1px, transparent 1px);
    background-size: 38px 38px;
    transform: perspective(1000px) rotateX(65deg);
    transform-origin: top;
    opacity:.55;
  }
  .bg-scanlight {
    position:absolute; inset:0;
    background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%);
    animation: scan 7s linear infinite;
  }

  /* ===== Layout ===== */
  .site-main {
    position: relative;
    min-height: calc(100dvh - 88px - 64px);
    padding: 24px clamp(16px, 3vw, 28px);
  }

  /* ===== Container ===== */
  .container {
    display:flex; align-items:center; justify-content:space-between;
    gap:16px; max-width:1200px; margin:0 auto; padding:0 clamp(16px, 3vw, 28px);
  }

  /* ===== Nav ===== */
  .nav {
    position:sticky; top:0; z-index:50; backdrop-filter:saturate(140%) blur(10px);
    background: linear-gradient(180deg, rgba(8,12,15,0.75), rgba(8,12,15,0.55));
    border-bottom:1px solid var(--line);
    box-shadow: 0 10px 40px var(--shadow);
  }
  .nav-left { display:flex; align-items:center; gap:14px; }
  .brand {
    display:flex; align-items:center; gap:10px; font-weight:700; letter-spacing:.4px;
    padding:10px 12px; border-radius:12px; position:relative; isolation:isolate;
  }
  .brand::after {
    content:""; position:absolute; inset:0; border-radius:12px; padding:1px;
    background: linear-gradient(135deg, rgba(0,208,132,0.7), rgba(110,170,255,0.6));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude; opacity:.35;
  }
  .brand-dot {
    width:10px; height:10px; border-radius:50%;
    background: radial-gradient(circle at 40% 40%, #00d084, #009f62);
    box-shadow: 0 0 24px #00d08488, 0 0 48px #00d08455;
  }
  .primary-links { display:flex; gap:6px; padding-left:8px; }
  .nav-link {
    padding:10px 12px; border-radius:10px; font-weight:500; color:var(--text);
    border:1px solid transparent; transition: border-color .2s ease, background .2s ease;
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00));
  }
  .nav-link:hover { border-color: var(--line); background: rgba(255,255,255,0.03); }

  .nav-actions { display:flex; gap:10px; }
  .nav-btn {
    --glow: drop-shadow(0 0 12px rgba(0,208,132,0.32));
    padding:10px 14px; border-radius:12px; font-weight:600; line-height:1; border:1px solid var(--line);
    background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
    filter: var(--glow);
  }
  .nav-btn.signup {
    background: radial-gradient(120% 140% at 10% -10%, rgba(0,208,132,0.5) 0%, rgba(0,208,132,0.14) 28%, rgba(255,255,255,0.03) 70%),
                linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
    border-color: rgba(0,208,132,0.45);
  }
  .nav-btn.signup:hover { transform: translateY(-0.5px); border-color: rgba(0,208,132,0.8); }
  .nav-btn.login:hover  { transform: translateY(-0.5px); border-color: var(--line); }

  /* ===== Footer ===== */
  .site-footer {
    position:relative; border-top:1px solid var(--line); background:rgba(7,10,13,0.6);
    backdrop-filter:saturate(140%) blur(8px);
  }
  .footer-inner {
    max-width:1200px; margin:0 auto; padding:18px clamp(16px, 3vw, 28px);
    display:flex; align-items:center; gap:12px; color:var(--muted);
  }
  .footer-inner .dot { opacity:.6; }
  .backtop {
    margin-left:auto; width:34px; height:34px; display:grid; place-items:center;
    border-radius:10px; border:1px solid var(--line);
    background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  }
  .backtop:hover { transform: translateY(-1px); }

  /* ===== Responsive ===== */
  @media (max-width: 980px) {
    .primary-links { display:none; }
  }

  /* ===== Keyframes ===== */
  @keyframes floatSlow { from { transform: translateY(-1%) } to { transform: translateY(1%) } }
  @keyframes drift {
    0% { transform: translate3d(0,0,0) rotate(0.2deg); }
    50% { transform: translate3d(3vw,-1.8vh,0) rotate(-0.6deg); }
    100% { transform: translate3d(-2vw,2vh,0) rotate(0.2deg); }
  }
  @keyframes aurora {
    0%   { transform: translate3d(-4%, 0, 0) skewX(-2deg); opacity:.85; }
    50%  { transform: translate3d(6%, -1%, 0) skewX(2deg); opacity:1; }
    100% { transform: translate3d(-2%, 1%, 0) skewX(-1deg); opacity:.9; }
  }
  @keyframes scan {
    0% { transform: translateY(-100%); opacity:0; }
    10% { opacity:.6; }
    50% { opacity:.25; }
    100% { transform: translateY(100%); opacity:0; }
  }
  `;

  return (
    <html lang="th" className={kanit.className}>
      <body>
        {/* style แบบ RSC-safe ไม่พึ่ง styled-jsx */}
        <style dangerouslySetInnerHTML={{ __html: css }} />

        {/* ===== Cosmic Background (pure CSS) ===== */}
        <div className="bg-wrap" aria-hidden="true">
          <div className="bg-grad" />
          <div className="bg-aurora a" />
          <div className="bg-aurora b" />
          <div className="bg-aurora c" />
          <div className="bg-blob a" />
          <div className="bg-blob b" />
          <div className="bg-blob c" />
          <div className="bg-scanlight" />
          <div className="bg-grid" />
        </div>

        {/* ===== Nav (glass + neon) ===== */}
        <a id="top" className="sr-only" aria-hidden="true" />
        <header className="nav">
          <div className="container">
            <div className="nav-left">
              <Link href="/" className="brand" aria-label="กลับหน้าแรก">
                <span className="brand-dot" />
                CAT-ALYSIM
              </Link>
              <nav className="primary-links" aria-label="เมนูหลัก">
                <Link href="/#features" className="nav-link">ฟีเจอร์</Link>
                <Link href="/#get" className="nav-link">ดาวน์โหลด</Link>
                <Link href="/docs" className="nav-link">คู่มือ</Link>
                <Link href="/contact" className="nav-link">ติดต่อ</Link>
              </nav>
            </div>
            <div className="nav-actions">
              <Link href="/signup" className="nav-btn signup">เปิดบัญชี</Link>
              <Link href="/login" className="nav-btn login">เข้าสู่ระบบ</Link>
            </div>
          </div>
        </header>

        {/* ===== Page content ===== */}
        <main className="site-main">{children}</main>

        {/* ===== Footer ===== */}
        <footer className="site-footer">
          <div className="footer-inner">
            <span>© {new Date().getFullYear()} CAT-ALYSIM</span>
            <span className="dot">•</span>
            <span>v{version} — อัปเดต {lastUpdate}</span>
            <Link href="#top" className="backtop" aria-label="กลับขึ้นบน">↑</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
