-- =============================================================
-- 02 · Geography — the GIS backbone
-- All boundaries use SRID 4326 (WGS 84). Distances in meters
-- must go through geography casts.
-- =============================================================

CREATE TABLE provinces (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(150) NOT NULL,
    code       VARCHAR(20) UNIQUE,              -- PSGC code
    boundary   GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cities_municipalities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    province_id UUID NOT NULL REFERENCES provinces(id) ON DELETE RESTRICT,
    name        VARCHAR(150) NOT NULL,
    code        VARCHAR(20) UNIQUE,             -- PSGC code
    type        VARCHAR(30) NOT NULL DEFAULT 'CITY',   -- CITY | MUNICIPALITY
    boundary    GEOMETRY(MultiPolygon, 4326),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (province_id, name)
);

CREATE TABLE barangays (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_municipality_id  UUID NOT NULL REFERENCES cities_municipalities(id) ON DELETE RESTRICT,
    name                  VARCHAR(150) NOT NULL,
    code                  VARCHAR(20),           -- PSGC code
    boundary              GEOMETRY(MultiPolygon, 4326),
    center_point          GEOMETRY(Point, 4326),
    population            INTEGER,
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (city_municipality_id, name)
);

-- Optional subdivision within a barangay (purok / zone / Sitio)
CREATE TABLE zones (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barangay_id UUID NOT NULL REFERENCES barangays(id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    code        VARCHAR(20),
    boundary    GEOMETRY(MultiPolygon, 4326),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (barangay_id, name)
);
