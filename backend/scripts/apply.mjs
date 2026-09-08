/* =============================================================
 * apply.mjs — Node installer for the AI Barangay Problem Mapper DB
 *
 * Same order as database/apply.sh, but runs over the `pg` driver so
 * no local psql is required (WSL-friendly):
 *
 *   schema/ → functions/ → triggers/ → views/ → indexes/ →
 *   policies/ → migrations/ → seeds/
 *
 * Run from backend/ (or repo root — paths resolve from this file):
 *   node scripts/apply.mjs                 # full install
 *   SKIP_DEMO=1 node scripts/apply.mjs     # no demo rows
 *
 * Connects as ADMIN_DATABASE_URL (postgres, has CREATEROLE and
 * BYPASSRLS, so seeds sail past the FORCE RLS policies). The API
 * itself uses DATABASE_URL = app_user, which the policies DO bind.
 * After the SQL runs, app_user/bi_reader login passwords are set
 * from APP_DB_PASSWORD / BI_DB_PASSWORD.
 * ============================================================= */
import '../src/env.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.resolve(here, '../../database');

const ADMIN_URL = process.env.ADMIN_DATABASE_URL || process.env.DATABASE_URL;
if (!ADMIN_URL) {
  console.error('ADMIN_DATABASE_URL (or DATABASE_URL) is not set.');
  process.exit(1);
}

const ORDER = [
  ['schema', 'schema/*.sql'],
  ['functions', 'functions/*.sql'],
  ['triggers', 'triggers/*.sql'],
  ['views', 'views/*.sql'],
  ['indexes', 'indexes/*.sql'],
  ['policies', 'policies/*.sql'],
  ['migrations', 'migrations/*.sql'],
  ['seeds', 'seeds/*.sql'],
];

const client = new pg.Client({
  connectionString: ADMIN_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

function filesFor(glob) {
  const dir = path.dirname(path.join(DB_DIR, glob));
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => path.join(dir, f));
}

async function runFile(file) {
  const sql = fs.readFileSync(file, 'utf8');
  // One multi-statement simple-protocol query per file; any error
  // aborts the file (like psql's ON_ERROR_STOP) and we exit.
  await client.query(sql);
}

try {
  await client.connect();
  const v = await client.query('select version()');
  console.log('► Connected:', v.rows[0].version.slice(0, 52), '…');

  for (const [label, glob] of ORDER) {
    const files = filesFor(glob);
    console.log(`► ${label} (${files.length} file${files.length === 1 ? '' : 's'})`);
    for (const file of files) {
      if (process.env.SKIP_DEMO === '1' && file.endsWith('_demo.sql')) {
        console.log(`    … skipping demo data (SKIP_DEMO=1)`);
        continue;
      }
      const rel = path.relative(DB_DIR, file);
      process.stdout.write(`    ${rel} … `);
      const t0 = Date.now();
      try {
        await runFile(file);
        console.log(`ok (${Date.now() - t0}ms)`);
      } catch (err) {
        console.log('FAILED');
        console.error(`\n✗ ${rel}\n  ${err.message}`);
        const detail = err.detail ? `  detail: ${err.detail}\n` : '';
        const hint = err.hint ? `  hint: ${err.hint}\n` : '';
        const where = err.where ? `  ${err.where.trim().split('\n')[0]}\n` : '';
        console.error(detail + hint + where);
        process.exit(1);
      }
    }
  }

  // Set the application-role passwords (roles created by policies/rls.sql).
  // ALTER ROLE takes no bind parameters, so quote-literal manually —
  // the values come from our own .env, not user input.
  const esc = (s) => s.replace(/'/g, "''");
  if (process.env.APP_DB_PASSWORD) {
    await client.query(`ALTER ROLE app_user WITH LOGIN PASSWORD '${esc(process.env.APP_DB_PASSWORD)}'`);
    console.log('► app_user password set');
  }
  if (process.env.BI_DB_PASSWORD) {
    await client.query(`ALTER ROLE bi_reader WITH LOGIN PASSWORD '${esc(process.env.BI_DB_PASSWORD)}'`);
    console.log('► bi_reader password set');
  }

  // Summary
  const counts = await client.query(`
    select
      (select count(*) from information_schema.tables where table_schema = 'public') as tables,
      (select count(*) from pg_policies where schemaname = 'public') as policies`);
  console.log(`✓ Done. public tables: ${counts.rows[0].tables}, RLS policies: ${counts.rows[0].policies}`);
} catch (err) {
  console.error('✗', err.message);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
