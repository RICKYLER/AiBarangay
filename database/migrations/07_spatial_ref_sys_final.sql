-- =============================================================
-- 07: spatial_ref_sys — everything that CAN be done, in one run
--
-- The linter item "RLS Disabled in Public · public.spatial_ref_sys"
-- cannot be cleared on hosted Supabase: the table is owned by
-- supabase_admin (PostGIS extension owner) and the postgres role
-- is neither superuser nor a member of that role, so
-- ALTER TABLE … ENABLE ROW LEVEL SECURITY raises
-- "must be owner of table spatial_ref_sys" — for every project
-- on hosted Supabase with PostGIS in the public schema. The table
-- itself is the public EPSG coordinate-system catalog: no user
-- data, no row-level sensitivity.
--
-- What this script does:
--   1. Tries to enable RLS (succeeds only if postgres owns it).
--   2. Falls back to the compensating control: REVOKE ALL from
--      anon + authenticated, which closes the actual PostgREST
--      exposure the lint rule points at. Idempotent.
--   3. Prints the resulting owner + SELECT grantees as a report.
--
-- After this, the remaining lint entry is a known false positive;
-- the security exposure it describes is closed.
-- =============================================================

DO $$
DECLARE
    v_owner  TEXT;
    v_grants TEXT;
BEGIN
    BEGIN
        ALTER TABLE spatial_ref_sys ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'spatial_ref_sys: RLS enabled';
    EXCEPTION WHEN insufficient_privilege THEN
        RAISE NOTICE 'spatial_ref_sys: cannot enable RLS (not owner) — revoking PostgREST access';
        REVOKE ALL ON spatial_ref_sys FROM anon, authenticated;
        REVOKE ALL ON spatial_ref_sys FROM PUBLIC;
    END;

    SELECT relowner::regrole::text INTO v_owner
      FROM pg_class WHERE relname = 'spatial_ref_sys';

    SELECT string_agg(DISTINCT grantee, ', ' ORDER BY grantee) INTO v_grants
      FROM information_schema.role_table_grants
     WHERE table_name = 'spatial_ref_sys'
       AND privilege_type = 'SELECT';

    RAISE NOTICE 'REPORT — owner: % | SELECT grantees: %', v_owner, coalesce(v_grants, 'none');
    RAISE NOTICE 'anon/authenticated must not appear above. If they do, contact Supabase support.';
END
$$;
