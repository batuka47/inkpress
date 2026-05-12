import Masthead from "@/components/Masthead";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";

const MAIN_SLUGS = ["politics", "tech", "culture", "world"];

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: categories } = await (supabase as any)
    .from("categories")
    .select("name, slug")
    .order("display_order", { ascending: true });

  const extra = (categories ?? []).filter(
    (c: { slug: string }) => !MAIN_SLUGS.includes(c.slug)
  );

  return (
    <>
      <Masthead extraCategories={extra} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories ?? []} />
    </>
  );
}
