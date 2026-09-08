import { apiGet } from './client';
import type { MapHotspot, MapIncident } from '@/types/api';

export async function fetchPublicMap() {
  return apiGet<{ incidents: MapIncident[]; hotspots: MapHotspot[] }>('/api/gis/public-map');
}
