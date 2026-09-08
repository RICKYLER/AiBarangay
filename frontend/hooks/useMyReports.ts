'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchMyReports } from '@/lib/api/reports';
import type { ResidentReport } from '@/types/api';

/** The signed-in resident's own reports (RLS-enforced server-side). */
export function useMyReports() {
  const [reports, setReports] = useState<ResidentReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { reports } = await fetchMyReports();
      setReports(reports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { reports, loading, error, reload };
}
