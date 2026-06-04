import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categories } = await (supabase as any)
    .from("categories")
    .select("name, name_mn, slug, is_main_nav")
    .order("display_order", { ascending: true });

  const all   = (categories ?? []) as { name: string; name_mn?: string | null; slug: string; is_main_nav: boolean }[];
  const main  = all.filter(c => c.is_main_nav);
  const extra = all.filter(c => !c.is_main_nav);

  return (
    <>
      <Masthead mainCategories={main} extraCategories={extra} />
      <main className="flex-1">{children}</main>
      <Footer categories={all} />
    </>
  );
}
