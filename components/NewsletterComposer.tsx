"use client";

import { useState } from "react";
import { buildEmailHtml } from "@/lib/email/template";

interface Article {
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  categories?: { name: string } | null;
  authors?: { display_name: string } | null;
}

interface Props {
  article: Article;
  subscriberCount: number;
}

export default function NewsletterComposer({ article, subscriberCount }: Props) {
  const [open, setOpen]               = useState(false);
  const [subject, setSubject]         = useState(
    `${article.categories?.name ? `[${article.categories.name}] ` : ""}${article.title} — InkPress`
  );
  const [customIntro, setCustomIntro] = useState("");
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");
  const [sending, setSending]         = useState(false);
  const [testing, setTesting]         = useState(false);
  const [result, setResult]           = useState<{ sent?: number; total?: number; error?: string; success?: boolean; sentTo?: string } | null>(null);
  const [testEmail, setTestEmail]     = useState("");

  const previewHtml = buildEmailHtml({
    siteUrl: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
    articleTitle: article.title,
    articleSlug: article.slug,
    articleExcerpt: article.excerpt ?? "",
    coverImageUrl: article.cover_image_url,
    authorName: article.authors?.display_name,
    categoryName: article.categories?.name,
    publishedAt: article.published_at,
    subscriberEmail: "preview@example.com",
    customIntro,
  });

  async function send() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleTitle: article.title,
          articleSlug: article.slug,
          articleExcerpt: article.excerpt,
          coverImageUrl: article.cover_image_url,
          authorName: article.authors?.display_name,
          categoryName: article.categories?.name,
          publishedAt: article.published_at,
          customSubject: subject,
          customIntro: customIntro || undefined,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Network error — check browser console" });
    } finally {
      setSending(false);
    }
  }

  async function sendTest() {
    if (!testEmail.trim()) return;
    setTesting(true);
    setResult(null);
    try {
      const res = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmail.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Network error" });
    } finally {
      setTesting(false);
    }
  }

  const labelCls = "block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1";
  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-violet transition-colors";

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">✉️</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">Send Newsletter</p>
            <p className="text-xs text-gray-500">
              {subscriberCount} active subscriber{subscriberCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="p-5 space-y-5 bg-white">
          {/* Edit / Preview toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden w-fit text-xs font-medium">
            {(["edit", "preview"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setPreviewMode(m)}
                className={`px-4 py-1.5 capitalize transition-colors ${
                  previewMode === m ? "bg-black text-white" : "text-gray-500 hover:text-black hover:bg-gray-50"
                }`}>
                {m === "edit" ? "✏ Compose" : "👁 Preview"}
              </button>
            ))}
          </div>

          {previewMode === "edit" ? (
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className={labelCls}>Subject line</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)}
                  className={inputCls} placeholder="Email subject…" />
              </div>

              {/* Custom intro */}
              <div>
                <label className={labelCls}>Custom intro message (optional)</label>
                <textarea value={customIntro} onChange={(e) => setCustomIntro(e.target.value)}
                  rows={3} className={inputCls}
                  placeholder="Add a personal note at the top of the email before the article content…" />
              </div>

              {/* Auto-filled fields */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Auto-filled from article</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider">Title</label>
                    <p className="text-sm font-medium text-gray-700 truncate">{article.title}</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider">Category</label>
                    <p className="text-sm text-gray-700">{article.categories?.name ?? "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider">Excerpt</label>
                    <p className="text-sm text-gray-700 line-clamp-2">{article.excerpt ?? "—"}</p>
                  </div>
                  {article.cover_image_url && (
                    <div className="col-span-2">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider">Cover image</label>
                      <img src={article.cover_image_url} alt="" className="mt-1 h-16 w-auto rounded object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Email preview */
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center">
                  <p className="text-xs text-gray-500 font-mono truncate">{subject}</p>
                </div>
              </div>
              <div className="overflow-auto" style={{ maxHeight: "500px" }}>
                <iframe
                  srcDoc={previewHtml}
                  title="Email preview"
                  className="w-full border-0"
                  style={{ height: "500px" }}
                />
              </div>
            </div>
          )}

          {/* Test email */}
          <div className="border border-dashed border-gray-200 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Test Gmail setup
            </p>
            <p className="text-xs text-gray-400">
              Send a test email to verify your Gmail credentials are working before sending to all subscribers.
            </p>
            <div className="flex gap-2">
              <input
                type="email" value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet transition-colors"
              />
              <button type="button" onClick={sendTest} disabled={testing || !testEmail.trim()}
                className="border border-gray-400 text-gray-600 text-sm font-medium px-4 py-2 rounded-lg hover:border-black hover:text-black transition-colors disabled:opacity-40">
                {testing ? "Sending…" : "Send test"}
              </button>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
              result.error ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
            }`}>
              {result.error
                ? <>❌ {result.error}</>
                : result.success
                  ? <>✓ Test email sent to <strong>{result.sentTo}</strong> — check your inbox</>
                  : <>✓ Sent to {result.sent} of {result.total} subscriber{result.total !== 1 ? "s" : ""}</>
              }
            </div>
          )}

          {/* Send button */}
          <div className="flex items-center gap-4">
            <button
              type="button" onClick={send}
              disabled={sending || subscriberCount === 0}
              className="border border-black text-black text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-40"
            >
              {sending ? "Sending…" : `Send to ${subscriberCount} subscriber${subscriberCount !== 1 ? "s" : ""}`}
            </button>
            {subscriberCount === 0 && (
              <p className="text-xs text-gray-400">No active subscribers yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
