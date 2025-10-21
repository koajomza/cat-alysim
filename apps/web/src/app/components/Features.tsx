const features = [
  {
    title: "เอกสารอัตโนมัติ",
    desc: "สร้างเอกสารตามฟอร์แมตได้ทันที พร้อมฟิลด์ครบ",
  },
  {
    title: "OCR + ประมวลผลบัตรประชาชน",
    desc: "อ่านข้อมูลจากบัตรโดยอัตโนมัติ ลดความผิดพลาด",
  },
  {
    title: "Realtime Chat & แจ้งเตือน",
    desc: "สื่อสารภายในระบบ พร้อมแสดงสถานะออนไลน์",
  },
];

export default function Features() {
  return (
    <section className="features container" id="features">
      {features.map((f, idx) => (
        <div className="card" key={idx}>
          <h3>{f.title}</h3>
          <p>{f.desc}</p>
        </div>
      ))}
    </section>
  );
}
