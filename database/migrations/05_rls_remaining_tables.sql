-- =============================================================
-- 05: RLS for the remaining public tables — final batch
--
-- Linter-flagged: audit_logs, incident_statistics, roles,
-- role_permissions. Also covers the rest of the no-RLS tables so
-- the linter is clean for good: permissions, barangays, zones,
-- cities_municipalities, chat_desks, issue_hotspots,
-- system_settings.
--
-- Access patterns preserved:
--   * roles / permissions / role_permissions — reference data.
--     roles is joined by app_user in several controllers and in
--     the users_insert_by_admin policy, so SELECT is open; writes
--     are admin-only (seeds run as the owner and bypass anyway).
--   * barangays / zones / cities_municipalities — read by the
--     PUBLIC lookups API (withDb, no user context) and joined by
--     the security_invoker portal views under any signed-in role.
--   * chat_desks — desk names/descriptions are shown to residents
--     picking a desk to chat with (chat.controller listDesks).
--   * audit_logs — INSERTed by the audit_row_change() trigger,
--     which is NOT SECURITY DEFINER: it runs as app_user whenever
--     a resident or staff member updates a report/incident, so
--     the insert policy must be open. Reads are staff/BI only;
--     no UPDATE/DELETE policies — the trail is immutable.
--   * incident_statistics / issue_hotspots — rebuilt by the
--     refresh_*() functions (run as the owner, which bypasses
--     ENABLE-only RLS) and read by staff dashboards / BI. The
--     public map reads hotspots through the SECURITY DEFINER
--     get_public_hotspots(), which also bypasses.
--   * system_settings — read via get_setting(); staff/BI read,
--     admin write.
--
-- All ENABLE-only (not FORCEd): maintenance jobs, seeds and the
-- SECURITY DEFINER helpers run as the table owner.
-- Idempotent: every policy is dropped before (re)creation.
-- =============================================================

ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_statistics  ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE barangays            ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones                ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities_municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_desks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_hotspots       ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings      ENABLE ROW LEVEL SECURITY;

-- ── RBAC reference data ──────────────────────────────────────
DROP POLICY IF EXISTS roles_select ON roles;
CREATE POLICY roles_select ON roles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS roles_write ON roles;
CREATE POLICY roles_write ON roles FOR ALL
    USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS permissions_select ON permissions;
CREATE POLICY permissions_select ON permissions FOR SELECT
    USING (true);

DROP POLICY IF EXISTS permissions_write ON permissions;
CREATE POLICY permissions_write ON permissions FOR ALL
    USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS role_permissions_select ON role_permissions;
CREATE POLICY role_permissions_select ON role_permissions FOR SELECT
    USING (true);

DROP POLICY IF EXISTS role_permissions_write ON role_permissions;
CREATE POLICY role_permissions_write ON role_permissions FOR ALL
    USING (is_admin()) WITH CHECK (is_admin());

-- ── geography (public lookups + portal views) ────────────────
DROP POLICY IF EXISTS barangays_select ON barangays;
CREATE POLICY barangays_select ON barangays FOR SELECT
    USING (true);

DROP POLICY IF EXISTS barangays_write ON barangays;
CREATE POLICY barangays_write ON barangays FOR ALL
    USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS zones_select ON zones;
CREATE POLICY zones_select ON zones FOR SELECT
    USING (true);

DROP POLICY IF EXISTS zones_write ON zones;
CREATE POLICY zones_write ON zones FOR ALL
    USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS cities_municipalities_select ON cities_municipalities;
CREATE POLICY cities_municipalities_select ON cities_municipalities FOR SELECT
    USING (true);

DROP POLICY IF EXISTS cities_municipalities_write ON cities_municipalities;
CREATE POLICY cities_municipalities_write ON cities_municipalities FOR ALL
    USING (is_admin()) WITH CHECK (is_admin());

-- ── chat_desks ───────────────────────────────────────────────
DROP POLICY IF EXISTS chat_desks_select ON chat_desks;
CREATE POLICY chat_desks_select ON chat_desks FOR SELECT
    USING (true);

DROP POLICY IF EXISTS chat_desks_write ON chat_desks;
CREATE POLICY chat_desks_write ON chat_desks FOR ALL
    USING (is_admin()) WITH CHECK (is_admin());

-- ── audit_logs (append-only trail) ───────────────────────────
-- Trigger runs as the updating user (resident or staff), so the
-- insert must be open; only roles holding the INSERT grant
-- (app_user, postgres) can reach it in the first place.
DROP POLICY IF EXISTS audit_logs_insert ON audit_logs;
CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS audit_logs_select ON audit_logs;
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT
    USING (is_staff() OR current_user = 'bi_reader');

-- ── analytics (owner-rebuilt, staff/BI-read) ─────────────────
DROP POLICY IF EXISTS incident_statistics_select ON incident_statistics;
CREATE POLICY incident_statistics_select ON incident_statistics FOR SELECT
    USING (
        is_city_official()
        OR (is_barangay_staff() AND barangay_id = current_app_barangay())
        OR current_user = 'bi_reader'
    );

DROP POLICY IF EXISTS incident_statistics_write ON incident_statistics;
CREATE POLICY incident_statistics_write ON incident_statistics FOR ALL
    USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS issue_hotspots_select ON issue_hotspots;
CREATE POLICY issue_hotspots_select ON issue_hotspots FOR SELECT
    USING (is_staff() OR current_user = 'bi_reader');

DROP POLICY IF EXISTS issue_hotspots_write ON issue_hotspots;
CREATE POLICY issue_hotspots_write ON issue_hotspots FOR ALL
    USING (is_admin()) WITH CHECK (is_admin());

-- ── system_settings ──────────────────────────────────────────
DROP POLICY IF EXISTS system_settings_select ON system_settings;
CREATE POLICY system_settings_select ON system_settings FOR SELECT
    USING (is_staff() OR current_user = 'bi_reader');

DROP POLICY IF EXISTS system_settings_write ON system_settings;
CREATE POLICY system_settings_write ON system_settings FOR ALL
    USING (is_admin()) WITH CHECK (is_admin());
