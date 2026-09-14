'use client';

import { useEffect } from 'react';

/**
 * Service-worker lifecycle manager.
 *
 * Production: registers /sw.js (offline support, installable PWA).
 *
 * Development: nothing to do here — app/layout.tsx renders an inline
 * pre-hydration script that unregisters any leftover production worker
 * and purges its caches. That cleanup used to live in this component,
 * but it only ran after hydration, and the stale chunks it was meant
 * to evict could crash React before this effect ever fired.
 */
export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('[pwa] service worker registration failed:', err);
      });
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);

  return null;
}
