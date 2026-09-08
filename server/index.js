import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  findUserByEmail, findUserByToken, createUser, verifyUser,
  rotateToken, checkPassword, publicUser,
} from './store.js';
import { sendVerificationEmail, transporter } from './mailer.js';

const PORT = Number(process.env.PORT || 4000);
const APP_ORIGIN = process.env.APP_ORIGIN || 'http://localhost:3000';

const app = express();
app.use(cors({ origin: APP_ORIGIN }));
app.use(express.json());

/* ---------- health ---------- */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mailerReady: Boolean(process.env.SMTP_USER) });
});

/* ---------- register: create account + send verification email ---------- */
app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, mobile, barangay, zone, password } = req.body || {};

  const errs = {};
  if (!fullName || !fullName.trim()) errs.fullName = 'Full name is required.';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errs.email = 'A valid email address is required.';
  if (!mobile || !mobile.trim()) errs.mobile = 'Mobile number is required.';
  if (!password || password.length < 8) errs.password = 'Password must be at least 8 characters.';
  if (Object.keys(errs).length > 0) return res.status(400).json({ errors: errs });

  const existing = findUserByEmail(email);
  if (existing) {
    if (existing.verified) {
      return res.status(409).json({
        error: 'An account with this email already exists. Try signing in instead.',
      });
    }
    /* Registered but never verified: refresh the token and resend. */
    try {
      const updated = rotateToken(existing);
      await sendVerificationEmail(updated);
      return res.json({ ok: true, resent: true, email: updated.email });
    } catch (err) {
      console.error('Resend verification email failed:', err);
      return res.status(502).json({ error: 'Could not send the verification email. Please try again.' });
    }
  }

  const user = createUser({ fullName, email, mobile, barangay, zone, password });
  try {
    await sendVerificationEmail(user);
    res.json({ ok: true, email: user.email });
  } catch (err) {
    console.error('Send verification email failed:', err);
    res.status(502).json({ error: 'Account created, but the verification email could not be sent. Please try registering again or contact support.' });
  }
});

/* ---------- verify: the link the user clicks in the email ---------- */
app.get('/api/auth/verify/:token', (req, res) => {
  const user = findUserByToken(req.params.token);
  if (!user) {
    return res.redirect(`${APP_ORIGIN}/verify-account?status=invalid`);
  }
  if (user.tokenExpires && Date.now() > user.tokenExpires) {
    return res.redirect(`${APP_ORIGIN}/verify-account?status=expired`);
  }
  verifyUser(user);
  res.redirect(`${APP_ORIGIN}/verify-account?status=ok&email=${encodeURIComponent(user.email)}`);
});

/* ---------- resend verification email ---------- */
app.post('/api/auth/resend', async (req, res) => {
  const user = findUserByEmail(req.body?.email);
  if (!user) return res.status(404).json({ error: 'No account found with that email.' });
  if (user.verified) return res.status(409).json({ error: 'This account is already verified. Please sign in.' });
  try {
    await sendVerificationEmail(rotateToken(user));
    res.json({ ok: true });
  } catch (err) {
    console.error('Resend failed:', err);
    res.status(502).json({ error: 'Could not send the email. Please try again.' });
  }
});

/* ---------- login: rejects unverified accounts ---------- */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = findUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'No account found with that email. Register first.' });
  if (!checkPassword(user, password || '')) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  if (!user.verified) {
    return res.status(403).json({
      needsVerification: true,
      email: user.email,
      error: 'Your email is not verified yet. Check your inbox for the verification link.',
    });
  }
  res.json({ ok: true, user: publicUser(user) });
});

/* ---------- dev helper: verify SMTP connection on boot ---------- */
transporter.verify().then(
  () => console.log(`[mailer] SMTP ready (${process.env.SMTP_USER})`),
  (err) => console.warn('[mailer] SMTP NOT ready — emails will fail:', err.message),
);

app.listen(PORT, () => {
  console.log(`[api] AI Barangay auth API listening on http://localhost:${PORT}`);
  console.log(`[api] App origin: ${APP_ORIGIN}`);
});
