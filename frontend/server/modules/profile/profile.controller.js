/**
 * Profile — the signed-in user's own identity and account summary.
 *
 * All queries run inside withUser (RLS context set), so the users
 * policies in policies/rls.sql do the enforcing: SELECT/UPDATE is
 * limited to the caller's own row, no matter what the API layer
 * ever passes in.
 */
import bcrypt from 'bcryptjs';
import { withUser } from '../../config/db.js';
import { publicUser } from '../auth/auth.controller.js';

/** Group raw status counts into the summary the UI shows. */
function summarizeStatuses(counts) {
  const get = (name) => Number(counts.find((c) => c.status === name)?.count || 0);
  return {
    total: counts.reduce((sum, c) => sum + Number(c.count), 0),
    pending: get('SUBMITTED') + get('UNDER_REVIEW') + get('REOPENED'),
    verified: get('VERIFIED') + get('ASSIGNED') + get('FIELD_RESPONSE'),
    resolved: get('RESOLVED') + get('CLOSED'),
    rejected: get('REJECTED') + get('DUPLICATE'),
  };
}

/** GET /api/profile — own identity + barangay + report summary */
export function getProfile(req, res) {
  return withUser(req, async (client, session) => {
    const { rows } = await client.query(
      `SELECT u.id, u.first_name, u.middle_name, u.last_name, u.email::text AS email,
              u.phone, u.address, u.profile_image, u.created_at, u.last_login_at,
              r.name AS role_name, u.barangay_id, b.name AS barangay_name
         FROM users u
         JOIN roles r ON r.id = u.role_id
         LEFT JOIN barangays b ON b.id = u.barangay_id
        WHERE u.id = $1`,
      [session.id]
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ error: 'Profile not found.' });

    // Report summary — the reports RLS policy already limits this to
    // the resident's own submissions (staff/city roles see their
    // scope, which is the correct "activity" view for them too).
    const { rows: counts } = await client.query(
      `SELECT s.name AS status, count(*) AS count
         FROM reports rep JOIN incident_statuses s ON s.id = rep.status_id
        GROUP BY s.name`
    );

    res.json({
      profile: {
        ...publicUser(user),
        middleName: user.middle_name,
        address: user.address,
        profileImage: user.profile_image,
        barangayName: user.barangay_name,
        memberSince: user.created_at,
      },
      stats: summarizeStatuses(counts),
    });
  });
}

/**
 * PUT /api/profile — update own names / phone / address.
 * Email and barangay are not editable here: an email change needs
 * re-verification, and a barangay move is an account transfer the
 * LGU should control.
 */
export function updateProfile(req, res) {
  const body = req.body || {};
  const clean = (v, max = 80) => String(v ?? '').trim().slice(0, max) || null;

  const firstName = clean(body.firstName);
  const lastName = clean(body.lastName);
  const phone = clean(body.phone, 20);
  const address = clean(body.address, 240);

  const errs = {};
  if (!firstName) errs.firstName = 'First name is required.';
  if (!lastName) errs.lastName = 'Last name is required.';
  if (phone && !/^[+0-9\s()-]{7,20}$/.test(phone)) errs.phone = 'That does not look like a mobile number.';
  if (Object.keys(errs).length) return res.status(400).json({ errors: errs });

  return withUser(req, async (client, session) => {
    try {
      const { rows } = await client.query(
        `UPDATE users
            SET first_name = $2, middle_name = $3, last_name = $4,
                phone = $5, address = $6, updated_at = now()
          WHERE id = $1
          RETURNING id, first_name, middle_name, last_name, email::text AS email,
                    phone, address, barangay_id, is_verified, created_at, last_login_at`,
        [session.id, firstName, clean(body.middleName), lastName, phone, address]
      );
      const user = rows[0];
      if (!user) return res.status(404).json({ error: 'Profile not found.' });
      res.json({ ok: true, profile: publicUser({ ...user, role_name: session.role_name }) });
    } catch (err) {
      if (err.code === '23505' && err.constraint === 'users_phone_key') {
        return res.status(409).json({ errors: { phone: 'That mobile number is already used by another account.' } });
      }
      if (err.code === '23514') {
        return res.status(400).json({ error: 'Some profile fields failed validation. Please review and try again.' });
      }
      throw err;
    }
  });
}

/**
 * PUT /api/profile/password — { currentPassword, newPassword }.
 * Verifies the current password, sets the new one, and signs out
 * every OTHER device (the current session stays live).
 */
export function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  const errs = {};
  if (!currentPassword) errs.currentPassword = 'Your current password is required.';
  if (!newPassword || newPassword.length < 8) errs.newPassword = 'The new password must be at least 8 characters.';
  if (Object.keys(errs).length) return res.status(400).json({ errors: errs });

  return withUser(req, async (client, session) => {
    const { rows } = await client.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [session.id]
    );
    const hash = rows[0]?.password_hash;
    if (!hash) return res.status(404).json({ error: 'Profile not found.' });

    const ok = await bcrypt.compare(currentPassword, hash);
    if (!ok) {
      return res.status(401).json({ errors: { currentPassword: 'That is not your current password.' } });
    }

    await client.query(
      `UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1`,
      [session.id, await bcrypt.hash(newPassword, 10)]
    );
    // Other devices are signed out; this browser stays signed in.
    await client.query(
      `UPDATE user_sessions SET revoked_at = now()
        WHERE user_id = $1 AND revoked_at IS NULL AND id <> $2`,
      [session.id, session.session_id]
    );
    res.json({ ok: true });
  });
}
