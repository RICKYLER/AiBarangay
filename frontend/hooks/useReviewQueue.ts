'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchReviewQueue } from '@/lib/api/barangay';
import type { ReviewQueueItem } from '@/types/api';

/** Barangay review queue — submitted / under-review reports. */
export function useReviewQueue() {
  const [items, setItems] = useState<ReviewQueueItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { reports } = await fetchReviewQueue();
      setItems(reports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the review queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, loading, error, reload };
}
