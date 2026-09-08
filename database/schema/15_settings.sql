-- =============================================================
-- 15 · System settings
-- =============================================================

CREATE TABLE system_settings (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key   VARCHAR(100) NOT NULL UNIQUE,   -- 'ai.confidence_threshold', 'uploads.max_size_mb' …
    setting_value JSONB NOT NULL,
    description   TEXT,
    updated_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
