-- =============================================================
-- Auth functions (SECURITY DEFINER)
-- =============================================================
-- The users table is RLS-protected (see policies/rls.sql), but the
-- pre-login auth flows — register, verify-email, login, password
-- reset, session resolution — cannot be scoped to a user yet,
-- because the caller is not authenticated. These functions run as
-- their owner (postgres, BYPASSRLS) so the auth flows keep working
-- while users remains invisible to un-scoped queries.
--
-- Everything taking a token takes its SHA-256 HASH, never the raw
-- token (except the email-verify token, which is consumed directly
-- from the link and is a random 32-byte hex value itself).

-- Shared user shape returned by the lookup functions.
DO $$ BEGIN
    CREATE TYPE auth_user_row AS(
        id              uuid,
        role_name       text,
        barangay_id     uuid,
        first_name      text,
        middle_name     text,
        last_name       text,
        email           text,
        phone           text,
        password_hash   text,
        profile_image   text,
        address         text,
        is_verified     boolean,
        is_active       boolean,
        created_at      timestamptz,
        last_login_at   timestamptz
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION auth_user_columns()
RETURNS SETOF auth_user_row LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT u.id, r.name, u.barangay_id, u.first_name, u.middle_name,
           u.last_name, u.email::text, u.phone, u.password_hash,
           u.profile_image, u.address, u.is_verified, u.is_active,
           u.created_at, u.last_login_at
      FROM users u JOIN roles r ON r.id = u.role_id;
$$;

-- Case-insensitive lookup by email (login, forgot-password, resend).
-- RETURNS SETOF so a miss yields ZERO rows — a bare composite return
-- would come back as one all-NULL row instead.
CREATE OR REPLACE FUNCTION auth_find_user_by_email(p_email text)
RETURNS SETOF auth_user_row LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT * FROM auth_user_columns() WHERE lower(email) = lower(p_email) LIMIT 1;
$$;

-- Resident self-registration (register endpoint).
CREATE OR REPLACE FUNCTION auth_register_user(
    p_first_name     text,
    p_middle_name    text,
    p_last_name      text,
    p_email          text,
    p_phone          text,
    p_password_hash  text,
    p_address        text,
    p_barangay_id    uuid,
    p_verify_token   text
) RETURNS auth_user_row LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid; v_row auth_user_row;
BEGIN
    INSERT INTO users (role_id, barangay_id, first_name, middle_name, last_name,
                       email, phone, password_hash, address, is_verified,
                       email_verify_token, email_token_expires_at)
    VALUES ((SELECT id FROM roles WHERE name = 'RESIDENT'),
            p_barangay_id, p_first_name, p_middle_name, p_last_name,
            lower(p_email), p_phone, p_password_hash, p_address, FALSE,
            p_verify_token, now() + interval '24 hours')
    RETURNING id INTO v_id;

    SELECT * INTO v_row FROM auth_user_columns() WHERE id = v_id;
    RETURN v_row;
END;
$$;

-- Email verification link consumption. SETOF for the same reason as
-- auth_find_user_by_email: a miss must be zero rows, not a NULL row.
CREATE OR REPLACE FUNCTION auth_get_by_verify_token(p_token text)
RETURNS SETOF auth_user_row LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT u.id, r.name, u.barangay_id, u.first_name, u.middle_name,
           u.last_name, u.email::text, u.phone, u.password_hash,
           u.profile_image, u.address, u.is_verified, u.is_active,
           u.created_at, u.last_login_at
      FROM users u JOIN roles r ON r.id = u.role_id
     WHERE u.email_verify_token = p_token
       AND u.email_token_expires_at > now()
     LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION auth_mark_verified(p_user_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
    UPDATE users SET is_verified = TRUE,
                     email_verify_token = NULL,
                     email_token_expires_at = NULL,
                     updated_at = now()
     WHERE id = p_user_id;
$$;

-- Refresh the verification token (resend).
CREATE OR REPLACE FUNCTION auth_rotate_verify_token(p_user_id uuid, p_token text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
    UPDATE users SET email_verify_token = p_token,
                     email_token_expires_at = now() + interval '24 hours',
                     updated_at = now()
     WHERE id = p_user_id;
$$;

-- Successful login bookkeeping.
CREATE OR REPLACE FUNCTION auth_touch_login(p_user_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
    UPDATE users SET last_login_at = now() WHERE id = p_user_id;
$$;

-- Password reset: store the token hash with an expiry.
CREATE OR REPLACE FUNCTION auth_set_reset_token(p_user_id uuid, p_token_hash text, p_minutes int)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
    UPDATE users SET password_reset_token = p_token_hash,
                     password_reset_expires_at = now() + (p_minutes || ' minutes')::interval,
                     updated_at = now()
     WHERE id = p_user_id;
$$;

-- Password reset: atomically consume the token, set the new hash and
-- revoke every session. Returns the user id, or NULL when the token
-- is unknown / already used / expired / the account is inactive.
CREATE OR REPLACE FUNCTION auth_consume_reset(p_token_hash text, p_new_hash text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
    SELECT id INTO v_id FROM users
     WHERE password_reset_token = p_token_hash
       AND password_reset_expires_at > now()
       AND is_active
       FOR UPDATE;
    IF v_id IS NULL THEN RETURN NULL; END IF;

    UPDATE users SET password_hash = p_new_hash,
                     password_reset_token = NULL,
                     password_reset_expires_at = NULL,
                     last_login_at = now(),
                     updated_at = now()
     WHERE id = v_id;
    UPDATE user_sessions SET revoked_at = now()
     WHERE user_id = v_id AND revoked_at IS NULL;
    RETURN v_id;
END;
$$;

-- Logout.
CREATE OR REPLACE FUNCTION auth_revoke_session(p_token_hash text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
    UPDATE user_sessions SET revoked_at = now()
     WHERE token_hash = p_token_hash AND revoked_at IS NULL;
$$;

-- Session resolution for authenticated requests (db.js withUser and
-- GET /api/auth/me). Returns the user when the session cookie's hash
-- matches a live, unrevoked session of an active account.
CREATE OR REPLACE FUNCTION resolve_session(p_token_hash text)
RETURNS TABLE(
    session_id      uuid,
    id              uuid,
    role_name       text,
    barangay_id     uuid,
    first_name      text,
    middle_name     text,
    last_name       text,
    email           text,
    phone           text,
    address         text,
    profile_image   text,
    is_verified     boolean,
    is_active       boolean,
    created_at      timestamptz,
    last_login_at   timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT s.id, u.id, r.name, u.barangay_id, u.first_name, u.middle_name,
           u.last_name, u.email::text, u.phone, u.address, u.profile_image,
           u.is_verified, u.is_active, u.created_at, u.last_login_at
      FROM user_sessions s
      JOIN users u ON u.id = s.user_id
      JOIN roles r ON r.id = u.role_id
     WHERE s.token_hash = p_token_hash
       AND s.revoked_at IS NULL
       AND s.expires_at > now()
     LIMIT 1;
$$;
