/**
 * Route guards. Actual session resolution happens inside withUser()
 * (config/db.js) so the RLS context is always set inside the same
 * transaction as the query. requireAuth resolves the session once
 * up front (cheap indexed lookup) so role guards and handlers can
 * read req.user without opening a transaction themselves.
 */
import { createHash } from 'node:crypto';
import { withDb } from '../config/db.js';

/** Resolve the session cookie → req.user, or reject. */
export async function requireAuth(req, res, next) {
  const token = req.cookies?.aibp_session;
  if (!token) {
    return res.status(401).json({ error: 'Please sign in to continue.' });
  }
  try {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const { rows } = await withDb((c) =>
      c.query(`SELECT * FROM resolve_session($1)`, [tokenHash])
    );
    const s = rows[0];
    if (!s || !s.is_active) {
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
    req.user = {
      id: s.id, first_name: s.first_name, last_name: s.last_name,
      email: s.email, role: s.role_name, barangay_id: s.barangay_id,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/** Restrict a route to specific roles (after requireAuth). */
export function requireRole(...allowed) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({ error: 'You do not have access to this action.' });
    }
    next();
  };
}

export const STAFF_ROLES = ['BARANGAY_ADMIN', 'BARANGAY_STAFF', 'FIELD_PERSONNEL', 'OFFICE_HEAD', 'LGU_ADMIN', 'SYSTEM_ADMIN'];
export const ADMIN_ROLES = ['BARANGAY_ADMIN', 'LGU_ADMIN', 'SYSTEM_ADMIN'];
