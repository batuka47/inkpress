import { notFound } from "next/navigation";
import { getArticlesByCategory, getCategories } from "@/lib/supabase/queries";
import SectionDivider from "@/components/SectionDivider";
import ArticleCard from "@/components/ArticleCard";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: categories } = await getCategories();
  const category = categories?.find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Latest ${category.name} news`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [{ data: articles }, { data: categories }] = await Promise.all([
    getArticlesByCategory(slug, 20),
    getCategories(),
  ]);

  const category = categories?.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <SectionDivider label={category.name} large />
      {category.description && (
        <p className="font-(family-name:--font-source-serif) italic text-[--color-text-muted] mb-8 max-w-2xl">
          {category.description}
        </p>
      )}

      {!articles || articles.length === 0 ? (
        <p className="font-(family-name:--font-dm-mono) text-sm text-[--color-text-muted] py-16 text-center">
          No articles in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} size="standard" />
          ))}
        </div>
      )}
    </div>
  );
}
