/**
 * Map tile proxy — serves basemap tiles from our own origin so the
 * browser never has to reach third-party tile CDNs directly. This
 * keeps the maps working behind networks, DNS filters, or browser
 * extensions that block openstreetmap.org / carto.com / esri.
 *
 * GET /api/tiles/:style/:z/:x/:y.png
 *   style: light (CARTO light basemap) · streets (OSM) · satellite (Esri)
 *
 * Politeness: identifying User-Agent (OSM tile usage policy), bounded
 * in-memory cache, shared in-flight requests.
 */

const TILE_STYLES = {
  light: (z, x, y) => `https://basemaps.cartocdn.com/light_all/${z}/${x}/${y}.png`,
  streets: (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  satellite: (z, x, y) =>
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
};

const CACHE_MAX = 800;
const cache = new Map(); // key -> { buf, type } (Map preserves insert order for FIFO eviction)
const inflight = new Map(); // key -> Promise

const UA = 'AI-Barangay-Problem-Mapper/1.0 (capstone project; contact via app)';

function cacheSet(key, entry) {
  cache.set(key, entry);
  if (cache.size > CACHE_MAX) {
    cache.delete(cache.keys().next().value);
  }
}

export async function tile(req, res) {
  const { style, z, x, y } = req.params;

  const url = TILE_STYLES[style]?.(
    Number(z), Number(x), String(y).replace(/\.png$/, '')
  );
  if (
    !url ||
    !Number.isInteger(Number(z)) || !Number.isInteger(Number(x)) || !Number.isInteger(Number(y).replace(/\.png$/, '')) ||
    Number(z) < 0 || Number(z) > 19
  ) {
    return res.status(400).json({ error: 'Unknown tile style or coordinates' });
  }

  const cached = cache.get(url);
  if (cached) {
    res.set('Content-Type', cached.type);
    res.set('Cache-Control', 'public, max-age=604800');
    return res.send(cached.buf);
  }

  let pending = inflight.get(url);
  if (!pending) {
    pending = (async () => {
      const upstream = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'image/png,image/*;q=0.8' },
        signal: AbortSignal.timeout(10000),
      });
      if (!upstream.ok) {
        const err = new Error(`upstream ${upstream.status}`);
        err.status = upstream.status === 404 ? 404 : 502;
        throw err;
      }
      const type = upstream.headers.get('content-type') || 'image/png';
      const buf = Buffer.from(await upstream.arrayBuffer());
      return { buf, type };
    })().finally(() => inflight.delete(url));
    inflight.set(url, pending);
  }

  try {
    const { buf, type } = await pending;
    cacheSet(url, { buf, type });
    res.set('Content-Type', type);
    res.set('Cache-Control', 'public, max-age=604800');
    res.send(buf);
  } catch (err) {
    res.status(err.status === 404 ? 404 : 502).json({ error: 'Tile fetch failed' });
  }
}
