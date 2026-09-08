# Database

SQL source for the AI Barangay Problem Mapper (Tagum City · Davao del Norte).

## Layout

| Folder | Purpose |
|---|---|
| `schema/` | Tables, one file per domain, numbered in apply order (00–15) |
| `seeds/` | Idempotent seed data (roles, categories, statuses, demo rows) |
| `functions/` | SQL functions (report numbering, priority, distance, hotspots) |
| `triggers/` | Trigger definitions and bindings |
| `views/` | Convenience views for each portal |
| `indexes/` | Performance indexes |
| `migrations/` | Incremental migration history (alternative to running `schema/` fresh) |
| `policies/` | Row-level security policies / grants |
| `docs/` | ERD, architecture, data dictionary, security notes |

## Apply order (fresh install)

```
schema/00…15  →  functions/  →  triggers/  →  views/  →  indexes/  →  policies/  →  seeds/
```

Or just run the installer:

```bash
# Node installer (no psql required — uses the pg driver in backend/):
#   .env needs ADMIN_DATABASE_URL (postgres) + APP_DB_PASSWORD for the app_user role.
node backend/scripts/apply.mjs

# With psql available (Supabase): paste the connection string from
# Project Settings → Database → Connection string (Session pooler).
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres" ./database/apply.sh

# Local Postgres (creates/uses the aibarangay database):
DB_NAME=aibarangay ./database/apply.sh
```

Options: `SKIP_DEMO=1` omits demo rows · `SKIP_POLICY=1` omits RLS/grants
(apply.sh only).

**Supabase notes:**
- The direct `db.<ref>.supabase.co:5432` host is **IPv6-only** — from
  IPv4-only networks (WSL2, most home ISPs) use the **session pooler**
  (`aws-0-<region>.pooler.supabase.com:5432`, username
  `postgres.<project-ref>`).
- Supabase's `postgres` role has `BYPASSRLS`, so the API connects as a
  dedicated `app_user` role (created by `policies/rls.sql`, password set
  by the installer from `APP_DB_PASSWORD`) — the FORCE RLS policies
  genuinely bind it. `ADMIN_DATABASE_URL` (postgres) is for the installer
  and maintenance jobs only.

The transaction pooler (`:6543`) also works — every API query runs inside a
transaction, so the `SET LOCAL request.*` session context is pooler-safe.

Requires **PostgreSQL 15+** (views use `security_invoker`) with **PostGIS 3+**.
Supabase satisfies both.

For existing installs, apply `migrations/` in numeric order instead.

## What's inside

**Schema (apply order):**

| File | Contents |
|---|---|
| `00_extensions.sql` | PostGIS, pgcrypto, citext + shared ENUM types |
| `01_rbac.sql` | `roles`, `permissions`, `role_permissions` |
| `02_geography.sql` | `provinces` → `cities_municipalities` → `barangays` → `zones` (PostGIS boundaries, SRID 4326) |
| `03_users.sql` | `users`, `user_sessions` |
| `04_lookups.sql` | `incident_statuses`, `priorities`, `categories` |
| `05_offices.sql` | `offices` (routing targets) |
| `06_reports.sql` | `reports`, `report_locations`, `report_media` |
| `07_ai.sql` | `ai_analyses`, `ai_insights` |
| `08_duplicates.sql` | `duplicate_matches` |
| `09_incidents.sql` | `incidents` (verified reports) |
| `10_assignments.sql` | `assignments`, `tasks` |
| `11_field.sql` | `field_updates`, `evidence`, `resolutions`, `feedback` |
| `12_notifications.sql` | `notifications` |
| `13_audit.sql` | `audit_logs` |
| `14_analytics.sql` | `incident_statistics`, `issue_hotspots` |
| `15_settings.sql` | `system_settings` |

**Key functions:**

- `generate_report_number()` / `generate_incident_number()` — auto `RPT-2026-000001` / `INC-2026-000001` via triggers
- `calculate_report_priority(report_id, category_id?, ai_confidence?)` — 0–100 severity score → CRITICAL/HIGH/MEDIUM/LOW suggestion (decision support only; reviewers can override)
- `find_nearby_reports(report_id, radius_m, max_age_days)` — duplicate-detection candidates via `ST_DWithin`
- `distance_between(lat1, lon1, lat2, lon2)` — meters
- `refresh_incident_statistics(date)` / `refresh_issue_hotspots(barangay_id, …)` — nightly analytics jobs (`ST_ClusterDBSCAN`)
- `get_setting(key)` — typed settings lookup

**Views:** `v_resident_reports`, `v_barangay_review_queue` (with AI + priority suggestions), `v_incident_board` (SLA breach flags), `v_hotspot_map`, `v_barangay_performance`, `v_audit_status_changes`.

**RLS** (`policies/rls.sql`): the app connects as `app_user` and sets `request.user_id` / `request.role_name` / `request.barangay_id` per transaction (`SET LOCAL`). Residents see only their own reports/notifications; staff are scoped to their barangay; LGU/SYSTEM_ADMIN see all. Read-only `bi_reader` role for dashboards.

## Conventions

- Every table has `id`, `created_at`, `updated_at` unless noted.
- `functions/update_updated_at.sql` is attached by the triggers, not called manually.
- Seeds must be safe to re-run (use `ON CONFLICT DO NOTHING`).
- The audit trigger reads `request.user_id` / `request.ip_address` session variables — the application must set them inside each transaction for a complete trail.
- `policies/rls.sql` grants to `app_user` and `bi_reader` — create these roles first:
  ```sql
  CREATE ROLE app_user LOGIN PASSWORD '…';
  CREATE ROLE bi_reader LOGIN PASSWORD '…';
  ```

## Demo data

`seeds/05_demo.sql` creates demo users across all seven roles (password
`Password123!`), three reports with locations, one AI analysis, a pending
duplicate flag, and notifications. **Never run this in production** — it exists
so the portals have data to render immediately after a fresh install.
