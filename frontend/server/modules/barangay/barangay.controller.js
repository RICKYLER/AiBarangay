import { userRoute } from '../../config/db.js';

/* ------------------------------------------------------------------ */
/* GET /api/barangay/review-queue — submitted/under-review reports     */
/* (RLS: staff see their barangay; LGU/SYSTEM_ADMIN see all)           */
/* ------------------------------------------------------------------ */
export const reviewQueue = userRoute(async (_req, res, client) => {
  const { rows } = await client.query(
    `SELECT * FROM v_barangay_review_queue
      ORDER BY pending_duplicate_flags DESC, submitted_at ASC`
  );
  res.json({ reports: rows });
});

/* ------------------------------------------------------------------ */
/* GET /api/barangay/reports/:id — full review payload                 */
/* ------------------------------------------------------------------ */
export const reviewDetail = userRoute(async (req, res, client) => {
  const id = req.params.id;

  const report = (
    await client.query(`SELECT * FROM v_resident_reports WHERE id::text = $1 OR report_number = $1`, [id])
  ).rows[0];
  if (!report) return res.status(404).json({ error: 'Report not found.' });

  const meta = (
    await client.query(
      `SELECT (u.first_name || ' ' || COALESCE(u.last_name, '')) AS resident_name,
              b.name AS barangay_name
         FROM reports r
         LEFT JOIN users u ON u.id = r.resident_id
         LEFT JOIN report_locations rl ON rl.report_id = r.id
         LEFT JOIN barangays b ON b.id = rl.barangay_id
        WHERE r.id = $1`,
      [report.id]
    )
  ).rows[0] || {};

  const media = (
    await client.query(
      `SELECT id, file_url, file_type, mime_type, created_at
         FROM report_media WHERE report_id = $1 ORDER BY created_at`,
      [report.id]
    )
  ).rows;

  const analyses = (
    await client.query(
      `SELECT a.*, c.name AS category_prediction_name, p.name AS priority_prediction_name
         FROM ai_analyses a
         LEFT JOIN categories c ON c.id = a.category_prediction
         LEFT JOIN priorities p ON p.id = a.priority_prediction
        WHERE a.report_id = $1
        ORDER BY a.created_at DESC`,
      [report.id]
    )
  ).rows;

  const duplicates = (
    await client.query(
      `SELECT dm.*,
              r.report_number AS matched_report_number,
              r.title         AS matched_report_title,
              r.status_id     AS matched_report_status_id
         FROM duplicate_matches dm
         JOIN reports r ON r.id = dm.matched_report_id
        WHERE dm.report_id = $1
        ORDER BY dm.similarity_score DESC`,
      [report.id]
    )
  ).rows;

  const suggested = (
    await client.query(
      `SELECT calculate_report_priority($1, NULL,
              (SELECT confidence_score FROM ai_analyses WHERE report_id = $1
                ORDER BY created_at DESC LIMIT 1)) AS priority_id`,
      [report.id]
    )
  ).rows[0].priority_id;

  const suggestedPriority = suggested
    ? (await client.query(`SELECT name, level, color FROM priorities WHERE id = $1`, [suggested])).rows[0]
    : null;

  res.json({ report, media, analyses, duplicates, suggestedPriority,
             residentName: meta.resident_name || 'Anonymous resident',
             barangayName: meta.barangay_name || null });
});

/* ------------------------------------------------------------------ */
/* POST /api/barangay/reports/:id/verify — REPORT → INCIDENT           */
/* ------------------------------------------------------------------ */
export const verifyReport = userRoute(async (req, res, client, session) => {
  const id = req.params.id;

  const report = (
    await client.query(`SELECT * FROM v_resident_reports WHERE id::text = $1 OR report_number = $1`, [id])
  ).rows[0];
  if (!report) return res.status(404).json({ error: 'Report not found.' });
  if (report.status !== 'SUBMITTED' && report.status !== 'UNDER_REVIEW') {
    return res.status(409).json({ error: `This report is already ${report.status}.` });
  }

  // Barangay is required for an incident — fall back to the reviewer's own.
  const barangayId = report.barangay_id || session.barangay_id;
  if (!barangayId) {
    return res.status(422).json({ error: 'The report has no barangay and your account has none either — set one before verifying.' });
  }

  const statusIds = Object.fromEntries(
    (await client.query(
      `SELECT name, id FROM incident_statuses WHERE name IN ('VERIFIED', 'REJECTED')`
    )).rows.map((r) => [r.name, r.id])
  );

  const incident = (
    await client.query(
      `INSERT INTO incidents (report_id, category_id, status_id, priority_id,
                              barangay_id, location_id, verified_by, verified_at)
       SELECT r.id, r.category_id, $2,
              COALESCE($3::uuid, r.priority_id),
              $4, rl.id, $5, now()
         FROM reports r
         JOIN report_locations rl ON rl.report_id = r.id
        WHERE r.id = $1
       RETURNING id, incident_number`,
      [report.id, statusIds.VERIFIED, req.body?.priorityId || null, barangayId, session.id]
    )
  ).rows[0];

  if (!incident) return res.status(409).json({ error: 'Could not create the incident (missing location row?).' });

  // The incident triggers mirror status/timestamps onto the report.

  await client.query(
    `INSERT INTO notifications (user_id, type, title, message)
     SELECT r.resident_id, 'VERIFIED', 'Your report was verified',
            'Your report "' || r.title || '" was verified as incident ' || $2 || '. Personnel will be assigned shortly.'
       FROM reports r WHERE r.id = $1`,
    [report.id, incident.incident_number]
  );

  res.status(201).json({
    ok: true,
    incidentNumber: incident.incident_number,
    incidentId: incident.id,
  });
});

/* ------------------------------------------------------------------ */
/* POST /api/barangay/reports/:id/reject                               */
/* ------------------------------------------------------------------ */
export const rejectReport = userRoute(async (req, res, client) => {
  const id = req.params.id;
  const reason = (req.body?.reason || '').trim() || 'The report did not meet verification requirements.';

  const report = (
    await client.query(`SELECT * FROM v_resident_reports WHERE id::text = $1 OR report_number = $1`, [id])
  ).rows[0];
  if (!report) return res.status(404).json({ error: 'Report not found.' });
  if (report.status !== 'SUBMITTED' && report.status !== 'UNDER_REVIEW') {
    return res.status(409).json({ error: `This report is already ${report.status}.` });
  }

  const statusId = (
    await client.query(`SELECT id FROM incident_statuses WHERE name = 'REJECTED'`)
  ).rows[0].id;

  await client.query(`UPDATE reports SET status_id = $2 WHERE id = $1`, [report.id, statusId]);

  await client.query(
    `INSERT INTO notifications (user_id, type, title, message)
     SELECT resident_id, 'REJECTED', 'Your report was not verified', $2
       FROM reports WHERE id = $1`,
    [report.id, `Your report "${report.title}" was not verified. Reason: ${reason}`]
  );

  res.json({ ok: true });
});
