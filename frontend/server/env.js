/* Load environment before anything else reads process.env.
 *
 * The repo keeps a single root .env (never committed). Locally, `next dev`
 * runs from frontend/ so dotenv's default cwd lookup misses it — resolve
 * the root .env relative to this file, then let a frontend/.env or cwd
 * .env override if present. On Vercel, real env vars are injected and all
 * dotenv lookups are harmless no-ops. */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../../.env') }); // repo root
dotenv.config({ path: path.resolve(here, '../.env') });    // frontend/.env
dotenv.config();                                           // cwd (dev override)

/* On Vercel, derive the app/backend origins from the deployment's
 * production URL unless they were set explicitly. The API runs on the
 * same domain as the site (pages/api bridge), so both are the same
 * origin — email verification/reset links point at the live site. */
if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
  const live = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  process.env.APP_ORIGIN ||= live;
  process.env.BACKEND_ORIGIN ||= live;
}
