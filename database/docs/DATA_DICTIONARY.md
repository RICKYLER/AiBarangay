# Data Dictionary

One section per table: purpose, columns, types, constraints, and which portal reads/writes it.

## conventions

- `id` — uuid primary key (or bigserial where sequence-friendly)
- `created_at` / `updated_at` — timestamptz, maintained by `update_updated_at()` trigger
- `*_id` — foreign keys
- boolean flags are `is_*` (e.g. `is_demo`, `is_anonymized`)

## TODO per table

| Table | File | Portal usage |
|---|---|---|
| users | schema/01 | all |
| roles / permissions | schema/02–03 | admin |
| barangays / zones | schema/04 | all (read) |
| categories | schema/05 | all (read), admin (write) |
| priorities | schema/06 | read |
| statuses | schema/07 | read |
| reports | schema/08 | resident (create/read own), admin (read/update) |
| report_media | schema/09 | resident (create), public (read, anonymized) |
| report_locations | schema/10 | resident (create), maps (read) |
| incidents | schema/11 | admin, resident (linked status) |
| offices | schema/12 | admin |
| assignments / tasks | schema/13–14 | admin, field teams |
| field_updates / evidence | schema/15–16 | field teams (create), all (read) |
| resolutions / feedback | schema/17–18 | admin, resident |
| notifications | schema/19 | per-user |
| ai_analyses / duplicate_matches / ai_insights | schema/20–22 | admin |
| analytics | schema/23 | admin dashboards |
| audit_logs | schema/24 | admin (read-only) |
| system_settings | schema/25 | admin |

TODO: fill in full column lists once tables are written.
