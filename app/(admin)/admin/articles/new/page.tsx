import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArticleForm from "@/components/ArticleForm";

export default async function NewArticlePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from("categories").select("id, name").order("display_order"),
    supabase.from("tags").select("id, name").order("name"),
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
        authorId={user.id}
      />
    </div>
  );
}
