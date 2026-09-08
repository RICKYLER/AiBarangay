# Database Architecture

How the SQL in this folder fits together.

## Layers

1. **Identity** — users, roles, permissions (`schema/01–03`). Auth lives in the app (Supabase Auth / JWT); these tables carry profile and authorization data only.
2. **Reference data** — barangays/zones, categories, priorities, statuses, offices (`schema/04–07`, `schema/12`). Seeded once, changed rarely.
3. **Citizen pipeline** — reports, report_media, report_locations (`schema/08–10`).
4. **Operations** — incidents, assignments, tasks, field_updates, evidence, resolutions, feedback (`schema/11, 13–18`).
5. **Intelligence** — ai_analyses, duplicate_matches, ai_insights (`schema/20–22`).
6. **Platform** — notifications, analytics, audit_logs, system_settings (`schema/19, 23–25`).

## The civic loop, in tables

resident submits → `reports` (status: Submitted)
→ AI triage writes `ai_analyses` + `duplicate_matches`
→ official verifies → `incidents` created, duplicate reports linked to it
→ `assignments` to an office → `tasks` + `field_updates` + `evidence`
→ `resolutions` closes the incident → `notifications` to reporters → `feedback`

## Two apply paths

- **Fresh installs:** run `schema/` in numeric order, then `functions/`, `triggers/`, `views/`, `indexes/`, `policies/`, `seeds/`.
- **Existing installs:** run `migrations/` in numeric order instead.

TODO: describe hosting choice (Supabase vs plain Postgres) and CI apply script.
