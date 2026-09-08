# API Reference — AI Barangay Problem Mapper

Base URL (dev): `http://localhost:4000` — the Next.js dev server proxies
`/api/*` and `/uploads/*` to it, so the browser only ever talks to
`http://localhost:3000`.

## Authentication

Opaque session tokens; **no JWTs**.

1. `POST /api/auth/login` sets an httpOnly cookie `aibp_session` (14 days).
   The cookie holds a random token; `user_sessions` stores only its SHA-256
   hash (`token_hash`).
2. Every authenticated request runs inside a DB transaction that resolves
   the session and issues `SET LOCAL request.user_id / request.role_name /
   request.barangay_id` — so **every query is filtered by the Row-Level
   Security policies** defined in `database/policies/rls.sql`.
3. Logout revokes the session row.

Roles: `RESIDENT`, `BARANGAY_ADMIN`, `BARANGAY_STAFF`, `FIELD_PERSONNEL`,
`OFFICE_HEAD`, `LGU_ADMIN`, `SYSTEM_ADMIN`. Staff roles land on
`/admin/dashboard`, residents on `/resident/dashboard`.

### Password reset

1. `POST /api/auth/forgot-password` `{ email }` — **always** returns
   `200 { ok: true }` (the response never reveals whether the address has
   an account). When it does — and the account is verified+active — a
   one-hour reset link (`/reset-password?token=…`) is emailed. Only the
   token's SHA-256 hash is stored (`users.password_reset_token`).
2. `POST /api/auth/reset-password` `{ token, password }` — consumes the
   token (single use), sets the new bcrypt hash, clears the token, and
   **revokes every session** of that user (all devices signed out).
   `400 { expired: true }` when the token is unknown/used/expired.

### Error shape

```json
{ "error": "Human-readable message." }
```

Validation errors may add `errors: { field: "message" }`. Statuses:
`400` bad input · `401` no/invalid session · `403` role not allowed ·
`404` not found (or hidden by RLS) · `409` state conflict · `422` missing
prerequisite.

---

## Health

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | `{ ok, db, mailerReady }` — public. |

## Auth

| Method | Path | Auth | Body / Result |
|---|---|---|---|
| POST | `/api/auth/register` | — | `{ fullName, email, password, phone?, barangay, zone? }` → creates RESIDENT (unverified), sends verification email |
| GET | `/api/auth/verify/:token` | — | Redirects to `APP_ORIGIN/verify-account?status=ok|expired|invalid` |
| POST | `/api/auth/resend` | — | `{ email }` |
| POST | `/api/auth/login` | — | `{ email, password }` → sets cookie, returns `{ user }` |
| POST | `/api/auth/logout` | ✓ | Revokes session |
| GET | `/api/auth/me` | ✓ | `{ user }` |

## Profile (own identity)

All three run inside the RLS transaction — the `users` policies
limit SELECT/UPDATE to the caller's own row.

| Method | Path | Auth | Body / Result |
|---|---|---|---|
| GET | `/api/profile` | ✓ | `{ profile: { …publicUser, middleName, address, barangayName, memberSince }, stats: { total, pending, verified, resolved, rejected } }` — report counts scoped by RLS to the caller |
| PUT | `/api/profile` | ✓ | `{ firstName, middleName?, lastName, phone?, address? }` → names/phone/address only. Email & barangay are not editable (email needs re-verification; a barangay move is an LGU account transfer) |
| PUT | `/api/profile/password` | ✓ | `{ currentPassword, newPassword }` → sets the new bcrypt hash and signs out every **other** device (the current session stays live) |

Pre-login auth flows (register, verify, login, password reset, session
resolution) run through the `SECURITY DEFINER` functions in
`database/functions/auth_functions.sql` — the caller cannot be
RLS-scoped before they are identified, so those functions are the
only path that touches `users` without a user context.

## Lookups (public)

| Method | Path | Result |
|---|---|---|
| GET | `/api/lookups/categories` | `{ categories: [{ id, name, description, icon, color }] }` |
| GET | `/api/lookups/barangays` | `{ barangays: [{ id, name, code, population, latitude, longitude }] }` (Tagum City) |
| GET | `/api/lookups/zones?barangayId=` | `{ zones }` |
| GET | `/api/lookups/priorities` | `{ priorities }` |

## Reports (resident)

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/reports` | ✓ RESIDENT | `multipart/form-data`: `title, description, categoryId?, categoryName?, latitude, longitude, address?, zone?, accuracy?, photo?` (image, ≤ `MAX_UPLOAD_MB`). Runs the AI analyzer, stores `ai_analyses`, flags `duplicate_matches` via `find_nearby_reports()`, assigns priority via `calculate_report_priority()`. Returns `{ reportNumber, reportId, ai: { priority, confidence, summary, duplicateCandidates } }` |
| GET | `/api/reports/mine` | ✓ | Own reports via `v_resident_reports` (RLS: resident sees own only) |
| GET | `/api/reports/:id` | ✓ | `{ report, media, timeline }` — `:id` accepts UUID or `RPT-…` number. Residents see only their own (RLS) |

## Barangay operations (staff)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/barangay/review-queue` | ✓ staff | `v_barangay_review_queue` (SUBMITTED / UNDER_REVIEW), ordered by pending duplicate flags. Staff see their barangay; LGU/SYSTEM_ADMIN see all |
| GET | `/api/barangay/reports/:id` | ✓ staff | `{ report, media, analyses, duplicates, suggestedPriority, residentName, barangayName }` |
| POST | `/api/barangay/reports/:id/verify` | ✓ staff | `{ priorityId? }` → creates the `incidents` row (`INC-…`), report → VERIFIED, notifies the resident. Returns `{ incidentNumber, incidentId }` |
| POST | `/api/barangay/reports/:id/reject` | ✓ staff | `{ reason? }` → report → REJECTED, notifies the resident |

## Admin: user management

Role-gated to `BARANGAY_ADMIN` / `LGU_ADMIN` / `SYSTEM_ADMIN`; the `users`
RLS policies scope the rows — a barangay admin sees and manages their own
barangay's accounts, city officials everyone. Nobody can manage their own
row through these endpoints (that's the profile screen), so an admin cannot
lock themselves out.

| Method | Path | Auth | Body / Result |
|---|---|---|---|
| GET | `/api/admin/users` | ✓ admin | `{ users: [{ id, name, firstName, lastName, email, phone, role, barangay, isActive, isVerified, createdAt, lastLoginAt }] }` |
| POST | `/api/admin/users` | ✓ admin | `{ firstName, lastName, email, phone?, password, role }` → creates a **pre-verified** account. Barangay admins may create `RESIDENT` / `BARANGAY_STAFF` / `FIELD_PERSONNEL` in their own barangay; city admins may create any role anywhere. `409` when the email/phone is taken |
| PUT | `/api/admin/users/:id/status` | ✓ admin | `{ active: boolean }` → suspend/reactivate. Suspending revokes every live session of the account immediately |

## GIS (public)

| Method | Path | Result |
|---|---|---|
| GET | `/api/gis/public-map` | `{ incidents, hotspots }` — anonymized verified incident points + `issue_hotspots` clusters (30-day, 150 m) |
| GET | `/api/gis/barangay-centers` | `{ centers }` — barangay center points for map defaults |

## Notifications

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/notifications` | ✓ | `{ notifications, unread }` (own only, latest 100) |
| POST | `/api/notifications/:id/read` | ✓ | Mark one read |
| POST | `/api/notifications/read-all` | ✓ | Mark all read |

## Uploads

Evidence photos are stored on the API server under `backend/uploads/` and
served at `BACKEND_ORIGIN/uploads/<file>` (proxied through the frontend in
dev). `report_media.storage_path` / `file_url` abstract a future move to
object storage (e.g. Supabase Storage) — no schema change needed.

## AI layer

`backend/src/modules/ai/analyzer.js` implements a rule-based analyzer that
mirrors `database/functions/calculate_report_priority.sql`:

```
score = category weight (0–40)
      + severity keywords (0–25)
      + confidence (0–20)
≥ 75 CRITICAL · ≥ 50 HIGH · ≥ 25 MEDIUM · else LOW
```

It is **decision support only** — output lands in `ai_analyses` and is
shown to the barangay reviewer, who makes the final verify/reject call.
The module exports a single `analyzeReport()` interface so a real model
(OpenAI, etc.) can replace the rules later without touching callers.
