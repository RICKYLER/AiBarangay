// Read-only DB state check: tables + RLS flags, required functions, policy count.
//   node scripts/check-db.mjs   (from the frontend/ directory)
import pg from 'pg';
import fs from 'node:fs';

const env = Object.fromEntries(
  fs.readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [
      l.slice(0, l.indexOf('=')).trim(),
      l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, ''),
    ])
);

const c = new pg.Client({ connectionString: env.ADMIN_DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const tables = await c.query(
  `SELECT relname AS table, relrowsecurity AS rls
     FROM pg_class
    WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
    ORDER BY relname`
);
console.log('TABLES:');
console.table(tables.rows);

const funcs = await c.query(
  `SELECT proname FROM pg_proc
    WHERE pronamespace = 'public'::regnamespace
      AND proname IN ('is_admin','current_app_user','current_app_role','current_app_barangay','is_city_official')
    ORDER BY proname`
);
console.log('FUNCTIONS:', funcs.rows.map((r) => r.proname).join(', ') || 'NONE');

const policies = await c.query(
  `SELECT count(*)::int AS n FROM pg_policies WHERE schemaname = 'public'`
);
console.log('EXISTING POLICIES:', policies.rows[0].n);

await c.end();
