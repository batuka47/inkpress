import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/supabase/queries";
import BookReaderClient from "@/components/BookReaderClient";
import PDFBookReaderClient from "@/components/PDFBookReaderClient";
import ArticleBody from "@/components/ArticleBody";
import AuthorCard from "@/components/AuthorCard";
import CategoryBadge from "@/components/CategoryBadge";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: article } = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.cover_image_url ? [article.cover_image_url] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const { data: article } = await getArticleBySlug(slug);

  if (!article) notFound();

  // PDF article — flip through it as a book
  if ((article as typeof article & { pdf_url?: string | null }).pdf_url) {
    return (
      <PDFBookReaderClient
        pdfUrl={(article as typeof article & { pdf_url: string }).pdf_url}
        title={article.title}
      />
    );
  }

  // Rich-text article — TipTap book reader
  if (article.body) {
    return (
      <BookReaderClient
        title={article.title}
        excerpt={article.excerpt ?? null}
        coverImageUrl={article.cover_image_url ?? null}
        body={article.body}
        authorName={article.authors?.display_name}
        publishedAt={article.published_at}
        category={article.categories?.name}
      />
    );
  }

  // Fallback — plain article layout
  const publishedAt = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : null;

  return (
    <article className="max-w-180 mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-6 text-xs text-[--color-text-muted]">
        {article.categories && <CategoryBadge name={article.categories.name} />}
        {article.reading_time_minutes && <span>{article.reading_time_minutes} min read</span>}
      </div>
      <h1 className="font-bold leading-tight mb-6" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.02em" }}>
        {article.title}
      </h1>
      {article.excerpt && (
        <p className="text-lg text-[--color-text-muted] italic mb-8 leading-relaxed">{article.excerpt}</p>
      )}
      <hr className="newspaper-rule mb-8" />
      <div className="flex items-center justify-between mb-10">
        {article.authors && <AuthorCard author={article.authors} />}
        {publishedAt && <time className="text-xs text-[--color-text-muted]">{publishedAt}</time>}
      </div>
      <ArticleBody body={article.body} />
    </article>
  );
}
