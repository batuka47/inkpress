import { createClient } from "./server";
import type { Database } from "@/types/database";

type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type AuthorRow = Database["public"]["Tables"]["authors"]["Row"];
type TagRow = Database["public"]["Tables"]["tags"]["Row"];
type BreakingRow = Database["public"]["Tables"]["breaking_news"]["Row"];

export type ArticleWithRelations = ArticleRow & {
  categories: CategoryRow | null;
  authors: AuthorRow | null;
};

export type ArticleWithTags = ArticleWithRelations & {
  article_tags: { tags: TagRow | null }[];
};

type QueryResult<T> = Promise<{ data: T | null; error: Error | null }>;

async function query<T>(fn: () => Promise<{ data: unknown; error: unknown }>): QueryResult<T> {
  const { data, error } = await fn();
  return { data: data as T | null, error: error as Error | null };
}

export async function getPublishedArticles(limit = 20, offset = 0): QueryResult<ArticleWithRelations[]> {
  return query<ArticleWithRelations[]>(async () => {
    const supabase = await createClient();
    return supabase
      .from("articles")
      .select("*, categories(*), authors(*)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);
  });
}

export async function getFeaturedArticle(): QueryResult<ArticleWithRelations> {
  return query<ArticleWithRelations>(async () => {
    const supabase = await createClient();
    return supabase
      .from("articles")
      .select("*, categories(*), authors(*)")
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .single();
  });
}

export async function getArticleBySlug(slug: string): QueryResult<ArticleWithTags> {
  return query<ArticleWithTags>(async () => {
    const supabase = await createClient();
    return supabase
      .from("articles")
      .select("*, categories(*), authors(*), article_tags(tags(*)), article_authors(authors(*))")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
  });
}

export async function getArticlesByCategory(categorySlug: string, limit = 12): QueryResult<ArticleWithRelations[]> {
  return query<ArticleWithRelations[]>(async () => {
    const supabase = await createClient();
    return supabase
      .from("articles")
      .select("*, categories!inner(*), authors(*)")
      .eq("status", "published")
      .eq("categories.slug", categorySlug)
      .order("published_at", { ascending: false })
      .limit(limit);
  });
}

export async function getBreakingNews(): QueryResult<BreakingRow[]> {
  return query<BreakingRow[]>(async () => {
    const supabase = await createClient();
    return supabase
      .from("breaking_news")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
  });
}

export async function getCategories(): QueryResult<CategoryRow[]> {
  return query<CategoryRow[]>(async () => {
    const supabase = await createClient();
    return supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });
  });
}

export async function getAuthorById(id: string): QueryResult<AuthorRow> {
  return query<AuthorRow>(async () => {
    const supabase = await createClient();
    return supabase.from("authors").select("*").eq("id", id).single();
  });
}

export async function getArticlesByAuthor(authorId: string, limit = 50): QueryResult<ArticleWithRelations[]> {
  return query<ArticleWithRelations[]>(async () => {
    const supabase = await createClient();

    // Get article IDs from the junction table
    const { data: junctionRows } = await supabase
      .from("article_authors")
      .select("article_id")
      .eq("author_id", authorId);

    const junctionIds = (junctionRows ?? []).map((r: { article_id: string }) => r.article_id);

    // Collect all article IDs: primary author_id OR in junction table
    const allIds = junctionIds.length > 0
      ? `author_id.eq.${authorId},id.in.(${junctionIds.join(",")})`
      : `author_id.eq.${authorId}`;

    return supabase
      .from("articles")
      .select("*, categories(*), authors(*)")
      .or(allIds)
      .order("created_at", { ascending: false })
      .limit(limit);
  });
}

export async function searchArticles(q: string, limit = 20): QueryResult<ArticleWithRelations[]> {
  return query<ArticleWithRelations[]>(async () => {
    const supabase = await createClient();
    return supabase
      .from("articles")
      .select("*, categories(*), authors(*)")
      .eq("status", "published")
      .textSearch("search_vector", q, { type: "websearch" })
      .order("published_at", { ascending: false })
      .limit(limit);
  });
}
