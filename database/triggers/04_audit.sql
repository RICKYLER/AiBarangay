-- =============================================================
-- 04 · Audit trail — log changes to high-value tables
-- Every UPDATE on incidents / reports / resolutions captures
-- old → new values into audit_logs.
--
-- Note: user_id / ip_address are supplied by the application via
-- SET LOCAL request.user_id / request.ip_address inside its
-- transaction; NULL when unavailable (e.g. system jobs).
-- =============================================================

CREATE OR REPLACE FUNCTION audit_row_change()
RETURNS TRIGGER AS $$
DECLARE
    v_user UUID;
    v_ip   INET;
BEGIN
    BEGIN
        v_user := current_setting('request.user_id', true)::UUID;
    EXCEPTION WHEN others THEN
        v_user := NULL;
    END;
    BEGIN
        v_ip := current_setting('request.ip_address', true)::INET;
    EXCEPTION WHEN others THEN
        v_ip := NULL;
    END;

    INSERT INTO audit_logs (user_id, action, entity_type, entity_id,
                            old_values, new_values, ip_address, created_at)
    VALUES (
        v_user,
        TG_ARGV[0],                          -- e.g. 'incident.status_changed'
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        to_jsonb(OLD),
        to_jsonb(NEW),
        v_ip,
        now()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Bind only on tables where the trail is legally required
DROP TRIGGER IF EXISTS trg_incidents_audit ON incidents;
CREATE TRIGGER trg_incidents_audit
    AFTER UPDATE ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION audit_row_change('incident.updated');

DROP TRIGGER IF EXISTS trg_reports_audit ON reports;
CREATE TRIGGER trg_reports_audit
    AFTER UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION audit_row_change('report.updated');

DROP TRIGGER IF EXISTS trg_resolutions_audit ON resolutions;
CREATE TRIGGER trg_resolutions_audit
    AFTER INSERT OR UPDATE ON resolutions
    FOR EACH ROW
    EXECUTE FUNCTION audit_row_change('resolution.saved');
