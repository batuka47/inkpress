import { getPublishedArticles, getFeaturedArticle, getBreakingNews, getCategories } from "@/lib/supabase/queries";
import BreakingTicker from "@/components/BreakingTicker";
import HeroGrid from "@/components/HeroGrid";
import SectionDivider from "@/components/SectionDivider";
import ArticleCard from "@/components/ArticleCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AmjiltPressAgency",
  description: "News as it should be read — beautifully.",
};

export const revalidate = 60;

export default async function HomePage() {
  const [
    { data: breakingNews },
    { data: featured },
    { data: articles },
    { data: categories },
  ] = await Promise.all([
    getBreakingNews(),
    getFeaturedArticle(),
    getPublishedArticles(20),
    getCategories(),
  ]);

  const heroArticle = featured ?? articles?.[0] ?? null;
  const sidebarArticles = articles?.slice(1, 3) ?? [];
  const remainingArticles = articles?.slice(3) ?? [];

  return (
    <div className="bg-[--color-surface] min-h-screen">
      {/* Breaking ticker */}
      {breakingNews && breakingNews.length > 0 && (
        <BreakingTicker items={breakingNews} />
      )}

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <HeroGrid hero={heroArticle} sidebar={sidebarArticles} />
      </section>

      {/* Category sections */}
      <div className="max-w-7xl mx-auto px-6 pb-16 flex flex-col gap-14">
        {(categories ?? []).map((category) => {
          const categoryArticles = remainingArticles.filter(
            (a) => a.category_id === category.id
          );
          if (categoryArticles.length === 0) return null;

          return (
            <section key={category.id}>
              <SectionDivider label={category.name} href={`/category/${category.slug}`} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryArticles.slice(0, 3).map((article) => (
                  <ArticleCard key={article.id} article={article} size="standard" />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <NewsletterSignup />
    </div>
  );
}
