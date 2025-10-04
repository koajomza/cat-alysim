import Hero from "@/components/Hero";
import Features from "@/components/Features";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <section className="preview container" id="preview">
        <h2>ดูตัวอย่างการใช้งาน</h2>
        <img src="/assets/mockup-chat.png" alt="Chat preview" />
      </section>
      <footer>
        <div className="container">
          © {new Date().getFullYear()} CAT-ALYSIM | สำนักงานตำรวจแห่งชาติ
        </div>
      </footer>
    </>
  );
}
