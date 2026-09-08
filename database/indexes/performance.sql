-- =============================================================
-- Performance indexes (GiST for PostGIS, GIN for JSONB search)
-- Table-level BTrees live next to their schema files; the heavy
-- GIS and full-text indexes are consolidated here.
-- =============================================================

-- ── PostGIS spatial ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_barangays_boundary       ON barangays USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_barangays_center         ON barangays USING GIST (center_point);
CREATE INDEX IF NOT EXISTS idx_cm_boundary              ON cities_municipalities USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_zones_boundary           ON zones USING GIST (boundary);
CREATE INDEX IF NOT EXISTS idx_report_locations_point   ON report_locations USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_field_updates_location   ON field_updates USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_evidence_location        ON evidence USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_issue_hotspots_center    ON issue_hotspots USING GIST (center_point);

-- Composite index for "open reports near a point" lookups
-- (note: index predicates must be IMMUTABLE, so no now()-based filters here)
CREATE INDEX IF NOT EXISTS idx_report_locations_created
    ON report_locations (created_at DESC);

-- ── JSONB ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_audit_logs_new_values    ON audit_logs USING GIN (new_values);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_reasoning    ON ai_analyses USING GIN (reasoning);
CREATE INDEX IF NOT EXISTS idx_report_media_metadata    ON report_media USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_system_settings_value    ON system_settings USING GIN (setting_value);

-- ── Report text search (duplicate detection + search) ──────
CREATE INDEX IF NOT EXISTS idx_reports_search
    ON reports
    USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- ── Hotspot / analytics lookups ────────────────────────────
CREATE INDEX IF NOT EXISTS idx_incident_statistics_date ON incident_statistics (date DESC);
CREATE INDEX IF NOT EXISTS idx_issue_hotspots_severity  ON issue_hotspots (severity_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_ai_insights_generated    ON ai_insights (generated_at DESC);
