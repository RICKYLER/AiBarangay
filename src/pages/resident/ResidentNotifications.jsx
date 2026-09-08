import React, { useState } from 'react';
import {
  Bell, CheckCircle2, MessageSquare, ShieldCheck, Megaphone, CheckCheck,
} from 'lucide-react';
import { NOTIFICATIONS } from '../../data/residentData';

const TYPE_ICONS = {
  update: { icon: Bell, cls: '' },
  resolved: { icon: CheckCircle2, cls: 'resolved' },
  message: { icon: MessageSquare, cls: 'message' },
  verified: { icon: ShieldCheck, cls: 'resolved' },
  announce: { icon: Megaphone, cls: 'announce' },
};

/**
 * ResidentNotifications — status changes on the resident's own reports,
 * messages, and community announcements. Nothing administrative.
 */
export default function ResidentNotifications() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const unread = items.filter((n) => !n.read).length;

  const markAllRead = () =>
    setItems((list) => list.map((n) => ({ ...n, read: true })));

  const groups = ['Today', 'Yesterday', 'This Week'];
  const visible = groups.filter((g) => items.some((n) => n.group === g));

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
          <button type="button" className="res-btn res-btn-secondary res-btn-sm" onClick={markAllRead}>
            <CheckCheck size={15} aria-hidden="true" /> Mark all as read
          </button>
        )}
      </div>

      {visible.map((group) => (
        <section key={group} aria-label={group}>
          <h3 className="res-notif-group-label">{group}</h3>
          {items
            .filter((n) => n.group === group)
            .map((n) => {
              const T = TYPE_ICONS[n.type] || TYPE_ICONS.update;
              return (
                <article key={n.id} className={`res-notif-item ${n.read ? '' : 'unread'}`}>
                  <span className={`res-notif-icon ${T.cls}`} aria-hidden="true">
                    <T.icon size={19} />
                  </span>
                  <div className="res-notif-body">
                    <span className="res-notif-title">{n.title}</span>
                    <span className="res-notif-text">{n.text}</span>
                  </div>
                  <span className="res-notif-time">{n.time}</span>
                  {!n.read && <span className="res-notif-unread-dot" aria-label="Unread" role="img" />}
                </article>
              );
            })}
        </section>
      ))}

      <div className="res-note" style={{ marginTop: 20 }}>
        <Bell size={16} aria-hidden="true" />
        <span>
          This is a demonstration environment. In the live service, you would
          receive a notification whenever the status of your report changes.
        </span>
      </div>
    </div>
  );
}
