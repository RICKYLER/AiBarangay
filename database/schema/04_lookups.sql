-- =============================================================
-- 04 · Lookup tables — statuses, priorities, categories
-- =============================================================

-- Workflow: SUBMITTED → UNDER REVIEW → VERIFIED → ASSIGNED →
--           FIELD RESPONSE → RESOLVED → CLOSED
-- Branches: REJECTED, DUPLICATE, REOPENED, CANCELLED
CREATE TABLE incident_statuses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL UNIQUE,    -- SUBMITTED, UNDER_REVIEW, VERIFIED, ...
    description TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_terminal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CRITICAL / HIGH / MEDIUM / LOW
CREATE TABLE priorities (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(30) NOT NULL UNIQUE,
    level                   INTEGER NOT NULL UNIQUE,   -- 1 = CRITICAL … 4 = LOW
    description             TEXT,
    color                   VARCHAR(20),               -- hex, e.g. '#dc2626'
    response_target_minutes INTEGER,                   -- SLA target
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Flooding, Road Damage, Garbage, Streetlight, Water Supply, Drainage,
-- Public Safety, Traffic, Noise, Illegal Dumping, Infrastructure, Other
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(80) NOT NULL UNIQUE,
    description TEXT,
    icon        VARCHAR(60),                      -- icon name for the front-end
    color       VARCHAR(20),                      -- hex, e.g. '#2563eb'
    department  VARCHAR(80),                      -- default responsible office
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
