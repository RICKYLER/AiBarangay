'use client';

import React from 'react';
import { usePublicFeed } from '@/hooks/usePublicFeed';
import { LIFECYCLE_STAGES } from '@/lib/data/publicData';
import { catInfo } from './NewsFeedHelpers';
import { Reveal } from './scroll/scrollFx';
import { CloudRain, Route, Trash2, Droplets, Lightbulb, Building2, Leaf, HelpCircle, Megaphone } from 'lucide-react';

/**
 * NewsFeed — the live community news feed for the /news page.
 * Anonymized items from /api/gis/public-feed: fresh resident
 * reports and incidents from verification through resolution.
 * No names, no report text — category, barangay/zone, dates,
 * and the six-stage status journey only.
 */

const CAT_ICONS = {
  flooding: CloudRain,
  roads: Route,
  garbage: Trash2,
  water: Droplets,
  streetlight: Lightbulb,
  infrastructure: Building2,
  environment: Leaf,
  other: HelpCircle,
};

/* DB status → 6-stage journey index (LIFECYCLE_STAGES). */
const STATUS_STAGE = {
  SUBMITTED: 0,
  UNDER_REVIEW: 1,
  VERIFIED: 2,
  ASSIGNED: 3,
  FIELD_RESPONSE: 4,
  REOPENED: 4,
  RESOLVED: 5,
  CLOSED: 5,
};

const STATUS_LABEL = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  VERIFIED: 'Verified',
  ASSIGNED: 'Assigned',
  FIELD_RESPONSE: 'Field Response',
  REOPENED: 'Reopened',
  RESOLVED: 'Resolved',
  CLOSED: 'Resolved',
};

function statusTone(item) {
  if (item.item_type === 'REPORT') return 'new';
  if (item.resolved_at) return 'resolved';
  return 'active';
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/* One feed entry: category rail (icon + color) + the story column. */
function FeedCard({ item, index }) {
  const cat = catInfo(item.category);
  const Icon = CAT_ICONS[cat.key] || HelpCircle;
  const stage = STATUS_STAGE[item.status] ?? 0;
  const resolved = Boolean(item.resolved_at);
  const where = [item.barangay, item.zone].filter(Boolean).join(' · ');

  return (
    <Reveal kind="up" delay={(index % 3) * 90} as="article" className={`pub-feed-card ${resolved ? 'is-resolved' : ''}`}>
      <div className="pub-feed-rail" style={{ '--cat-color': item.category_color || undefined }}>
        <span className="pub-feed-cat-icon" aria-hidden="true">
          <Icon size={20} />
        </span>
        <span className="pub-feed-cat">{cat.label}</span>
        {item.priority && <span className="pub-feed-priority">{item.priority}</span>}
      </div>

      <div className="pub-feed-body">
        <div className="pub-feed-meta">
          <span className="pub-feed-ref">{item.ref_number}</span>
          <span className={`pub-feed-badge tone-${statusTone(item)}`}>
            {STATUS_LABEL[item.status] || item.status}
          </span>
        </div>

        <p className="pub-feed-where">
          {where || 'Community report'}
          <time className="pub-feed-date" dateTime={item.occurred_at}>
            {' '}{fmtDate(item.occurred_at)}
          </time>
        </p>

        {item.item_type === 'INCIDENT' && (
          <ol className="pub-feed-journey" aria-label={`Status: ${STATUS_LABEL[item.status] || item.status}`}>
            {LIFECYCLE_STAGES.map((s, i) => (
              <li
                key={s.key}
                className={i < stage ? 'done' : i === stage ? 'current' : 'todo'}
                title={s.title}
              >
                <span className="pub-feed-journey-dot" aria-hidden="true" />
                <span className="pub-feed-journey-label">{s.title}</span>
              </li>
            ))}
          </ol>
        )}

        {resolved && item.resolution_summary && (
          <p className="pub-feed-resolution">
            <Megaphone size={13} aria-hidden="true" />
            <span>{item.resolution_summary}</span>
          </p>
        )}
        {resolved && item.office && (
          <p className="pub-feed-office">
            Handled by {item.office}
            {item.resolved_at && <> · {fmtDate(item.resolved_at)}</>}
          </p>
        )}
      </div>
    </Reveal>
  );
}

const TABS = [
  { key: 'ALL', label: 'LATEST' },
  { key: 'NEW', label: 'NEW REPORTS' },
  { key: 'ACTIVE', label: 'IN PROGRESS' },
  { key: 'RESOLVED', label: 'RESOLVED' },
];

export default function NewsFeed() {
  const [filter, setFilter] = React.useState('ALL');
  const { items, stats, loading } = usePublicFeed(filter, 24);

  return (
    <section className="pub-section" aria-label="Community news feed">
      <div className="pub-container">
        {stats && (
          <div className="pub-feed-stats">
            <div className="pub-feed-stat">
              <span className="pub-feed-stat-value">{stats.new_reports_7d}</span>
              <span className="pub-feed-stat-label">New reports · last 7 days</span>
            </div>
            <div className="pub-feed-stat">
              <span className="pub-feed-stat-value">{stats.active_incidents}</span>
              <span className="pub-feed-stat-label">Incidents in progress</span>
            </div>
            <div className="pub-feed-stat">
              <span className="pub-feed-stat-value">{stats.resolved_total}</span>
              <span className="pub-feed-stat-label">Resolved for the community</span>
            </div>
          </div>
        )}

        <div className="pub-feed-tabs" role="tablist" aria-label="Filter community feed">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={filter === t.key}
              className={`pub-feed-tab ${filter === t.key ? 'active' : ''}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="pub-feed-empty" role="status">
            <p className="pub-feed-empty-title">Loading community activity…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="pub-feed-empty">
            <p className="pub-feed-empty-title">No community activity to show yet</p>
            <p className="pub-feed-empty-text">
              Reports appear here — anonymized — as residents submit them and barangay
              personnel verify and resolve them.
            </p>
          </div>
        ) : (
          <div className="pub-feed-list">
            {items.map((item, i) => (
              <FeedCard key={item.ref_number} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
