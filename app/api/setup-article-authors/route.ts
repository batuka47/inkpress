import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Create junction table via rpc if raw SQL is needed
  const { error } = await supabase.rpc("create_article_authors_table" as string);

  if (error) {
    // Try creating via direct SQL using postgres extension
    return NextResponse.json({
      message: "Please run this SQL in your Supabase SQL editor:",
      sql: `
CREATE TABLE IF NOT EXISTS article_authors (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES authors(id)  ON DELETE CASCADE,
  PRIMARY KEY (article_id, author_id)
);
CREATE INDEX IF NOT EXISTS idx_article_authors_article ON article_authors(article_id);
CREATE INDEX IF NOT EXISTS idx_article_authors_author  ON article_authors(author_id);
      `.trim(),
      supabase_url: "https://supabase.com/dashboard/project/cokaqklrffnybqwvnzlh/sql/new",
    });
  }

  return NextResponse.json({ success: true });
}
