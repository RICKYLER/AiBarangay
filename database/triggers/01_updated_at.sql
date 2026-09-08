-- =============================================================
-- 01 · updated_at triggers — attach update_updated_at() everywhere
-- =============================================================

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'barangays', 'zones', 'users', 'offices', 'reports',
        'report_locations', 'incidents', 'assignments', 'tasks',
        'resolutions', 'incident_statistics', 'system_settings'
    ]
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I;
             CREATE TRIGGER trg_%s_updated_at
                 BEFORE UPDATE ON %I
                 FOR EACH ROW
                 EXECUTE FUNCTION update_updated_at();',
            t, t, t, t
        );
    END LOOP;
END;
$$;
