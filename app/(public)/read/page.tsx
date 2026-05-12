"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";

const PDFBookReader = dynamic(() => import("@/components/PDFBookReader"), { ssr: false });

export default function ReadPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }
    if (file.size > 52_428_800) {
      setError("File must be under 50 MB.");
      return;
    }

    setError(null);
    setUploading(true);
    setFileName(file.name);

    const supabase = createClient();
    const path = `${crypto.randomUUID()}.pdf`;

    const { data, error: uploadError } = await supabase.storage
      .from("pdfs")
      .upload(path, file, { contentType: "application/pdf" });

    if (uploadError || !data) {
      // Fallback: read locally without uploading (works for anon users)
      const localUrl = URL.createObjectURL(file);
      setPdfUrl(localUrl);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("pdfs").getPublicUrl(data.path);
    setPdfUrl(publicUrl);
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function reset() {
    setPdfUrl(null);
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (pdfUrl) {
    return (
      <div className="relative">
        <button
          onClick={reset}
          className="fixed top-20 right-6 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full backdrop-blur transition-colors"
        >
          ✕ Close
        </button>
        <PDFBookReader pdfUrl={pdfUrl} title={fileName ?? undefined} />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 bg-[--color-surface]">
      <div className="max-w-lg w-full text-center mb-10">
        <h1 className="text-3xl font-bold text-[--color-text] mb-3" style={{ letterSpacing: "-0.02em" }}>
          Read any PDF as a book
        </h1>
        <p className="text-[--color-text-muted] text-sm">
          Upload a PDF and flip through it like a real book — drag page corners or use the arrow buttons.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className="max-w-lg w-full border-2 border-dashed border-[--color-rule] rounded-2xl p-12 flex flex-col items-center gap-5 cursor-pointer hover:border-[--color-accent] hover:bg-[--color-accent-light] transition-colors"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
      >
        <div className="w-14 h-14 rounded-full bg-[--color-accent-light] flex items-center justify-center">
          <svg className="w-6 h-6 text-[--color-accent]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>

        {uploading ? (
          <p className="text-sm text-[--color-text-muted]">Uploading <span className="font-medium text-[--color-text]">{fileName}</span>…</p>
        ) : (
          <>
            <div>
              <p className="font-semibold text-[--color-text] mb-1">Drop your PDF here</p>
              <p className="text-sm text-[--color-text-muted]">or click to browse — up to 50 MB</p>
            </div>
            <span className="px-5 py-2 bg-[--color-accent] text-white text-sm font-medium rounded-full hover:bg-[--color-accent-dark] transition-colors">
              Choose PDF
            </span>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
