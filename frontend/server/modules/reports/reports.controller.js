import crypto from 'node:crypto';
import { userRoute } from '../../config/db.js';
import { analyzeReport } from '../ai/analyzer.js';

/* Upload the in-memory photo buffer to the public Supabase Storage bucket.
 *
 * Serverless filesystems are read-only, so the API never writes to disk —
 * photos live in Storage and are served straight from its public URL
 * (`<SUPABASE_URL>/storage/v1/object/public/uploads/<filename>`).
 * The service-role key authorizes the write; the bucket itself is public
 * for reads (database/schema/17_storage.sql). */
async function uploadPhotoToStorage(file) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Photo storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  }
  const ext = (file.originalname.match(/\.[a-z0-9]+$/i) || ['.jpg'])[0].toLowerCase();
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/uploads/${filename}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': file.mimetype,
      'x-upsert': 'true',
    },
    body: file.buffer,
  });
  if (!upload.ok) {
    const detail = await upload.text().catch(() => '');
    throw new Error(`Photo upload failed (${upload.status}). ${detail}`.trim());
  }
  return {
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/uploads/${filename}`,
    storagePath: `uploads/${filename}`,
  };
}

/* ------------------------------------------------------------------ */
/* POST /api/reports — resident submits a report                       */
/* multipart/form-data: title, description, categoryId/categoryName,   */
/* latitude, longitude, address, zone, photo (optional file)           */
/* ------------------------------------------------------------------ */
export const createReport = userRoute(async (req, res, client, session) => {
  const {
    title, description, categoryId, categoryName,
    latitude, longitude, address, zone,
  } = req.body || {};

  const errs = {};
  if (!title || !title.trim()) errs.title = 'A short title is required.';
  if (!description || description.trim().length < 10) errs.description = 'Please describe the problem (at least 10 characters).';
  if (latitude == null || longitude == null) errs.location = 'Drop a pin on the map to tell us where the problem is.';
  if (Object.keys(errs).length) return res.status(400).json({ errors: errs });

  // ---- 1. AI pass (decision support, before the insert) -------------
  // Real LLM via AI_API_KEY (agentrouter.org); falls back to the
  // rule engine if the model is unreachable — submission never blocks.
  const analysis = await analyzeReport({ title, description, category: categoryName || categoryId });

  // ---- 2. Insert the report (status SUBMITTED) ----------------------
  const statusId = (await client.query(
    `SELECT id FROM incident_statuses WHERE name = 'SUBMITTED'`
  )).rows[0].id;

  const reportRow = (
    await client.query(
      `INSERT INTO reports (resident_id, category_id, title, description,
                            status_id, priority_id, source)
       VALUES ($1, $2, $3, $4, $5,
               calculate_report_priority(NULL, $2, $6), 'WEB_PORTAL')
       RETURNING id, report_number`,
      [
        session.id,
        categoryId || null,
        title.trim(),
        description.trim(),
        statusId,
        analysis.confidenceScore,
      ]
    )
  ).rows[0];

  // ---- 3. Location (PostGIS trigger auto-detects the barangay) ------
  const loc = (
    await client.query(
      `INSERT INTO report_locations (report_id, latitude, longitude, address,
                                     accuracy, location_source)
       VALUES ($1, $2, $3, $4, $5, 'MAP_PIN')
       RETURNING barangay_id`,
      [reportRow.id, Number(latitude), Number(longitude), address || null, req.body.accuracy || null]
    )
  ).rows[0];

  // Zone, when the resident picked one, is matched inside the detected barangay.
  if (zone && loc?.barangay_id) {
    await client.query(
      `UPDATE report_locations rl
          SET zone_id = z.id
         FROM zones z
        WHERE z.barangay_id = $2 AND lower(z.name) = lower($3)
          AND rl.report_id = $1`,
      [reportRow.id, loc.barangay_id, zone]
    );
  }

  // ---- 4. Media (photo buffered in memory by multer) ------------------
  // A storage outage must not block the report itself — same philosophy
  // as the AI pass: submit anyway, log, skip the photo.
  if (req.file) {
    try {
      const stored = await uploadPhotoToStorage(req.file);
      await client.query(
        `INSERT INTO report_media (report_id, uploaded_by, file_url, file_type,
                                   mime_type, file_size, storage_path, metadata)
         VALUES ($1, $2, $3, 'IMAGE', $4, $5, $6, $7)`,
        [
          reportRow.id, session.id, stored.publicUrl,
          req.file.mimetype, req.file.size, stored.storagePath,
          JSON.stringify({ originalName: req.file.originalname }),
        ]
      );
    } catch (err) {
      console.error('[reports] photo upload skipped:', err.message);
    }
  }

  // ---- 5. Persist the AI analysis -------------------------------------
  await client.query(
    `INSERT INTO ai_analyses (report_id, model_name, model_version, analysis_type,
                              category_prediction, priority_prediction, summary,
                              confidence_score, detected_keywords, reasoning)
     VALUES ($1, $2, $3, $4,
             (SELECT id FROM categories WHERE lower(name) = lower($5)),
             (SELECT id FROM priorities WHERE name = $6),
             $7, $8, $9::jsonb, $10::jsonb)`,
    [
      reportRow.id,
      analysis.modelName, analysis.modelVersion || '1.0.0', analysis.analysisType,
      analysis.categoryPrediction, analysis.priorityPrediction,
      analysis.summary, analysis.confidenceScore,
      JSON.stringify(analysis.detectedKeywords),
      JSON.stringify({
        score: analysis.score,
        engine: analysis.engine,
        ...(analysis.reasoning ? { reasoning: analysis.reasoning } : {}),
      }),
    ]
  );

  // ---- 6. Duplicate candidates (nearby open reports, last 14 days) ----
  const nearby = await client.query(
    `SELECT report_id, distance_m FROM find_nearby_reports($1, 150, 14)`,
    [reportRow.id]
  );
  for (const n of nearby.rows) {
    await client.query(
      `INSERT INTO duplicate_matches (report_id, matched_report_id, similarity_score,
                                      match_type, ai_confidence, review_status)
       VALUES ($1, $2, $3, 'LOCATION', $4, 'PENDING')
       -- no explicit conflict target: with RLS an arbiter clause can trip
       -- the insert policy (known Postgres quirk), plain DO NOTHING is enough
       ON CONFLICT DO NOTHING`,
      [reportRow.id, n.report_id,
       Math.max(0, 1 - n.distance_m / 300), // closer → higher similarity
       analysis.confidenceScore]
    );
  }

  // ---- 7. Notify the resident ------------------------------------------
  await client.query(
    `INSERT INTO notifications (user_id, type, title, message)
     VALUES ($1, 'REPORT_RECEIVED', 'Your report was received',
             $2)`,
    [session.id,
     `Thank you for your report "${title.trim()}". Tracking number ${reportRow.report_number}. Our team will review it shortly.`]
  );

  res.status(201).json({
    ok: true,
    reportNumber: reportRow.report_number,
    reportId: reportRow.id,
    ai: {
      priority: analysis.priorityPrediction,
      confidence: analysis.confidenceScore,
      summary: analysis.summary,
      duplicateCandidates: nearby.rows.length,
    },
  });
});

/* ------------------------------------------------------------------ */
/* GET /api/reports/mine — the resident's own reports (RLS-scoped)    */
/* ------------------------------------------------------------------ */
export const myReports = userRoute(async (req, res, client) => {
  const { rows } = await client.query(
    `SELECT * FROM v_resident_reports ORDER BY submitted_at DESC`
  );
  res.json({ reports: rows });
});

/* ------------------------------------------------------------------ */
/* GET /api/reports/:id — detail + media + timeline                    */
/* ------------------------------------------------------------------ */
export const reportDetail = userRoute(async (req, res, client) => {
  const id = req.params.id;

  const report = (
    await client.query(`SELECT * FROM v_resident_reports WHERE id::text = $1 OR report_number = $1`, [id])
  ).rows[0];
  if (!report) return res.status(404).json({ error: 'Report not found.' });

  const media = (
    await client.query(
      `SELECT id, file_url, file_type, mime_type, created_at FROM report_media
        WHERE report_id = $1 ORDER BY created_at`,
      [report.id]
    )
  ).rows;

  // Timeline: status timestamps + field updates + notifications
  const timeline = (
    await client.query(
      `SELECT 'status' AS kind, verified_at AS at, 'Report verified' AS text
         FROM incidents WHERE report_id = $1 AND verified_at IS NOT NULL
       UNION ALL
       SELECT 'field', fu.created_at, initcap(replace(fu.update_type::text, '_', ' ')) || COALESCE(' — ' || fu.notes, '')
         FROM field_updates fu JOIN incidents i ON i.id = fu.incident_id
        WHERE i.report_id = $1
       UNION ALL
       SELECT 'resolution', rs.completion_date::timestamptz, 'Resolved: ' || COALESCE(rs.action_taken, rs.description, '')
         FROM resolutions rs JOIN incidents i ON i.id = rs.incident_id
        WHERE i.report_id = $1
       ORDER BY at DESC`,
      [report.id]
    )
  ).rows;

  res.json({ report, media, timeline });
});
