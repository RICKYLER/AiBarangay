'use client';

import React from 'react';

/**
 * Offline fallback — served by the service worker when a navigation
 * fails with no network. Self-contained: its styles are inlined into
 * the HTML (styled-jsx) and it uses system fonts, so it renders
 * correctly even when the stylesheet chunks were never cached.
 */
export default function OfflinePage() {
  return (
    <div className="offline-wrap">
      <style jsx>{`
        .offline-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7f6ed;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            sans-serif;
          color: #0e4c41;
          padding: 24px;
        }
        .offline-card {
          max-width: 420px;
          text-align: center;
        }
        .offline-mark {
          width: 52px;
          height: 52px;
          margin: 0 auto 18px;
          border-radius: 12px;
          background: #0e4c41;
          color: #f7f6ed;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
        }
        .offline-title {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin: 0 0 10px;
        }
        .offline-text {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(14, 76, 65, 0.72);
          margin: 0 0 22px;
        }
        .offline-btn {
          display: inline-block;
          background: #2ba889;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          padding: 11px 22px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
        }
      `}</style>

      <main className="offline-card">
        <div className="offline-mark" aria-hidden="true">⌂</div>
        <h1 className="offline-title">You&rsquo;re offline</h1>
        <p className="offline-text">
          Wa kay internet connection karon. Ang mga reports ug ang community
          map kinahanglan og connection — sulayi pag-usab kung nakakonekta
          na ka.
        </p>
        <button type="button" className="offline-btn" onClick={() => window.location.reload()}>
          Try again
        </button>
      </main>
    </div>
  );
}
