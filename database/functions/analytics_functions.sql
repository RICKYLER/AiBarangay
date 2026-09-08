-- =============================================================
-- refresh_incident_statistics(p_target_date)
-- Rebuilds the daily incident_statistics rows for one date.
-- Schedule nightly:  SELECT refresh_incident_statistics(current_date - 1);
-- =============================================================

CREATE OR REPLACE FUNCTION refresh_incident_statistics(p_target_date DATE DEFAULT current_date)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_rows INTEGER;
BEGIN
    INSERT INTO incident_statistics
        (barangay_id, category_id, date,
         total_reports, verified_reports, resolved_reports,
         average_resolution_minutes, critical_reports, created_at, updated_at)
    SELECT
        i.barangay_id,
        i.category_id,
        p_target_date,
        count(DISTINCT i.report_id),
        count(DISTINCT i.report_id) FILTER (WHERE i.verified_at::date = p_target_date),
        count(DISTINCT i.report_id) FILTER (WHERE i.resolved_at::date = p_target_date),
        round(avg(EXTRACT(EPOCH FROM (i.resolved_at - i.verified_at)) / 60)
                  FILTER (WHERE i.resolved_at IS NOT NULL), 2),
        count(DISTINCT i.report_id) FILTER (WHERE pr.level = 1),
        now(), now()
    FROM incidents i
    LEFT JOIN priorities pr ON pr.id = i.priority_id
    WHERE (i.created_at::date = p_target_date
           OR i.verified_at::date = p_target_date
           OR i.resolved_at::date = p_target_date)
    GROUP BY i.barangay_id, i.category_id
    ON CONFLICT (barangay_id, category_id, date)
    DO UPDATE SET
        total_reports            = EXCLUDED.total_reports,
        verified_reports         = EXCLUDED.verified_reports,
        resolved_reports         = EXCLUDED.resolved_reports,
        average_resolution_minutes = EXCLUDED.average_resolution_minutes,
        critical_reports         = EXCLUDED.critical_reports,
        updated_at               = now();

    GET DIAGNOSTICS v_rows = ROW_COUNT;
    RETURN v_rows;
END;
$$;

-- =============================================================
-- refresh_issue_hotspots(p_barangay_id, p_category_id, p_days, p_cluster_m)
-- Recomputes hotspot clusters using ST_ClusterDBSCAN over recent
-- incident locations, then scores each cluster by priority weighting.
-- =============================================================

CREATE OR REPLACE FUNCTION refresh_issue_hotspots(
    p_barangay_id UUID,
    p_category_id UUID DEFAULT NULL,
    p_days        INTEGER DEFAULT 30,
    p_cluster_m   DOUBLE PRECISION DEFAULT 150
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_rows INTEGER;
BEGIN
    -- Remove stale hotspots for this scope, then recompute
    DELETE FROM issue_hotspots
     WHERE barangay_id = p_barangay_id
       AND (p_category_id IS NULL OR category_id = p_category_id);

    WITH recent AS (
        SELECT i.barangay_id, i.category_id, i.priority_id,
               rl.location
          FROM incidents i
          JOIN report_locations rl ON rl.id = i.location_id
         WHERE i.barangay_id = p_barangay_id
           AND (p_category_id IS NULL OR i.category_id = p_category_id)
           AND i.created_at >= now() - (p_days || ' days')::interval
    ),
    clustered AS (
        SELECT barangay_id, category_id, priority_id, location,
               ST_ClusterDBSCAN(location::geometry, eps := p_cluster_m, minpoints := 3)
                   OVER () AS cid
          FROM recent
    ),
    clusters AS (
        SELECT barangay_id, category_id, cid,
               ST_Collect(location)              AS geoms,
               ST_Centroid(ST_Collect(location)) AS center_point,
               count(*)                          AS incident_count,
               avg(CASE p.level WHEN 1 THEN 1.0 WHEN 2 THEN 0.7
                                WHEN 3 THEN 0.45 ELSE 0.25 END) AS mean_weight
          FROM clustered c
          LEFT JOIN priorities p ON p.id = c.priority_id
         WHERE cid IS NOT NULL
         GROUP BY barangay_id, category_id, cid
    )
    INSERT INTO issue_hotspots
        (barangay_id, category_id, center_point, radius_meters,
         incident_count, severity_score, calculated_at)
    SELECT barangay_id,
           category_id,
           center_point,
           -- radius = farthest point in the cluster from the centroid (meters)
           greatest(
               (SELECT max(ST_Distance(ST_GeometryN(geoms, i)::geography,
                                       center_point::geography))
                  FROM generate_series(1, ST_NumGeometries(geoms)) AS i),
               50
           ) AS radius_meters,
           incident_count,
           -- severity 0–100: mean priority weight (CRITICAL=1.0 … LOW=0.25)
           -- scaled by cluster density
           round(least((mean_weight * least(incident_count::numeric / 10.0, 1.0)) * 100, 100), 3)
               AS severity_score,
           now()
      FROM clusters;

    GET DIAGNOSTICS v_rows = ROW_COUNT;
    RETURN v_rows;
END;
$$;

-- =============================================================
-- get_setting(p_key) — typed convenience for the app layer
-- =============================================================

CREATE OR REPLACE FUNCTION get_setting(p_key VARCHAR)
RETURNS JSONB
LANGUAGE SQL
STABLE
AS $$
    SELECT setting_value FROM system_settings WHERE setting_key = p_key;
$$;
