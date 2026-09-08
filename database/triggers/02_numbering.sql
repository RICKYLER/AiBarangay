-- =============================================================
-- 02 · Auto-numbering — RPT-… and INC-…
-- =============================================================

DROP TRIGGER IF EXISTS trg_reports_number ON reports;
CREATE TRIGGER trg_reports_number
    BEFORE INSERT ON reports
    FOR EACH ROW
    EXECUTE FUNCTION generate_report_number();

DROP TRIGGER IF EXISTS trg_incidents_number ON incidents;
CREATE TRIGGER trg_incidents_number
    BEFORE INSERT ON incidents
    FOR EACH ROW
    EXECUTE FUNCTION generate_incident_number();
