import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BreakingNewsManager from "@/components/BreakingNewsManager";

export default async function BreakingNewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [{ data: items }, { data: articles }] = await Promise.all([
    db.from("breaking_news").select("*, articles(title, slug)").order("created_at", { ascending: false }),
    db.from("articles").select("id, title").eq("status", "published").order("published_at", { ascending: false }).limit(100),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Breaking News</h1>
      <BreakingNewsManager items={items ?? []} articles={articles ?? []} />
    </div>
  );
}
