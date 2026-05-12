import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [
    { count: published },
    { count: drafts },
    { count: categoriesCount },
    { count: breakingCount },
    { data: recentArticles },
  ] = await Promise.all([
    db.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
    db.from("articles").select("*", { count: "exact", head: true }).eq("status", "draft"),
    db.from("categories").select("*", { count: "exact", head: true }),
    db.from("breaking_news").select("*", { count: "exact", head: true }).eq("active", true),
    db.from("articles").select("id, title, slug, status, published_at, categories(name)").order("created_at", { ascending: false }).limit(8),
  ]);

  const stats = [
    { label: "Published",      value: published ?? 0,      href: "/admin/articles",  color: "bg-green-50 text-green-700 border-green-200" },
    { label: "Drafts",         value: drafts ?? 0,          href: "/admin/articles",  color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    { label: "Categories",     value: categoriesCount ?? 0, href: "/admin/categories", color: "bg-[--color-accent-light] text-[--color-accent] border-[--color-accent-light]" },
    { label: "Breaking Active",value: breakingCount ?? 0,   href: "/admin/breaking",  color: "bg-red-50 text-red-700 border-red-200" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[--color-text]">Dashboard</h1>
        <p className="text-sm text-[--color-text-muted] mt-1">Welcome back, {user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}
            className={`border rounded-xl p-5 hover:shadow-sm transition-shadow ${s.color}`}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/articles/new"
          className="border border-black text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-black hover:text-white transition-colors">
          + New Article
        </Link>
        <Link href="/admin/breaking"
          className="border border-black text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-black hover:text-white transition-colors">
          + Breaking News
        </Link>
        <Link href="/admin/categories"
          className="border border-black text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-black hover:text-white transition-colors">
          Manage Categories
        </Link>
      </div>

      {/* Recent articles */}
      <div>
        <h2 className="text-lg font-bold mb-4">Recent Articles</h2>
        <div className="bg-white border border-[--color-rule] rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-2.5 bg-[#F9FAFB] border-b border-[--color-rule] text-xs font-semibold uppercase tracking-widest text-[--color-text-muted]">
            <span className="col-span-6">Title</span>
            <span className="col-span-2">Category</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Published</span>
          </div>
          {(recentArticles ?? []).map((a: {
            id: string; title: string; slug: string;
            status: string; published_at: string | null;
            categories: { name: string } | null;
          }) => (
            <div key={a.id} className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-[--color-rule] last:border-0 items-center hover:bg-[#F9FAFB] transition-colors">
              <div className="col-span-6">
                <Link href={`/admin/articles/${a.id}/edit`}
                  className="text-sm font-medium text-[--color-text] hover:text-[--color-accent] line-clamp-1 transition-colors">
                  {a.title}
                </Link>
              </div>
              <span className="col-span-2 text-xs text-[--color-text-muted]">
                {a.categories?.name ?? "—"}
              </span>
              <span className="col-span-2">
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                  a.status === "published" ? "bg-green-100 text-green-700" :
                  a.status === "draft"     ? "bg-yellow-100 text-yellow-700" :
                                            "bg-gray-100 text-gray-600"
                }`}>{a.status}</span>
              </span>
              <span className="col-span-2 text-xs text-[--color-text-muted]">
                {a.published_at ? new Date(a.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
