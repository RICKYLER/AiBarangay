import { apiGet, apiPost } from './client';
import type { AppNotification } from '@/types/api';

export async function fetchNotifications() {
  return apiGet<{ notifications: AppNotification[]; unread: number }>('/api/notifications');
}

export async function markNotificationRead(id: string) {
  return apiPost<{ ok: boolean }>(`/api/notifications/${encodeURIComponent(id)}/read`);
}

export async function markAllNotificationsRead() {
  return apiPost<{ ok: boolean }>('/api/notifications/read-all');
}
