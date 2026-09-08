'use client';

import { useEffect, useState } from 'react';
import { fetchBarangays, fetchCategories } from '@/lib/api/lookups';
import type { Barangay, Category } from '@/types/api';

/** Categories + Tagum barangays for the report wizard dropdowns. */
export function useLookups() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [c, b] = await Promise.all([fetchCategories(), fetchBarangays()]);
        if (cancelled) return;
        setCategories(c.categories);
        setBarangays(b.barangays);
      } catch {
        /* dropdowns simply stay empty; forms validate server-side too */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, barangays, loading };
}
