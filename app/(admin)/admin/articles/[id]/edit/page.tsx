import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArticleForm from "@/components/ArticleForm";
import NewsletterComposer from "@/components/NewsletterComposer";

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [
    { data: article },
    { data: categories },
    { data: tags },
    { data: authors },
    { data: articleTags },
    { data: articleAuthors },
    { count: subscriberCount },
  ] = await Promise.all([
    db.from("articles").select("*, categories(name), authors(display_name)").eq("id", id).single(),
    db.from("categories").select("id, name").order("display_order"),
    db.from("tags").select("id, name").order("name"),
    db.from("authors").select("id, display_name, role").order("display_name"),
    db.from("article_tags").select("tag_id").eq("article_id", id) as unknown as Promise<{ data: { tag_id: string }[] | null }>,
    db.from("article_authors").select("author_id").eq("article_id", id) as unknown as Promise<{ data: { author_id: string }[] | null }>,
    db.from("subscribers").select("*", { count: "exact", head: true }).eq("active", true),
  ]);

  if (!article) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[--color-text]">Edit Article</h1>
        <p className="text-sm text-[--color-text-muted] mt-1 truncate">
          {(article as { title: string }).title}
        </p>
      </div>

      <ArticleForm
        article={article}
        categories={categories ?? []}
        tags={tags ?? []}
        authors={authors ?? []}
        selectedTagIds={(articleTags ?? []).map((t: { tag_id: string }) => t.tag_id)}
        selectedAuthorIds={(articleAuthors ?? []).map((a: { author_id: string }) => a.author_id)}
        authorId={user.id}
      />

      {/* Newsletter section — only shown when article is published */}
      {(article as { status: string }).status === "published" && (
        <div>
          <h2 className="text-lg font-bold mb-4">Newsletter</h2>
          <NewsletterComposer
            article={article as {
              title: string; slug: string; excerpt: string | null;
              cover_image_url: string | null; published_at: string | null;
              categories?: { name: string } | null;
              authors?: { display_name: string } | null;
            }}
            subscriberCount={subscriberCount ?? 0}
          />
        </div>
      )}
    </div>
  );
}
