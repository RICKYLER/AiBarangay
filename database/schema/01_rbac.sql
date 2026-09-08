-- =============================================================
-- 01 · Roles & permissions (RBAC)
-- =============================================================

CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL UNIQUE,   -- e.g. 'reports.create'
    description TEXT,
    module      VARCHAR(50) NOT NULL,           -- reports | users | analytics | barangay | incidents
    action      VARCHAR(50) NOT NULL,           -- create | view | verify | assign | resolve | manage | export
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE role_permissions (
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (role_id, permission_id)
);

-- Possible roles: RESIDENT, BARANGAY_ADMIN, BARANGAY_STAFF, FIELD_PERSONNEL,
--                 OFFICE_HEAD, LGU_ADMIN, SYSTEM_ADMIN  (seeded in seeds/01_roles.sql)
