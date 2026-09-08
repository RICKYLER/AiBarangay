# Deploying to Vercel (manual)

The app deploys as **one Vercel project**: the Next.js site *and* the
Express API (frontend/server) run on the same domain, so the httpOnly
session cookie always stays same-site.

## 1. Push to GitHub

```bash
cd ~/Aibarangay
git remote add origin git@github.com:<you>/aibarangay.git
git push -u origin main
```

- Repo must be **private** (it contains no secrets — `.env` is
  gitignored — but the code is not for public release).
- Never commit `.env`. Real values live only in the root `.env` (local)
  and Vercel env settings (deployed).

## 2. Import in Vercel

1. vercel.com → **Add New… → Project** → import the GitHub repo.
2. **Root Directory: `frontend`** (important — everything else is ignored).
3. Framework preset: auto-detected (Next.js). Leave build settings default.

## 3. Environment Variables

Project → Settings → Environment Variables → add (copy values from root `.env`):

| Variable | Value |
|---|---|
| `DATABASE_URL` | the `app_user` pooler URL from `.env` |
| `SUPABASE_URL` | `https://xutikanmhjtnachtygbj.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | from `.env` (photo storage writes) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | from `.env` |
| `AI_API_KEY` / `AI_BASE_URL` / `AI_MODEL` | from `.env` |
| `MAX_UPLOAD_MB` | `4` |

`APP_ORIGIN` / `BACKEND_ORIGIN` are **optional**: `frontend/server/env.js`
derives them from `VERCEL_PROJECT_PRODUCTION_URL` automatically. If you
later attach a custom domain, set both to `https://<your-domain>` and
redeploy.

## 4. Deploy

Click **Deploy**. After the first deploy, verify:

- `https://<project>.vercel.app/api/health` → `{"ok":true,"db":true,...}`
- login → open the same URL in a second tab → still logged in
- submit a report with a photo → photo renders (served from
  `...supabase.co/storage/v1/object/public/uploads/...`)
- register a test account → the verification email link points at the
  deployed domain

## Local development (changed!)

There is **no separate backend process anymore**:

```bash
cd ~/Aibarangay/frontend
npm run dev        # serves the site AND /api on http://localhost:3000
```

DB tooling stays in `backend/scripts/` (run from `backend/`):
`node scripts/apply.mjs` (full install), `node scripts/run-sql.mjs <file.sql>`.

## Notes

- Vercel caps request bodies at ~4.5MB — that's why `MAX_UPLOAD_MB=4`
  and the browser compresses photos before upload (`lib/imageCompress.ts`).
- Function timeout is 60s (`frontend/vercel.json`) — the AI triage call
  times out at 25s, well within it.
- First request after idle may take ~1s (serverless cold start). Normal.
