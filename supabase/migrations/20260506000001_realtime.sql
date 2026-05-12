-- ─────────────────────────────────────────────────────────────────────────────
-- InkPress — Enable Realtime
-- ─────────────────────────────────────────────────────────────────────────────

-- Add breaking_news to the realtime publication so clients can subscribe
-- to INSERT events for the live ticker.
ALTER PUBLICATION supabase_realtime ADD TABLE breaking_news;
