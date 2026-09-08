import type { NextConfig } from 'next';

/**
 * The frontend never talks to Postgres directly — every data call goes
 * through the Express API (frontend/server/app.js), which enforces RLS.
 *
 * /api/* is served by frontend/pages/api/[[...slug]].js, which bridges
 * into that Express app — in `next dev` AND on Vercel. One origin, one
 * code path; the httpOnly session cookie stays same-site everywhere.
 * Uploaded photos are served from Supabase Storage's public URL, so no
 * /uploads proxy is needed anymore.
 */
const nextConfig: NextConfig = {
  // react-leaflet v4 creates its map inside a ref callback with a stale
  // closure, so React StrictMode's dev-only double-mount runs
  // `new L.Map(sameDiv)` twice and Leaflet throws
  // "Map container is already initialized". StrictMode must stay off
  // until react-leaflet handles remounts (production is unaffected —
  // double-mounting never happens there).
  reactStrictMode: false,
};

export default nextConfig;
