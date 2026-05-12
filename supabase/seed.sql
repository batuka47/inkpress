-- ─────────────────────────────────────────────────────────────────────────────
-- InkPress — Seed Data
-- Run this after the initial migration to populate sample content.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Categories ────────────────────────────────────────────────────────────────

INSERT INTO categories (id, name, slug, description, color_hex, display_order) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Politics',  'politics',  'Government, elections, and policy',               '#5B3ADB', 1),
  ('11111111-0000-0000-0000-000000000002', 'Tech',       'tech',      'Technology, startups, and the digital world',     '#3B1FA8', 2),
  ('11111111-0000-0000-0000-000000000003', 'Culture',    'culture',   'Arts, entertainment, and society',                '#9B83F4', 3),
  ('11111111-0000-0000-0000-000000000004', 'World',      'world',     'International news and global affairs',           '#5B3ADB', 4)
ON CONFLICT (slug) DO NOTHING;

-- ── Tags ─────────────────────────────────────────────────────────────────────

INSERT INTO tags (id, name, slug) VALUES
  ('22222222-0000-0000-0000-000000000001', 'Breaking',       'breaking'),
  ('22222222-0000-0000-0000-000000000002', 'Analysis',       'analysis'),
  ('22222222-0000-0000-0000-000000000003', 'Opinion',        'opinion'),
  ('22222222-0000-0000-0000-000000000004', 'Exclusive',      'exclusive'),
  ('22222222-0000-0000-0000-000000000005', 'Investigation',  'investigation'),
  ('22222222-0000-0000-0000-000000000006', 'Climate',        'climate'),
  ('22222222-0000-0000-0000-000000000007', 'AI',             'ai'),
  ('22222222-0000-0000-0000-000000000008', 'Elections',      'elections')
ON CONFLICT (slug) DO NOTHING;

-- ── Breaking News ─────────────────────────────────────────────────────────────

INSERT INTO breaking_news (text, active) VALUES
  ('Markets respond to latest central bank rate decision — full analysis inside', true),
  ('Major climate summit reaches landmark emissions agreement', true),
  ('Tech giant announces record quarterly earnings amid layoffs', true)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTE: Authors are linked to auth.users — create a user in Supabase Auth first,
-- then insert their author profile:
--
--   INSERT INTO authors (id, display_name, bio, role)
--   VALUES ('<your-auth-user-uuid>', 'Jane Smith', 'Senior editor at InkPress.', 'editor');
--
-- Then you can insert articles referencing that author_id.
-- ─────────────────────────────────────────────────────────────────────────────
