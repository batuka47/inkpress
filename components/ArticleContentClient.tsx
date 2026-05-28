"use client";

import { useLanguage } from "./LanguageProvider";
import ArticleBody from "./ArticleBody";
import AuthorCard from "./AuthorCard";
import CategoryBadge from "./CategoryBadge";
import type { Json } from "@/types/database";

interface Author { id: string; display_name: string; bio: string | null; avatar_url: string | null; role: "editor" | "journalist" | "contributor"; }
interface Category { name: string; name_mn?: string | null; }

interface Props {
  title: string;
  title_mn: string | null;
  excerpt: string | null;
  excerpt_mn: string | null;
  body: Json | null;
  body_mn: Json | null;
  cover_image_url: string | null;
  published_at: string | null;
  reading_time_minutes: number | null;
  authors: Author | null;
  categories: Category | null;
}

export default function ArticleContentClient({
  title, title_mn, excerpt, excerpt_mn, body, body_mn,
  cover_image_url, published_at, reading_time_minutes,
  authors, categories,
}: Props) {
  const { locale } = useLanguage();

  const displayTitle   = (locale === "mn" && title_mn)   ? title_mn   : title;
  const displayExcerpt = (locale === "mn" && excerpt_mn) ? excerpt_mn : excerpt;
  const displayBody    = (locale === "mn" && body_mn)    ? body_mn    : body;
  const displayCat     = (locale === "mn" && categories?.name_mn) ? categories.name_mn : categories?.name ?? null;

  const publishedAt = published_at
    ? new Date(published_at).toLocaleDateString(locale === "mn" ? "mn-MN" : "en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : null;

  return (
    <div className="bg-white min-h-screen">
      {cover_image_url && (
        <div className="w-full max-h-120 overflow-hidden">
          <img src={cover_image_url} alt={displayTitle} className="w-full h-full object-cover max-h-120" />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-5 text-xs text-[--color-text-muted]">
          {displayCat && <CategoryBadge name={displayCat} />}
          {reading_time_minutes && (
            <span>{reading_time_minutes} {locale === "mn" ? "мин" : "min read"}</span>
          )}
        </div>

        <h1 className="font-black text-[--color-ink] leading-tight mb-5"
          style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.03em" }}>
          {displayTitle}
        </h1>

        {displayExcerpt && (
          <p className="text-xl text-[--color-text-muted] leading-relaxed mb-8 border-l-4 border-[--color-accent] pl-4">
            {displayExcerpt}
          </p>
        )}

        <div className="flex items-center justify-between border-y border-[--color-rule] py-4 mb-10">
          {authors && <AuthorCard author={authors} />}
          {publishedAt && <time className="text-xs text-[--color-text-muted]" suppressHydrationWarning>{publishedAt}</time>}
        </div>

        <ArticleBody body={displayBody} />
      </article>
    </div>
  );
}
