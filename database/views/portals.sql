-- =============================================================
-- Views — one convenience view per portal
-- security_invoker = true so RLS policies on the underlying tables
-- still apply when the app queries these as app_user (PG15+).
-- =============================================================

-- 1 · RESIDENT PORTAL — "my reports" with status & tracking
CREATE OR REPLACE VIEW v_resident_reports WITH (security_invoker = true) AS
SELECT
    r.id,
    r.report_number,
    r.title,
    r.description,
    c.name        AS category,
    c.icon        AS category_icon,
    st.name       AS status,
    p.name        AS priority,
    p.color       AS priority_color,
    r.submitted_at,
    r.verified_at,
    r.closed_at,
    i.incident_number,
    rl.address,
    rl.barangay_id,
    rl.latitude,
    rl.longitude,
    EXISTS (SELECT 1 FROM resolutions rs WHERE rs.incident_id = i.id) AS is_resolved,
    (SELECT count(*) FROM report_media m WHERE m.report_id = r.id)   AS media_count
FROM reports r
LEFT JOIN categories c         ON c.id  = r.category_id
LEFT JOIN incident_statuses st ON st.id = r.status_id
LEFT JOIN priorities p         ON p.id  = r.priority_id
LEFT JOIN incidents i          ON i.report_id = r.id
LEFT JOIN report_locations rl  ON rl.report_id = r.id;

-- 2 · BARANGAY PORTAL — review queue (submitted, awaiting review)
CREATE OR REPLACE VIEW v_barangay_review_queue WITH (security_invoker = true) AS
SELECT
    r.id,
    r.report_number,
    r.title,
    r.description,
    r.submitted_at,
    c.name  AS category,
    c.color AS category_color,
    rl.barangay_id,
    b.name  AS barangay,
    z.name  AS zone,
    rl.latitude,
    rl.longitude,
    u.first_name || ' ' || u.last_name AS resident_name,
    ai.analysis_type,
    ai.summary              AS ai_summary,
    (SELECT c2.name FROM categories c2 WHERE c2.id = ai.category_prediction) AS ai_category,
    (SELECT p2.name FROM priorities p2 WHERE p2.id = ai.priority_prediction) AS ai_priority,
    ai.confidence_score     AS ai_confidence,
    (SELECT p3.name FROM priorities p3
      WHERE p3.id = calculate_report_priority(r.id, NULL, ai.confidence_score)) AS suggested_priority,
    (SELECT count(*) FROM duplicate_matches dm
      WHERE dm.review_status = 'PENDING'
        AND (dm.report_id = r.id OR dm.matched_report_id = r.id)) AS pending_duplicate_flags
FROM reports r
JOIN incident_statuses st    ON st.id = r.status_id
LEFT JOIN categories c       ON c.id = r.category_id
LEFT JOIN report_locations rl ON rl.report_id = r.id
LEFT JOIN barangays b        ON b.id = rl.barangay_id
LEFT JOIN zones z            ON z.id = rl.zone_id
LEFT JOIN users u            ON u.id = r.resident_id
LEFT JOIN LATERAL (
    SELECT * FROM ai_analyses a
     WHERE a.report_id = r.id
     ORDER BY a.created_at DESC
     LIMIT 1
) ai ON TRUE
WHERE st.name IN ('SUBMITTED', 'UNDER_REVIEW');

-- 3 · BARANGAY PORTAL — incident operations board
CREATE OR REPLACE VIEW v_incident_board WITH (security_invoker = true) AS
SELECT
    i.id,
    i.incident_number,
    i.report_id,
    r.report_number,
    i.verified_at,
    i.assigned_at,
    i.resolved_at,
    i.closed_at,
    b.name  AS barangay,
    c.name  AS category,
    st.name AS status,
    p.name  AS priority,
    p.level AS priority_level,
    p.color AS priority_color,
    rl.latitude,
    rl.longitude,
    rl.address,
    (SELECT o.name FROM assignments a
       LEFT JOIN offices o ON o.id = a.office_id
      WHERE a.incident_id = i.id
      ORDER BY a.assigned_at DESC LIMIT 1) AS assigned_office,
    (SELECT u.first_name || ' ' || u.last_name FROM assignments a
       LEFT JOIN users u ON u.id = a.assigned_to
      WHERE a.incident_id = i.id
      ORDER BY a.assigned_at DESC LIMIT 1) AS assigned_personnel,
    -- SLA breach check against the priority's response target
    (p.response_target_minutes IS NOT NULL
     AND i.resolved_at IS NULL
     AND now() > i.verified_at + (p.response_target_minutes || ' minutes')::interval
    ) AS sla_breached
FROM incidents i
JOIN barangays b           ON b.id = i.barangay_id
LEFT JOIN reports r        ON r.id = i.report_id
LEFT JOIN categories c     ON c.id = i.category_id
LEFT JOIN incident_statuses st ON st.id = i.status_id
LEFT JOIN priorities p     ON p.id = i.priority_id
LEFT JOIN report_locations rl ON rl.id = i.location_id;

-- 4 · GIS DASHBOARD — hotspot map layer
CREATE OR REPLACE VIEW v_hotspot_map WITH (security_invoker = true) AS
SELECT
    h.id,
    b.name AS barangay,
    c.name AS category,
    c.color AS category_color,
    h.center_point,
    ST_X(h.center_point) AS longitude,
    ST_Y(h.center_point) AS latitude,
    h.radius_meters,
    h.incident_count,
    h.severity_score,
    h.calculated_at
FROM issue_hotspots h
JOIN barangays b   ON b.id = h.barangay_id
LEFT JOIN categories c ON c.id = h.category_id
ORDER BY h.severity_score DESC NULLS LAST;

-- 5 · ANALYTICS — barangay performance summary (last 30 days)
CREATE OR REPLACE VIEW v_barangay_performance WITH (security_invoker = true) AS
SELECT
    b.id   AS barangay_id,
    b.name AS barangay,
    count(DISTINCT i.id)                                        AS total_incidents,
    count(DISTINCT i.id) FILTER (WHERE i.resolved_at IS NOT NULL) AS resolved,
    count(DISTINCT i.id) FILTER (WHERE pr.level = 1)            AS critical,
    round(avg(EXTRACT(EPOCH FROM (i.resolved_at - i.verified_at)) / 60)
              FILTER (WHERE i.resolved_at IS NOT NULL), 1)      AS avg_resolution_minutes,
    (SELECT round(avg(f.rating), 2) FROM feedback f
       JOIN incidents i2 ON i2.id = f.incident_id
      WHERE i2.barangay_id = b.id)                              AS avg_resident_rating
FROM barangays b
LEFT JOIN incidents i  ON i.barangay_id = b.id
    AND i.created_at >= now() - interval '30 days'
LEFT JOIN priorities pr ON pr.id = i.priority_id
GROUP BY b.id, b.name;

-- 6 · AUDIT — human-readable status-change trail
CREATE OR REPLACE VIEW v_audit_status_changes WITH (security_invoker = true) AS
SELECT
    a.created_at,
    a.action,
    u.first_name || ' ' || u.last_name AS actor,
    a.entity_type,
    a.entity_id,
    a.old_values->>'status_id' AS old_status_id,
    (SELECT s1.name FROM incident_statuses s1
      WHERE s1.id::text = a.old_values->>'status_id') AS old_status,
    (SELECT s2.name FROM incident_statuses s2
      WHERE s2.id::text = a.new_values->>'status_id') AS new_status,
    a.ip_address
FROM audit_logs a
LEFT JOIN users u ON u.id = a.user_id
WHERE a.entity_type IN ('incidents', 'reports')
  AND a.old_values->>'status_id' IS DISTINCT FROM a.new_values->>'status_id'
ORDER BY a.created_at DESC;
