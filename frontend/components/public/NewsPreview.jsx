'use client';

import React from 'react';
import { ArrowRight, Inbox } from 'lucide-react';
import { usePublicFeed } from '@/hooks/usePublicFeed';
import { Reveal } from './scroll/scrollFx';
import { catInfo } from './NewsFeedHelpers';

/**
 * NewsPreview — landing-page section: the latest community
 * activity from /api/gis/public-feed (anonymized), pointing
 * visitors to the full /news page.
 */
export default function NewsPreview() {
  const { items, loading } = usePublicFeed('ALL', 4);

  return (
    <section className="pub-section" aria-labelledby="pub-newsfeed-title">
      <div className="pub-container">
        <div className="pub-section-head">
          <Reveal kind="up">
            <span className="pub-eyebrow">COMMUNITY FEED</span>
          </Reveal>
          <Reveal kind="up" delay={90}>
            <h2 className="pub-section-title" id="pub-newsfeed-title">
              LATEST COMMUNITY ACTIVITY
            </h2>
          </Reveal>
          <Reveal kind="up" delay={180}>
            <p className="pub-section-sub">
              Live, anonymized activity from residents — new reports, verified
              incidents, and problems the barangay has resolved.
            </p>
          </Reveal>
        </div>

        <Reveal kind="up" delay={120}>
          <div className="pub-feed-preview">
            <span className="pub-demo-badge">ANONYMIZED · LIVE DATA</span>

            {loading ? (
              <p className="pub-feed-preview-empty" role="status">
                Loading community activity…
              </p>
            ) : items.length === 0 ? (
              <div className="pub-feed-preview-empty">
                <Inbox size={22} aria-hidden="true" />
                <p>No community activity yet. Be the first to report a problem.</p>
              </div>
            ) : (
              <ul className="pub-feed-preview-list">
                {items.map((item) => {
                  const cat = catInfo(item.category);
                  const resolved = Boolean(item.resolved_at);
                  const where = [item.barangay, item.zone].filter(Boolean).join(' · ');
                  return (
                    <li key={item.ref_number} className="pub-feed-preview-row">
                      <span
                        className="pub-feed-preview-cat"
                        style={{ '--cat-color': item.category_color || undefined }}
                      >
                        {cat.label}
                      </span>
                      <span className="pub-feed-preview-ref">{item.ref_number}</span>
                      <span className="pub-feed-preview-where">{where || 'Community report'}</span>
                      <span className={`pub-feed-badge tone-${resolved ? 'resolved' : item.item_type === 'REPORT' ? 'new' : 'active'}`}>
                        {item.status === 'RESOLVED' || item.status === 'CLOSED'
                          ? 'Resolved'
                          : item.status === 'UNDER_REVIEW'
                            ? 'Under Review'
                            : item.status
                              ? item.status.charAt(0) + item.status.slice(1).toLowerCase().replace('_', ' ')
                              : ''}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="pub-feed-preview-cta">
              <a href="/news" className="pub-btn pub-btn-secondary">
                View Community Feed <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
