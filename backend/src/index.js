import './env.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';

import * as auth from './modules/auth/auth.controller.js';
import * as lookups from './modules/lookups/lookups.controller.js';
import * as reports from './modules/reports/reports.controller.js';
import * as barangay from './modules/barangay/barangay.controller.js';
import * as gis from './modules/gis/gis.controller.js';
import * as notifications from './modules/notifications/notifications.controller.js';
import * as chat from './modules/chat/chat.controller.js';
import * as profile from './modules/profile/profile.controller.js';
import * as adminUsers from './modules/admin/users.controller.js';
import { requireAuth, requireRole, STAFF_ROLES, ADMIN_ROLES } from './middleware/auth.js';
import { userRoute } from './config/db.js';
import { transporter } from './mailer.js';

const PORT = Number(process.env.PORT || 4000);
const APP_ORIGIN = process.env.APP_ORIGIN || 'http://localhost:3000';
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 25);

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: APP_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

/* ---------- static: uploaded evidence photos ---------- */
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

/* ---------- health ---------- */
app.get('/api/health', async (_req, res) => {
  const db = await import('./config/db.js')
    .then(({ pool }) => pool.query('SELECT 1').then(() => true).catch(() => false))
    .catch(() => false);
  res.json({ ok: true, db, mailerReady: Boolean(process.env.SMTP_USER) });
});

/* ---------- auth ---------- */
app.post('/api/auth/register', auth.register);
app.get('/api/auth/verify/:token', auth.verifyEmail);
app.post('/api/auth/resend', auth.resend);
app.post('/api/auth/login', auth.login);
app.post('/api/auth/forgot-password', auth.forgotPassword);
app.post('/api/auth/reset-password', auth.resetPassword);
app.post('/api/auth/logout', auth.logout);
app.get('/api/auth/me', requireAuth, auth.me);

/* ---------- profile (own identity) ---------- */
app.get('/api/profile', requireAuth, userRoute(profile.getProfile));
app.put('/api/profile', requireAuth, userRoute(profile.updateProfile));
app.put('/api/profile/password', requireAuth, userRoute(profile.changePassword));

/* ---------- lookups (public) ---------- */
app.get('/api/lookups/categories', lookups.categories);
app.get('/api/lookups/barangays', lookups.barangays);
app.get('/api/lookups/zones', lookups.zones);
app.get('/api/lookups/priorities', lookups.priorities);

/* ---------- reports (resident) ---------- */
app.post(
  '/api/reports',
  requireAuth,
  (req, res, next) => {
    // Inline multer-lite: multipart photo + JSON-ish fields.
    import('multer').then(({ default: multer }) => {
      const upload = multer({
        storage: multer.diskStorage({
          destination: UPLOADS_DIR,
          filename: (_req, file, cb) =>
            cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${path.extname(file.originalname) || '.jpg'}`),
        }),
        limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
        fileFilter: (_req, file, cb) =>
          /^image\//.test(file.mimetype) ? cb(null, true) : cb(new Error('Only image uploads are supported.')),
      });
      upload.single('photo')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
      });
    }).catch(next);
  },
  reports.createReport
);
app.get('/api/reports/mine', requireAuth, reports.myReports);
app.get('/api/reports/:id', requireAuth, reports.reportDetail);

/* ---------- barangay operations ---------- */
app.get('/api/barangay/review-queue', requireAuth, requireRole(...STAFF_ROLES), barangay.reviewQueue);
app.get('/api/barangay/reports/:id', requireAuth, requireRole(...STAFF_ROLES), barangay.reviewDetail);
app.post('/api/barangay/reports/:id/verify', requireAuth, requireRole(...STAFF_ROLES), barangay.verifyReport);
app.post('/api/barangay/reports/:id/reject', requireAuth, requireRole(...STAFF_ROLES), barangay.rejectReport);

/* ---------- admin: user management ---------- */
app.get('/api/admin/users', requireAuth, requireRole(...ADMIN_ROLES), adminUsers.listUsers);
app.post('/api/admin/users', requireAuth, requireRole(...ADMIN_ROLES), adminUsers.createUser);
app.put('/api/admin/users/:id/status', requireAuth, requireRole(...ADMIN_ROLES), adminUsers.setUserStatus);

/* ---------- gis (public) ---------- */
app.get('/api/gis/public-map', gis.publicMap);
app.get('/api/gis/barangay-centers', gis.barangayCenters);

/* ---------- notifications ---------- */
app.get('/api/notifications', requireAuth, notifications.list);
app.post('/api/notifications/:id/read', requireAuth, notifications.markRead);
app.post('/api/notifications/read-all', requireAuth, notifications.markAllRead);

/* ---------- chat (resident ↔ desk) ---------- */
app.get('/api/chat/desks', requireAuth, chat.listDesks);
app.get('/api/chat/threads', requireAuth, chat.listThreads);
app.post('/api/chat/threads', requireAuth, chat.createThread);
app.get('/api/chat/threads/:id/messages', requireAuth, chat.threadMessages);
app.post('/api/chat/threads/:id/messages', requireAuth, chat.sendMessage);

/* ---------- errors ---------- */
app.use((err, _req, res, _next) => {
  console.error('[api]', err);
  res.status(err.status || 500).json({ error: err.message || 'Unexpected server error.' });
});

/* ---------- boot ---------- */
transporter.verify().then(
  () => console.log(`[mailer] SMTP ready (${process.env.SMTP_USER})`),
  (err) => console.warn('[mailer] SMTP NOT ready — emails will fail:', err.message),
);

app.listen(PORT, () => {
  console.log(`[api] AI Barangay API listening on http://localhost:${PORT}`);
  console.log(`[api] App origin: ${APP_ORIGIN} · uploads: ${UPLOADS_DIR}`);
});
