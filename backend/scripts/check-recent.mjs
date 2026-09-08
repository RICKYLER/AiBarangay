import { config } from 'dotenv';
config({ path: '../.env', override: true });
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.ADMIN_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const { rows } = await pool.query(`
  SELECT email, first_name, last_name, is_verified, is_active, created_at,
         email_verify_token IS NOT NULL AS has_token, phone
    FROM users WHERE created_at > now() - interval '1 day'
   ORDER BY created_at DESC`);
console.log(`${rows.length} account(s) created in the last 24h:`);
for (const u of rows) console.log(`  ${u.created_at.toISOString()}  ${u.email}  verified=${u.is_verified}  pending_token=${u.has_token}  phone=${u.phone}`);
await pool.end();
