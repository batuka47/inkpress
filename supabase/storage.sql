-- ─────────────────────────────────────────────────────────────────────────────
-- InkPress — Storage Buckets & Policies
-- Run this in the Supabase SQL editor AFTER the initial schema migration.
-- ─────────────────────────────────────────────────────────────────────────────

-- Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'article-images',
    'article-images',
    true,
    10485760,  -- 10 MB
    ARRAY['image/jpeg','image/png','image/webp','image/gif','image/avif']
  ),
  (
    'author-avatars',
    'author-avatars',
    true,
    2097152,   -- 2 MB
    ARRAY['image/jpeg','image/png','image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- ── article-images policies ───────────────────────────────────────────────────

-- Anyone can view
CREATE POLICY "article_images_public_read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'article-images');

-- Authenticated authors can upload
CREATE POLICY "article_images_auth_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'article-images'
    AND EXISTS (SELECT 1 FROM public.authors WHERE id = auth.uid())
  );

-- Authors can update/delete their own uploads
CREATE POLICY "article_images_auth_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'article-images'
    AND owner = auth.uid()
  );

CREATE POLICY "article_images_auth_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'article-images'
    AND (
      owner = auth.uid()
      OR EXISTS (SELECT 1 FROM public.authors WHERE id = auth.uid() AND role = 'editor')
    )
  );

-- ── author-avatars policies ───────────────────────────────────────────────────

-- Anyone can view
CREATE POLICY "author_avatars_public_read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'author-avatars');

-- Authors can upload their own avatar (path must start with their uid)
CREATE POLICY "author_avatars_self_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'author-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "author_avatars_self_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'author-avatars'
    AND owner = auth.uid()
  );

CREATE POLICY "author_avatars_self_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'author-avatars'
    AND owner = auth.uid()
  );
