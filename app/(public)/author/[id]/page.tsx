import { notFound } from "next/navigation";
import Image from "next/image";
import { getAuthorById, getArticlesByAuthor } from "@/lib/supabase/queries";
import ArticleCard from "@/components/ArticleCard";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data: author } = await getAuthorById(id);
  if (!author) return {};
  return {
    title: author.display_name,
    description: author.bio ?? `Articles by ${author.display_name}`,
  };
}

const ROLE_LABEL: Record<string, string> = {
  editor:      "Editor",
  journalist:  "Journalist",
  contributor: "Contributor",
};

export default async function AuthorPage({ params }: Props) {
  const { id } = await params;

  const [{ data: author }, { data: articles }] = await Promise.all([
    getAuthorById(id),
    getArticlesByAuthor(id),
  ]);

  if (!author) notFound();

  return (
    <div className="min-h-screen bg-white">
      {/* Profile header */}
      <div className="border-b border-[--color-rule]">
        <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col sm:flex-row items-center sm:items-start gap-8">
          {/* Avatar */}
          {author.avatar_url ? (
            <div className="relative w-28 h-28 rounded-full overflow-hidden shrink-0 border-4 border-[--color-accent-light]">
              <Image src={author.avatar_url} alt={author.display_name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-28 h-28 rounded-full bg-[--color-accent-light] flex items-center justify-center shrink-0 border-4 border-white shadow-md">
              <span className="text-4xl font-black text-[--color-accent]">
                {author.display_name.charAt(0)}
              </span>
            </div>
          )}

          {/* Info */}
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[--color-accent] mb-2">
              {ROLE_LABEL[author.role] ?? author.role}
            </p>
            <h1 className="text-4xl font-black text-[--color-ink] leading-tight mb-3"
              style={{ letterSpacing: "-0.03em" }}>
              {author.display_name}
            </h1>
            {author.bio && (
              <p className="text-base text-gray-500 leading-relaxed max-w-xl">
                {author.bio}
              </p>
            )}
            <p className="mt-4 text-sm text-[--color-text-muted]">
              {articles?.length ?? 0} published article{(articles?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Articles grid */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {!articles || articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[--color-text-muted] text-sm">No published articles yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} size="standard" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
