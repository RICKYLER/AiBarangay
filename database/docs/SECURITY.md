# Security

## Row-level security plan

- `users` — self read/update; officials read residents of their barangay; admins all.
- `reports` — public can INSERT (new report); residents SELECT only own rows; officials SELECT/UPDATE within their barangay.
- `incidents` — officials/admins only; residents get linked status via a view, not the table.
- `report_media` / `evidence` — upload only for own reports; public reads only media tied to anonymized views.
- `audit_logs` — append-only; SELECT for admins; no UPDATE/DELETE ever.

## Privacy rules (must hold end-to-end)

1. The public map (`views/issue_hotspots.sql`) never exposes reporter identity or exact household coordinates — generalize coordinates before display.
2. Reporter contact details are visible only to authorized personnel.
3. AI analyses are advisory; they must be clearly labeled as AI output in every UI.

## TODO

- choose platform: Supabase (RLS + Auth) vs plain Postgres (grants + app-level auth)
- storage bucket rules for media
- rate limiting on report submission
- PII retention policy
