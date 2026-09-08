import bcrypt from 'bcryptjs';
import { withDb, withUser } from '../../config/db.js';

/**
 * User management (barangay / city admins).
 *
 * Visibility and write access are enforced by the users RLS policies:
 * a BARANGAY_ADMIN sees and manages the accounts of their own barangay
 * only, city officials (OFFICE_HEAD / LGU_ADMIN / SYSTEM_ADMIN) see
 * everyone. Nobody can manage their own row here — that is the profile
 * screen — so an admin cannot lock themselves out.
 */

const CREATION_ROLES = ['RESIDENT', 'BARANGAY_STAFF', 'FIELD_PERSONNEL', 'DESK_OFFICER'];

/** GET /api/admin/users — accounts visible to the caller (RLS-scoped). */
export async function listUsers(req, res) {
  const rows = await withUser(req, async (client) => {
    const { rows } = await client.query(`
      SELECT u.id, u.first_name, u.middle_name, u.last_name, u.email, u.phone,
             u.is_active, u.is_verified, u.created_at, u.last_login_at,
             r.name AS role, b.name AS barangay, d.name AS desk
        FROM users u
        JOIN roles r ON r.id = u.role_id
        LEFT JOIN barangays b ON b.id = u.barangay_id
        LEFT JOIN chat_desks d ON d.id = u.desk_id
       ORDER BY u.is_active DESC, r.name, u.last_name, u.first_name`);
    return rows;
  });

  res.json({
    users: rows.map((u) => ({
      id: u.id,
      name: [u.first_name, u.middle_name, u.last_name].filter(Boolean).join(' '),
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      barangay: u.barangay,
      desk: u.desk,
      isActive: u.is_active,
      isVerified: u.is_verified,
      createdAt: u.created_at,
      lastLoginAt: u.last_login_at,
    })),
  });
}

/**
 * POST /api/admin/users — provision an account.
 * Barangay admins create RESIDENT / BARANGAY_STAFF / FIELD_PERSONNEL /
 * DESK_OFFICER (chat-only, requires a desk) accounts in their own
 * barangay (RLS with-check enforces it); city admins may create any
 * account anywhere. Desk-created accounts are pre-verified — the
 * admin vouches for the identity in person.
 */
export async function createUser(req, res) {
  const { firstName, middleName, lastName, email, phone, password, role, deskId } = req.body || {};
  const errs = {};
  if (!firstName?.trim()) errs.firstName = 'First name is required.';
  if (!lastName?.trim()) errs.lastName = 'Last name is required.';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errs.email = 'A valid email address is required.';
  if (phone && !/^[+0-9\s()-]{7,20}$/.test(phone)) errs.phone = 'That does not look like a mobile number.';
  if (!password || password.length < 8) errs.password = 'The initial password must be at least 8 characters.';
  const allowedRoles = ['LGU_ADMIN', 'SYSTEM_ADMIN'].includes(req.user.role)
    ? [...CREATION_ROLES, 'BARANGAY_ADMIN']
    : CREATION_ROLES;
  if (!allowedRoles.includes(role)) errs.role = 'Choose a role.';
  if (role === 'DESK_OFFICER' && !deskId) errs.deskId = 'Choose the desk this account will answer.';

  let desk = null;
  if (role === 'DESK_OFFICER' && deskId) {
    const found = await withDb((c) =>
      c.query(`SELECT id FROM chat_desks WHERE id = $1 AND is_active`, [deskId])
    );
    if (!found.rowCount) errs.deskId = 'That desk is not available.';
    else desk = found.rows[0].id;
  }
  if (Object.keys(errs).length) return res.status(400).json({ errors: errs });

  try {
    const created = await withUser(req, async (client) => {
      const { rows } = await client.query(
        `INSERT INTO users (role_id, barangay_id, first_name, middle_name,
                            last_name, email, phone, password_hash,
                            is_verified, is_active, desk_id)
         VALUES ((SELECT id FROM roles WHERE name = $1), $2, $3, $4, $5,
                 lower($6), NULLIF($7, ''), $8, TRUE, TRUE, $9)
         RETURNING id`,
        [
          role, req.user.barangay_id,
          firstName.trim(), middleName?.trim() || null, lastName.trim(),
          email.trim(), phone?.trim() || null,
          await bcrypt.hash(password, 10),
          desk,
        ]
      );
      return rows[0];
    });

    res.status(201).json({ ok: true, userId: created.id });
  } catch (err) {
    if (err.code === '23505') {
      const field = err.constraint === 'users_phone_key' ? 'phone' : 'email';
      return res.status(409).json({
        error: 'That account already exists.',
        errors: { [field]: `This ${field} is already registered.` },
      });
    }
    if (err.code === '42501') {
      // RLS with-check: e.g. a barangay admin creating an admin account
      return res.status(403).json({
        error: 'You can only create accounts for your own barangay.',
      });
    }
    throw err;
  }
}

/**
 * PUT /api/admin/users/:id/status — suspend ({ active: false }) or
 * reactivate ({ active: true }). Suspending revokes every live
 * session of that account immediately.
 */
export async function setUserStatus(req, res) {
  const active = Boolean(req.body?.active);
  const userId = req.params.id;

  const updated = await withUser(req, async (client) => {
    const { rowCount } = await client.query(
      'UPDATE users SET is_active = $1, updated_at = now() WHERE id = $2',
      [active, userId]
    );
    if (rowCount === 0) return false;
    if (!active) {
      await client.query(
        'UPDATE user_sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL',
        [userId]
      );
    }
    return true;
  });

  if (!updated) {
    return res.status(404).json({
      error: 'Account not found (or it is your own account — use your profile screen).',
    });
  }
  res.json({ ok: true });
}
