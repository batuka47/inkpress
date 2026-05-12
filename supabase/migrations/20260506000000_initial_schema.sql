-- ─────────────────────────────────────────────────────────────────────────────
-- InkPress — Initial Schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE author_role    AS ENUM ('editor', 'journalist', 'contributor');

-- ─── Categories ──────────────────────────────────────────────────────────────

CREATE TABLE categories (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL UNIQUE,
  slug          text        NOT NULL UNIQUE,
  description   text,
  color_hex     text        DEFAULT '#5B3ADB',
  display_order int         DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─── Authors ─────────────────────────────────────────────────────────────────

CREATE TABLE authors (
  id           uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text        NOT NULL,
  bio          text,
  avatar_url   text,
  role         author_role NOT NULL DEFAULT 'contributor',
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ─── Tags ────────────────────────────────────────────────────────────────────

CREATE TABLE tags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  slug       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Articles ────────────────────────────────────────────────────────────────

CREATE TABLE articles (
  id                   uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  title                text           NOT NULL,
  slug                 text           NOT NULL UNIQUE,
  excerpt              text,
  body                 jsonb,                             -- TipTap JSON
  cover_image_url      text,
  category_id          uuid           REFERENCES categories ON DELETE SET NULL,
  author_id            uuid           REFERENCES authors   ON DELETE SET NULL,
  status               article_status NOT NULL DEFAULT 'draft',
  is_breaking          boolean        NOT NULL DEFAULT false,
  is_featured          boolean        NOT NULL DEFAULT false,
  reading_time_minutes int,                              -- computed by app on save
  published_at         timestamptz,
  created_at           timestamptz    NOT NULL DEFAULT now(),
  updated_at           timestamptz    NOT NULL DEFAULT now(),
  search_vector        tsvector                          -- updated by trigger
);

-- ─── Article Tags ─────────────────────────────────────────────────────────────

CREATE TABLE article_tags (
  article_id uuid NOT NULL REFERENCES articles ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES tags     ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- ─── Breaking News ───────────────────────────────────────────────────────────

CREATE TABLE breaking_news (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  text            text        NOT NULL,
  link_article_id uuid        REFERENCES articles ON DELETE SET NULL,
  active          boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Full-Text Search
-- ─────────────────────────────────────────────────────────────────────────────

-- Recursively extracts all text nodes from a TipTap JSON body
CREATE OR REPLACE FUNCTION extract_tiptap_text(doc jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT string_agg(node ->> 'text', ' ')
  FROM jsonb_path_query(doc, '$.** ? (@.type == "text")') AS node
  WHERE node ->> 'text' IS NOT NULL;
$$;

-- Computes approximate reading time (200 wpm) from TipTap body
CREATE OR REPLACE FUNCTION compute_reading_time(body jsonb)
RETURNS int
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT GREATEST(1, round(
    array_length(
      string_to_array(trim(coalesce(extract_tiptap_text(body), '')), ' '),
      1
    )::numeric / 200
  )::int);
$$;

-- Trigger function: updates search_vector and reading_time_minutes on each upsert
CREATE OR REPLACE FUNCTION articles_search_and_reading_time()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  body_text text;
BEGIN
  body_text := coalesce(extract_tiptap_text(NEW.body), '');

  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title,   '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', body_text),                 'C');

  IF NEW.body IS NOT NULL AND (OLD IS NULL OR NEW.body IS DISTINCT FROM OLD.body) THEN
    NEW.reading_time_minutes := compute_reading_time(NEW.body);
  END IF;

  NEW.updated_at := now();

  RETURN NEW;
END;
$$;

CREATE TRIGGER articles_search_update
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION articles_search_and_reading_time();

-- ─── Indexes ─────────────────────────────────────────────────────────────────

-- Full-text search (primary)
CREATE INDEX articles_search_vector_idx ON articles USING GIN (search_vector);

-- Fuzzy title search via pg_trgm
CREATE INDEX articles_title_trgm_idx ON articles USING GIN (title gin_trgm_ops);

-- Filtered listing queries
CREATE INDEX articles_status_published_at_idx ON articles (status, published_at DESC)
  WHERE status = 'published';
CREATE INDEX articles_category_idx ON articles (category_id) WHERE status = 'published';
CREATE INDEX articles_featured_idx  ON articles (is_featured, published_at DESC)
  WHERE status = 'published' AND is_featured = true;
CREATE INDEX articles_slug_idx       ON articles (slug);

-- Breaking news active lookup
CREATE INDEX breaking_news_active_idx ON breaking_news (active, created_at DESC)
  WHERE active = true;

-- Tag slugs
CREATE INDEX tags_slug_idx ON tags (slug);

-- Category display order
CREATE INDEX categories_display_order_idx ON categories (display_order);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE articles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags          ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags  ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaking_news ENABLE ROW LEVEL SECURITY;

-- ── Categories: anyone can read ──────────────────────────────────────────────

CREATE POLICY "categories_public_select"
  ON categories FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "categories_admin_all"
  ON categories FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM authors WHERE id = auth.uid() AND role IN ('editor'))
  );

-- ── Tags: anyone can read ─────────────────────────────────────────────────────

CREATE POLICY "tags_public_select"
  ON tags FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "tags_admin_all"
  ON tags FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM authors WHERE id = auth.uid() AND role IN ('editor'))
  );

-- ── Article Tags: follow article visibility ───────────────────────────────────

CREATE POLICY "article_tags_public_select"
  ON article_tags FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE articles.id = article_tags.article_id
        AND articles.status = 'published'
    )
  );

CREATE POLICY "article_tags_author_all"
  ON article_tags FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM articles
      WHERE articles.id = article_tags.article_id
        AND (
          articles.author_id = auth.uid()
          OR EXISTS (SELECT 1 FROM authors WHERE id = auth.uid() AND role = 'editor')
        )
    )
  );

-- ── Articles ─────────────────────────────────────────────────────────────────

-- Public can read published articles
CREATE POLICY "articles_public_select_published"
  ON articles FOR SELECT TO anon, authenticated
  USING (status = 'published');

-- Authors can read their own drafts
CREATE POLICY "articles_author_select_own"
  ON articles FOR SELECT TO authenticated
  USING (author_id = auth.uid());

-- Editors can read everything
CREATE POLICY "articles_editor_select_all"
  ON articles FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM authors WHERE id = auth.uid() AND role = 'editor')
  );

-- Authors can insert new articles (assigned to themselves)
CREATE POLICY "articles_author_insert"
  ON articles FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (SELECT 1 FROM authors WHERE id = auth.uid())
  );

-- Authors can update their own non-published articles
CREATE POLICY "articles_author_update_own_draft"
  ON articles FOR UPDATE TO authenticated
  USING (
    author_id = auth.uid()
    AND status IN ('draft', 'archived')
  );

-- Editors can update any article (including publish/unpublish)
CREATE POLICY "articles_editor_update_all"
  ON articles FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM authors WHERE id = auth.uid() AND role = 'editor')
  );

-- Only editors can delete articles
CREATE POLICY "articles_editor_delete"
  ON articles FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM authors WHERE id = auth.uid() AND role = 'editor')
  );

-- ── Authors ───────────────────────────────────────────────────────────────────

-- Anyone can read author profiles
CREATE POLICY "authors_public_select"
  ON authors FOR SELECT TO anon, authenticated
  USING (true);

-- Authors can insert their own profile (on first sign-up)
CREATE POLICY "authors_self_insert"
  ON authors FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- Authors can update their own profile
CREATE POLICY "authors_self_update"
  ON authors FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- Editors can update any author
CREATE POLICY "authors_editor_update"
  ON authors FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM authors WHERE id = auth.uid() AND role = 'editor')
  );

-- ── Breaking News ─────────────────────────────────────────────────────────────

-- Public can read active breaking news
CREATE POLICY "breaking_news_public_select_active"
  ON breaking_news FOR SELECT TO anon, authenticated
  USING (active = true);

-- Editors can manage all breaking news
CREATE POLICY "breaking_news_editor_all"
  ON breaking_news FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM authors WHERE id = auth.uid() AND role = 'editor')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-set published_at when article is published
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_published_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status IS DISTINCT FROM 'published' THEN
    IF NEW.published_at IS NULL THEN
      NEW.published_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER articles_set_published_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION set_published_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Storage Buckets
-- (run these after the migration, or via Supabase dashboard)
-- ─────────────────────────────────────────────────────────────────────────────

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES
--   ('article-images', 'article-images', true),
--   ('author-avatars', 'author-avatars', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage RLS: any authenticated user can upload to article-images
-- CREATE POLICY "article_images_upload"
--   ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'article-images');

-- CREATE POLICY "article_images_public_read"
--   ON storage.objects FOR SELECT TO anon, authenticated
--   USING (bucket_id = 'article-images');

-- CREATE POLICY "author_avatars_self_upload"
--   ON storage.objects FOR INSERT TO authenticated
--   WITH CHECK (
--     bucket_id = 'author-avatars'
--     AND (storage.foldername(name))[1] = auth.uid()::text
--   );

-- CREATE POLICY "author_avatars_public_read"
--   ON storage.objects FOR SELECT TO anon, authenticated
--   USING (bucket_id = 'author-avatars');
