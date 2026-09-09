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

const FEED_FILTERS = new Set(['ALL', 'NEW', 'ACTIVE', 'RESOLVED']);

/**
 * GET /api/gis/public-feed — anonymized news feed of community
 * activity for the public news page: fresh resident reports and
 * incidents from verification through resolution. No personal
 * data, no report titles/descriptions, no exact addresses
 * (see database/functions/public_feed.sql).
 */
export async function publicFeed(req, res) {
  // SECURITY DEFINER functions — same sanctioned anonymous read
  // path as publicMap above. Anonymized columns only.
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 50);
  const filter = FEED_FILTERS.has(req.query.filter) ? req.query.filter : 'ALL';

  const { rows } = await withDb((c) =>
    c.query('SELECT * FROM get_public_feed($1, $2)', [limit, filter])
  );
  const stats = await withDb((c) => c.query('SELECT * FROM get_public_feed_stats()'));

  res.json({ items: rows, stats: stats.rows[0] });
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
