"use client";

import { useRef, useState, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import type { Json } from "@/types/database";

/* ─── Types ─────────────────────────────────────────────── */

interface Props {
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  body: Json | null;
  authorName?: string;
  publishedAt?: string | null;
  category?: string | null;
}

type TipTapNode = {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string }[];
  attrs?: Record<string, string | number | null>;
};

/* ─── Content extraction ─────────────────────────────────── */

function extractBlocks(doc: Json): TipTapNode[] {
  const root = doc as { type: string; content?: TipTapNode[] };
  if (root.type !== "doc" || !root.content) return [];
  return root.content;
}

function splitIntoPages(blocks: TipTapNode[], wordsPerPage = 200): TipTapNode[][] {
  const pages: TipTapNode[][] = [];
  let current: TipTapNode[] = [];
  let wordCount = 0;

  for (const block of blocks) {
    const text = JSON.stringify(block).replace(/"text":"/g, " ").replace(/[^a-zA-Z\s]/g, " ");
    const words = text.split(/\s+/).filter(Boolean).length;

    current.push(block);
    wordCount += words;

    if (wordCount >= wordsPerPage) {
      pages.push(current);
      current = [];
      wordCount = 0;
    }
  }
  if (current.length > 0) pages.push(current);
  return pages;
}

/* ─── Node renderer ──────────────────────────────────────── */

function renderNode(node: TipTapNode, i: number): React.ReactNode {
  switch (node.type) {
    case "paragraph":
      return <p key={i} className="mb-3 leading-relaxed text-[13px] text-[#2a2a2a]">{node.content?.map(renderNode)}</p>;
    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const Tag = `h${level}` as "h2" | "h3";
      return <Tag key={i} className="font-bold mt-4 mb-2 text-[15px] text-[#111]">{node.content?.map(renderNode)}</Tag>;
    }
    case "blockquote":
      return <blockquote key={i} className="border-l-2 border-[#5B3ADB] pl-3 my-3 italic text-[12px] text-[#555]">{node.content?.map(renderNode)}</blockquote>;
    case "bulletList":
      return <ul key={i} className="list-disc pl-4 mb-3 space-y-1">{node.content?.map(renderNode)}</ul>;
    case "orderedList":
      return <ol key={i} className="list-decimal pl-4 mb-3 space-y-1">{node.content?.map(renderNode)}</ol>;
    case "listItem":
      return <li key={i} className="text-[13px] text-[#2a2a2a]">{node.content?.map(renderNode)}</li>;
    case "horizontalRule":
      return <hr key={i} className="my-4 border-[#d0ccc0]" />;
    case "text": {
      let content: React.ReactNode = node.text ?? "";
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === "bold")   content = <strong key={i}>{content}</strong>;
          if (mark.type === "italic") content = <em key={i}>{content}</em>;
        }
      }
      return content;
    }
    default: return null;
  }
}

/* ─── Page components ────────────────────────────────────── */

const pageStyle = "bg-[#faf8f3] w-full h-full flex flex-col overflow-hidden relative select-none";
const pageInner = "flex-1 overflow-hidden px-8 py-6";

function CoverPage({ title, excerpt, coverImageUrl, category }: {
  title: string; excerpt: string | null; coverImageUrl: string | null; category?: string | null;
}) {
  return (
    <div className={`${pageStyle} bg-[#111827]`}>
      {coverImageUrl && (
        <div className="absolute inset-0">
          <img src={coverImageUrl} alt="" className="w-full h-full object-cover opacity-30" />
        </div>
      )}
      <div className="relative z-10 flex flex-col h-full px-10 py-12 justify-end">
        {category && (
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9B83F4] mb-4">
            {category}
          </span>
        )}
        <h1 className="text-white font-bold leading-tight mb-4" style={{ fontSize: "clamp(1.2rem, 3vw, 1.8rem)" }}>
          {title}
        </h1>
        {excerpt && (
          <p className="text-gray-300 text-[13px] leading-relaxed line-clamp-3">{excerpt}</p>
        )}
        <div className="mt-8 border-t border-white/20 pt-4">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#5B3ADB] uppercase">AmjiltPressAgency</span>
        </div>
      </div>
    </div>
  );
}

function ContentPage({ blocks, pageNum, total }: {
  blocks: TipTapNode[]; pageNum: number; total: number;
}) {
  return (
    <div className={pageStyle}>
      <div className={pageInner}>
        <div className="border-b border-[#d0ccc0] pb-1 mb-4 flex justify-between items-center">
          <span className="text-[10px] uppercase tracking-widest text-[#999] font-medium">AmjiltPressAgency</span>
          <div className="h-px flex-1 mx-3 bg-[#d0ccc0]" />
        </div>
        <div className="columns-1">
          {blocks.map((node, i) => renderNode(node, i))}
        </div>
      </div>
      <div className="px-8 py-3 border-t border-[#d0ccc0] flex justify-between items-center">
        <div className="h-px flex-1 bg-[#d0ccc0] mr-3" />
        <span className="text-[10px] text-[#aaa] tabular-nums">{pageNum} / {total}</span>
      </div>
    </div>
  );
}

function BlankPage() {
  return (
    <div className={pageStyle}>
      <div className="flex-1 flex items-center justify-center">
        <span className="text-[10px] uppercase tracking-widest text-[#ccc]">AmjiltPressAgency</span>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */

export default function BookReader({ title, excerpt, coverImageUrl, body, authorName, publishedAt, category }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const blocks = body ? extractBlocks(body) : [];
  const contentPages = splitIntoPages(blocks, 180);

  // Build a flat array of page elements — react-pageflip requires every child
  // to be a real React element (no false, no arrays)
  const pages: React.ReactElement[] = [
    // 0 — front cover
    <div key="cover">
      <CoverPage title={title} excerpt={excerpt} coverImageUrl={coverImageUrl} category={category} />
    </div>,
    // 1 — inside blank
    <div key="blank-front"><BlankPage /></div>,
    // 2…n — content
    ...contentPages.map((pageBlocks, i) => (
      <div key={`content-${i}`}>
        <ContentPage blocks={pageBlocks} pageNum={i + 1} total={contentPages.length} />
      </div>
    )),
  ];

  // Ensure total page count is even (HTMLFlipBook needs pairs)
  if (pages.length % 2 !== 0) {
    pages.push(<div key="blank-mid"><BlankPage /></div>);
  }

  // Back cover always last
  pages.push(
    <div key="back-cover">
      <div className={`${pageStyle} bg-[#111827]`}>
        <div className="flex flex-col h-full items-center justify-center gap-3">
          <span className="text-xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
            AmjiltPressAgency
          </span>
          <p className="text-xs text-gray-500">News as it should be read.</p>
        </div>
      </div>
    </div>
  );

  const totalPages = pages.length;
  const onFlip = useCallback((e: { data: number }) => setCurrentPage(e.data), []);
  const prev = () => bookRef.current?.pageFlip().turnToPage(Math.max(0, currentPage - 2));
  const next = () => bookRef.current?.pageFlip().turnToPage(Math.min(totalPages - 1, currentPage + 2));

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#1a1520] py-10 px-4">
      <div className="relative" style={{ filter: "drop-shadow(0 25px 60px rgba(0,0,0,0.6))" }}>
        <HTMLFlipBook
          ref={bookRef}
          width={420}
          height={560}
          size="fixed"
          minWidth={280}
          maxWidth={500}
          minHeight={380}
          maxHeight={650}
          drawShadow
          flippingTime={700}
          usePortrait={false}
          startPage={0}
          showCover
          mobileScrollSupport
          onFlip={onFlip}
          className="book-root"
          style={{}}
          startZIndex={1}
          autoSize={false}
          maxShadowOpacity={0.5}
          showPageCorners
          disableFlipByClick={false}
          clickEventForward
          useMouseEvents
          swipeDistance={30}
        >
          {pages}
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
          {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={next}
          disabled={currentPage >= totalPages - 2}
          className="px-5 py-2 bg-white/10 text-white text-sm rounded-full hover:bg-white/20 disabled:opacity-30 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Metadata */}
      {(authorName || publishedAt) && (
        <div className="mt-4 text-white/30 text-xs flex gap-4">
          {authorName && <span>{authorName}</span>}
          {publishedAt && <span>{new Date(publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>}
        </div>
      )}
    </div>
  );
}
