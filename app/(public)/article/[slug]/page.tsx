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

  const a = article as typeof article & { pdf_url?: string | null; pdf_url_mn?: string | null; title_mn?: string | null; excerpt_mn?: string | null; body_mn?: unknown };

  // PDF Book — no body text, show full-screen flip reader
  if ((a.pdf_url || a.pdf_url_mn) && !article.body) {
    return (
      <PDFArticleClient
        pdfUrl={a.pdf_url ?? null}
        pdfUrlMn={a.pdf_url_mn ?? null}
        title={article.title}
        titleMn={a.title_mn ?? null}
      />
    );
  }

  // Normal article — standard layout, with optional PDF attachment passed through
  return (
    <ArticleContentClient
      title={article.title}
      title_mn={a.title_mn ?? null}
      excerpt={article.excerpt ?? null}
      excerpt_mn={a.excerpt_mn ?? null}
      body={article.body ?? null}
      body_mn={a.body_mn as typeof article.body ?? null}
      cover_image_url={article.cover_image_url ?? null}
      published_at={article.published_at ?? null}
      reading_time_minutes={article.reading_time_minutes ?? null}
      authors={article.authors ?? null}
      coAuthors={((article as typeof article & { article_authors?: { authors: typeof article.authors }[] }).article_authors ?? []).map(r => r.authors).filter(Boolean) as typeof article.authors[]}
      categories={article.categories ?? null}
      pdf_url={a.pdf_url ?? null}
      pdf_url_mn={a.pdf_url_mn ?? null}
    />
  );
}
