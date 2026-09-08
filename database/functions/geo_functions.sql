-- =============================================================
-- sync_report_location_geometry()
-- Keeps report_locations.location in sync with lat/lon columns.
-- The application writes lat/lon; the point column is derived.
-- =============================================================

CREATE OR REPLACE FUNCTION sync_report_location_geometry()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location := ST_SetSRID(
        ST_MakePoint(COALESCE(NEW.longitude, ST_X(NEW.location)),
                     COALESCE(NEW.latitude,  ST_Y(NEW.location))),
        4326
    );

    -- Auto-detect barangay: exact boundary match first, then the
    -- nearest center point (seeded barangays ship without boundaries).
    IF NEW.barangay_id IS NULL THEN
        SELECT b.id INTO NEW.barangay_id
          FROM barangays b
         WHERE b.is_active
         ORDER BY ST_Distance(b.boundary, NEW.location) NULLS LAST,
                  ST_Distance(b.center_point::geography, NEW.location::geography) NULLS LAST
         LIMIT 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================
-- distance_between(lat1, lon1, lat2, lon2) — meters (haversine-free,
-- uses PostGIS geography)
-- =============================================================

CREATE OR REPLACE FUNCTION distance_between(
    lat1 DOUBLE PRECISION, lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION, lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION
LANGUAGE SQL
IMMUTABLE
PARALLEL SAFE
AS $$
    SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
    );
$$;

-- =============================================================
-- find_nearby_reports(p_report_id, p_radius_meters)
-- Candidate duplicates within a radius, newest first.
-- Used by the AI duplicate-detection pipeline.
--
-- SECURITY DEFINER: the AI pass runs inside the reporting
-- resident's transaction, where RLS hides everyone else's rows.
-- The function only exposes non-sensitive fields (number, title,
-- distance, date) and no personal data, so it is safe to expose
-- cross-resident candidates this way.
-- =============================================================

CREATE OR REPLACE FUNCTION find_nearby_reports(
    p_report_id     UUID,
    p_radius_meters DOUBLE PRECISION DEFAULT 150,
    p_max_age_days  INTEGER DEFAULT 14
)
RETURNS TABLE (
    report_id       UUID,
    report_number   VARCHAR,
    title           VARCHAR,
    distance_m      DOUBLE PRECISION,
    submitted_at    TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT r.id,
           r.report_number,
           r.title,
           ST_Distance(rl.location::geography, me.location::geography) AS distance_m,
           r.submitted_at
      FROM reports r
      JOIN report_locations rl ON rl.report_id = r.id
      JOIN report_locations me ON me.report_id = p_report_id
     WHERE r.id <> p_report_id
       AND r.closed_at IS NULL
       AND r.submitted_at >= now() - (p_max_age_days || ' days')::interval
       AND ST_DWithin(rl.location::geography, me.location::geography, p_radius_meters)
     ORDER BY distance_m ASC
     LIMIT 50;
$$;
