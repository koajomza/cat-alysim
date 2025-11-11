export default function Hero() {
  return (
    <section className="hero container">
      <div className="hero-text">
        <h1>CAT-ALYSIM: ระบบจัดการคดีอัจฉริยะ</h1>
        <p>เอกสารอัตโนมัติ, OCR, แชท realtime — ครบทุกฟีเจอร์เพื่อเจ้าหน้าที่</p>
        <div className="mt-8">
          <a href="/login" className="btn accent mr-4">เข้าสู่ระบบ</a>
          <a href="#features" className="btn outline">ดูฟีเจอร์</a>
        </div>
      </div>
      <div className="hero-image">
        <img src="/assets/mockup-dashboard.png" alt="Dashboard preview" />
      </div>
    </section>
  );
}
