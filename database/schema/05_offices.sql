-- =============================================================
-- 05 · Offices / departments (routing targets)
-- =============================================================

CREATE TABLE offices (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barangay_id    UUID REFERENCES barangays(id) ON DELETE CASCADE,
    name           VARCHAR(150) NOT NULL,
    description    TEXT,
    office_type    office_type NOT NULL DEFAULT 'BARANGAY_OFFICE',
    contact_number VARCHAR(30),
    email          CITEXT,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT offices_scope CHECK (barangay_id IS NOT NULL OR office_type <> 'BARANGAY_OFFICE')
    -- city-level offices (Engineering, DRRMO …) have NULL barangay_id
);
