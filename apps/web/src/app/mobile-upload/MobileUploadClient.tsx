// apps/web/app/mobile-upload/MobileUploadClient.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const UPLOAD_BASE = process.env.NEXT_PUBLIC_UPLOAD_BASE || "https://upload.cat-alysim.com";
const MOBILE_PAGE = process.env.NEXT_PUBLIC_MOBILE_PAGE || "https://www.cat-alysim.com/mobile-upload";

// helper: แปลง bytes → KB/MB
const fmtSize = (b?: number) => {
  if (!b && b !== 0) return "";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0, v = b;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(1)} ${u[i]}`;
};

const MobileUploadClient: React.FC = () => {
  const searchParams = useSearchParams();

  // kind: img | doc (default img)
  const kind = (searchParams.get("kind") || "img").toLowerCase() === "doc" ? "doc" : "img";

  // single: true = ให้เลือกได้รูปเดียว (accuser/suspect/witness), false = หลายรูป (photo evidence)
  const single = useMemo(() => {
    const q = (searchParams.get("single") || "").toLowerCase();
    if (q === "1" || q === "true" || q === "yes") return true;
    // ดีฟอลต์: จากโทรศัพท์ให้ multi (ตามที่สั่ง), ถ้าไม่ส่งพารามมา = false
    return false;
  }, [searchParams]);

  // source: local | phone
  const [source, setSource] = useState<"local" | "phone">("local");

  // เก็บไฟล์ที่เลือก (เฉพาะโหมด local เท่านั้น)
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<boolean>(false);

  // refs ฟอร์ม/อินพุต/ไอเฟรม
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // อัปเดตพรีวิวไฟล์แรก
  useEffect(() => {
    if (!files.length) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(files[0]);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [files]);

  // เมื่อ iframe โหลดเสร็จ (เช็คว่าเป็นหน้า /done ของโดเมนอัปโหลด → ขึ้นสถานะสำเร็จ)
  useEffect(() => {
    const onLoad = () => {
      try {
        // cross-origin อ่านเนื้อไม่ได้ แต่ load สำเร็จ = โพสต์เสร็จแล้ว (ฝั่ง Flask redirect ไป /done)
        setStatus("อัปโหลดเสร็จแล้ว ✅");
        setConfirmed(false);
        setFiles([]);
        setPreviewUrl(null);
      } catch {
        // ignore
      }
    };
    const el = iframeRef.current;
    if (el) el.addEventListener("load", onLoad);
    return () => { if (el) el.removeEventListener("load", onLoad); };
  }, []);

  // กดเลือกไฟล์จากเครื่อง
  const onPickLocal = () => {
    setSource("local");
    inputRef.current?.click();
  };

  // เปลี่ยนไฟล์
  const onFilesChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const list = e.target.files;
    if (!list || list.length === 0) {
      setFiles([]); setStatus(null); setConfirmed(false); return;
    }
    const arr = Array.from(list);
    // ถ้า single บังคับใช้แค่รูปแรก
    setFiles(single ? [arr[0]] : arr);
    setStatus("ยังไม่ส่ง — กดปุ่มยืนยันเพื่ออัปโหลด");
    setConfirmed(false);
  };

  // กดยืนยันส่งจริง
  const onConfirmSubmit = () => {
    if (!files.length) {
      setStatus("ยังไม่ได้เลือกไฟล์");
      return;
    }
    setConfirmed(true);
    setStatus("กำลังอัปโหลด...");
    // ส่งฟอร์มเข้า hidden iframe เพื่อไม่เปลี่ยนหน้า
    formRef.current?.submit();
  };

  // ลิงก์สำหรับ “อัปโหลดจากโทรศัพท์”
  const phoneURL = useMemo(() => {
    // เปิดหน้า mobile-upload (ฝั่งเว็บหลัก) แล้วหน้านั้นจะ submit form ไปโดเมนอัปโหลดเอง
    // ให้ default ที่มือถือ = หลายรูป ⇒ single=false
    const qs = new URLSearchParams({ kind, single: "false" });
    return `${MOBILE_PAGE}?${qs.toString()}`;
  }, [kind]);

  // URL ทำ QR ง่าย ๆ (ไม่ต้องลง lib)
  const qrURL = useMemo(() => {
    const data = encodeURIComponent(phoneURL);
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${data}`;
  }, [phoneURL]);

  return (
    <div className="page-root">
      <div className="wrap">
        <div className="title">อัปโหลดจากมือถือ / เครื่อง</div>
        <div className="subtitle">
          เลือกแหล่งอัปโหลดได้: จากเครื่อง (พรีวิว → ยืนยัน → ส่ง) หรือจากโทรศัพท์ (สแกน QR แล้วเลือกหลายรูปได้)
        </div>

        {/* โหมดเลือกแหล่ง */}
        <div className="tabs">
          <button
            className={`tab ${source === "local" ? "active" : ""}`}
            onClick={() => setSource("local")}
            type="button"
          >
            จากเครื่อง
          </button>
          <button
            className={`tab ${source === "phone" ? "active" : ""}`}
            onClick={() => setSource("phone")}
            type="button"
          >
            จากโทรศัพท์
          </button>
          <div className="pill">โหมด: {kind.toUpperCase()} | {single ? "รูปเดียว" : "หลายรูป"}</div>
        </div>

        {/* FROM LOCAL */}
        {source === "local" && (
          <div className="card">
            <button className="btn-main" onClick={onPickLocal} type="button">
              เลือกไฟล์จากเครื่อง
            </button>
            <div className="hint">
              {kind === "img"
                ? <>รองรับ .jpg .jpeg .png .heic {single ? "(เลือกได้รูปเดียว)" : "(เลือกได้หลายรูป)"} </>
                : <>แนบเอกสาร (เช่น PDF) {single ? "(ไฟล์เดียว)" : "(หลายไฟล์)"} </>}
            </div>

            <form
              ref={formRef}
              method="POST"
              // ★ ยิงข้ามโดเมนแบบ absolute URL
              action={`${UPLOAD_BASE}/upload`}
              encType="multipart/form-data"
              // ★ ส่งเข้า hidden iframe เพื่อไม่ให้หน้าเว็บเด้งไปโดเมนอัปโหลด
              target="upload_iframe"
            >
              <input
                ref={inputRef}
                className="hidden-input"
                name="photo"
                type="file"
                accept={kind === "img" ? "image/*" : undefined}
                multiple={!single} // ★ ตามโหมด
                onChange={onFilesChange}
              />
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="mode" value={kind === "img" ? "image" : "doc"} />
            </form>

            {files.length > 0 && (
              <div className="preview">
                {previewUrl && (
                  <>
                    <div className="preview-title">พรีวิวไฟล์แรก</div>
                    {kind === "img" ? (
                      <img src={previewUrl} alt="preview" />
                    ) : (
                      <div className="docbox">ไฟล์: {files[0].name}</div>
                    )}
                  </>
                )}

                <div className="file-list">
                  {files.map((f, i) => (
                    <div className="file-item" key={i}>
                      <strong>{f.name}</strong> <span className="size">({fmtSize(f.size)})</span>
                    </div>
                  ))}
                </div>

                <div className="actions">
                  <button
                    className="btn-confirm"
                    disabled={confirmed}
                    onClick={onConfirmSubmit}
                    type="button"
                  >
                    {confirmed ? "กำลังส่ง..." : "ยืนยันส่ง"}
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => { setFiles([]); setPreviewUrl(null); setStatus(null); setConfirmed(false); }}
                    type="button"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}

            {status && <div className="status">{status}</div>}

            {/* ★ Hidden Iframe รับผลลัพธ์ /done โดยไม่เปลี่ยนหน้า */}
            <iframe
              ref={iframeRef}
              name="upload_iframe"
              className="hidden-iframe"
              title="upload_target"
            />
          </div>
        )}

        {/* FROM PHONE */}
        {source === "phone" && (
          <div className="card phone">
            <div className="phone-title">อัปโหลดจากโทรศัพท์</div>
            <div className="phone-grid">
              <img className="qr" src={qrURL} alt="qr" />
              <div className="phone-help">
                <ol>
                  <li>หยิบมือถือมาสแกน QR</li>
                  <li>หน้าเปิดที่: <code>{MOBILE_PAGE}</code></li>
                  <li>เลือกหลายรูปได้เลย แล้วกดยืนยันบนมือถือ</li>
                </ol>
                <a className="btn-link" href={phoneURL} target="_blank" rel="noreferrer">
                  เปิดลิงก์นี้บนมือถือ
                </a>
              </div>
            </div>
            <div className="muted">
              ปลายทางอัปโหลด: <code>{UPLOAD_BASE}/upload</code> (ผ่าน Cloudflare Tunnel)
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        :root {
          --bg: #0b1020;
          --card: #0e1628;
          --text: #e5e7eb;
          --muted: #9ca3af;
          --accent: #22d3ee;
          --accent-soft: rgba(34,211,238,.12);
          --border: #1f2937;
          --danger: #ef4444;
          --ok: #22c55e;
        }
        .page-root { min-height:100vh; background: radial-gradient(1200px 600px at 50% -10%, #1f2937, #070a14 60%); color:var(--text); }
        .wrap { max-width: 860px; margin: 0 auto; padding:24px 16px 48px; }
        .title { font-size:24px; font-weight:800; }
        .subtitle { color:var(--muted); margin-top:6px; margin-bottom:14px; }
        .tabs { display:flex; align-items:center; gap:8px; margin:10px 0 14px; flex-wrap:wrap; }
        .tab { padding:8px 12px; border:1px solid var(--border); background:#0c1324; color:var(--text); border-radius:10px; cursor:pointer; }
        .tab.active { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft) inset; }
        .pill { margin-left:auto; font-size:12px; background:var(--accent-soft); color:var(--accent); border-radius:999px; padding:4px 10px; }
        .card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:16px; }
        .btn-main { width:100%; padding:12px 14px; border-radius:10px; border:1px solid var(--accent); background:linear-gradient(135deg,#0e1726,#0b2a3f); color:#dff8ff; font-weight:700; cursor:pointer; }
        .hint { font-size:12px; color:var(--muted); margin-top:6px; }
        .preview { margin-top:14px; }
        .preview-title { color:var(--muted); font-size:12px; margin-bottom:6px; }
        .preview img { max-width:100%; border:1px solid var(--border); border-radius:12px; display:block; }
        .docbox { padding:10px; border:1px dashed var(--border); border-radius:10px; color:var(--muted); background:#0b1322; }
        .file-list { margin-top:10px; font-size:12px; color:var(--muted); max-height:120px; overflow:auto; }
        .file-item { border-bottom:1px dashed #273445; padding:4px 0; }
        .file-item:last-child { border-bottom:none; }
        .actions { display:flex; gap:8px; margin-top:12px; }
        .btn-confirm { padding:10px 12px; border-radius:10px; border:1px solid #1b3a2a; background:#0a1e14; color:#bff1ce; font-weight:700; cursor:pointer; }
        .btn-cancel { padding:10px 12px; border-radius:10px; border:1px solid #3a1b1b; background:#220a0a; color:#ffc6c6; font-weight:700; cursor:pointer; }
        .status { margin-top:10px; color:var(--muted); }
        .hidden-input { position: fixed; left:-9999px; top:-9999px; }
        .hidden-iframe { width:0; height:0; border:0; visibility:hidden; }
        .phone { }
        .phone-title { font-weight:700; margin-bottom:8px; }
        .phone-grid { display:grid; grid-template-columns: 240px 1fr; gap:16px; align-items:center; }
        .qr { width:240px; height:240px; border-radius:12px; border:1px solid var(--border); background:#000; }
        .phone-help ol { margin:0 0 8px 18px; }
        .btn-link { display:inline-block; margin-top:6px; padding:8px 10px; border-radius:10px; background:var(--accent-soft); color:var(--accent); border:1px solid var(--accent); text-decoration:none; }
        .muted { margin-top:8px; color:var(--muted); font-size:12px; }
        code { background:#0b1320; padding:2px 6px; border-radius:6px; border:1px solid #111827; }
      `}</style>
    </div>
  );
};

export default MobileUploadClient;
