-- =============================================================
-- 03: RLS for the remaining public tables
-- (offices, categories, incident_statuses, user_sessions)
--
-- These were flagged by the Supabase linter: they live in the
-- public schema exposed to PostgREST but had no RLS, so anyone
-- holding the anon key could read every row — including
-- user_sessions.token_hash.
--
-- Access patterns these policies preserve:
--   * offices / categories / incident_statuses are reference data:
--     read by everyone (the public report wizard runs with no user
--     context, and portal views join offices as security_invoker),
--     written only by admins (and by seeds, which run as the owner).
--   * user_sessions: the API inserts a row at login BEFORE any user
--     context exists, and revokes sessions for the profile screen
--     ("other devices") and the admin suspend flow. Reads happen
--     only through the SECURITY DEFINER functions in
--     functions/auth_functions.sql — there is deliberately NO
--     SELECT policy, so app_user can never read token hashes.
--
-- These tables are ENABLE-only (not FORCEd): the SECURITY DEFINER
-- auth functions run as the table owner and must keep working.
-- Idempotent: every policy is dropped before (re)creation.
-- =============================================================

ALTER TABLE offices           ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions     ENABLE ROW LEVEL SECURITY;

-- ── offices ──────────────────────────────────────────────────
DROP POLICY IF EXISTS offices_select ON offices;
CREATE POLICY offices_select ON offices FOR SELECT
    USING (true);

DROP POLICY IF EXISTS offices_write ON offices;
CREATE POLICY offices_write ON offices FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ── categories ───────────────────────────────────────────────
DROP POLICY IF EXISTS categories_select ON categories;
CREATE POLICY categories_select ON categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS categories_write ON categories;
CREATE POLICY categories_write ON categories FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ── incident_statuses ────────────────────────────────────────
DROP POLICY IF EXISTS incident_statuses_select ON incident_statuses;
CREATE POLICY incident_statuses_select ON incident_statuses FOR SELECT
    USING (true);

DROP POLICY IF EXISTS incident_statuses_write ON incident_statuses;
CREATE POLICY incident_statuses_write ON incident_statuses FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ── user_sessions ────────────────────────────────────────────
-- INSERT: session creation happens at login, before the caller is
-- identified — no request.* context is set yet. Only app_user holds
-- the INSERT grant, so WITH CHECK (true) is safe here.
DROP POLICY IF EXISTS user_sessions_insert ON user_sessions;
CREATE POLICY user_sessions_insert ON user_sessions FOR INSERT
    WITH CHECK (true);

-- UPDATE (revocation): your own sessions (password change signs out
-- other devices), or sessions of users you manage — mirroring the
-- users_update_by_admin policy in policies/rls.sql.
DROP POLICY IF EXISTS user_sessions_update ON user_sessions;
CREATE POLICY user_sessions_update ON user_sessions FOR UPDATE
    USING (
        user_id = current_app_user()
        OR is_city_official()
        OR (current_app_role() = 'BARANGAY_ADMIN'
            AND EXISTS (SELECT 1 FROM users u
                         WHERE u.id = user_sessions.user_id
                           AND u.barangay_id = current_app_barangay()))
    )
    WITH CHECK (true);
