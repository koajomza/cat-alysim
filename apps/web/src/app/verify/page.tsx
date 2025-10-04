// apps/web/src/app/verify/page.tsx
import VerifyClient from './VerifyClient';

// ทำให้เพจนี้เป็น static ไปเลย
export const dynamic = 'force-static';

export default function VerifyPage() {
  return <VerifyClient />;
}
