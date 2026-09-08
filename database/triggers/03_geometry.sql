-- =============================================================
-- 03 · Geometry sync — lat/lon → PostGIS point + barangay detection
-- =============================================================

DROP TRIGGER IF EXISTS trg_report_locations_geom ON report_locations;
CREATE TRIGGER trg_report_locations_geom
    BEFORE INSERT OR UPDATE OF latitude, longitude
    ON report_locations
    FOR EACH ROW
    EXECUTE FUNCTION sync_report_location_geometry();
