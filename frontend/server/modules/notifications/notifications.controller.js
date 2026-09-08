import { userRoute } from '../../config/db.js';

/** GET /api/notifications — the signed-in user's notifications */
export const list = userRoute(async (_req, res, client) => {
  const { rows } = await client.query(
    `SELECT id, type, title, message, is_read, read_at, created_at
       FROM notifications
      ORDER BY created_at DESC
      LIMIT 100`
  );
  const unread = rows.filter((n) => !n.is_read).length;
  res.json({ notifications: rows, unread });
});

/** POST /api/notifications/:id/read */
export const markRead = userRoute(async (req, res, client) => {
  const { rowCount } = await client.query(
    `UPDATE notifications SET is_read = TRUE, read_at = now()
      WHERE id = $1`,
    [req.params.id]
  );
  if (!rowCount) return res.status(404).json({ error: 'Notification not found.' });
  res.json({ ok: true });
});

/** POST /api/notifications/read-all */
export const markAllRead = userRoute(async (_req, res, client) => {
  await client.query(
    `UPDATE notifications SET is_read = TRUE, read_at = now() WHERE NOT is_read`
  );
  res.json({ ok: true });
});
