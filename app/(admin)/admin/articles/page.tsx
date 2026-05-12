import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteArticleButton from "@/components/DeleteArticleButton";

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  categories: { name: string } | null;
  authors: { display_name: string } | null;
};

export default async function AdminArticlesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rawArticles } = await supabase
    .from("articles")
    .select("id, title, slug, status, published_at, categories(name), authors(display_name)")
    .order("created_at", { ascending: false })
    .limit(50);

  const articles = rawArticles as ArticleRow[] | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[--color-text]">Articles</h1>
        <Link href="/admin/articles/new"
          className="border border-black text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-black hover:text-white transition-colors">
          + New Article
        </Link>
      </div>

      <div className="bg-white border border-[--color-rule] rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-2.5 bg-[#F9FAFB] border-b border-[--color-rule] text-xs font-semibold uppercase tracking-widest text-[--color-text-muted]">
          <span className="col-span-4">Title</span>
          <span className="col-span-2">Category</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2">Published</span>
          <span className="col-span-2">Actions</span>
        </div>

        {!articles || articles.length === 0 ? (
          <p className="px-5 py-10 text-sm text-[--color-text-muted] text-center">No articles yet.</p>
        ) : articles.map((article) => (
          <div key={article.id} className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-[--color-rule] last:border-0 items-center hover:bg-[#F9FAFB] transition-colors">
            <div className="col-span-4">
              <Link href={`/admin/articles/${article.id}/edit`}
                className="text-sm font-medium text-[--color-text] hover:text-[--color-accent] transition-colors line-clamp-1">
                {article.title}
              </Link>
            </div>
            <span className="col-span-2 text-xs text-[--color-text-muted]">
              {article.categories?.name ?? "—"}
            </span>
            <span className="col-span-2">
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                article.status === "published" ? "bg-green-100 text-green-700" :
                article.status === "draft"     ? "bg-yellow-100 text-yellow-700" :
                                                "bg-gray-100 text-gray-600"
              }`}>{article.status}</span>
            </span>
            <span className="col-span-2 text-xs text-[--color-text-muted]">
              {article.published_at
                ? new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "—"}
            </span>
            <div className="col-span-2 flex items-center gap-2">
              <Link href={`/admin/articles/${article.id}/edit`}
                className="text-xs font-medium px-3 py-1 rounded-full bg-[--color-accent-light] text-[--color-accent] hover:bg-violet-200 transition-colors">
                Edit
              </Link>
              <DeleteArticleButton id={article.id} title={article.title} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
