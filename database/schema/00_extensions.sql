-- =============================================================
-- 00 · Extensions & shared types
-- AI Barangay Problem Mapper · PostgreSQL 14+ / PostGIS 3+
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS citext;

-- Shared ENUM types ---------------------------------------------------------

CREATE TYPE media_type       AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');
CREATE TYPE report_source    AS ENUM ('WEB_PORTAL', 'MOBILE_APP', 'SMS', 'WALK_IN', 'HOTLINE');
CREATE TYPE analysis_type    AS ENUM ('TEXT', 'IMAGE', 'LOCATION', 'COMBINED');
CREATE TYPE match_type       AS ENUM ('TEXT', 'IMAGE', 'LOCATION', 'TIME', 'COMBINED');
CREATE TYPE review_status    AS ENUM ('PENDING', 'CONFIRMED', 'DISMISSED');
CREATE TYPE update_type      AS ENUM ('EN_ROUTE', 'ARRIVED', 'INSPECTING', 'WORK_STARTED', 'WORK_COMPLETED', 'NOTE', 'STATUS_CHANGE');
CREATE TYPE evidence_type    AS ENUM ('BEFORE_PHOTO', 'DURING_PHOTO', 'AFTER_PHOTO', 'INSPECTION_DOC', 'COMPLETION_PROOF', 'OTHER');
CREATE TYPE resolution_type  AS ENUM ('REPAIRED', 'REPLACED', 'CLEARED', 'REMOVED', 'REFERRED', 'NO_ACTION_NEEDED');
CREATE TYPE notification_type AS ENUM ('REPORT_RECEIVED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'FIELD_RESPONSE', 'RESOLVED', 'REJECTED', 'DUPLICATE', 'SYSTEM');
CREATE TYPE office_type      AS ENUM ('BARANGAY_OFFICE', 'ENGINEERING', 'PUBLIC_WORKS', 'DRRMO', 'SANITATION', 'ENVIRONMENT', 'WATER_SERVICES', 'OTHER');
CREATE TYPE assignment_status AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE task_status      AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
