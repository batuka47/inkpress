import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TagsManager from "@/components/TagsManager";

export default async function TagsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tags } = await (supabase as any)
    .from("tags")
    .select("id, name, slug")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tags</h1>
      <TagsManager tags={tags ?? []} />
    </div>
  );
}
