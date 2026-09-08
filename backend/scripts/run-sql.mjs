/* Run one or more SQL files against the admin database.
 * Usage (from backend/): node scripts/run-sql.mjs ../database/policies/rls.sql [more.sql …] */
import '../src/env.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));
const files = process.argv.slice(2).map((f) => path.resolve(process.cwd(), f));
if (!files.length) {
  console.error('usage: node scripts/run-sql.mjs <file.sql> […]');
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.ADMIN_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
for (const file of files) {
  process.stdout.write(`► ${path.relative(process.cwd(), file)} … `);
  try {
    await client.query(fs.readFileSync(file, 'utf8'));
    console.log('ok');
  } catch (err) {
    console.log('FAILED');
    console.error(' ', err.message);
    if (err.detail) console.error('  detail:', err.detail);
    process.exit(1);
  }
}
await client.end();
