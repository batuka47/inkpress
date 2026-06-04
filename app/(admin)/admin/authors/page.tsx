import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthorsManager from "@/components/AuthorsManager";

export default async function AuthorsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: authors } = await (supabase as any)
    .from("authors")
    .select("id, display_name, bio, avatar_url, role")
    .order("display_name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[--color-text]">Authors</h1>
        <p className="text-sm text-[--color-text-muted] mt-1">
          Manage roles, bios, and profile photos for all {authors?.length ?? 0} journalists.
        </p>
      </div>
      <AuthorsManager authors={authors ?? []} />
    </div>
  );
}
