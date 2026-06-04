import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArticleForm from "@/components/ArticleForm";

export default async function NewArticlePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const [{ data: categories }, { data: tags }, { data: authors }] = await Promise.all([
    db.from("categories").select("id, name").order("display_order"),
    db.from("tags").select("id, name").order("name"),
    db.from("authors").select("id, display_name, role").order("display_name"),
  ]);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[--color-text]">New Article</h1>
        <p className="text-sm text-[--color-text-muted] mt-1">
          Fill in the details below, or upload a PDF to use as the article content.
        </p>
      </div>
      <ArticleForm
        categories={categories ?? []}
        tags={tags ?? []}
        authors={authors ?? []}
        authorId={user.id}
      />
    </div>
  );
}
