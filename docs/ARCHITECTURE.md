# System Architecture — AI Barangay Problem Mapper

```
┌────────────────────────────┐
│  FRONTEND                  │
│  Next.js 15 (App Router)   │
│  React 18 · TypeScript     │
│  Leaflet (dynamic, CSR)    │
│  localhost:3000            │
└─────────────┬──────────────┘
              │  /api/*  +  /uploads/*   (Next rewrites → :4000)
              │  httpOnly cookie aibp_session
┌─────────────▼──────────────┐
│  API LAYER                 │
│  Express 5 (ESM)           │
│  localhost:4000            │
│  ├─ modules/auth           │
│  ├─ modules/lookups        │
│  ├─ modules/reports        │
│  ├─ modules/barangay       │
│  ├─ modules/gis            │
│  ├─ modules/notifications  │
│  └─ modules/ai (analyzer)  │
└─────────────┬──────────────┘
              │  pg Pool · one transaction per request
              │  SET LOCAL request.user_id / role_name / barangay_id
┌─────────────▼──────────────┐
│  DATABASE                  │
│  PostgreSQL 15+ / PostGIS  │
│  (Supabase)                │
│  · Row-Level Security      │
│  · security_invoker views  │
│  · triggers + audit log    │
└────────────────────────────┘
```

## Directories

```
frontend/    Next.js app (app/, components/, hooks/, lib/, types/, styles/)
backend/     Express API (src/config, src/middleware, src/modules/*, src/mailer.js)
             uploads/ — evidence photos (object storage later)
database/    SQL, applied in order by apply.sh:
             schema/ → functions/ → triggers/ → views/ → indexes/ →
             policies/ → migrations/ → seeds/
docs/        API.md · ARCHITECTURE.md (this file) · ERD.md
.env         secrets (never committed) — see .env.example
```

## The request lifecycle (why RLS "just works")

1. Browser sends a request with the `aibp_session` httpOnly cookie.
2. Next.js rewrites `/api/*` to the Express backend (no CORS in dev).
3. `withUser()` (backend/src/config/db.js) opens a transaction, resolves
   the cookie → `user_sessions.token_hash` → user, then issues
   `SET LOCAL request.user_id / request.role_name / request.barangay_id`.
   `SET LOCAL` is transaction-scoped, so this is safe with Supabase
   connection pooling (session or transaction mode).
4. Every query the controller runs is now subject to the RLS policies in
   `database/policies/rls.sql` — residents see their own rows, staff see
   their barangay's, admins see all. Views are `security_invoker` so they
   cannot be used to bypass policies.
5. Commit / rollback. The audit trigger stamps `audit_logs` with the same
   session variables.

## Incident workflow

```
SUBMITTED → UNDER REVIEW → VERIFIED → ASSIGNED → FIELD RESPONSE → RESOLVED → CLOSED
                │                                              (terminal: REJECTED, DUPLICATE)
                └─ barangay reviewer's decision (AI is advisory only)
```

- Reports get `RPT-YYYY-NNNNNN` numbers, incidents `INC-YYYY-NNNNNN`
  (sequence triggers).
- `POST /api/barangay/reports/:id/verify` is the report→incident boundary:
  one transaction inserts `incidents`, flips the report to VERIFIED
  (mirrored by trigger), and notifies the resident.
- The public community map shows only **verified** incidents, anonymized,
  plus `issue_hotspots` clusters (PostGIS `ST_ClusterDBSCAN`).

## AI as decision support

The rule-based analyzer (`backend/src/modules/ai/analyzer.js`) mirrors the
SQL scoring function and writes to `ai_analyses`; nearby reports within
150 m / 14 days become `duplicate_matches` candidates. Nothing automated
touches report status — the barangay reviewer confirms. A real model can
replace the analyzer behind the same `analyzeReport()` interface.

## Environment & secrets

All secrets live in the root `.env` (see `.env.example`): `DATABASE_URL`,
`PORT`, `APP_ORIGIN`, `BACKEND_ORIGIN`, `SMTP_*`, `MAX_UPLOAD_MB`.
The frontend never reads secrets — it only calls same-origin `/api/*`.

## Deployment notes

- **Supabase = plain Postgres here.** No Supabase Auth/Storage SDKs; our
  own `users` + `user_sessions` + bcrypt flow drives the RLS design.
  Apply the schema with `DATABASE_URL=… ./database/apply.sh`.
- Media on `backend/uploads/` (disk) is the dev setup; `report_media.storage_path`
  abstracts the move to Supabase Storage / S3.
- Not yet wired (later passes): assignments/field-ops/analytics admin pages,
  Redis caching, password reset, real AI model.
