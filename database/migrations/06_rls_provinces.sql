-- =============================================================
-- 06: provinces RLS + spatial_ref_sys report
--
-- provinces was missed in migration 05 (parent lookup of
-- cities_municipalities, same access pattern: public reference
-- data, admin-managed).
--
-- spatial_ref_sys CANNOT get RLS on hosted Supabase: the table
-- belongs to the PostGIS extension and is owned by supabase_admin,
-- and the postgres role is not a superuser there, so
-- ALTER TABLE … ENABLE ROW LEVEL SECURITY fails with
-- "must be owner of table spatial_ref_sys". Migration 04 already
-- ran the compensating control (REVOKE from anon/authenticated),
-- which closes the actual PostgREST exposure; the linter item is
-- a known false positive for hosted PostGIS. The block below
-- prints the owner + effective grants as confirmation.
-- =============================================================

ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS provinces_select ON provinces;
CREATE POLICY provinces_select ON provinces FOR SELECT
    USING (true);

DROP POLICY IF EXISTS provinces_write ON provinces;
CREATE POLICY provinces_write ON provinces FOR ALL
    USING (is_admin()) WITH CHECK (is_admin());

-- ── spatial_ref_sys: report, not fix (cannot fix as postgres) ──
DO $$
DECLARE
    v_owner TEXT;
    v_grants TEXT;
BEGIN
    SELECT relowner::regrole::text INTO v_owner
      FROM pg_class WHERE relname = 'spatial_ref_sys';

    SELECT string_agg(DISTINCT grantee, ', ' ORDER BY grantee) INTO v_grants
      FROM information_schema.role_table_grants
     WHERE table_name = 'spatial_ref_sys'
       AND privilege_type = 'SELECT';

    RAISE NOTICE 'spatial_ref_sys owner: % — SELECT grantees: %', v_owner, v_grants;
    RAISE NOTICE 'anon/authenticated should NOT appear above; if they do, run: REVOKE ALL ON spatial_ref_sys FROM anon, authenticated;';
END
$$;
