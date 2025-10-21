// contact/pages.tsx
import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', lineHeight: 1.6 }}>
      <h1>ติดต่อบริษัท</h1>
      <p>บริษัท ABC จำกัด</p>

      <h2>ที่อยู่</h2>
      <p>123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110</p>

      <h2>โทรศัพท์</h2>
      <p>+66 2 123 4567</p>

      <h2>อีเมลล์</h2>
      <p>contact@abccompany.com</p>
    </div>
  );
};

export default ContactPage;
