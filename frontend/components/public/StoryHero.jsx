'use client';

import React, { useRef } from 'react';
import { Link } from '@/lib/router-shim';
import { MapPinned, ShieldCheck, Flag } from 'lucide-react';
import { PUBLIC_CONFIG, REPORT_ROUTE } from '@/lib/data/publicData';
import { useScrub, useReducedMotion } from './scroll/scrollFx';

/* The workflow the hero communicates, shown as a quiet strip under
   the map: report → locate → review → act. */
const FLOW = ['RESIDENT REPORTS', 'PROBLEM LOCATED', 'BARANGAY REVIEWS', 'ACTION TAKEN'];

/* Map markers: [x, y, glyph, animation delay] — each appears in
   sequence after the panel has revealed. */
const PINS = [
  { x: 128, y: 108, kind: 'flood', d: '1.15s' },
  { x: 360, y: 152, kind: 'waste', d: '1.3s' },
  { x: 196, y: 268, kind: 'light', d: '1.45s' },
  { x: 250, y: 320, kind: 'check', d: '1.6s' },
];

/* Tiny 8px glyphs drawn inside each marker — plain line art, no
   icon fonts, no decoration. */
function PinGlyph({ kind }) {
  if (kind === 'flood') {
    return <path className="pub-hero-pin-glyph" d="M 0 -4.6 C 2.2 -1.8 3.4 -0.4 3.4 1.2 A 3.4 3.4 0 1 1 -3.4 1.2 C -3.4 -0.4 -2.2 -1.8 0 -4.6 Z" />;
  }
  if (kind === 'waste') {
    return (
      <g className="pub-hero-pin-glyph">
        <path d="M -3 -1.6 L 3 -1.6 L 2.4 4 L -2.4 4 Z" />
        <path d="M -4 -2.8 L 4 -2.8" />
      </g>
    );
  }
  if (kind === 'light') {
    return (
      <g className="pub-hero-pin-glyph">
        <circle cx="0" cy="-2.4" r="1.7" />
        <path d="M 0 -0.7 L 0 4" />
      </g>
    );
  }
  return <path className="pub-hero-pin-glyph check" d="M -3 0.2 L -0.8 2.4 L 3.4 -2.2" />;
}

/**
 * StoryHero — balanced two-column civic hero.
 *
 * LEFT: a quiet two-line eyebrow, a controlled display headline, one
 * sentence of support, the two actions, and a trust line. RIGHT: a
 * stylized barangay map panel — streets, purok boundaries, issue
 * markers, one highlighted problem area, a resolved incident, and a
 * workflow strip (report → locate → review → act). Pure CSS/SVG, a
 * design mockup — no external map service, no live data.
 *
 * Entrance is one calm stagger (CSS keyframes, disabled under
 * prefers-reduced-motion): eyebrow → headline → support → actions →
 * map panel → markers, one by one. On scroll, the whole composition
 * fades gently toward the next chapter (--p from useScrub 'exit').
 */
export default function StoryHero() {
  const sectionRef = useRef(null);
  const reduced = useReducedMotion();
  useScrub(sectionRef, 'exit');

  return (
    <section
      className={`pub-st-hero ${reduced ? 'is-reduced' : ''}`}
      ref={sectionRef}
      aria-labelledby="pub-hero-title"
    >
      {/* Backdrop — faint survey contours only; content leads */}
      <div className="pub-st-hero-bg" aria-hidden="true">
        <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" focusable="no">
          <path
            className="pub-st-hero-contour"
            d="M -60 620 C 220 560, 420 640, 700 580 S 1100 520, 1260 560"
          />
          <path
            className="pub-st-hero-contour"
            d="M -60 680 C 260 620, 480 700, 760 640 S 1140 580, 1260 620"
          />
        </svg>
      </div>

      <div className="pub-container pub-st-hero-inner">
        {/* ---- LEFT: the message ---- */}
        <div className="pub-st-hero-copy">
          <div className="pub-hero-eyebrow pub-in" style={{ '--d': 0 }}>
            <span className="pub-hero-eyebrow-top">
              {PUBLIC_CONFIG.siteName.toUpperCase()}
            </span>
            <span className="pub-hero-eyebrow-sub">
              {PUBLIC_CONFIG.lgu.name.toUpperCase()}
              {' • '}
              {PUBLIC_CONFIG.lgu.type.toUpperCase()}
            </span>
          </div>

          <h1 className="pub-st-hero-title" id="pub-hero-title">
            <span className="pub-st-hero-line pub-in" style={{ '--d': 1 }}>
              COMMUNITY PROBLEMS.
            </span>
            <span className="pub-st-hero-line pub-in accent" style={{ '--d': 2 }}>
              SMARTER RESPONSE.
            </span>
          </h1>

          <p className="pub-hero-support pub-in" style={{ '--d': 3 }}>
            Report community problems, track their progress, and help your
            barangay respond with better information.
          </p>

          <div className="pub-st-hero-actions pub-in" style={{ '--d': 4 }}>
            <Link to={REPORT_ROUTE} className="pub-btn pub-btn-primary pub-btn-lg">
              <Flag size={15} aria-hidden="true" />
              Report a Problem
            </Link>
            <Link to="/community-map" className="pub-btn pub-btn-secondary pub-btn-lg">
              <MapPinned size={16} aria-hidden="true" />
              Explore Community Map
            </Link>
          </div>

          <p className="pub-st-hero-trust pub-in" style={{ '--d': 5 }}>
            <ShieldCheck size={14} aria-hidden="true" />
            AI-assisted • Human-verified • Community-focused
          </p>
        </div>

        {/* ---- RIGHT: the civic map panel (design mockup) ---- */}
        <div className="pub-hero-map pub-in" style={{ '--d': 5 }} aria-label="Stylized community map showing reported issues across barangay zones (design mockup with sample data)">
          <div className="pub-hero-map-head">
            <span className="pub-hero-map-title">COMMUNITY ISSUES</span>
            <span className="pub-hero-map-live">
              <i aria-hidden="true" />
              LIVE · SAMPLE DATA
            </span>
          </div>

          <div className="pub-hero-map-canvas">
            <svg viewBox="0 0 520 400" role="img" aria-hidden="true" focusable="no">
              <defs>
                <pattern id="pubHeroGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" className="pub-hero-grid-line" />
                </pattern>
              </defs>

              {/* survey grid */}
              <rect width="520" height="400" fill="url(#pubHeroGrid)" />

              {/* roads — one main, three secondary */}
              <path className="pub-hero-road main" d="M 0 268 C 120 250, 210 190, 310 178 C 400 168, 470 150, 520 138" />
              <path className="pub-hero-road" d="M 186 0 C 196 110, 246 210, 236 400" />
              <path className="pub-hero-road" d="M 0 118 C 150 128, 320 108, 520 56" />
              <path className="pub-hero-road" d="M 338 400 C 348 300, 396 190, 384 0" />
              <path className="pub-hero-road slim" d="M 60 400 C 90 330, 170 300, 220 250" />

              {/* purok boundaries */}
              <path className="pub-hero-zone" d="M 62 64 L 196 44 L 238 128 L 152 178 L 64 138 Z" />
              <path className="pub-hero-zone" d="M 286 44 L 458 72 L 478 176 L 352 206 L 272 138 Z" />
              <path className="pub-hero-zone" d="M 84 232 L 224 222 L 300 300 L 238 366 L 100 348 Z" />
              <text className="pub-hero-zone-label" x="112" y="112">PUROK 1</text>
              <text className="pub-hero-zone-label" x="352" y="134">PUROK 2</text>
              <text className="pub-hero-zone-label" x="156" y="300">PUROK 3</text>

              {/* street labels */}
              <text className="pub-hero-street-label" x="404" y="176">RIZAL ST.</text>
              <text className="pub-hero-street-label" x="90" y="112">MABINI AVE.</text>

              {/* highlighted problem area — clustered reports */}
              <g className="pub-hero-pin" style={{ '--pd': '1.05s' }}>
                <circle className="pub-hero-problem-ring" cx="128" cy="108" r="36" />
                <rect className="pub-hero-problem-chip" x="80" y="50" width="96" height="18" rx="3" />
                <text className="pub-hero-problem-text" x="128" y="62">4 REPORTS</text>
              </g>

              {/* quiet report dots */}
              <g className="pub-hero-pin" style={{ '--pd': '1.05s' }}>
                <circle className="pub-hero-dot" cx="300" cy="180" r="2.5" />
                <circle className="pub-hero-dot" cx="440" cy="120" r="2.5" />
                <circle className="pub-hero-dot" cx="150" cy="230" r="2.5" />
                <circle className="pub-hero-dot" cx="390" cy="300" r="2.5" />
                <circle className="pub-hero-dot" cx="470" cy="220" r="2.5" />
              </g>

              {/* issue markers, in sequence */}
              {PINS.map((p) => (
                <g
                  key={p.kind}
                  className={`pub-hero-pin pub-hero-pin-${p.kind}`}
                  style={{ '--pd': p.d }}
                  transform={`translate(${p.x} ${p.y})`}
                >
                  <circle className="pub-hero-pin-body" r="8.5" />
                  <PinGlyph kind={p.kind} />
                </g>
              ))}

              {/* compass + scale */}
              <g className="pub-hero-map-meta">
                <path className="pub-hero-meta-line" d="M 492 46 L 492 30" />
                <path className="pub-hero-meta-line" d="M 488.5 34 L 492 29 L 495.5 34" />
                <text className="pub-hero-meta-text" x="487" y="58">N</text>
                <path className="pub-hero-meta-line" d="M 20 382 L 60 382" />
                <path className="pub-hero-meta-line" d="M 20 378 L 20 386 M 60 378 L 60 386" />
                <text className="pub-hero-meta-text" x="66" y="385">200 M</text>
              </g>
            </svg>
          </div>

          {/* the workflow, quietly */}
          <ol className="pub-hero-map-flow" aria-label="How a report becomes action">
            {FLOW.map((step, i) => (
              <li key={step} className={i === FLOW.length - 1 ? 'now' : 'done'}>
                <span className="pub-hero-flow-dot" aria-hidden="true" />
                <span className="pub-hero-flow-label">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
