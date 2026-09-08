import { randomBytes } from 'node:crypto';
import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { withDb } from '../../config/db.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../mailer.js';

export const SESSION_COOKIE = 'aibp_session';
const SESSION_DAYS = 14;

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

async function findUserByEmail(client, email) {
  const { rows } = await client.query(
    'SELECT * FROM auth_find_user_by_email($1)',
    [String(email || '').trim()]
  );
  // Defensive: guard the composite-NULL case (all-null row) too.
  return rows[0]?.id ? rows[0] : null;
}

async function createSession(res, userId) {
  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  await withDb((client) =>
    client.query(
      `INSERT INTO user_sessions (user_id, token_hash, expires_at)
       VALUES ($1, $2, now() + ($3 || ' days')::interval)`,
      [userId, tokenHash, SESSION_DAYS]
    )
  );
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function publicUser(user) {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role_name,
    barangayId: user.barangay_id,
    isVerified: user.is_verified,
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at,
  };
}

/* ------------------------------------------------------------------ */
/* Routes                                                             */
/* ------------------------------------------------------------------ */

/** POST /api/auth/register — resident self-registration + verification email */
export async function register(req, res) {
  const { fullName, email, mobile, barangay, zone, password } = req.body || {};
  const errs = {};
  if (!fullName || !fullName.trim()) errs.fullName = 'Full name is required.';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errs.email = 'A valid email address is required.';
  if (!mobile || !mobile.trim()) errs.mobile = 'Mobile number is required.';
  if (!password || password.length < 8) errs.password = 'Password must be at least 8 characters.';
  if (Object.keys(errs).length > 0) return res.status(400).json({ errors: errs });

  // "First Middle Last" → first_name / last_name (middle kept if 3+ words)
  const parts = fullName.trim().split(/\s+/);
  const first_name = parts[0];
  const last_name = parts.length >= 2 ? parts[parts.length - 1] : parts[0];
  const middle_name = parts.length >= 3 ? parts.slice(1, -1).join(' ') : null;

  const result = await withDb(async (client) => {
    const existing = await findUserByEmail(client, email);
    if (existing) return { existing };

    // Resolve barangay/zone by name (public geography, no RLS needed)
    let barangayId = null;
    let zoneId = null;
    if (barangay) {
      const { rows: br } = await client.query(
        `SELECT id FROM barangays
          WHERE lower(name) = lower($1)
            AND city_municipality_id = (SELECT id FROM cities_municipalities WHERE name = 'Tagum City')
          LIMIT 1`,
        [barangay.replace(/^barangay\s+/i, '').trim()]
      );
      barangayId = br[0]?.id || null;
      if (barangayId && zone) {
        const { rows: z } = await client.query(
          'SELECT id FROM zones WHERE barangay_id = $1 AND lower(name) = lower($2) LIMIT 1',
          [barangayId, zone]
        );
        zoneId = z[0]?.id || null;
      }
    }

    const verifyToken = randomBytes(32).toString('hex');
    const { rows } = await client.query(
      `SELECT * FROM auth_register_user($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        first_name, middle_name, last_name,
        email.trim(), mobile.trim(),
        await bcrypt.hash(password, 10),
        zone ? `${zone}, ${barangay}` : barangay || null,
        barangayId,
        verifyToken,
      ]
    );
    return { user: rows[0], verifyToken };
  });

  // Registered but never verified: refresh the token and resend.
  if (result.existing) {
    if (result.existing.is_verified) {
      return res.status(409).json({
        error: 'An account with this email already exists. Try signing in instead.',
      });
    }
    try {
      await rotateAndSend(result.existing);
      return res.json({ ok: true, resent: true, email: result.existing.email });
    } catch (err) {
      console.error('Resend verification email failed:', err);
      return res.status(502).json({ error: 'Could not send the verification email. Please try again.' });
    }
  }

  try {
    await sendVerificationEmail({
      email: result.user.email,
      verifyToken: result.verifyToken,
      fullName,
      barangay: barangay || null,
    });
    res.json({ ok: true, email: result.user.email });
  } catch (err) {
    console.error('Send verification email failed:', err);
    res.status(502).json({ error: 'Account created, but the verification email could not be sent. Please try registering again or contact support.' });
  }
}

/** GET /api/auth/verify/:token — the link the user clicks in the email */
export async function verifyEmail(req, res) {
  const APP_ORIGIN = process.env.APP_ORIGIN || 'http://localhost:3000';
  const user = await withDb(async (client) => {
    const { rows } = await client.query(
      'SELECT * FROM auth_get_by_verify_token($1)',
      [req.params.token]
    );
    const found = rows[0];
    if (found) {
      await client.query('SELECT auth_mark_verified($1)', [found.id]);
    }
    return found || null;
  });
  if (!user) return res.redirect(`${APP_ORIGIN}/verify-account?status=invalid`);
  res.redirect(`${APP_ORIGIN}/verify-account?status=ok&email=${encodeURIComponent(user.email)}`);
}

/** POST /api/auth/resend */
export async function resend(req, res) {
  const email = req.body?.email;
  const user = await withDb((client) => findUserByEmail(client, email));
  if (!user) return res.status(404).json({ error: 'No account found with that email.' });
  if (user.is_verified) return res.status(409).json({ error: 'This account is already verified. Please sign in.' });
  try {
    await rotateAndSend(user);
    res.json({ ok: true });
  } catch (err) {
    console.error('Resend failed:', err);
    res.status(502).json({ error: 'Could not send the email.' });
  }
}

async function rotateAndSend(user) {
  const verifyToken = randomBytes(32).toString('hex');
  await withDb((client) =>
    client.query('SELECT auth_rotate_verify_token($1, $2)', [user.id, verifyToken])
  );
  await sendVerificationEmail({
    email: user.email,
    verifyToken,
    fullName: `${user.first_name} ${user.last_name}`,
  });
}

/** POST /api/auth/login — rejects unverified accounts; sets the session cookie */
export async function login(req, res) {
  const { email, password } = req.body || {};
  const user = await withDb((client) => findUserByEmail(client, email));
  if (!user) return res.status(404).json({ error: 'No account found with that email. Register first.' });

  const ok = await bcrypt.compare(password || '', user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Incorrect email or password.' });

  if (!user.is_verified) {
    return res.status(403).json({
      needsVerification: true,
      email: user.email,
      error: 'Your email is not verified yet. Check your inbox for the verification link.',
    });
  }
  if (!user.is_active) {
    return res.status(403).json({ error: 'This account has been deactivated. Contact your barangay office.' });
  }

  await withDb((client) => client.query('SELECT auth_touch_login($1)', [user.id]));
  await createSession(res, user.id);

  res.json({ ok: true, user: publicUser(user) });
}

/* ------------------------------------------------------------------ */
/* Password reset                                                     */
/* ------------------------------------------------------------------ */

const RESET_MINUTES = 60;

/**
 * POST /api/auth/forgot-password — { email }
 * Always answers { ok: true } so the response cannot be used to
 * probe which emails have accounts. When the account exists (and
 * is verified), a one-time reset link valid for 1 hour is emailed;
 * only the token's SHA-256 hash is stored.
 */
export async function forgotPassword(req, res) {
  const email = String(req.body?.email || '').trim();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ errors: { email: 'A valid email address is required.' } });
  }

  const user = await withDb((client) => findUserByEmail(client, email));
  // Unregistered / unverified accounts get the same silent ok.
  if (user && user.is_verified && user.is_active) {
    const resetToken = randomBytes(32).toString('hex');
    await withDb((client) =>
      client.query('SELECT auth_set_reset_token($1, $2, $3)',
        [user.id, hashToken(resetToken), RESET_MINUTES])
    );
    try {
      await sendPasswordResetEmail({
        email: user.email,
        fullName: `${user.first_name} ${user.last_name}`,
        resetToken,
      });
    } catch (err) {
      console.error('Send password-reset email failed:', err);
      // Still answer ok — the email is the delivery channel, and we
      // never reveal account state through this endpoint.
    }
  }
  res.json({ ok: true });
}

/**
 * POST /api/auth/reset-password — { token, password }
 * Consumes the one-time token, sets the new password, and revokes
 * every session of that user (all devices signed out).
 */
export async function resetPassword(req, res) {
  const { token, password } = req.body || {};
  const errs = {};
  if (!token || !/^[0-9a-f]{64}$/i.test(token)) errs.token = 'This reset link is not valid.';
  if (!password || password.length < 8) errs.password = 'The new password must be at least 8 characters.';
  if (Object.keys(errs).length) return res.status(400).json({ errors: errs });

  const updated = await withDb(async (client) => {
    const { rows } = await client.query(
      'SELECT auth_consume_reset($1, $2) AS user_id',
      [hashToken(token), await bcrypt.hash(password, 10)]
    );
    return rows[0]?.user_id || null;
  });

  if (!updated) {
    return res.status(400).json({
      error: 'This reset link is invalid or has expired. Please request a new one.',
      expired: true,
    });
  }
  res.json({ ok: true });
}

/** POST /api/auth/logout */
export async function logout(req, res) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) {
    await withDb((client) =>
      client.query('SELECT auth_revoke_session($1)', [hashToken(token)])
    );
  }
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ ok: true });
}

/** GET /api/auth/me — current session user (used by the frontend AuthProvider) */
export async function me(req, res) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return res.status(401).json({ error: 'Not signed in.' });
  const user = await withDb((client) =>
    client.query('SELECT * FROM resolve_session($1)', [hashToken(token)])
      .then(({ rows }) => rows[0] || null)
  );
  if (!user) return res.status(401).json({ error: 'Session expired.' });
  res.json({ user: publicUser(user) });
}
