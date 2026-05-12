"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";

const AdminEditor = dynamic(() => import("./AdminEditor"), { ssr: false });

interface Category { id: string; name: string; }
interface Tag      { id: string; name: string; }

interface ArticleData {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: object | null;
  cover_image_url?: string | null;
  pdf_url?: string | null;
  category_id?: string | null;
  status?: "draft" | "published" | "archived";
  is_breaking?: boolean;
  is_featured?: boolean;
}

interface Props {
  article?: ArticleData;
  categories: Category[];
  tags: Tag[];
  selectedTagIds?: string[];
  authorId: string;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ArticleForm({ article, categories, tags, selectedTagIds = [], authorId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!article?.id;

  const [title,          setTitle]         = useState(article?.title           ?? "");
  const [slug,           setSlug]          = useState(article?.slug            ?? "");
  const [excerpt,        setExcerpt]       = useState(article?.excerpt         ?? "");
  const [body,           setBody]          = useState<object>(article?.body    ?? { type: "html", html: "" });
  const [coverUrl,       setCoverUrl]      = useState(article?.cover_image_url ?? "");
  const [pdfUrl,         setPdfUrl]        = useState(article?.pdf_url         ?? "");
  const [categoryId,     setCategoryId]    = useState(article?.category_id     ?? "");
  const [status,         setStatus]        = useState<"draft"|"published"|"archived">(article?.status ?? "draft");
  const [isBreaking,     setIsBreaking]    = useState(article?.is_breaking     ?? false);
  const [isFeatured,     setIsFeatured]    = useState(article?.is_featured     ?? false);
  const [pickedTagIds,   setPickedTagIds]  = useState<string[]>(selectedTagIds);
  const [error,          setError]         = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [pdfUploading,   setPdfUploading]  = useState(false);
  const [pdfFileName,    setPdfFileName]   = useState<string | null>(
    article?.pdf_url ? article.pdf_url.split("/").pop() ?? null : null
  );

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!isEditing) setSlug(slugify(v));
  }

  function toggleTag(id: string) {
    setPickedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function uploadCover(file: File) {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `covers/${crypto.randomUUID()}.${ext}`;
    setCoverUploading(true);
    const { data, error } = await supabase.storage.from("article-images").upload(path, file, { contentType: file.type });
    setCoverUploading(false);
    if (error || !data) return;
    const { data: { publicUrl } } = supabase.storage.from("article-images").getPublicUrl(data.path);
    setCoverUrl(publicUrl);
  }

  async function uploadPDF(file: File) {
    if (file.type !== "application/pdf") { setError("Please select a PDF file."); return; }
    const supabase = createClient();
    const path = `articles/${crypto.randomUUID()}.pdf`;
    setPdfUploading(true);
    setPdfFileName(file.name);
    const { data, error } = await supabase.storage.from("pdfs").upload(path, file, { contentType: "application/pdf" });
    setPdfUploading(false);
    if (error || !data) { setError(error?.message ?? "PDF upload failed"); return; }
    const { data: { publicUrl } } = supabase.storage.from("pdfs").getPublicUrl(data.path);
    setPdfUrl(publicUrl);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const supabase = createClient();
      const payload = {
        title,
        slug,
        excerpt: excerpt || null,
        body: pdfUrl ? null : body,
        cover_image_url: coverUrl || null,
        pdf_url: pdfUrl || null,
        category_id: categoryId || null,
        status,
        is_breaking: isBreaking,
        is_featured: isFeatured,
        author_id: authorId,
      };

      let articleId = article?.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;

      if (isEditing && articleId) {
        const { error } = await db.from("articles").update(payload).eq("id", articleId);
        if (error) { setError(error.message); return; }
      } else {
        const { data, error } = await db.from("articles").insert(payload).select("id").single();
        if (error || !data) { setError(error?.message ?? "Insert failed"); return; }
        articleId = (data as { id: string }).id;
      }

      if (articleId) {
        await db.from("article_tags").delete().eq("article_id", articleId);
        if (pickedTagIds.length > 0) {
          await db.from("article_tags").insert(
            pickedTagIds.map((tag_id) => ({ article_id: articleId!, tag_id }))
          );
        }
      }

      router.push("/admin/articles");
      router.refresh();
    });
  }

  const fieldClass = "w-full border border-[--color-rule] bg-white px-3 py-2 text-sm text-[--color-text] rounded-lg focus:outline-none focus:border-[--color-accent] transition-colors appearance-none";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Title + Slug + Category */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Title *</label>
          <input type="text" required value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={fieldClass} placeholder="Article headline" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className={labelClass}>Slug *</label>
          <input type="text" required value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className={fieldClass} placeholder="url-friendly-slug" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className={labelClass}>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={fieldClass}>
            <option value="">— None —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className={labelClass}>Excerpt</label>
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
          rows={3} className={fieldClass}
          placeholder="Short summary shown on article cards" />
      </div>

      {/* Cover image */}
      <div>
        <label className={labelClass}>Cover Image</label>
        <div className="flex gap-3 items-start">
          <input type="text" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)}
            className={`${fieldClass} flex-1`} placeholder="https://… or upload" />
          <label className="shrink-0 border border-[--color-rule] rounded-lg px-4 py-2 text-xs font-medium cursor-pointer hover:border-[--color-accent] transition-colors">
            {coverUploading ? "Uploading…" : "Upload"}
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }} />
          </label>
        </div>
        {coverUrl && (
          <img src={coverUrl} alt="Cover" className="mt-3 h-28 w-auto object-cover rounded-lg border border-[--color-rule]" />
        )}
      </div>

      {/* ── PDF upload ─────────────────────────────────────────── */}
      <div>
        <label className={labelClass}>PDF Content</label>
        <p className="text-xs text-[--color-text-muted] mb-3">
          Upload a PDF — readers will flip through it as a book. Replaces the rich text body.
        </p>

        {pdfUrl ? (
          <div className="flex items-center gap-3 border border-[--color-accent] bg-[--color-accent-light] rounded-lg px-4 py-3">
            <svg className="w-5 h-5 text-[--color-accent] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-[--color-accent] flex-1 truncate">{pdfFileName}</span>
            <button type="button" onClick={() => { setPdfUrl(""); setPdfFileName(null); }}
              className="text-xs text-[--color-accent] hover:underline shrink-0">
              Remove
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[--color-rule] rounded-xl p-8 cursor-pointer hover:border-[--color-accent] hover:bg-[--color-accent-light] transition-colors">
            {pdfUploading ? (
              <span className="text-sm text-[--color-text-muted]">Uploading PDF…</span>
            ) : (
              <>
                <svg className="w-8 h-8 text-[--color-text-muted]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-[--color-text-muted]">Click to upload a PDF (max 50 MB)</span>
              </>
            )}
            <input type="file" accept="application/pdf" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPDF(f); }} />
          </label>
        )}
      </div>

      {/* Rich text body — only shown when no PDF */}
      {!pdfUrl && (
        <div>
          <label className={labelClass}>Body (rich text)</label>
          <AdminEditor content={body as { type: string; html?: string }} onChange={setBody} />
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <label className={labelClass}>Tags <span className="normal-case font-normal text-[--color-text-muted]">(click to toggle)</span></label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const selected = pickedTagIds.includes(tag.id);
              return (
                <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    selected
                      ? "bg-[--color-accent] text-white border-[--color-accent]"
                      : "bg-white text-black border-black hover:bg-black hover:text-white"
                  }`}>
                  {selected ? "✓ " : ""}{tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Status + flags */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className={labelClass}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={fieldClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <label className="flex items-center gap-2 pb-2 cursor-pointer">
          <input type="checkbox" id="is_featured" checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-[--color-accent]" />
          <span className="text-sm font-medium text-[--color-text]">Featured</span>
        </label>
        <label className="flex items-center gap-2 pb-2 cursor-pointer">
          <input type="checkbox" id="is_breaking" checked={isBreaking}
            onChange={(e) => setIsBreaking(e.target.checked)} className="w-4 h-4 accent-[--color-accent]" />
          <span className="text-sm font-medium text-[--color-text]">Breaking</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending}
          className="border border-black text-black text-sm font-medium px-8 py-2.5 rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-40">
          {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Article"}
        </button>
        <button type="button" onClick={() => router.push("/admin/articles")}
          className="border border-[--color-rule] text-sm font-medium px-6 py-2.5 rounded-lg text-[--color-text-muted] hover:border-[--color-accent] hover:text-[--color-accent] transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
