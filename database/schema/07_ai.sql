-- =============================================================
-- 07 · AI layer — decision support, never the final authority
-- =============================================================

-- One analysis per model run over a report
CREATE TABLE ai_analyses (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id            UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    model_name           VARCHAR(120) NOT NULL,
    model_version        VARCHAR(60),
    analysis_type        analysis_type NOT NULL,          -- TEXT | IMAGE | LOCATION | COMBINED
    category_prediction  UUID REFERENCES categories(id) ON DELETE SET NULL,
    priority_prediction  UUID REFERENCES priorities(id) ON DELETE SET NULL,
    summary              TEXT,
    confidence_score     DOUBLE PRECISION CHECK (confidence_score BETWEEN 0 AND 1),
    reasoning            JSONB NOT NULL DEFAULT '{}',
    detected_objects     JSONB NOT NULL DEFAULT '[]',     -- image model output
    detected_keywords    JSONB NOT NULL DEFAULT '[]',     -- text model output
    location_analysis    JSONB NOT NULL DEFAULT '{}',     -- barangay/hotspot/cluster result
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_analyses_report ON ai_analyses(report_id, created_at DESC);

-- Narrative insights for the dashboard, e.g.
-- "Flooding reports increased 42% in Zone 3 over the last 30 days."
CREATE TABLE ai_insights (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barangay_id      UUID REFERENCES barangays(id) ON DELETE CASCADE,
    insight_type     VARCHAR(50) NOT NULL,               -- TREND | HOTSPOT | ANOMALY | FORECAST
    title            VARCHAR(200) NOT NULL,
    description      TEXT NOT NULL,
    severity         VARCHAR(20) NOT NULL DEFAULT 'INFO',
    supporting_data  JSONB NOT NULL DEFAULT '{}',
    recommendation   TEXT,
    generated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
