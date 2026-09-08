'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/api/notifications';
import type { AppNotification } from '@/types/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[] | null>(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications);
      setUnread(data.unread);
    } catch {
      setNotifications([]);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev ? prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)) : prev
    );
    setUnread((u) => Math.max(0, u - 1));
    await markNotificationRead(id).catch(() => undefined);
  }, []);

  const markAll = useCallback(async () => {
    setNotifications((prev) => (prev ? prev.map((n) => ({ ...n, is_read: true })) : prev));
    setUnread(0);
    await markAllNotificationsRead().catch(() => undefined);
  }, []);

  return { notifications, unread, loading, reload, markRead, markAll };
}
