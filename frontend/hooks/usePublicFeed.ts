'use client';

import { useEffect, useState } from 'react';
import { fetchPublicFeed } from '@/lib/api/gis';
import type { FeedFilter, FeedItem, FeedStats } from '@/types/api';

/** Public news feed: anonymized resident reports + incidents through resolution. */
export function usePublicFeed(filter: FeedFilter = 'ALL', limit = 24) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [stats, setStats] = useState<FeedStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchPublicFeed({ filter, limit });
        if (cancelled) return;
        setItems(data.items);
        setStats(data.stats);
      } catch {
        /* feed renders empty on failure */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter, limit]);

  return { items, stats, loading };
}
