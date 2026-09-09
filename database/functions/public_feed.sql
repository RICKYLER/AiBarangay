-- =============================================================
-- Public community news feed
--
-- GET /api/gis/public-feed calls these with NO user context
-- (anonymous visitors), while reports/incidents sit behind FORCE
-- ROW LEVEL SECURITY. Same sanctioned-public-read pattern as
-- public_map.sql: SECURITY DEFINER, anonymized columns only —
-- no resident ids, no names, no titles, no descriptions, no
-- exact addresses. Unlike the map layer, RESOLVED/CLOSED
-- incidents are INCLUDED: the feed tells the story of community
-- problems from submission to completion.
-- =============================================================

CREATE OR REPLACE FUNCTION get_public_feed(p_limit INT DEFAULT 24, p_filter TEXT DEFAULT 'ALL')
RETURNS TABLE (
    item_type           VARCHAR,       -- REPORT (new) | INCIDENT (verified+)
    ref_number          VARCHAR,       -- RPT-… / INC-…
    category            VARCHAR,
    category_color      VARCHAR,
    priority            VARCHAR,
    status              VARCHAR,
    barangay            VARCHAR,
    zone                VARCHAR,
    occurred_at         TIMESTAMPTZ,   -- submitted / verified / resolved moment
    resolved_at         TIMESTAMPTZ,
    office              VARCHAR,       -- office currently owning the incident
    resolution_summary  TEXT           -- anonymized "what was done"
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH feed AS (
        -- A · Fresh resident reports (submitted / under review)
        SELECT 'REPORT'::text       AS item_type,
               r.report_number      AS ref_number,
               c.name               AS category,
               c.color              AS category_color,
               NULL::varchar        AS priority,
               st.name              AS status,
               b.name               AS barangay,
               z.name               AS zone,
               r.submitted_at       AS occurred_at,
               NULL::timestamptz    AS resolved_at,
               NULL::varchar        AS office,
               NULL::text           AS resolution_summary
          FROM reports r
          JOIN incident_statuses st ON st.id = r.status_id
          LEFT JOIN categories c         ON c.id  = r.category_id
          LEFT JOIN report_locations rl  ON rl.report_id = r.id
          LEFT JOIN barangays b          ON b.id  = rl.barangay_id
          LEFT JOIN zones z              ON z.id  = rl.zone_id
         WHERE st.name IN ('SUBMITTED', 'UNDER_REVIEW')

        UNION ALL

        -- B · Incidents — every public stage from VERIFIED through
        -- RESOLVED/CLOSED. Rejected/cancelled/duplicate work is
        -- internal and is not advertised in the feed.
        SELECT 'INCIDENT'::text      AS item_type,
               i.incident_number     AS ref_number,
               c.name                AS category,
               c.color               AS category_color,
               p.name                AS priority,
               st.name               AS status,
               b.name                AS barangay,
               z.name                AS zone,
               GREATEST(i.verified_at, COALESCE(i.resolved_at, i.closed_at)) AS occurred_at,
               i.resolved_at         AS resolved_at,
               (SELECT o.name FROM assignments a
                  LEFT JOIN offices o ON o.id = a.office_id
                 WHERE a.incident_id = i.id
                 ORDER BY a.assigned_at DESC LIMIT 1)          AS office,
               COALESCE(rs.action_taken, rs.description)      AS resolution_summary
          FROM incidents i
          JOIN incident_statuses st ON st.id = i.status_id
          LEFT JOIN categories c         ON c.id  = i.category_id
          LEFT JOIN priorities p         ON p.id  = i.priority_id
          LEFT JOIN barangays b          ON b.id  = i.barangay_id
          LEFT JOIN report_locations rl  ON rl.id = i.location_id
          LEFT JOIN zones z              ON z.id  = rl.zone_id
          LEFT JOIN resolutions rs       ON rs.incident_id = i.id
         WHERE st.name NOT IN ('REJECTED', 'CANCELLED', 'DUPLICATE')
           AND (
                 -- ACTIVE: still being worked on
                 (p_filter = 'ACTIVE' AND i.resolved_at IS NULL AND i.closed_at IS NULL)
                 -- RESOLVED: the completed stories
              OR (p_filter = 'RESOLVED' AND (i.resolved_at IS NOT NULL OR i.closed_at IS NOT NULL))
              OR (p_filter NOT IN ('ACTIVE', 'RESOLVED', 'NEW'))
           )
    )
    SELECT item_type, ref_number, category, category_color, priority,
           status, barangay, zone, occurred_at, resolved_at,
           office, resolution_summary
      FROM feed
     WHERE (p_filter <> 'NEW' OR item_type = 'REPORT')
     ORDER BY occurred_at DESC NULLS LAST
     LIMIT GREATEST(1, LEAST(p_limit, 50))
$$;

-- Header stat strip for the news page: same anonymized aggregates.
CREATE OR REPLACE FUNCTION get_public_feed_stats()
RETURNS TABLE (
    new_reports_7d  BIGINT,
    active_incidents BIGINT,
    resolved_total   BIGINT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        (SELECT count(*) FROM reports r
           JOIN incident_statuses st ON st.id = r.status_id
          WHERE st.name IN ('SUBMITTED', 'UNDER_REVIEW')
            AND r.submitted_at >= now() - interval '7 days')          AS new_reports_7d,
        (SELECT count(*) FROM incidents i
           JOIN incident_statuses st ON st.id = i.status_id
          WHERE i.resolved_at IS NULL AND i.closed_at IS NULL
            AND st.name NOT IN ('REJECTED', 'CANCELLED', 'DUPLICATE')) AS active_incidents,
        (SELECT count(*) FROM incidents i
          WHERE i.resolved_at IS NOT NULL OR i.closed_at IS NOT NULL)   AS resolved_total;
$$;

-- Revoke direct execution from non-granted roles; the app role
-- gets EXECUTE through policies/rls.sql's blanket grant — but
-- functions applied AFTER that script ran need the explicit
-- grant here, so the two stay in sync on fresh and existing
-- databases alike.
REVOKE EXECUTE ON FUNCTION get_public_feed(INT, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION get_public_feed_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_public_feed(INT, TEXT) TO app_user;
GRANT EXECUTE ON FUNCTION get_public_feed_stats() TO app_user;
