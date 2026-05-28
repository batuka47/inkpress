import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/supabase/queries";
import PDFArticleClient from "@/components/PDFArticleClient";
import ArticleContentClient from "@/components/ArticleContentClient";
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

  // PDF article — locale-aware: pick pdf_url_mn if available, else pdf_url
  const a = article as typeof article & { pdf_url?: string | null; pdf_url_mn?: string | null };
  if (a.pdf_url || a.pdf_url_mn) {
    return (
      <PDFArticleClient
        pdfUrl={a.pdf_url ?? null}
        pdfUrlMn={a.pdf_url_mn ?? null}
        title={article.title}
        titleMn={(article as typeof article & { title_mn?: string | null }).title_mn ?? null}
      />
    );
  }

  // Normal article — locale-aware client component picks EN or MN content
  return (
    <ArticleContentClient
      title={article.title}
      title_mn={(article as typeof article & { title_mn?: string | null }).title_mn ?? null}
      excerpt={article.excerpt ?? null}
      excerpt_mn={(article as typeof article & { excerpt_mn?: string | null }).excerpt_mn ?? null}
      body={article.body ?? null}
      body_mn={(article as typeof article & { body_mn?: unknown }).body_mn as typeof article.body ?? null}
      cover_image_url={article.cover_image_url ?? null}
      published_at={article.published_at ?? null}
      reading_time_minutes={article.reading_time_minutes ?? null}
      authors={article.authors ?? null}
      categories={article.categories ?? null}
    />
  );
}
