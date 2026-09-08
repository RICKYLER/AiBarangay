// One-off: apply database/migrations/03_rls_lookups_sessions.sql to the
// Supabase admin database and verify the RLS flags.
//   node scripts/apply-03-rls.mjs     (from the frontend/ directory)
import pg from 'pg';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// .env lives at the repo root
const envPath = new URL('../../.env', import.meta.url);
const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [
      l.slice(0, l.indexOf('=')).trim(),
      l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, ''),
    ])
);

const sqlPath = new URL('../../database/migrations/03_rls_lookups_sessions.sql', import.meta.url);
const sql = fs.readFileSync(sqlPath, 'utf8');

const c = new pg.Client({ connectionString: env.ADMIN_DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query(sql);
const { rows } = await c.query(`
  SELECT relname, relrowsecurity AS rls, relforcerowsecurity AS forced
    FROM pg_class
   WHERE relname IN ('offices','categories','incident_statuses','user_sessions')
   ORDER BY relname`);
console.table(rows);
await c.end();
