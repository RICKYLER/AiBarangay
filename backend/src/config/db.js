import '../env.js';
import pg from 'pg';

/* ---------------------------------------------------------------------------
 * Database access
 *
 * Supabase Postgres over the session pooler. Two access helpers:
 *
 *   withDb(fn)      — one-off query, no user context (login, register, health)
 *   withUser(req, fn) — full transaction that resolves the session cookie,
 *                       then SET LOCALs the request.* variables so every
 *                       query inside fn runs through the RLS policies
 *                       (see database/policies/rls.sql).
 * ------------------------------------------------------------------------- */

if (!process.env.DATABASE_URL) {
  console.warn('[db] DATABASE_URL is not set — API calls will fail.');
}

const DB_URL = process.env.DATABASE_URL || '';
const isLocal = DB_URL.includes('localhost') || DB_URL.includes('127.0.0.1');

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (err) => console.error('[db] idle client error:', err.message));

/** Run fn(client) with a plain client (no user/RLS context). */
export async function withDb(fn) {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

/**
 * Run fn(client) inside a transaction authenticated as the request's user.
 * Resolves the session cookie to a live user_session, then sets:
 *   request.user_id, request.role_name, request.barangay_id
 * Rejects with 401-shaped errors when the session is missing/expired.
 */
export async function withUser(req, fn) {
  const token = req?.cookies?.aibp_session;
  if (!token) {
    const err = new Error('Not signed in.');
    err.status = 401;
    throw err;
  }
  const tokenHash = sha256(token);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT * FROM resolve_session($1)`,
      [tokenHash]
    );

    const session = rows[0];
    if (!session || !session.is_active) {
      await client.query('ROLLBACK');
      const err = new Error('Your session has expired. Please sign in again.');
      err.status = 401;
      throw err;
    }

    // RLS context — every query in fn now passes through the policies.
    await client.query('SELECT set_config($1, $2, true)', ['request.user_id', session.id]);
    await client.query('SELECT set_config($1, $2, true)', ['request.role_name', session.role_name]);
    await client.query('SELECT set_config($1, $2, true)', [
      'request.barangay_id', session.barangay_id || '',
    ]);
    // Audit triggers read these too.
    await client.query('SELECT set_config($1, $2, true)', [
      'request.ip_address', req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '',
    ]);

    const result = await fn(client, session);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch { /* already rolled back */ }
    throw err;
  } finally {
    client.release();
  }
}

/** Wrap a withUser handler so 401s return JSON instead of an HTML error page. */
export function userRoute(handler) {
  return async (req, res, next) => {
    try {
      await withUser(req, (client, session) => handler(req, res, client, session));
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      next(err);
    }
  };
}

import { createHash } from 'node:crypto';
function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}
