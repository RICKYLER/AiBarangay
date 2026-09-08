-- =============================================================
-- 11 · Field response, evidence, resolution, feedback
-- =============================================================

-- Live updates from barangay personnel in the field
CREATE TABLE field_updates (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id  UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    personnel_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    update_type  update_type NOT NULL,               -- EN_ROUTE, ARRIVED, INSPECTING, WORK_STARTED, WORK_COMPLETED, NOTE
    notes        TEXT,
    location     GEOMETRY(Point, 4326),
    latitude     DOUBLE PRECISION,
    longitude    DOUBLE PRECISION,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Proof captured by personnel: before / during / after
CREATE TABLE evidence (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id   UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    submitted_by  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    evidence_type evidence_type NOT NULL,
    file_url      TEXT NOT NULL,
    description   TEXT,
    location      GEOMETRY(Point, 4326),
    captured_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- What was done to close the incident
CREATE TABLE resolutions (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id      UUID NOT NULL UNIQUE REFERENCES incidents(id) ON DELETE CASCADE,
    resolved_by      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    resolution_type  resolution_type NOT NULL,
    description      TEXT,
    action_taken     TEXT,
    cost             NUMERIC(12, 2),
    completion_date  DATE,
    evidence_id      UUID REFERENCES evidence(id) ON DELETE SET NULL,
    verified_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Resident rates the resolved incident
CREATE TABLE feedback (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id       UUID NOT NULL UNIQUE REFERENCES incidents(id) ON DELETE CASCADE,
    resident_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    rating            SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment           TEXT,
    satisfaction_level VARCHAR(20),                 -- VERY_SATISFIED | SATISFIED | NEUTRAL | DISSATISFIED
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_field_updates_incident ON field_updates(incident_id, created_at);
CREATE INDEX idx_evidence_incident      ON evidence(incident_id);
