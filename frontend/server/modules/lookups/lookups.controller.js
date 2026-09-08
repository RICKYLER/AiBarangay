import { withDb } from '../../config/db.js';

/** GET /api/lookups/categories — active categories for the report wizard */
export async function categories(_req, res) {
  const { rows } = await withDb((c) =>
    c.query(`SELECT id, name, description, icon, color FROM categories
              WHERE is_active ORDER BY name`)
  );
  res.json({ categories: rows });
}

/** GET /api/lookups/barangays — Tagum City barangays (+ population) */
export async function barangays(_req, res) {
  const { rows } = await withDb((c) =>
    c.query(`SELECT b.id, b.name, b.code, b.population,
                    ST_Y(b.center_point) AS latitude,
                    ST_X(b.center_point) AS longitude
               FROM barangays b
               JOIN cities_municipalities cm ON cm.id = b.city_municipality_id
              WHERE cm.name = 'Tagum City' AND b.is_active
              ORDER BY b.name`)
  );
  res.json({ barangays: rows });
}

/** GET /api/lookups/zones?barangayId=… — zones for a barangay */
export async function zones(req, res) {
  const barangayId = req.query.barangayId;
  const { rows } = await withDb((c) =>
    c.query(
      `SELECT id, name, code FROM zones
        WHERE ($1::uuid IS NULL OR barangay_id = $1::uuid)
        ORDER BY name`,
      [barangayId || null]
    )
  );
  res.json({ zones: rows });
}

/** GET /api/lookups/priorities */
export async function priorities(_req, res) {
  const { rows } = await withDb((c) =>
    c.query(`SELECT id, name, level, color, response_target_minutes
               FROM priorities ORDER BY level`)
  );
  res.json({ priorities: rows });
}
