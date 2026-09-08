// Apply a database migration to the Supabase admin database.
//   node scripts/apply-migration.mjs ../../database/migrations/04_rls_spatial_priorities_ai.sql
// Then verifies + prints RLS flags for the tables it mentions.
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/apply-migration.mjs <migration.sql>');
  process.exit(1);
}
const sqlPath = path.resolve(process.cwd(), file);
const sql = fs.readFileSync(sqlPath, 'utf8');

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
await c.query(sql);
const tables = [...new Set([...sql.matchAll(/ALTER TABLE\s+(\w+)\s+ENABLE/g)].map((m) => m[1]))];
if (tables.length) {
  const { rows } = await c.query(
    `SELECT relname AS table, relrowsecurity AS rls, relforcerowsecurity AS forced
       FROM pg_class WHERE relname = ANY($1) ORDER BY relname`,
    [tables]
  );
  console.table(rows);
}
await c.end();
