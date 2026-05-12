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
    .select("id, name, slug, description, color_hex, display_order")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categories</h1>
      <CategoriesManager categories={categories ?? []} />
    </div>
  );
}
