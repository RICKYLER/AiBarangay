'use client';

import { useEffect, useState } from 'react';
import { fetchPublicMap } from '@/lib/api/gis';
import type { MapHotspot, MapIncident } from '@/types/api';

/** Public community-map layer: anonymized incident points + hotspots. */
export function usePublicMap() {
  const [incidents, setIncidents] = useState<MapIncident[]>([]);
  const [hotspots, setHotspots] = useState<MapHotspot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchPublicMap();
        if (cancelled) return;
        setIncidents(data.incidents);
        setHotspots(data.hotspots);
      } catch {
        /* map renders empty on failure */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { incidents, hotspots, loading };
}
