-- =============================================================
-- 02 · Password-reset columns
-- Supports POST /api/auth/forgot-password → email link →
-- POST /api/auth/reset-password. Only the token's SHA-256 hash
-- is stored; expiry is 1 hour (set by the API).
-- =============================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_reset_token      TEXT,
    ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ;
