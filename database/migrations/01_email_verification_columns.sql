-- =============================================================
-- Migration 01 · Email verification columns
-- The base schema's users table has is_verified but no token
-- columns — the Express auth flow needs them.
-- =============================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verify_token     TEXT,
    ADD COLUMN IF NOT EXISTS email_token_expires_at TIMESTAMPTZ;
