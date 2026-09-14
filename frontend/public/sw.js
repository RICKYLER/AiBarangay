/**
 * AI Barangay Problem Mapper — service worker.
 *
 * Deliberately conservative, dependency-free:
 *   — /api/*            NEVER cached (session cookies, live data)
 *   — navigations       network-first, cache fallback, then /offline
 *   — static assets     cache-first (Next content-hashes them, so a
 *                       cached file is always the exact version a page
 *                       asked for)
 *
 * Bump CACHE_VERSION whenever this file's caching behavior changes —
 * the activate handler deletes every older cache.
 */
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `aibarangay-static-${CACHE_VERSION}`;

const OFFLINE_URL = '/offline';

/* Only these origins/paths may enter the static cache. */
function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icon-') ||
    url.pathname === '/apple-touch-icon.png' ||
    url.pathname === '/og.png' ||
    /\.(?:woff2?|png|svg|jpg|jpeg|webp)$/i.test(url.pathname)
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* Live data and anything authenticated always goes to the network. */
  if (url.pathname.startsWith('/api/')) return;

  /* Pages: network-first so residents always see the latest reports. */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL)),
        ),
    );
    return;
  }

  /* Hashed/static assets: cache-first. */
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches
                .open(STATIC_CACHE)
                .then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
  }
});
