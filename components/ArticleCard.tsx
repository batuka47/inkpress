"use client";

import Link from "next/link";
import Image from "next/image";
import CategoryBadge from "./CategoryBadge";
import { useLanguage } from "./LanguageProvider";
import type { Database } from "@/types/database";

type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"] | null;
  authors: Database["public"]["Tables"]["authors"]["Row"] | null;
};

type Size = "hero" | "standard" | "compact";
type Layout = "card" | "row";

interface Props {
  article: Article;
  size?: Size;
  layout?: Layout;
}

export default function ArticleCard({ article, size = "standard", layout = "card" }: Props) {
  const { locale } = useLanguage();
  const href = `/article/${article.slug}`;

  const title   = (locale === "mn" && article.title_mn)   ? article.title_mn   : article.title;
  const excerpt = (locale === "mn" && article.excerpt_mn) ? article.excerpt_mn : article.excerpt;
  const catName = (locale === "mn" && article.categories?.name_mn)
    ? article.categories.name_mn
    : article.categories?.name ?? null;

  const publishedAt = article.published_at
    ? new Date(article.published_at).toLocaleDateString(locale === "mn" ? "mn-MN" : "en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  if (layout === "row") {
    return (
      <article className="py-5 flex gap-5 items-start">
        {article.cover_image_url && (
          <div className="article-image-wrap shrink-0 w-24 h-16 relative rounded-lg overflow-hidden">
            <Image src={article.cover_image_url} alt={title} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {catName && <CategoryBadge name={catName} className="mb-2" />}
          <h2 className="font-semibold text-sm leading-snug text-[--color-text]">
            <Link href={href} className="headline-link hover:text-[--color-accent]">{title}</Link>
          </h2>
          {publishedAt && (
            <time className="text-xs text-[--color-text-muted] mt-1 block" suppressHydrationWarning>{publishedAt}</time>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className={`card ink-reveal flex flex-col ${size === "hero" ? "md:flex-row" : ""}`}>
      {article.cover_image_url && (
        <div
          className={`article-image-wrap relative w-full ${size === "hero" ? "md:w-1/2 md:shrink-0" : ""}`}
          style={{ aspectRatio: "16/9" }}
        >
          <Image
            src={article.cover_image_url}
            alt={title}
            fill
            className="object-cover"
            sizes={size === "hero" ? "50vw" : "33vw"}
          />
        </div>
      )}

      <div className={`flex flex-col flex-1 p-5 ${size === "hero" ? "md:p-8 justify-center" : ""}`}>
        {catName && (
          <CategoryBadge name={catName} className="mb-3 self-start" />
        )}

        <h2
          className="font-bold leading-snug text-[--color-text] mb-2"
          style={{ fontSize: size === "hero" ? "clamp(1.4rem, 2.5vw, 2rem)" : size === "standard" ? "1.05rem" : "0.95rem" }}
        >
          <Link href={href} className="headline-link hover:text-[--color-accent]">
            {title}
          </Link>
        </h2>

        {excerpt && size !== "compact" && (
          <p className="text-sm text-[--color-text-muted] line-clamp-2 leading-relaxed mb-4">
            {excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-[--color-text-muted] mt-auto pt-3 border-t border-[--color-rule]">
          {article.authors && <span className="font-medium">{article.authors.display_name}</span>}
          {publishedAt && <time dateTime={article.published_at ?? ""} suppressHydrationWarning>{publishedAt}</time>}
          {article.reading_time_minutes && (
            <span>{article.reading_time_minutes} {locale === "mn" ? "мин" : "min read"}</span>
          )}
        </div>
      </div>
    </article>
  );
}
