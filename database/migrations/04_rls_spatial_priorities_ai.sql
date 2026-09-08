-- =============================================================
-- 04: RLS for the second batch of linter-flagged tables
-- (spatial_ref_sys, priorities, ai_analyses, ai_insights)
--
--   * spatial_ref_sys is the PostGIS coordinate-system catalog:
--     public reference data, nothing sensitive. RLS + a read-all
--     policy silences the linter while keeping PostGIS functions
--     working for app_user.
--   * priorities is lookup data read by the public lookups API
--     (withDb, no user context) and by the report-submission
--     INSERT … (SELECT id FROM priorities WHERE name = …).
--   * ai_analyses is written during report submission inside the
--     resident's transaction and read by the barangay review
--     screen + v_barangay_review_queue (security_invoker, staff
--     context). Visibility mirrors the reports policies.
--   * ai_insights are dashboard narratives for staff (barangay
--     staff see their barangay + city-wide; city officials see
--     all). bi_reader (BI dashboards, no request.* context) is
--     allowed by name.
--
-- Idempotent: every policy is dropped before (re)creation.
-- =============================================================

-- spatial_ref_sys belongs to the PostGIS extension. On hosted
-- Supabase it is owned by supabase_admin, so ALTER TABLE / CREATE
-- POLICY fail with "must be owner" — in that case fall back to
-- revoking PostgREST access, which fixes the actual exposure.
DO $$
BEGIN
    ALTER TABLE spatial_ref_sys ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS spatial_ref_sys_select ON spatial_ref_sys;
    CREATE POLICY spatial_ref_sys_select ON spatial_ref_sys FOR SELECT
        USING (true);
EXCEPTION WHEN insufficient_privilege THEN
    BEGIN
        RAISE NOTICE 'spatial_ref_sys: not owner — revoking anon/authenticated instead';
        REVOKE ALL ON spatial_ref_sys FROM anon, authenticated;
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE 'spatial_ref_sys: cannot revoke either — leaving as-is (reference data only)';
    END;
END
$$;

ALTER TABLE priorities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- ── priorities ───────────────────────────────────────────────
DROP POLICY IF EXISTS priorities_select ON priorities;
CREATE POLICY priorities_select ON priorities FOR SELECT
    USING (true);

DROP POLICY IF EXISTS priorities_write ON priorities;
CREATE POLICY priorities_write ON priorities FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- ── ai_analyses ──────────────────────────────────────────────
-- Same visibility as the parent report: city officials see all,
-- barangay staff see analyses of reports in their barangay, and
-- residents see analyses of their own reports.
DROP POLICY IF EXISTS ai_analyses_select ON ai_analyses;
CREATE POLICY ai_analyses_select ON ai_analyses FOR SELECT
    USING (
        is_city_official()
        OR (is_barangay_staff() AND report_in_my_barangay(report_id))
        OR EXISTS (SELECT 1 FROM reports r
                    WHERE r.id = report_id
                      AND r.resident_id = current_app_user())
    );

-- Written by the AI triage pass inside the reporting resident's
-- submission transaction (the report row already exists in that
-- transaction); staff can add analyses too.
DROP POLICY IF EXISTS ai_analyses_insert ON ai_analyses;
CREATE POLICY ai_analyses_insert ON ai_analyses FOR INSERT
    WITH CHECK (
        is_staff()
        OR EXISTS (SELECT 1 FROM reports r
                    WHERE r.id = report_id
                      AND r.resident_id = current_app_user())
    );

-- ── ai_insights ──────────────────────────────────────────────
DROP POLICY IF EXISTS ai_insights_select ON ai_insights;
CREATE POLICY ai_insights_select ON ai_insights FOR SELECT
    USING (
        is_city_official()
        OR (is_barangay_staff()
            AND (barangay_id IS NULL OR barangay_id = current_app_barangay()))
        OR current_user = 'bi_reader'
    );

DROP POLICY IF EXISTS ai_insights_write ON ai_insights;
CREATE POLICY ai_insights_write ON ai_insights FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());
