# AI Barangay Problem Mapper — Tagum City

Residents report community problems (flooding, road damage, garbage,
streetlights, water leaks), barangay personnel verify and dispatch them,
and an AI layer assists — never decides. Verified incidents appear on a
public anonymized map with PostGIS-computed hotspots.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router) · React 18 · TypeScript · Leaflet |
| API | Express 5 (ESM) · pg · multer · nodemailer |
| Database | PostgreSQL 15+ / PostGIS 3+ on **Supabase** (plain Postgres — no Supabase SDKs) |
| Security | Row-Level Security driven by per-transaction session variables; opaque httpOnly session cookies; bcrypt |

## Quick start

```bash
# 1 · Install everything (root + backend + frontend)
npm run install:all

# 2 · Configure secrets
cp .env.example .env       # then edit: DATABASE_URL, SMTP_*, …

# 3 · Apply the database (no psql needed — Node installer)
node backend/scripts/apply.mjs
#    SKIP_DEMO=1 omits demo data · connects via ADMIN_DATABASE_URL in .env

# 4 · Run API (:4000) + web (:3000) together
npm run dev
```

Demo barangay-admin account (from `database/seeds/05_demo.sql`):
`pedro.ramos@example.com` / `Password123!` — residents can self-register
(email verification required).

## Structure

```
frontend/    Next.js app — app/ (routes), components/, hooks/, lib/api, types/
backend/     Express API — src/config (db + RLS context), src/modules/*, uploads/
database/    SQL in apply order: schema → functions → triggers → views →
             indexes → policies → migrations → seeds  (see database/README.md)
docs/        API.md · ARCHITECTURE.md · ERD.md
.env         secrets — never committed (template: .env.example)
```

## What's wired (core flows)

- **Auth** — register → email verification → login → role-based routing
  (resident vs staff portals), logout, session persistence.
- **Resident reporting** — category + map pin + photo upload; real
  `RPT-2026-0000xx` tracking number; AI triage (priority, confidence,
  duplicate candidates) on the success screen.
- **My Reports** — own reports with status filters, search, detail view
  with the civic timeline and update history (RLS: own rows only).
- **Notifications** — real unread badge in both portals; status-change
  notifications from the barangay workflow.
- **Barangay review** — live review queue with AI panel, duplicate flags,
  suggested priority; Verify (creates `INC-…` incident) / Reject actions,
  audit-logged.
- **Dashboards** — resident summary from real reports; operations KPIs,
  priority mix, GIS map, and hotspot alerts from live data.
- **Community map (public)** — anonymized verified incident points +
  PostGIS hotspot clusters.

Still on sample data (later passes): assignments, field ops, AI intel,
analytics, users/zones/categories/settings admin pages, resident
messages/profile/settings.

## How security works (short version)

Every authenticated API request opens a transaction that resolves the
session cookie and issues `SET LOCAL request.user_id / request.role_name /
request.barangay_id`. Every query then passes through the Row-Level
Security policies in `database/policies/rls.sql` — residents see only
their own rows, staff see their barangay's, admins see all. Views are
`security_invoker`. Full story in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Docs

- [docs/API.md](docs/API.md) — every endpoint, auth model, error shapes
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — request lifecycle, RLS, workflow
- [docs/ERD.md](docs/ERD.md) — entity relationships and invariants
- [database/README.md](database/README.md) — schema tour + apply instructions
