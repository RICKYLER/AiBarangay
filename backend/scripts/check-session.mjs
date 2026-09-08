import { config } from 'dotenv';
config({ path: '../.env', override: true });
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.ADMIN_DATABASE_URL, ssl: { rejectUnauthorized: false } });
const { rows } = await pool.query(`
  SELECT u.email, r.name AS role, b.name AS barangay, u.is_verified, u.is_active,
         (SELECT count(*) FROM user_sessions s WHERE s.user_id = u.id) AS total_sessions,
         (SELECT count(*) FROM user_sessions s WHERE s.user_id = u.id AND s.revoked_at IS NULL AND s.expires_at > now()) AS live_sessions,
         u.last_login_at
    FROM users u JOIN roles r ON r.id = u.role_id
    LEFT JOIN barangays b ON b.id = u.barangay_id
   WHERE u.email IN ('rickycontiga24@gmail.com','rickycontiga14@gmail.com')`);
for (const u of rows) console.log(JSON.stringify(u, null, 1));
await pool.end();
