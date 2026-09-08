-- =============================================================
-- 03 · Users & sessions
-- =============================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    barangay_id     UUID REFERENCES barangays(id) ON DELETE SET NULL,
    first_name      VARCHAR(80) NOT NULL,
    middle_name     VARCHAR(80),
    last_name       VARCHAR(80) NOT NULL,
    email           CITEXT UNIQUE,              -- requires citext; see note below
    phone           VARCHAR(20) UNIQUE,
    password_hash   TEXT NOT NULL,
    profile_image   TEXT,
    address         TEXT,
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at   TIMESTAMPTZ,
    CONSTRAINT users_contact_present CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- If citext is unavailable, replace CITEXT with VARCHAR and add a unique index
-- on lower(email). To enable citext, run:  CREATE EXTENSION IF NOT EXISTS citext;
-- (added to 00_extensions.sql in production hardening if desired).

CREATE TABLE user_sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL UNIQUE,           -- sha256 of the session token
    ip_address  INET,
    user_agent  TEXT,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at  TIMESTAMPTZ
);

CREATE INDEX idx_user_sessions_user   ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(expires_at) WHERE revoked_at IS NULL;
