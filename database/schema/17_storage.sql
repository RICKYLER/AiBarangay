-- =============================================================
-- 17_storage.sql — public bucket for report evidence photos
--
-- Uploaded photos live in Supabase Storage (the API runs on a
-- read-only serverless filesystem). `public = true` serves objects
-- from /storage/v1/object/public/uploads/<file> without auth;
-- writes go through the API with the service-role key.
-- =============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;
