"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";

const AdminEditor = dynamic(() => import("./AdminEditor"), { ssr: false });

interface Category { id: string; name: string; }
interface Tag      { id: string; name: string; }
interface Author   { id: string; display_name: string; role: string; }

interface ArticleData {
  id?: string;
  title?: string;
  title_mn?: string | null;
  slug?: string;
  excerpt?: string;
  excerpt_mn?: string | null;
  body?: object | null;
  body_mn?: object | null;
  cover_image_url?: string | null;
  pdf_url?: string | null;
  pdf_url_mn?: string | null;
  author_id?: string | null;
  category_id?: string | null;
  status?: "draft" | "published" | "archived";
  is_breaking?: boolean;
  is_featured?: boolean;
}

interface Props {
  article?: ArticleData;
  categories: Category[];
  tags: Tag[];
  authors?: Author[];
  selectedTagIds?: string[];
  selectedAuthorIds?: string[];
  authorId: string;
  lockAuthor?: boolean;
  redirectTo?: string;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function PdfUploadField({ url, fileName, uploading, onUpload, onRemove }: {
  url: string; fileName: string | null; uploading: boolean;
  onUpload: (f: File) => void; onRemove: () => void;
}) {
  if (url) {
    return (
      <div className="flex items-center gap-3 border border-[--color-accent] bg-[--color-accent-light] rounded-lg px-4 py-3">
        <svg className="w-5 h-5 text-[--color-accent] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm font-medium text-[--color-accent] flex-1 truncate">{fileName}</span>
        <button type="button" onClick={onRemove} className="text-xs text-[--color-accent] hover:underline shrink-0">Remove</button>
      </div>
    );
  }
  return (
    <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[--color-rule] rounded-xl p-8 cursor-pointer hover:border-[--color-accent] hover:bg-[--color-accent-light] transition-colors">
      {uploading
        ? <span className="text-sm text-[--color-text-muted]">Uploading PDF…</span>
        : <>
            <svg className="w-8 h-8 text-[--color-text-muted]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-[--color-text-muted]">Click to upload a PDF (max 50 MB)</span>
          </>
      }
      <input type="file" accept="application/pdf" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
    </label>
  );
}

export default function ArticleForm({ article, categories, tags, authors = [], selectedTagIds = [], selectedAuthorIds = [], authorId, lockAuthor = false, redirectTo = "/admin/articles" }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!article?.id;

  // Article type
  const [articleType, setArticleType] = useState<"normal" | "pdf">(article?.pdf_url ? "pdf" : "normal");

  // Language tab (for content fields)
  const [langTab, setLangTab] = useState<"en" | "mn">("en");

  // Meta fields (language-independent)
  const [slug,        setSlug]       = useState(article?.slug            ?? "");
  const [categoryId,  setCategoryId] = useState(article?.category_id     ?? "");
  const [status,      setStatus]     = useState<"draft"|"published"|"archived">(article?.status ?? "draft");
  const [isBreaking,  setIsBreaking] = useState(article?.is_breaking     ?? false);
  const [isFeatured,  setIsFeatured] = useState(article?.is_featured     ?? false);
  const [pickedTagIds,    setPickedTagIds]    = useState<string[]>(selectedTagIds);
  const [pickedAuthorIds, setPickedAuthorIds] = useState<string[]>(
    selectedAuthorIds.length > 0 ? selectedAuthorIds : (article?.author_id ? [article.author_id] : [authorId])
  );
  const [coverUrl,      setCoverUrl]      = useState(article?.cover_image_url ?? "");
  const [pdfUrl,        setPdfUrl]        = useState(article?.pdf_url         ?? "");
  const [pdfUrlMn,      setPdfUrlMn]      = useState(article?.pdf_url_mn      ?? "");
  const [coverUploading, setCoverUploading] = useState(false);
  const [pdfUploading,   setPdfUploading]   = useState(false);
  const [pdfUploadingMn, setPdfUploadingMn] = useState(false);
  const [pdfFileName,    setPdfFileName]    = useState<string | null>(
    article?.pdf_url ? article.pdf_url.split("/").pop() ?? null : null
  );
  const [pdfFileNameMn, setPdfFileNameMn] = useState<string | null>(
    article?.pdf_url_mn ? article.pdf_url_mn.split("/").pop() ?? null : null
  );
  const [error, setError] = useState<string | null>(null);

  // English content
  const [titleEn,   setTitleEn]   = useState(article?.title   ?? "");
  const [excerptEn, setExcerptEn] = useState(article?.excerpt ?? "");
  const [bodyEn,    setBodyEn]    = useState<object>(article?.body    ?? { type: "html", html: "" });

  // Mongolian content
  const [titleMn,   setTitleMn]   = useState(article?.title_mn   ?? "");
  const [excerptMn, setExcerptMn] = useState(article?.excerpt_mn ?? "");
  const [bodyMn,    setBodyMn]    = useState<object>(article?.body_mn   ?? { type: "html", html: "" });

  function handleTitleEnChange(v: string) {
    setTitleEn(v);
    if (!isEditing) setSlug(slugify(v));
  }

  function switchType(t: "normal" | "pdf") {
    setArticleType(t);
    if (t === "normal") { setPdfUrl(""); setPdfFileName(null); }
  }

  function toggleTag(id: string) {
    setPickedTagIds((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  }

  function toggleAuthor(id: string) {
    if (lockAuthor) return;
    setPickedAuthorIds((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
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

  async function uploadPDFMn(file: File) {
    if (file.type !== "application/pdf") { setError("Please select a PDF file."); return; }
    const supabase = createClient();
    const path = `articles/${crypto.randomUUID()}.pdf`;
    setPdfUploadingMn(true);
    setPdfFileNameMn(file.name);
    const { data, error } = await supabase.storage.from("pdfs").upload(path, file, { contentType: "application/pdf" });
    setPdfUploadingMn(false);
    if (error || !data) { setError(error?.message ?? "PDF upload failed"); return; }
    const { data: { publicUrl } } = supabase.storage.from("pdfs").getPublicUrl(data.path);
    setPdfUrlMn(publicUrl);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = createClient() as any;
      const payload = {
        title:      titleEn,
        title_mn:   titleMn   || null,
        slug,
        excerpt:    excerptEn || null,
        excerpt_mn: excerptMn || null,
        body:       articleType === "pdf" ? null : bodyEn,
        body_mn:    articleType === "pdf" ? null : (bodyMn || null),
        cover_image_url: coverUrl || null,
        pdf_url:    pdfUrl || null,
        pdf_url_mn: pdfUrlMn || null,
        category_id: categoryId || null,
        status,
        is_breaking: isBreaking,
        is_featured: isFeatured,
        author_id: selectedAuthorId || authorId,
      };

      let articleId = article?.id;

      if (isEditing && articleId) {
        const { error } = await db.from("articles").update(payload).eq("id", articleId);
        if (error) { setError(error.message); return; }
      } else {
        const { data, error } = await db.from("articles").insert(payload).select("id").single();
        if (error || !data) { setError(error?.message ?? "Insert failed"); return; }
        articleId = (data as { id: string }).id;
      }

      if (articleId) {
        // Sync tags
        await db.from("article_tags").delete().eq("article_id", articleId);
        if (pickedTagIds.length > 0) {
          await db.from("article_tags").insert(
            pickedTagIds.map((tag_id) => ({ article_id: articleId!, tag_id }))
          );
        }
        // Sync authors — wrapped in try/catch in case table doesn't exist yet
        try {
          const authorsToSave = lockAuthor ? [authorId] : pickedAuthorIds;
          await db.from("article_authors").delete().eq("article_id", articleId);
          if (authorsToSave.length > 0) {
            await db.from("article_authors").insert(
              authorsToSave.map((author_id) => ({ article_id: articleId!, author_id }))
            );
          }
        } catch {
          // table may not exist yet — non-fatal
        }
      }

      router.push(redirectTo);
      router.refresh();
    });
  }

  const fieldClass = "w-full border border-[--color-rule] bg-white px-3 py-2 text-sm text-[--color-text] rounded-lg focus:outline-none focus:border-[--color-accent] transition-colors appearance-none";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {/* Article type */}
      <div>
        <label className={labelClass}>Article Type</label>
        <div className="flex gap-3 mt-1">
          {(["normal", "pdf"] as const).map((t) => (
            <button key={t} type="button" onClick={() => switchType(t)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-colors ${
                articleType === t
                  ? "border-[--color-accent] bg-[--color-accent-light] text-[--color-accent]"
                  : "border-[--color-rule] text-[--color-text-muted] hover:border-[--color-accent] hover:text-[--color-accent]"
              }`}>
              {t === "normal" ? (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6M5 8h14M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" /></svg>Normal Article</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>PDF Book</>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Meta: slug + category */}
      <div className="grid grid-cols-2 gap-4">
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

      {/* Author multi-select */}
      {authors.length > 0 && (
        <div>
          <label className={labelClass}>
            Authors / Зохиогчид
            {!lockAuthor && <span className="normal-case font-normal text-[--color-text-muted] ml-1">(click to toggle)</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {authors.map((author) => {
              const selected = pickedAuthorIds.includes(author.id);
              return (
                <button key={author.id} type="button"
                  onClick={() => toggleAuthor(author.id)}
                  disabled={lockAuthor}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
                  style={selected
                    ? { backgroundColor: "#5B3ADB", color: "#fff", borderColor: "#5B3ADB" }
                    : { backgroundColor: "#fff", color: "#000", borderColor: "#000" }
                  }>
                  {selected ? "✓ " : ""}{author.display_name}
                </button>
              );
            })}
          </div>
          {pickedAuthorIds.length === 0 && (
            <p className="text-xs text-red-500 mt-1">Select at least one author.</p>
          )}
        </div>
      )}

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

      {/* ── Language-specific content ───────────────────────────── */}
      <div className="border border-[--color-rule] rounded-xl overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-[--color-rule] bg-gray-50">
          {([["en", "🇬🇧 English"], ["mn", "🇲🇳 Монгол"]] as const).map(([lang, label]) => (
            <button key={lang} type="button" onClick={() => setLangTab(lang)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                langTab === lang
                  ? "bg-white text-[--color-accent] border-b-2 border-[--color-accent]"
                  : "text-[--color-text-muted] hover:text-[--color-text]"
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {/* English — always mounted, hidden when MN tab active */}
          <div style={{ display: langTab === "en" ? "flex" : "none" }} className="flex-col gap-4">
            <div>
              <label className={labelClass}>Title (English) *</label>
              <input type="text" value={titleEn}
                onChange={(e) => handleTitleEnChange(e.target.value)}
                className={fieldClass} placeholder="Article headline in English" />
            </div>
            <div>
              <label className={labelClass}>Excerpt (English)</label>
              <textarea value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)}
                rows={3} className={fieldClass} placeholder="Short summary shown on article cards" />
            </div>
            {articleType === "normal" && (
              <>
                <div>
                  <label className={labelClass}>Body (English)</label>
                  <AdminEditor content={bodyEn as { type: string; html?: string }} onChange={setBodyEn} />
                </div>
                <div>
                  <label className={labelClass}>PDF Attachment — English <span className="normal-case font-normal text-[--color-text-muted]">(optional)</span></label>
                  <PdfUploadField
                    url={pdfUrl} fileName={pdfFileName} uploading={pdfUploading}
                    onUpload={uploadPDF} onRemove={() => { setPdfUrl(""); setPdfFileName(null); }}
                  />
                </div>
              </>
            )}
            {articleType === "pdf" && (
              <div>
                <label className={labelClass}>PDF File — English *</label>
                <PdfUploadField
                  url={pdfUrl} fileName={pdfFileName} uploading={pdfUploading}
                  onUpload={uploadPDF} onRemove={() => { setPdfUrl(""); setPdfFileName(null); }}
                />
              </div>
            )}
          </div>

          {/* Mongolian — always mounted, hidden when EN tab active */}
          <div style={{ display: langTab === "mn" ? "flex" : "none" }} className="flex-col gap-4">
            <div>
              <label className={labelClass}>Гарчиг (Монгол)</label>
              <input type="text" value={titleMn}
                onChange={(e) => setTitleMn(e.target.value)}
                className={fieldClass} placeholder="Мэдээний гарчиг монгол хэлээр" />
            </div>
            <div>
              <label className={labelClass}>Товч агуулга (Монгол)</label>
              <textarea value={excerptMn} onChange={(e) => setExcerptMn(e.target.value)}
                rows={3} className={fieldClass} placeholder="Мэдээний товч тайлбар монгол хэлээр" />
            </div>
            {articleType === "normal" && (
              <>
                <div>
                  <label className={labelClass}>Агуулга (Монгол)</label>
                  <AdminEditor content={bodyMn as { type: string; html?: string }} onChange={setBodyMn} />
                </div>
                <div>
                  <label className={labelClass}>PDF хавсралт — Монгол <span className="normal-case font-normal text-[--color-text-muted]">(заавал биш)</span></label>
                  <PdfUploadField
                    url={pdfUrlMn} fileName={pdfFileNameMn} uploading={pdfUploadingMn}
                    onUpload={uploadPDFMn} onRemove={() => { setPdfUrlMn(""); setPdfFileNameMn(null); }}
                  />
                </div>
              </>
            )}
            {articleType === "pdf" && (
              <div>
                <label className={labelClass}>PDF файл — Монгол</label>
                <PdfUploadField
                  url={pdfUrlMn} fileName={pdfFileNameMn} uploading={pdfUploadingMn}
                  onUpload={uploadPDFMn} onRemove={() => { setPdfUrlMn(""); setPdfFileNameMn(null); }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <label className={labelClass}>Tags <span className="normal-case font-normal text-[--color-text-muted]">(click to toggle)</span></label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const selected = pickedTagIds.includes(tag.id);
              return (
                <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer"
                  style={selected
                    ? { backgroundColor: "#5B3ADB", color: "#fff", borderColor: "#5B3ADB" }
                    : { backgroundColor: "#fff", color: "#000", borderColor: "#000" }
                  }>
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
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 accent-[--color-accent]" />
          <span className="text-sm font-medium text-[--color-text]">Featured</span>
        </label>
        <label className="flex items-center gap-2 pb-2 cursor-pointer">
          <input type="checkbox" checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)} className="w-4 h-4 accent-[--color-accent]" />
          <span className="text-sm font-medium text-[--color-text]">Breaking</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isPending}
          className="border border-black text-black text-sm font-medium px-8 py-2.5 rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-40">
          {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Article"}
        </button>
        <button type="button" onClick={() => router.push(redirectTo)}
          className="border border-[--color-rule] text-sm font-medium px-6 py-2.5 rounded-lg text-[--color-text-muted] hover:border-[--color-accent] hover:text-[--color-accent] transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
