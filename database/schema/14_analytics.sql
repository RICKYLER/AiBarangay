-- =============================================================
-- 14 · Analytics — statistics & GIS hotspots
-- =============================================================

-- Pre-aggregated daily stats per barangay × category
CREATE TABLE incident_statistics (
    id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barangay_id               UUID NOT NULL REFERENCES barangays(id) ON DELETE CASCADE,
    category_id               UUID REFERENCES categories(id) ON DELETE CASCADE,
    date                      DATE NOT NULL,
    total_reports             INTEGER NOT NULL DEFAULT 0,
    verified_reports          INTEGER NOT NULL DEFAULT 0,
    resolved_reports          INTEGER NOT NULL DEFAULT 0,
    average_resolution_minutes NUMERIC(10, 2),
    critical_reports          INTEGER NOT NULL DEFAULT 0,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (barangay_id, category_id, date)
);

-- Clustered problem areas for the GIS dashboard
CREATE TABLE issue_hotspots (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barangay_id    UUID NOT NULL REFERENCES barangays(id) ON DELETE CASCADE,
    category_id    UUID REFERENCES categories(id) ON DELETE CASCADE,
    center_point   GEOMETRY(Point, 4326) NOT NULL,
    radius_meters  DOUBLE PRECISION NOT NULL DEFAULT 100,
    incident_count INTEGER NOT NULL DEFAULT 0,
    severity_score NUMERIC(6, 3),               -- 0–100, weighted by priority + recency
    calculated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incident_statistics_lookup ON incident_statistics(barangay_id, date DESC);
CREATE INDEX idx_issue_hotspots_barangay    ON issue_hotspots(barangay_id, calculated_at DESC);
