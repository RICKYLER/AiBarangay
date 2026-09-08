-- =============================================================
-- Row-Level Security & grants
--
-- The application connects as ONE role (app_user, NO bypassrls)
-- and sets
--     SET LOCAL request.user_id     = '<uuid>';
--     SET LOCAL request.role_name   = 'RESIDENT';
--     SET LOCAL request.barangay_id = '<uuid>';
-- per transaction. Policies read those settings, so a connection
-- pool never leaks one user's rows to another.
--
-- Visibility model:
--   * RESIDENT            → only rows they own
--   * BARANGAY_ADMIN /
--     BARANGAY_STAFF /
--     FIELD_PERSONNEL     → rows in their own barangay
--   * OFFICE_HEAD /
--     LGU_ADMIN /
--     SYSTEM_ADMIN        → city-wide (city offices route work)
--
-- Idempotent: every policy is dropped before (re)creation.
-- =============================================================

CREATE OR REPLACE FUNCTION current_app_user()   RETURNS UUID    LANGUAGE sql STABLE AS
$$ SELECT nullif(current_setting('request.user_id', true), '')::UUID $$;

CREATE OR REPLACE FUNCTION current_app_role()   RETURNS TEXT   LANGUAGE sql STABLE AS
$$ SELECT coalesce(nullif(current_setting('request.role_name', true), ''), 'ANONYMOUS') $$;

CREATE OR REPLACE FUNCTION current_app_barangay() RETURNS UUID   LANGUAGE sql STABLE AS
$$ SELECT nullif(current_setting('request.barangay_id', true), '')::UUID $$;

CREATE OR REPLACE FUNCTION is_staff() RETURNS BOOLEAN LANGUAGE sql STABLE AS
$$ SELECT current_app_role() IN ('BARANGAY_ADMIN', 'BARANGAY_STAFF', 'FIELD_PERSONNEL',
                                 'OFFICE_HEAD', 'LGU_ADMIN', 'SYSTEM_ADMIN') $$;

CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN LANGUAGE sql STABLE AS
$$ SELECT current_app_role() IN ('BARANGAY_ADMIN', 'LGU_ADMIN', 'SYSTEM_ADMIN') $$;

-- Barangay-scoped staff (reports/incidents of their barangay only)
CREATE OR REPLACE FUNCTION is_barangay_staff() RETURNS BOOLEAN LANGUAGE sql STABLE AS
$$ SELECT current_app_role() IN ('BARANGAY_ADMIN', 'BARANGAY_STAFF', 'FIELD_PERSONNEL') $$;

-- City-level roles see everything (office routing, city dashboards)
CREATE OR REPLACE FUNCTION is_city_official() RETURNS BOOLEAN LANGUAGE sql STABLE AS
$$ SELECT current_app_role() IN ('OFFICE_HEAD', 'LGU_ADMIN', 'SYSTEM_ADMIN') $$;

-- Barangay of a report, read as the owner (postgres) so policies on
-- report_locations do not recurse into themselves.
CREATE OR REPLACE FUNCTION report_in_my_barangay(p_report_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT EXISTS (SELECT 1 FROM report_locations rl
                   WHERE rl.report_id = p_report_id
                     AND rl.barangay_id = current_app_barangay()) $$;

CREATE OR REPLACE FUNCTION incident_in_my_barangay(p_incident_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT EXISTS (SELECT 1 FROM incidents i
                   WHERE i.id = p_incident_id
                     AND i.barangay_id = current_app_barangay()) $$;

-- Does the incident trace back to the current user's own report?
CREATE OR REPLACE FUNCTION incident_is_own_report(p_incident_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT EXISTS (SELECT 1 FROM incidents i
                   JOIN reports r ON r.id = i.report_id
                  WHERE i.id = p_incident_id
                    AND r.resident_id = current_app_user()) $$;

-- ── Enable + FORCE RLS ──────────────────────────────────────
-- FORCE matters: without it the table owner (postgres) would
-- bypass every policy below.
DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'reports', 'report_locations', 'report_media', 'incidents',
        'assignments', 'tasks', 'field_updates', 'evidence',
        'resolutions', 'feedback', 'notifications', 'duplicate_matches',
        'users'
    ]
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    END LOOP;
END;
$$;

-- ── reports ─────────────────────────────────────────────────
DROP POLICY IF EXISTS reports_select ON reports;
CREATE POLICY reports_select ON reports FOR SELECT
    USING (
        is_city_official()
        OR (is_barangay_staff() AND report_in_my_barangay(id))
        OR resident_id = current_app_user()
    );

DROP POLICY IF EXISTS reports_insert ON reports;
CREATE POLICY reports_insert ON reports FOR INSERT
    WITH CHECK (
        (current_app_role() = 'RESIDENT' AND resident_id = current_app_user())
        OR is_staff()
    );

DROP POLICY IF EXISTS reports_update ON reports;
CREATE POLICY reports_update ON reports FOR UPDATE
    USING (
        is_city_official()
        OR (is_barangay_staff() AND report_in_my_barangay(id))
        OR resident_id = current_app_user()
    )
    WITH CHECK (
        is_city_official()
        OR (is_barangay_staff() AND report_in_my_barangay(id))
        OR resident_id = current_app_user()
    );

-- report_locations / report_media inherit visibility from their
-- parent report (helper function avoids policy recursion).
DROP POLICY IF EXISTS report_locations_select ON report_locations;
CREATE POLICY report_locations_select ON report_locations FOR SELECT
    USING (
        is_city_official()
        OR (is_barangay_staff() AND report_in_my_barangay(report_id))
        OR EXISTS (SELECT 1 FROM reports r
                    WHERE r.id = report_id
                      AND r.resident_id = current_app_user())
    );

DROP POLICY IF EXISTS report_locations_write ON report_locations;
CREATE POLICY report_locations_write ON report_locations FOR ALL
    USING (
        is_city_official()
        OR (is_barangay_staff() AND report_in_my_barangay(report_id))
        OR EXISTS (SELECT 1 FROM reports r
                    WHERE r.id = report_id
                      AND r.resident_id = current_app_user())
    )
    WITH CHECK (
        is_city_official()
        OR (is_barangay_staff() AND report_in_my_barangay(report_id))
        OR EXISTS (SELECT 1 FROM reports r
                    WHERE r.id = report_id
                      AND r.resident_id = current_app_user())
    );

DROP POLICY IF EXISTS report_media_select ON report_media;
CREATE POLICY report_media_select ON report_media FOR SELECT
    USING (
        is_city_official()
        OR (is_barangay_staff() AND report_in_my_barangay(report_id))
        OR EXISTS (SELECT 1 FROM reports r
                    WHERE r.id = report_id
                      AND r.resident_id = current_app_user())
    );

DROP POLICY IF EXISTS report_media_write ON report_media;
CREATE POLICY report_media_write ON report_media FOR ALL
    USING (
        is_city_official()
        OR (is_barangay_staff() AND report_in_my_barangay(report_id))
        OR EXISTS (SELECT 1 FROM reports r
                    WHERE r.id = report_id
                      AND r.resident_id = current_app_user())
    )
    WITH CHECK (
        is_city_official()
        OR (is_barangay_staff() AND report_in_my_barangay(report_id))
        OR EXISTS (SELECT 1 FROM reports r
                    WHERE r.id = report_id
                      AND r.resident_id = current_app_user())
    );

-- ── incidents ───────────────────────────────────────────────
DROP POLICY IF EXISTS incidents_select ON incidents;
CREATE POLICY incidents_select ON incidents FOR SELECT
    USING (
        is_city_official()
        OR (is_barangay_staff() AND barangay_id = current_app_barangay())
        OR incident_is_own_report(id)
    );

DROP POLICY IF EXISTS incidents_write ON incidents;
CREATE POLICY incidents_write ON incidents FOR ALL
    USING (
        is_admin()
        OR (is_barangay_staff() AND barangay_id = current_app_barangay())
    )
    WITH CHECK (
        is_admin()
        OR (is_barangay_staff() AND barangay_id = current_app_barangay())
    );

-- ── operational tables (staff only, scoped by incident) ─────
DROP POLICY IF EXISTS assignments_rw ON assignments;
CREATE POLICY assignments_rw ON assignments FOR ALL
    USING (is_admin() OR (is_barangay_staff() AND incident_in_my_barangay(incident_id)))
    WITH CHECK (is_admin() OR (is_barangay_staff() AND incident_in_my_barangay(incident_id)));

DROP POLICY IF EXISTS tasks_rw ON tasks;
CREATE POLICY tasks_rw ON tasks FOR ALL
    USING (is_admin()
           OR assigned_to = current_app_user()
           OR (is_barangay_staff() AND incident_in_my_barangay(incident_id)))
    WITH CHECK (is_admin()
           OR assigned_to = current_app_user()
           OR (is_barangay_staff() AND incident_in_my_barangay(incident_id)));

DROP POLICY IF EXISTS field_updates_rw ON field_updates;
CREATE POLICY field_updates_rw ON field_updates FOR ALL
    USING (is_admin() OR (is_barangay_staff() AND incident_in_my_barangay(incident_id)))
    WITH CHECK (is_admin() OR (is_barangay_staff() AND incident_in_my_barangay(incident_id)));

DROP POLICY IF EXISTS evidence_select ON evidence;
CREATE POLICY evidence_select ON evidence FOR SELECT
    USING (is_admin()
           OR (is_barangay_staff() AND incident_in_my_barangay(incident_id))
           OR incident_is_own_report(incident_id));

DROP POLICY IF EXISTS evidence_write ON evidence;
CREATE POLICY evidence_write ON evidence FOR INSERT
    WITH CHECK (is_admin() OR (is_barangay_staff() AND incident_in_my_barangay(incident_id)));

DROP POLICY IF EXISTS resolutions_select ON resolutions;
CREATE POLICY resolutions_select ON resolutions FOR SELECT
    USING (is_admin()
           OR (is_barangay_staff() AND incident_in_my_barangay(incident_id))
           OR incident_is_own_report(incident_id));

DROP POLICY IF EXISTS resolutions_write ON resolutions;
CREATE POLICY resolutions_write ON resolutions FOR ALL
    USING (is_admin() OR (is_barangay_staff() AND incident_in_my_barangay(incident_id)))
    WITH CHECK (is_admin() OR (is_barangay_staff() AND incident_in_my_barangay(incident_id)));

-- Residents can rate incidents that belong to their own reports
DROP POLICY IF EXISTS feedback_select ON feedback;
CREATE POLICY feedback_select ON feedback FOR SELECT
    USING (is_admin() OR (is_barangay_staff() AND incident_in_my_barangay(incident_id))
           OR resident_id = current_app_user());

DROP POLICY IF EXISTS feedback_insert ON feedback;
CREATE POLICY feedback_insert ON feedback FOR INSERT
    WITH CHECK (current_app_role() = 'RESIDENT' AND resident_id = current_app_user());

-- ── notifications: strictly your own ────────────────────────
DROP POLICY IF EXISTS notifications_select ON notifications;
CREATE POLICY notifications_select ON notifications FOR SELECT
    USING (user_id = current_app_user());

DROP POLICY IF EXISTS notifications_update ON notifications;
CREATE POLICY notifications_update ON notifications FOR UPDATE
    USING (user_id = current_app_user())
    WITH CHECK (user_id = current_app_user());

-- Workflow writes on behalf of residents/staff (report received,
-- verified, rejected, …). Residents may only notify themselves;
-- staff may notify any user in their flow.
DROP POLICY IF EXISTS notifications_insert ON notifications;
CREATE POLICY notifications_insert ON notifications FOR INSERT
    WITH CHECK (is_staff() OR user_id = current_app_user());

-- ── duplicate_matches: AI candidates + staff review ─────────
DROP POLICY IF EXISTS duplicate_matches_select ON duplicate_matches;
CREATE POLICY duplicate_matches_select ON duplicate_matches FOR SELECT
    USING (
        is_city_official()
        OR (is_barangay_staff() AND (report_in_my_barangay(report_id)
                                     OR report_in_my_barangay(matched_report_id)))
    );

-- The AI pass runs inside the reporting resident's submission
-- transaction, so residents create candidate rows for their own
-- reports; staff can create them too.
DROP POLICY IF EXISTS duplicate_matches_insert ON duplicate_matches;
CREATE POLICY duplicate_matches_insert ON duplicate_matches FOR INSERT
    WITH CHECK (
        is_staff()
        OR EXISTS (SELECT 1 FROM reports r
                    WHERE r.id = report_id
                      AND r.resident_id = current_app_user())
    );

-- ── users: profile + identity ───────────────────────────────
-- Registration, login, verification and password reset happen
-- BEFORE the caller is identified, so they run through the
-- SECURITY DEFINER functions in functions/auth_functions.sql —
-- not through these policies.
--
-- Everyone sees their own row (the resident profile screen);
-- barangay staff see residents registered in their barangay plus
-- anyone who filed a report there (the review screen joins users
-- for the resident's name); city officials see everyone.
DROP POLICY IF EXISTS users_select ON users;
CREATE POLICY users_select ON users FOR SELECT
    USING (
        id = current_app_user()
        OR is_city_official()
        OR (is_barangay_staff() AND (
               barangay_id = current_app_barangay()
               OR EXISTS (SELECT 1 FROM reports r
                           WHERE r.resident_id = users.id
                             AND report_in_my_barangay(r.id))))
    );

-- Barangay admins provision accounts for their own barangay (staff,
-- residents who register at the desk, and chat-only desk officers —
-- a DESK_OFFICER must carry a desk assignment). Only city-level
-- admins may create other admin accounts.
DROP POLICY IF EXISTS users_insert_by_admin ON users;
CREATE POLICY users_insert_by_admin ON users FOR INSERT
    WITH CHECK (
        current_app_role() IN ('LGU_ADMIN', 'SYSTEM_ADMIN')
        OR (current_app_role() = 'BARANGAY_ADMIN'
            AND barangay_id = current_app_barangay()
            AND role_id IN (SELECT id FROM roles
                             WHERE name IN ('RESIDENT', 'BARANGAY_STAFF',
                                            'FIELD_PERSONNEL', 'DESK_OFFICER'))
            AND (role_id <> (SELECT id FROM roles WHERE name = 'DESK_OFFICER')
                 OR desk_id IS NOT NULL))
    );

-- Profile updates are strictly your own row; the API additionally
-- restricts which columns may change (names, phone, address).
DROP POLICY IF EXISTS users_update_own ON users;
CREATE POLICY users_update_own ON users FOR UPDATE
    USING (id = current_app_user())
    WITH CHECK (id = current_app_user());

-- Barangay admins manage the accounts of their own barangay
-- (suspend / reactivate, detail fixes); city officials manage
-- anyone. Nobody manages their own row here — that is the profile
-- screen — so an admin cannot lock themselves out.
DROP POLICY IF EXISTS users_update_by_admin ON users;
CREATE POLICY users_update_by_admin ON users FOR UPDATE
    USING (
        id <> current_app_user()
        AND (is_city_official()
             OR (current_app_role() = 'BARANGAY_ADMIN'
                 AND barangay_id = current_app_barangay()))
    )
    WITH CHECK (
        is_city_official()
        OR (current_app_role() = 'BARANGAY_ADMIN'
            AND barangay_id = current_app_barangay())
    );

-- ── Grants ──────────────────────────────────────────────────
-- app_user is the application's login role (NO bypassrls, so the
-- policies above really apply to it). bi_reader is read-only for
-- BI dashboards. Passwords are set by the installer (apply.mjs).
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user LOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bi_reader') THEN
        CREATE ROLE bi_reader LOGIN;
    END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

-- Analytics role: read-only for BI dashboards
GRANT USAGE ON SCHEMA public TO bi_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO bi_reader;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO bi_reader;
