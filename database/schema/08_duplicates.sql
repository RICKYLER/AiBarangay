-- =============================================================
-- 08 · Duplicate detection
-- Report A ──92% similar──▶ Report B
-- =============================================================

CREATE TABLE duplicate_matches (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id          UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    matched_report_id  UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    similarity_score   DOUBLE PRECISION NOT NULL CHECK (similarity_score BETWEEN 0 AND 1),
    match_type         match_type NOT NULL,              -- TEXT | IMAGE | LOCATION | TIME | COMBINED
    ai_confidence      DOUBLE PRECISION,
    review_status      review_status NOT NULL DEFAULT 'PENDING',
    reviewed_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at        TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT duplicate_no_self CHECK (report_id <> matched_report_id),
    CONSTRAINT duplicate_pair_unique UNIQUE (report_id, matched_report_id)
);

CREATE INDEX idx_duplicate_matches_report ON duplicate_matches(report_id) WHERE review_status = 'PENDING';
CREATE INDEX idx_duplicate_matches_matched ON duplicate_matches(matched_report_id);
