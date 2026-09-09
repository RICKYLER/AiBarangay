'use client';

import React from 'react';
import { NewsFeed } from '@/components/public';

/**
 * NewsPage — the public community news feed: anonymized activity
 * from resident reports through verified incidents to completed
 * resolutions. Live data via /api/gis/public-feed.
 */
export default function NewsPage() {
  return (
    <>
      <div className="pub-page">
        <div className="pub-container">
          <div className="pub-page-head">
            <span className="pub-eyebrow">TRANSPARENCY</span>
            <h1 className="pub-section-title">Community News & Activity</h1>
            <p className="pub-section-sub">
              Follow community problems from the moment residents report them to the
              moment the barangay resolves them. Every item is anonymized — categories,
              areas, dates, and official status only, never resident identities or
              report details.
            </p>
          </div>
        </div>

        <NewsFeed />
      </div>
    </>
  );
}
