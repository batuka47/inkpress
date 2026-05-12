import { searchArticles } from "@/lib/supabase/queries";
import ArticleCard from "@/components/ArticleCard";
import SearchBar from "@/components/SearchBar";
import type { Metadata } from "next";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const { data: results } = q ? await searchArticles(q) : { data: [] };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="font-(family-name:--font-playfair) text-4xl font-bold mb-8">
        Search
      </h1>

      <div className="max-w-2xl mb-10">
        <SearchBar defaultValue={q} />
      </div>

      {q && (
        <p className="font-(family-name:--font-dm-mono) text-sm text-[--color-text-muted] mb-8">
          {results?.length ?? 0} result{results?.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
        </p>
      )}

      {results && results.length > 0 ? (
        <div className="divide-y divide-[--color-rule]">
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} size="compact" layout="row" />
          ))}
        </div>
      ) : q ? (
        <p className="font-(family-name:--font-dm-mono) text-sm text-[--color-text-muted] py-16 text-center">
          No results found. Try different keywords.
        </p>
      ) : null}
    </div>
  );
}
