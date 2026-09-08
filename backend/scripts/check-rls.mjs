import { config } from 'dotenv';
config({ path: '../.env', override: true });
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.ADMIN_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const { rows } = await pool.query(`
  SELECT relname AS table, relrowsecurity AS rls_on, (SELECT count(*) FROM pg_policies p WHERE p.tablename = c.relname) AS policies
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND relkind = 'r' ORDER BY relname`);
for (const r of rows) console.log(`${r.rls_on ? 'RLS ' : '----'} ${String(r.policies).padStart(2)} policies  ${r.table}`);
await pool.end();
