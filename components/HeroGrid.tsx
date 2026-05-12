import ArticleCard from "./ArticleCard";
import type { Database } from "@/types/database";

type Article = Database["public"]["Tables"]["articles"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"] | null;
  authors: Database["public"]["Tables"]["authors"]["Row"] | null;
};

interface Props {
  hero: Article | null;
  sidebar: Article[];
}

export default function HeroGrid({ hero, sidebar }: Props) {
  if (!hero) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Hero — 2 cols wide */}
      <div className="lg:col-span-2">
        <ArticleCard article={hero} size="hero" />
      </div>

      {/* Sidebar — 1 col, stacked */}
      <div className="flex flex-col gap-6">
        {sidebar.map((article) => (
          <ArticleCard key={article.id} article={article} size="standard" />
        ))}
      </div>
    </div>
  );
}
