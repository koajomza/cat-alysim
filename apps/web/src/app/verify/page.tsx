"use client";

export default function VerifyPage() {
  return (
    <main className="container">
      <h1>ยืนยันสิทธิ์การใช้งาน</h1>
      <p>กรุณากรอก Token เพื่อยืนยัน</p>
      
      <form className="status-form" style={{ flexDirection: "column", gap: "12px" }}>
        <input
          type="text"
          placeholder="กรอกโทเค็น"
          className="input"
          required
        />
        <button className="btn primary" type="submit">
          ยืนยัน
        </button>
      </form>
    </main>
  );
}
