-- =============================================================
-- Public community-map layer
--
-- GET /api/gis/public-map calls these with NO user context
-- (anonymous visitors), while incidents sit behind FORCE ROW
-- LEVEL SECURITY. These SECURITY DEFINER functions are the one
-- sanctioned public read path: they expose ONLY anonymized,
-- aggregate-safe columns — no resident ids, no exact addresses,
-- no free-text descriptions. Closed incidents are excluded.
-- =============================================================

CREATE OR REPLACE FUNCTION get_public_incidents()
RETURNS TABLE (
    id              UUID,
    incident_number VARCHAR,
    category        VARCHAR,
    category_color  VARCHAR,
    priority        VARCHAR,
    status          VARCHAR,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    barangay        VARCHAR,
    verified_at     TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT i.id,
           i.incident_number,
           c.name  AS category,
           c.color AS category_color,
           p.name  AS priority,
           st.name AS status,
           ST_Y(rl.location) AS latitude,
           ST_X(rl.location) AS longitude,
           b.name  AS barangay,
           i.verified_at
      FROM incidents i
      JOIN report_locations rl ON rl.id = i.location_id
      LEFT JOIN categories c         ON c.id  = i.category_id
      LEFT JOIN priorities p        ON p.id  = i.priority_id
      LEFT JOIN incident_statuses st ON st.id = i.status_id
      LEFT JOIN barangays b         ON b.id  = i.barangay_id
     WHERE i.closed_at IS NULL;
$$;

-- Hotspots are pre-computed aggregates (no personal data); the
-- definer wrapper keeps the public endpoint off the base table.
CREATE OR REPLACE FUNCTION get_public_hotspots()
RETURNS TABLE (
    barangay       VARCHAR,
    category       VARCHAR,
    latitude       DOUBLE PRECISION,
    longitude      DOUBLE PRECISION,
    radius_meters  INTEGER,
    incident_count INTEGER,
    severity_score NUMERIC
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT b.name AS barangay,
           c.name AS category,
           ST_Y(h.center_point) AS latitude,
           ST_X(h.center_point) AS longitude,
           h.radius_meters,
           h.incident_count,
           h.severity_score
      FROM issue_hotspots h
      JOIN barangays b   ON b.id = h.barangay_id
      LEFT JOIN categories c ON c.id = h.category_id
     ORDER BY h.severity_score DESC NULLS LAST;
$$;

-- Revoke direct execution from non-granted roles; the app role
-- gets EXECUTE through policies/rls.sql's blanket grant.
REVOKE EXECUTE ON FUNCTION get_public_incidents() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_public_hotspots() FROM PUBLIC;
