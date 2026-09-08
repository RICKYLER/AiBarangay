-- =============================================================
-- 05 · Timestamp workflow triggers
-- Keeps verified_at / assigned_at / resolved_at / closed_at in sync
-- with status transitions on incidents and reports.
-- =============================================================

CREATE OR REPLACE FUNCTION sync_incident_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status_id IS DISTINCT FROM OLD.status_id THEN
        IF NEW.status_id = (SELECT id FROM incident_statuses WHERE name = 'VERIFIED')
           AND NEW.verified_at IS NULL THEN
            NEW.verified_at := now();
        END IF;
        IF NEW.status_id = (SELECT id FROM incident_statuses WHERE name = 'ASSIGNED')
           AND NEW.assigned_at IS NULL THEN
            NEW.assigned_at := now();
        END IF;
        IF NEW.status_id = (SELECT id FROM incident_statuses WHERE name = 'RESOLVED')
           AND NEW.resolved_at IS NULL THEN
            NEW.resolved_at := now();
        END IF;
        IF NEW.status_id = (SELECT id FROM incident_statuses WHERE name = 'CLOSED')
           AND NEW.closed_at IS NULL THEN
            NEW.closed_at := now();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incidents_status_ts ON incidents;
CREATE TRIGGER trg_incidents_status_ts
    BEFORE UPDATE OF status_id ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION sync_incident_status_timestamps();

-- Mirror the same transitions back onto the source report
CREATE OR REPLACE FUNCTION sync_report_status_from_incident()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE reports
       SET verified_at = NEW.verified_at,
           closed_at   = NEW.closed_at,
           status_id   = NEW.status_id,
           priority_id = COALESCE(NEW.priority_id, reports.priority_id)
     WHERE id = NEW.report_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incidents_mirror_report ON incidents;
CREATE TRIGGER trg_incidents_mirror_report
    AFTER UPDATE OF status_id, priority_id, verified_at, closed_at ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION sync_report_status_from_incident();

-- Creation of the incident (verification) must flip the report to
-- VERIFIED immediately — the UPDATE trigger above never fires for
-- the initial INSERT.
DROP TRIGGER IF EXISTS trg_incidents_insert_mirror ON incidents;
CREATE TRIGGER trg_incidents_insert_mirror
    AFTER INSERT ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION sync_report_status_from_incident();
