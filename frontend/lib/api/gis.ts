import { apiGet } from './client';
import type { FeedFilter, FeedItem, FeedStats, MapHotspot, MapIncident } from '@/types/api';

export async function fetchPublicMap() {
  return apiGet<{ incidents: MapIncident[]; hotspots: MapHotspot[] }>('/api/gis/public-map');
}

export async function fetchPublicFeed(params?: { limit?: number; filter?: FeedFilter }) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.filter) qs.set('filter', params.filter);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return apiGet<{ items: FeedItem[]; stats: FeedStats }>(`/api/gis/public-feed${suffix}`);
}
