"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";

interface Props {
  pdfUrl: string;
  title?: string;
}

export default function PDFBookReader({ pdfUrl, title }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [renderProgress, setRenderProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function renderPDF() {
      try {
        setLoading(true);
        setError(null);

        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdf = await pdfjs.getDocument({ url: pdfUrl }).promise;
        const numPages = pdf.numPages;
        const rendered: string[] = [];

        for (let i = 1; i <= numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.8 });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;

          rendered.push(canvas.toDataURL("image/jpeg", 0.92));
          setRenderProgress(Math.round((i / numPages) * 100));
        }

        if (!cancelled) {
          // Pad to even count for the book (HTMLFlipBook needs pairs)
          if (rendered.length % 2 !== 0) rendered.push("");
          setPages(rendered);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load PDF");
          setLoading(false);
        }
      }
    }

    renderPDF();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  const onFlip = useCallback((e: { data: number }) => setCurrentPage(e.data), []);
  const prev = () => bookRef.current?.pageFlip().turnToPage(Math.max(0, currentPage - 2));
  const next = () => bookRef.current?.pageFlip().turnToPage(Math.min(pages.length - 1, currentPage + 2));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#1a1520] gap-6">
        <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet rounded-full transition-all duration-300"
            style={{ width: `${renderProgress}%` }}
          />
        </div>
        <p className="text-white/40 text-sm font-medium">
          Rendering pages… {renderProgress}%
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#1a1520] gap-4">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#1a1520] py-10 px-4">
      {title && (
        <p className="text-white/30 text-xs uppercase tracking-widest mb-6 font-medium">{title}</p>
      )}

      <div style={{ filter: "drop-shadow(0 25px 60px rgba(0,0,0,0.7))" }}>
        <HTMLFlipBook
          ref={bookRef}
          width={420}
          height={560}
          size="fixed"
          minWidth={280}
          maxWidth={520}
          minHeight={380}
          maxHeight={680}
          drawShadow
          flippingTime={650}
          usePortrait={false}
          startPage={0}
          showCover={false}
          mobileScrollSupport
          onFlip={onFlip}
          className=""
          style={{}}
          startZIndex={1}
          autoSize={false}
          maxShadowOpacity={0.6}
          showPageCorners
          disableFlipByClick={false}
          clickEventForward
          useMouseEvents
          swipeDistance={30}
        >
          {pages.map((dataUrl, i) =>
            dataUrl ? (
              <div key={i} className="bg-white w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dataUrl}
                  alt={`Page ${i + 1}`}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
            ) : (
              <div key={i} className="bg-[#faf8f3] w-full h-full" />
            )
          )}
        </HTMLFlipBook>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mt-8">
        <button
          onClick={prev}
          disabled={currentPage === 0}
          className="px-5 py-2 bg-white/10 text-white text-sm rounded-full hover:bg-white/20 disabled:opacity-30 transition-colors"
        >
          ← Prev
        </button>
        <span className="text-white/40 text-xs tabular-nums">
          {currentPage + 1} – {Math.min(currentPage + 2, pages.length)} / {pages.length}
        </span>
        <button
          onClick={next}
          disabled={currentPage >= pages.length - 2}
          className="px-5 py-2 bg-white/10 text-white text-sm rounded-full hover:bg-white/20 disabled:opacity-30 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
