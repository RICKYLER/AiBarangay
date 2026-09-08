'use client';

import React, { useMemo } from 'react';
import {
  Bell, CheckCircle2, MessageSquare, ShieldCheck, Megaphone, CheckCheck,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

/* DB notification_type → icon + color class. */
const TYPE_ICONS = {
  REPORT_RECEIVED: { icon: Bell, cls: '' },
  UNDER_REVIEW: { icon: Bell, cls: '' },
  VERIFIED: { icon: ShieldCheck, cls: 'resolved' },
  ASSIGNED: { icon: Bell, cls: '' },
  FIELD_RESPONSE: { icon: Bell, cls: '' },
  RESOLVED: { icon: CheckCircle2, cls: 'resolved' },
  REJECTED: { icon: Bell, cls: '' },
  DUPLICATE: { icon: Bell, cls: '' },
  MESSAGE: { icon: MessageSquare, cls: 'message' },
  SYSTEM: { icon: Megaphone, cls: 'announce' },
};

function iconFor(type) {
  return TYPE_ICONS[type] || { icon: Bell, cls: '' };
}

function groupFor(iso) {
  const now = new Date();
  const at = new Date(iso);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = at.getTime();
  if (t >= startOfToday) return 'Today';
  if (t >= startOfToday - 86400000) return 'Yesterday';
  if (t >= startOfToday - 7 * 86400000) return 'This Week';
  return 'Earlier';
}

function timeAgo(iso) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/**
 * ResidentNotifications — status changes on the resident's own reports,
 * messages, and community announcements. Nothing administrative.
 * Data comes from the API (RLS: only the resident's own notifications).
 */
export default function ResidentNotifications() {
  const { notifications, unread, loading, markRead, markAll } = useNotifications();

  const grouped = useMemo(() => {
    const items = notifications || [];
    const buckets = new Map();
    for (const n of items) {
      const g = groupFor(n.created_at);
      if (!buckets.has(g)) buckets.set(g, []);
      buckets.get(g).push(n);
    }
    // Newest first within each group; groups newest-first.
    const order = ['Today', 'Yesterday', 'This Week', 'Earlier'];
    return order
      .filter((g) => buckets.has(g))
      .map((g) => ({ group: g, items: buckets.get(g) }));
  }, [notifications]);

  return (
    <div className="res-fade" style={{ maxWidth: 760 }}>
      <div className="res-section-head">
        <div>
          <span className="res-section-eyebrow">NOTIFICATIONS</span>
          <h2 className="res-section-title">
            Updates for you {unread > 0 && <span style={{ fontSize: 14, color: 'var(--res-teal)' }}>({unread} new)</span>}
          </h2>
          <p className="res-section-sub">Status changes on your reports, messages, and community announcements.</p>
        </div>
        {unread > 0 && (
          <button type="button" className="res-btn res-btn-secondary res-btn-sm" onClick={markAll}>
            <CheckCheck size={15} aria-hidden="true" /> Mark all as read
          </button>
        )}
      </div>

      {loading && (
        <p className="res-empty-text" aria-live="polite">Loading notifications…</p>
      )}

      {!loading && grouped.length === 0 && (
        <div className="res-empty">
          <span className="res-empty-icon"><Bell size={22} /></span>
          <p className="res-empty-title">No notifications yet</p>
          <p className="res-empty-text">
            You&apos;ll be notified here whenever the status of one of your
            reports changes.
          </p>
        </div>
      )}

      {grouped.map(({ group, items }) => (
        <section key={group} aria-label={group}>
          <h3 className="res-notif-group-label">{group}</h3>
          {items.map((n) => {
            const T = iconFor(n.type);
            return (
              <article
                key={n.id}
                className={`res-notif-item ${n.is_read ? '' : 'unread'}`}
                onClick={() => { if (!n.is_read) markRead(n.id); }}
                style={{ cursor: n.is_read ? 'default' : 'pointer' }}
                role={n.is_read ? undefined : 'button'}
                tabIndex={n.is_read ? undefined : 0}
                onKeyDown={(e) => {
                  if (!n.is_read && (e.key === 'Enter' || e.key === ' ')) markRead(n.id);
                }}
              >
                <span className={`res-notif-icon ${T.cls}`} aria-hidden="true">
                  <T.icon size={19} />
                </span>
                <div className="res-notif-body">
                  <span className="res-notif-title">{n.title}</span>
                  <span className="res-notif-text">{n.message}</span>
                </div>
                <span className="res-notif-time">{timeAgo(n.created_at)}</span>
                {!n.is_read && <span className="res-notif-unread-dot" aria-label="Unread" role="img" />}
              </article>
            );
          })}
        </section>
      ))}

      {!loading && grouped.length > 0 && (
        <div className="res-note" style={{ marginTop: 20 }}>
          <Bell size={16} aria-hidden="true" />
          <span>
            Tap a notification to mark it as read. You will receive a
            notification whenever the status of your report changes.
          </span>
        </div>
      )}
    </div>
  );
}
