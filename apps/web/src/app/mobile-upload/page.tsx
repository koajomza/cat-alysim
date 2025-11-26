// apps/web/app/mobile-upload/page.tsx
import { Suspense } from "react";
import MobileUploadClient from "./MobileUploadClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{padding:16}}>กำลังโหลด…</div>}>
      <MobileUploadClient />
    </Suspense>
  );
}
