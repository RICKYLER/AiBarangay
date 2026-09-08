'use client';

import dynamic from 'next/dynamic';

/* Leaflet touches `window` at import time, so map components must never
   load during SSR/prerender — they are fetched in the browser only. */
const CommunityMapLive = dynamic(() => import('./CommunityMapLive'), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-label="Loading map"
      style={{ width: '100%', height: '560px', background: '#0b1120', borderRadius: 8 }}
    />
  ),
});

export default CommunityMapLive;
