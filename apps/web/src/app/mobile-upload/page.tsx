import React, { Suspense } from "react";
import MobileUploadClient from "./MobileUploadClient";

export default function MobileUploadPage() {
  return (
    <Suspense fallback={<div style={{padding:20}}>Loading...</div>}>
      <MobileUploadClient />
    </Suspense>
  );
}
