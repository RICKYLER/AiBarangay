import type { NextConfig } from 'next';

/**
 * The frontend never talks to Postgres directly — every data call goes
 * through the Express API (backend/src/index.js), which enforces RLS.
 * In dev, /api and /uploads are rewritten to the backend so cookies and
 * CORS stay same-origin.
 */
const BACKEND = process.env.BACKEND_ORIGIN || 'http://localhost:4000';

const nextConfig: NextConfig = {
  // react-leaflet v4 creates its map inside a ref callback with a stale
  // closure, so React StrictMode's dev-only double-mount runs
  // `new L.Map(sameDiv)` twice and Leaflet throws
  // "Map container is already initialized". StrictMode must stay off
  // until react-leaflet handles remounts (production is unaffected —
  // double-mounting never happens there).
  reactStrictMode: false,
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${BACKEND}/api/:path*` },
      { source: '/uploads/:path*', destination: `${BACKEND}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
