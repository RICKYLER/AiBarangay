# Entity-Relationship Diagram — AI Barangay Problem Mapper

Generated from `database/schema/`. All PKs are UUIDs (`uuid-ossp`) unless
noted; all tables carry `created_at` / `updated_at`.

```mermaid
erDiagram
    roles ||--o{ users : "role_id"
    barangays ||--o{ users : "home barangay"
    barangays ||--o{ zones : "has"
    provinces ||--o{ cities : "contains"
    cities ||--o{ barangays : "contains"

    users ||--o{ reports : "submits"
    users ||--o{ user_sessions : "authenticates via"
    users ||--o{ notifications : "receives"
    users ||--o{ audit_logs : "acts (recorded in)"

    categories ||--o{ reports : "classifies"
    incident_statuses ||--o{ reports : "status_id"
    priorities ||--o{ reports : "priority_id"
    reports ||--|| report_locations : "geo (1:1)"
    barangays ||--o{ report_locations : "auto-detected by trigger"
    zones ||--o{ report_locations : "optional"
    reports ||--o{ report_media : "evidence photos"
    users ||--o{ report_media : "uploads"

    reports ||--o| incidents : "verified → becomes"
    incidents }o--|| incident_statuses : "status"
    incidents }o--|| priorities : "priority"
    incidents ||--o{ assignments : "routed by"
    offices ||--o{ assignments : "assigned to"
    users ||--o{ assignments : "assigned personnel"
    assignments ||--o{ tasks : "broken into"
    incidents ||--o{ field_updates : "progress log"
    users ||--o{ field_updates : "posted by"
    incidents ||--o{ evidence : "verification proof"
    incidents ||--o{ resolutions : "outcome"
    users ||--o{ resolutions : "resolved by"
    reports ||--o{ feedback : "resident rates"

    reports ||--o{ ai_analyses : "AI decision-support"
    reports ||--o{ duplicate_matches : "near-duplicate candidates"
    reports ||--o{ duplicate_matches : "matched against"

    barangays ||--o{ issue_hotspots : "clustered (PostGIS)"
    barangays ||--o{ incident_statistics : "daily rollup"
```

## Core tables

| Area | Tables |
|---|---|
| RBAC | `roles`, `permissions`, `role_permissions`, `users`, `user_sessions` |
| Geography | `provinces`, `cities`, `barangays` (PostGIS `center_point`, `boundary`), `zones` |
| Reports | `reports` (RPT-YYYY-NNNNNN), `report_locations` (PostGIS point, lat/lng), `report_media` |
| Incidents | `incidents` (INC-YYYY-NNNNNN), `assignments`, `tasks`, `field_updates`, `evidence`, `resolutions`, `feedback` |
| AI layer | `ai_analyses` (decision support only), `ai_insights`, `duplicate_matches` |
| Org | `offices` |
| Ops | `notifications`, `audit_logs` |
| Analytics | `incident_statistics`, `issue_hotspots` |
| Config | `system_settings` (key-value) |

## Key invariants

- **`report_locations.location`** is derived: the app writes lat/lng and the
  `sync_report_location_geometry()` trigger builds the PostGIS point and
  auto-detects the barangay (boundary match, else nearest center).
- **Report → incident is 1:0..1**; incident status changes mirror onto the
  report by trigger, and the numbering triggers mint `RPT-`/`INC-` numbers.
- **`ai_analyses` is advisory**: no trigger or policy lets AI change a
  report's status — only staff actions do.
- **Views** (`v_resident_reports`, `v_barangay_review_queue`,
  `v_incident_board`, `v_hotspot_map`, `v_barangay_performance`,
  `v_audit_status_changes`) are `WITH (security_invoker = true)` so RLS
  applies through them.
- **RLS** on reports/media/incidents/assignments/tasks/field updates/
  evidence/resolutions/feedback/notifications/duplicate matches — driven by
  `request.user_id` / `request.role_name` / `request.barangay_id` session
  variables set per transaction by the API.

See `database/schema/*.sql` for full column definitions and
`database/policies/rls.sql` for the policy matrix.
