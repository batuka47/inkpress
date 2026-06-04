import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ArticleForm from "@/components/ArticleForm";

type Props = { params: Promise<{ id: string }> };

export default async function JournalistNewArticlePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.id !== id) redirect(`/author/${user.id}/dashboard`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [{ data: categories }, { data: tags }, { data: selfAuthor }] = await Promise.all([
    db.from("categories").select("id, name").order("display_order"),
    db.from("tags").select("id, name").order("name"),
    db.from("authors").select("id, display_name, role").eq("id", user.id),
  ]);

  const dashboardUrl = `/author/${id}/dashboard`;

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <header className="bg-white border-b border-[--color-rule] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link href={dashboardUrl} className="text-sm text-[--color-text-muted] hover:text-black transition-colors">
            ← Dashboard
          </Link>
          <span className="text-[--color-rule]">|</span>
          <h1 className="text-sm font-semibold text-[--color-ink]">New Article</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <ArticleForm
          categories={categories ?? []}
          tags={tags ?? []}
          authors={selfAuthor ?? []}
          authorId={user.id}
          lockAuthor
          redirectTo={dashboardUrl}
        />
      </main>
    </div>
  );
}
