import React from 'react';
import { Megaphone, ArrowRight } from 'lucide-react';
import { ANNOUNCEMENTS } from '../../data/publicData';

/**
 * Announcements — government-style public notices. All items carry a
 * DEMO CONTENT badge until real LGU announcements are configured.
 */
export default function Announcements({ limit, showHeading = true }) {
  const items = limit ? ANNOUNCEMENTS.slice(0, limit) : ANNOUNCEMENTS;

  return (
    <section className="pub-section" aria-labelledby="pub-news-title">
      <div className="pub-container">
        {showHeading && (
          <div className="pub-section-head">
            <span className="pub-eyebrow">PUBLIC NOTICES</span>
            <h2 className="pub-section-title" id="pub-news-title">
              NEWS & ANNOUNCEMENTS
            </h2>
            <p className="pub-section-sub">
              Official barangay announcements and community advisories.
            </p>
          </div>
        )}

        <div className="pub-news-grid">
          {items.map((item) => (
            <article key={item.id} className="pub-news-card">
              <div className="pub-news-meta">
                <time className="pub-news-date" dateTime={item.date}>{item.date}</time>
                <span className="pub-demo-badge">DEMO</span>
              </div>
              <span className="pub-news-category">{item.category}</span>
              <h3 className="pub-news-title">{item.title}</h3>
              <p className="pub-news-text">{item.text}</p>
            </article>
          ))}
        </div>

        <div style={{ marginTop: 26 }}>
          <a href="/help#announcements" className="pub-btn pub-btn-secondary">
            <Megaphone size={15} aria-hidden="true" />
            View All Announcements <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
