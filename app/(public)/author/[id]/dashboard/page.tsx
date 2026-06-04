import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getArticlesByAuthor } from "@/lib/supabase/queries";

type Props = { params: Promise<{ id: string }> };

export default async function JournalistDashboard({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.id !== id) redirect(`/author/${user.id}/dashboard`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: author } = await (supabase as any)
    .from("authors")
    .select("id, display_name, bio, avatar_url, role")
    .eq("id", id)
    .single();

  if (!author) notFound();
  if (author.role === "editor") redirect("/admin");

  const { data: articles } = await getArticlesByAuthor(id, 50);

  const published = articles?.filter(a => a.status === "published").length ?? 0;
  const drafts    = articles?.filter(a => a.status === "draft").length ?? 0;

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Header */}
      <header className="bg-white border-b border-[--color-rule] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-lg text-[--color-ink]" style={{ letterSpacing: "-0.03em" }}>
              AmjiltPressAgency
            </Link>
            <span className="text-[10px] font-semibold uppercase tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              Journalist
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/author/${id}`} className="text-xs text-gray-500 hover:text-black transition-colors">
              ← My Profile
            </Link>
            <form action="/api/signout" method="POST">
              <button type="submit"
                className="text-xs font-medium text-gray-600 hover:text-black border border-[--color-rule] hover:border-gray-400 px-3 py-1.5 rounded-md transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome */}
        <div className="flex items-center gap-4">
          {author.avatar_url ? (
            <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
              <Image src={author.avatar_url} alt={author.display_name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-[--color-accent-light] flex items-center justify-center shrink-0">
              <span className="text-xl font-black text-[--color-accent]">{author.display_name.charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="text-xs text-[--color-text-muted] uppercase tracking-widest font-semibold">Welcome back</p>
            <h1 className="text-2xl font-bold text-[--color-ink]" style={{ letterSpacing: "-0.02em" }}>
              {author.display_name}
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Published",   value: published, color: "text-green-600" },
            { label: "Drafts",      value: drafts,    color: "text-yellow-600" },
            { label: "Total",       value: articles?.length ?? 0, color: "text-[--color-accent]" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[--color-rule] rounded-xl p-5">
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-[--color-text-muted] uppercase tracking-widest font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Articles list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[--color-ink]">My Articles</h2>
            <Link href={`/author/${id}/dashboard/new`}
              className="border border-black text-black text-sm font-medium px-5 py-2 rounded-lg hover:bg-black hover:text-white transition-colors">
              + New Article
            </Link>
          </div>

          <div className="bg-white border border-[--color-rule] rounded-xl overflow-hidden">
            {!articles || articles.length === 0 ? (
              <p className="text-sm text-[--color-text-muted] text-center py-12">
                No articles yet. Write your first one!
              </p>
            ) : articles.map(article => (
              <div key={article.id}
                className="flex items-center gap-4 px-5 py-3 border-b border-[--color-rule] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[--color-ink] truncate">{article.title}</p>
                  <p className="text-xs text-[--color-text-muted] mt-0.5">
                    {article.categories?.name ?? "Uncategorized"} ·{" "}
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "Not published"}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                  article.status === "published" ? "bg-green-100 text-green-700" :
                  article.status === "draft"     ? "bg-yellow-100 text-yellow-700" :
                                                   "bg-gray-100 text-gray-600"
                }`}>{article.status}</span>
                <Link href={`/author/${id}/dashboard/edit/${article.id}`}
                  className="text-xs font-medium px-3 py-1 rounded-full bg-[--color-accent-light] text-[--color-accent] hover:bg-violet-200 transition-colors shrink-0">
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
