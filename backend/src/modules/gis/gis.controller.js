import { withDb } from '../../config/db.js';

/**
 * GET /api/gis/public-map — anonymized map layer for the public
 * community map: verified+ incident points clustered by category,
 * plus current hotspot circles. No personal data, no exact addresses.
 */
export async function publicMap(_req, res) {
  // SECURITY DEFINER functions — the only sanctioned anonymous
  // read path over the RLS-protected incidents (see
  // database/functions/public_map.sql). Anonymized columns only.
  const { rows } = await withDb((c) => c.query('SELECT * FROM get_public_incidents()'));
  const hotspots = await withDb((c) => c.query('SELECT * FROM get_public_hotspots()'));

  res.json({ incidents: rows, hotspots: hotspots.rows });
}

/** GET /api/gis/barangay-boundaries — barangay centers for map labels */
export async function barangayCenters(_req, res) {
  const { rows } = await withDb((c) =>
    c.query(
      `SELECT b.name,
              ST_Y(b.center_point) AS latitude,
              ST_X(b.center_point) AS longitude
         FROM barangays b
         JOIN cities_municipalities cm ON cm.id = b.city_municipality_id
        WHERE cm.name = 'Tagum City' AND b.is_active
        ORDER BY b.name`
    )
  );
  res.json({ centers: rows });
}
