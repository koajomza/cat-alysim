"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

const MobileUploadPage: React.FC = () => {
  const searchParams = useSearchParams();
  const kindParam = (searchParams.get("kind") || "img").toLowerCase();

  const [kind, setKind] = useState<"img" | "doc">("img");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  // sync kind จาก query string
  useEffect(() => {
    setKind(kindParam === "doc" ? "doc" : "img");
  }, [kindParam]);

  // อัปเดต preview เมื่อ files เปลี่ยน
  useEffect(() => {
    if (files.length === 0) {
      setPreviewUrl(null);
      return;
    }
    const first = files[0];
    const url = URL.createObjectURL(first);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [files]);

  // format size สวย ๆ
  const formatSize = (bytes?: number): string => {
    if (bytes === undefined) return "";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let val = bytes;
    while (val >= 1024 && i < units.length - 1) {
      val /= 1024;
      i++;
    }
    return `${val.toFixed(1)} ${units[i]}`;
  };

  const handlePickClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFilesChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const list = e.target.files;
    if (!list || list.length === 0) {
      setFiles([]);
      setStatus(null);
      return;
    }

    const f = Array.from(list);
    setFiles(f);
    setStatus("กำลังอัปโหลด...");

    // ให้ UI ได้วาดก่อน แล้วค่อย submit ฟอร์ม
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.submit(); // จะ reload หน้า / ไปหน้า done ของ backend
      }
    }, 200);
  };

  return (
    <div className="page-root">
      <div className="wrap">
        <div className="pill">
          <span>โหมด:</span>
          <span className="kind">{kind === "doc" ? "DOC" : "IMG"}</span>
        </div>

        <div className="title">อัปโหลดจากโทรศัพท์</div>
        <div className="subtitle">
          เลือกรูปจากแกลเลอรี่ของเครื่องได้ทีละหลายรูป
          ระบบจะอัปโหลดทั้งหมดให้ทีเดียวแล้วส่งเข้าโปรแกรมบนคอม
        </div>

        <div className="card">
          <button
            id="btn_pick"
            className="btn-main"
            type="button"
            onClick={handlePickClick}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
                ry="2"
                fill="none"
                stroke="#e0f2fe"
                strokeWidth="1.4"
              />
              <path
                d="M4 15l4-4 4 4 3-3 5 5"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>เลือกจากโทรศัพท์</span>
          </button>

          <div className="hint">
            รองรับไฟล์รูป เช่น <strong>.jpg .jpeg .png .heic</strong>
            <br />
            กดเลือกทีเดียวหลายรูปได้เลย
          </div>

          {/* ฟอร์มที่จะยิงไป /upload (ให้ nginx / cloudflare proxy ไปหา Python) */}
          <form
            ref={formRef}
            id="form_upload"
            method="POST"
            action="/upload"
            encType="multipart/form-data"
          >
            <input
              ref={inputRef}
              id="input_files"
              className="hidden-input"
              name="photo"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
            />

            <input id="input_mode" type="hidden" name="mode" value="image" />
            <input id="input_kind" type="hidden" name="kind" value={kind} />
          </form>

          {previewUrl && (
            <div className="preview">
              <div className="preview-title">
                พรีวิวรูปแรกจากชุดที่เลือก
              </div>
              <img src={previewUrl} alt="preview" />
              <div className="file-list">
                {files.map((f) => (
                  <div className="file-item" key={f.name + f.size}>
                    <strong>{f.name}</strong>{" "}
                    <span className="size">({formatSize(f.size)})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status && (
            <div
              id="status"
              className={`status ${status.startsWith("กำลัง") ? "" : "ok"}`}
            >
              {status}
            </div>
          )}
        </div>
      </div>

      {/* CSS แบบ scoped */}
      <style jsx>{`
        :root {
          --bg: #0f172a;
          --card: #020617;
          --border: #1f2937;
          --accent: #22d3ee;
          --accent-soft: rgba(34, 211, 238, 0.1);
          --text: #e5e7eb;
          --muted: #9ca3af;
          --danger: #f97373;
        }

        .page-root {
          min-height: 100vh;
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          background: radial-gradient(circle at top, #1f2937 0, #020617 60%);
          color: var(--text);
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        }

        .wrap {
          max-width: 720px;
          width: 100%;
          margin: 0 auto;
          padding: 20px 16px 32px;
        }

        .title {
          font-size: 22px;
          font-weight: 700;
          margin: 4px 0 8px;
        }

        .subtitle {
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 16px;
        }

        .card {
          background: var(--card);
          border-radius: 16px;
          border: 1px solid var(--border);
          padding: 16px;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.8);
        }

        .btn-main {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid var(--accent);
          background: linear-gradient(135deg, #0f172a, #0369a1);
          color: #e5faff;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: transform 0.12s ease, box-shadow 0.12s ease,
            background 0.12s ease;
        }

        .btn-main:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px rgba(8, 47, 73, 0.6);
          background: linear-gradient(135deg, #0b1120, #075985);
        }

        .btn-main:active {
          transform: translateY(0);
          box-shadow: none;
        }

        .hint {
          font-size: 12px;
          color: var(--muted);
          margin-top: 8px;
          text-align: center;
        }

        .hint strong {
          color: var(--accent);
        }

        .preview {
          margin-top: 16px;
        }

        .preview-title {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 6px;
        }

        .preview img {
          max-width: 100%;
          border-radius: 14px;
          border: 1px solid var(--border);
          display: block;
        }

        .file-list {
          margin-top: 10px;
          font-size: 12px;
          color: var(--muted);
          max-height: 90px;
          overflow: auto;
        }

        .file-item {
          padding: 3px 0;
          border-bottom: 1px dashed rgba(148, 163, 184, 0.25);
        }

        .file-item:last-child {
          border-bottom: none;
        }

        .file-item .size {
          color: #6b7280;
        }

        .hidden-input {
          position: fixed;
          left: -9999px;
          top: -9999px;
        }

        .status {
          margin-top: 16px;
          font-size: 13px;
          color: var(--muted);
        }

        .status.ok {
          color: #4ade80;
        }

        .status.err {
          color: var(--danger);
        }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 11px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .pill .kind {
          font-weight: 600;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};

export default MobileUploadPage;
