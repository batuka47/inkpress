import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CategoriesManager from "@/components/CategoriesManager";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categories } = await (supabase as any)
    .from("categories")
    .select("id, name, name_mn, slug, description, color_hex, display_order")
    .order("display_order", { ascending: true });

  // Normalize — is_main_nav may not exist until migration is run
  const normalized = (categories ?? []).map((c: Record<string, unknown>) => ({
    ...c,
    is_main_nav: c.is_main_nav ?? false,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categories</h1>
      <CategoriesManager categories={normalized} />
    </div>
  );
}
