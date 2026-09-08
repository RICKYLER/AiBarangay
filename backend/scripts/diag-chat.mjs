/* Diagnostic: list all chat threads (with barangay) and recent users. */
import '../src/env.js';
import pg from 'pg';

const client = new pg.Client({
  connectionString: process.env.ADMIN_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const t = await client.query(`
  SELECT t.id, t.subject, t.resident_name, b.name AS barangay, d.name AS desk,
         t.created_at,
         (SELECT count(*) FROM chat_messages m WHERE m.thread_id = t.id) AS msgs
    FROM chat_threads t
    JOIN chat_desks d ON d.id = t.desk_id
    JOIN barangays b ON b.id = t.barangay_id
   ORDER BY t.created_at DESC`);
console.log('ALL THREADS:');
for (const r of t.rows) {
  console.log(`  ${r.subject} | ${r.resident_name} | ${r.barangay} | ${r.desk} | msgs: ${r.msgs} | created: ${r.created_at}`);
}

const u = await client.query(`
  SELECT u.email, r.name AS role, b.name AS barangay, u.created_at
    FROM users u
    JOIN roles r ON r.id = u.role_id
    LEFT JOIN barangays b ON b.id = u.barangay_id
   ORDER BY u.created_at DESC LIMIT 15`);
console.log('RECENT USERS:');
for (const r of u.rows) {
  console.log(`  ${r.email} | ${r.role} | ${r.barangay} | joined: ${r.created_at}`);
}

await client.end();
