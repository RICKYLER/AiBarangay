import { userRoute } from '../../config/db.js';

/**
 * Resident ↔ barangay desk chat.
 *
 * Desks are shared inboxes: a thread belongs to a resident and a
 * desk (not an individual account). Desk visibility and who may
 * reply are enforced by the chat RLS policies (policies/chat.sql):
 *   RESIDENT     → own threads
 *   BARANGAY_ADMIN / BARANGAY_STAFF → all threads in their barangay
 *   DESK_OFFICER → threads of their own desk in their barangay
 * Notifications are fired by the chat_messages trigger.
 */

const DESK_REPLY_ROLES = ['BARANGAY_ADMIN', 'BARANGAY_STAFF', 'DESK_OFFICER'];

/** GET /api/chat/desks — desk list for pickers. */
export const listDesks = userRoute(async (_req, res, client) => {
  const { rows } = await client.query(
    `SELECT id, name, description FROM chat_desks
      WHERE is_active
      ORDER BY name`
  );
  res.json({ desks: rows });
});

/** GET /api/chat/threads — conversation list for the signed-in side. */
export const listThreads = userRoute(async (req, res, client) => {
  // Whose inbox is this? Residents see their own conversations;
  // staff and desk officers work the desk side of the threads.
  const viewerSide = req.user.role === 'RESIDENT' ? 'RESIDENT' : 'DESK';

  const { rows } = await client.query(
    `SELECT t.id,
            t.subject,
            t.resident_name,
            d.name AS desk_name,
            t.created_at,
            last.body    AS last_body,
            last.side    AS last_side,
            last.created_at AS last_at,
            last.sender_name AS last_sender,
            (SELECT count(*)::int FROM chat_messages m
              WHERE m.thread_id = t.id
                AND m.side <> $1          -- messages from the other side
                AND m.read_at IS NULL) AS unread
       FROM chat_threads t
       JOIN chat_desks d ON d.id = t.desk_id
       LEFT JOIN LATERAL (
           SELECT body, side, created_at, sender_name
             FROM chat_messages m
            WHERE m.thread_id = t.id
            ORDER BY m.created_at DESC
            LIMIT 1
       ) last ON TRUE
      ORDER BY last.created_at DESC NULLS LAST, t.created_at DESC`,
    [viewerSide]
  );

  const totalUnread = rows.reduce((sum, t) => sum + (t.unread || 0), 0);
  res.json({ threads: rows, totalUnread, viewerSide });
});

/** POST /api/chat/threads — resident opens (or reopens) a conversation. */
export const createThread = [
  (req, res, next) => {
    if (req.user.role !== 'RESIDENT') {
      return res.status(403).json({ error: 'Only residents can start conversations.' });
    }
    next();
  },
  userRoute(async (req, res, client, session) => {
    const { deskId, subject } = req.body || {};
    const trimmed = (subject || '').trim().slice(0, 200);

    if (!deskId) return res.status(400).json({ error: 'Choose a desk to message.' });
    if (!session.barangay_id) {
      return res.status(400).json({ error: 'Your account has no barangay assigned yet.' });
    }

    const desk = await client.query(
      `SELECT id FROM chat_desks WHERE id = $1 AND is_active`,
      [deskId]
    );
    if (!desk.rowCount) return res.status(400).json({ error: 'That desk is not available.' });

    const residentName =
      [session.first_name, session.last_name].filter(Boolean).join(' ') || 'Resident';

    // Bare ON CONFLICT: an arbiter target can trip the insert policy
    // under RLS (known Postgres quirk — see reports.controller.js).
    const inserted = await client.query(
      `INSERT INTO chat_threads (resident_id, resident_name, desk_id, barangay_id, subject)
       VALUES ($1, $2, $3, $4, NULLIF($5, ''))
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [session.id, residentName, deskId, session.barangay_id, trimmed]
    );

    const thread = inserted.rows[0]
      ? inserted.rows[0]
      : (await client.query(
          `SELECT * FROM chat_threads
            WHERE resident_id = $1 AND desk_id = $2`,
          [session.id, deskId]
        )).rows[0];

    res.status(201).json({ ok: true, thread });
  }),
];

/** GET /api/chat/threads/:id/messages — thread detail (marks incoming read). */
export const threadMessages = userRoute(async (req, res, client) => {
  const viewerSide = req.user.role === 'RESIDENT' ? 'RESIDENT' : 'DESK';

  const thread = (await client.query(
    `SELECT t.id, t.subject, t.resident_name, d.name AS desk_name, t.created_at
       FROM chat_threads t
       JOIN chat_desks d ON d.id = t.desk_id
      WHERE t.id = $1`,
    [req.params.id]
  )).rows[0];

  if (!thread) return res.status(404).json({ error: 'Conversation not found.' });

  // Opening the conversation clears the other side's messages.
  // Shared inbox: any officer of the desk reads on behalf of the desk.
  await client.query(
    `UPDATE chat_messages
        SET read_at = now()
      WHERE thread_id = $1 AND side = $2 AND read_at IS NULL`,
    [req.params.id, viewerSide === 'RESIDENT' ? 'DESK' : 'RESIDENT']
  );

  const { rows } = await client.query(
    `SELECT id, sender_name, side, body, read_at, created_at
       FROM chat_messages
      WHERE thread_id = $1
      ORDER BY created_at ASC, id ASC`,
    [req.params.id]
  );

  res.json({ thread, messages: rows, viewerSide });
});

/** POST /api/chat/threads/:id/messages — send a message. */
export const sendMessage = userRoute(async (req, res, client, session) => {
  const body = (req.body?.body || '').trim();
  if (!body) return res.status(400).json({ error: 'Write a message first.' });
  if (body.length > 2000) return res.status(400).json({ error: 'Messages are limited to 2000 characters.' });

  const side = req.user.role === 'RESIDENT' ? 'RESIDENT' : 'DESK';
  if (side === 'DESK' && !DESK_REPLY_ROLES.includes(req.user.role)) {
    return res.status(403).json({ error: 'Your role can view conversations but not reply.' });
  }

  const senderName =
    [session.first_name, session.last_name].filter(Boolean).join(' ') || 'Barangay Staff';

  try {
    const { rows } = await client.query(
      `INSERT INTO chat_messages (thread_id, sender_id, sender_name, side, body)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, sender_name, side, body, read_at, created_at`,
      [req.params.id, session.id, senderName, side, body]
    );
    res.status(201).json({ ok: true, message: rows[0] });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(404).json({ error: 'Conversation not found.' });
    }
    throw err;
  }
});
