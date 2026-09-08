'use client';

import React, { useRef } from 'react';
import { Link } from '@/lib/router-shim';
import { MapPinned, ShieldCheck, Flag, MousePointer2, ArrowRight } from 'lucide-react';
import { PUBLIC_CONFIG, REPORT_ROUTE } from '@/lib/data/publicData';
import { useScrub, useReducedMotion } from './scroll/scrollFx';

/* The system chain — the whole platform in four mono labels. */
const CHAIN = ['PROBLEMS', 'LOCATION', 'INTELLIGENCE', 'ACTION'];

/**
 * StoryHero — typography-first editorial hero for the landing page.
 *
 * The message enters once with a calm staggered rise (CSS keyframes,
 * disabled under prefers-reduced-motion). Behind the copy, the system
 * itself is drawn as an abstract barangay map — street network, a
 * dashed barangay boundary, a coordinate frame, incident points, one
 * cluster ring, and one verified node — line art only, weighted toward
 * the right where the copy is not. The streets draw themselves in on
 * load (stroke-dashoffset), then the frame and points settle.
 *
 * As the visitor starts scrolling, a single scrubbed custom property
 * (--p) drives a subtle exit: the headline drifts up slightly slower
 * than the page and the map fades, so the hero hands over to the story
 * below instead of cutting to it.
 *
 * Content is unchanged from the previous hero — the GIS visual now has
 * its own full chapter (Community Map) instead of competing with the
 * headline.
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
      {/* Backdrop — the abstract barangay map (decorative) */}
      <div className="pub-st-hero-bg" aria-hidden="true">
        <svg
          className="pub-st-hero-grid"
          viewBox="0 0 1200 700"
          preserveAspectRatio="xMidYMid slice"
          focusable="no"
        >
          {/* street skeleton — the primary road reads first */}
          <path
            className="pub-st-map-street primary pub-st-map-draw"
            style={{ '--md': '0.35s' }}
            pathLength={1}
            d="M 560 620 C 700 560, 760 380, 720 240 S 780 90, 940 70"
          />
          <path
            className="pub-st-map-street pub-st-map-draw"
            style={{ '--md': '0.55s' }}
            pathLength={1}
            d="M 640 660 C 820 620, 980 520, 1060 380 S 1180 220, 1220 200"
          />
          <path
            className="pub-st-map-street pub-st-map-draw"
            style={{ '--md': '0.7s' }}
            pathLength={1}
            d="M 700 60 C 760 200, 900 260, 1040 300 S 1160 420, 1180 520"
          />
          <path
            className="pub-st-map-street pub-st-map-draw"
            style={{ '--md': '0.85s' }}
            pathLength={1}
            d="M 600 420 C 760 400, 900 440, 1000 540 S 1100 640, 1180 660"
          />
          <path
            className="pub-st-map-street slim pub-st-map-draw"
            style={{ '--md': '1s' }}
            pathLength={1}
            d="M 660 180 C 800 160, 940 140, 1080 180"
          />

          {/* barangay boundary — dashed, quiet */}
          <g className="pub-st-map-fade" style={{ '--md': '1.05s' }}>
            <path
              className="pub-st-map-boundary"
              d="M 760 140 L 980 100 L 1120 220 L 1150 400 L 1020 560 L 820 540 L 730 380 Z"
            />
          </g>

          {/* coordinate frame */}
          <g className="pub-st-map-fade" style={{ '--md': '1.15s' }}>
            <path className="pub-st-map-tick" d="M 1180 150 h 16" />
            <path className="pub-st-map-tick" d="M 1180 300 h 16" />
            <path className="pub-st-map-tick" d="M 1180 450 h 16" />
            <path className="pub-st-map-tick" d="M 1180 600 h 16" />
            <path className="pub-st-map-tick" d="M 700 640 v 16" />
            <path className="pub-st-map-tick" d="M 850 640 v 16" />
            <path className="pub-st-map-tick" d="M 1000 640 v 16" />
            <path className="pub-st-map-tick" d="M 1150 640 v 16" />
            <text className="pub-st-map-label" x="998" y="678">7.4472° N</text>
            <text className="pub-st-map-label" x="1058" y="128">125.8074° E</text>
          </g>

          {/* incident points — reports on the map */}
          <g className="pub-st-map-fade" style={{ '--md': '1.25s' }}>
            <circle className="pub-st-map-point" cx="840" cy="220" r="4.5" />
            <circle className="pub-st-map-point" cx="790" cy="300" r="4.5" />
            <circle className="pub-st-map-point" cx="860" cy="500" r="4.5" />
            <circle className="pub-st-map-point" cx="1080" cy="330" r="4.5" />
          </g>

          {/* a cluster — nearby reports grouping */}
          <circle
            className="pub-st-map-ring pub-st-map-draw"
            style={{ '--md': '1.35s' }}
            pathLength={1}
            cx="915"
            cy="330"
            r="58"
          />
          <g className="pub-st-map-pop" style={{ '--md': '1.45s' }}>
            <circle className="pub-st-map-point" cx="900" cy="300" r="4.5" />
            <circle className="pub-st-map-point" cx="930" cy="360" r="4.5" />
          </g>

          {/* a verified incident — the resolution at the end of the chain */}
          <g className="pub-st-map-pop" style={{ '--md': '1.6s' }}>
            <circle className="pub-st-map-verified" cx="1050" cy="450" r="10" />
            <path className="pub-st-map-check" d="M 1045.5 450 l 3 3 l 6.5 -6.5" />
          </g>
        </svg>
      </div>

      <div className="pub-container pub-st-hero-inner">
        <div className="pub-st-hero-copy">
          <span className="pub-st-hero-eyebrow pub-in" style={{ '--d': 0 }}>
            <Flag size={12} aria-hidden="true" />
            {PUBLIC_CONFIG.lgu.name.toUpperCase()} · {PUBLIC_CONFIG.lgu.type.toUpperCase()}
          </span>

          <h1 className="pub-st-hero-title" id="pub-hero-title">
            <span className="pub-st-hero-line pub-in" style={{ '--d': 1 }}>
              COMMUNITY PROBLEMS.
            </span>
            <span className="pub-st-hero-line pub-in accent" style={{ '--d': 2 }}>
              SMARTER RESPONSE.
            </span>
          </h1>

          {/* The whole system in one line of technical labels */}
          <div className="pub-st-hero-chain pub-in" style={{ '--d': 3 }}>
            {CHAIN.map((step, i) => (
              <React.Fragment key={step}>
                {i > 0 && (
                  <span className="pub-st-hero-chain-arrow" aria-hidden="true">
                    <ArrowRight size={12} strokeWidth={2} />
                  </span>
                )}
                <span className="pub-st-hero-chain-step">
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  {step}
                </span>
              </React.Fragment>
            ))}
          </div>

          <p className="pub-st-hero-headline pub-in" style={{ '--d': 4 }}>
            Report community problems. Help your barangay respond faster.
          </p>

          <p className="pub-st-hero-desc pub-in" style={{ '--d': 5 }}>
            {PUBLIC_CONFIG.siteName} helps residents report community issues while
            giving authorized barangay personnel better tools to review, prioritize,
            map, and resolve problems.
          </p>

          <div className="pub-st-hero-actions pub-in" style={{ '--d': 6 }}>
            <Link to={REPORT_ROUTE} className="pub-btn pub-btn-primary pub-btn-lg">
              Report a Problem
            </Link>
            <Link to="/community-map" className="pub-btn pub-btn-secondary pub-btn-lg">
              <MapPinned size={16} aria-hidden="true" />
              Explore Community Map
            </Link>
          </div>

          <p className="pub-st-hero-trust pub-in" style={{ '--d': 7 }}>
            <ShieldCheck size={15} aria-hidden="true" />
            AI-assisted. Human-verified. Community-focused.
          </p>
        </div>
      </div>

      {/* Scroll cue — invites the story without hijacking the page */}
      <div className="pub-st-hero-cue pub-in" style={{ '--d': 8 }} aria-hidden="true">
        <MousePointer2 size={13} />
        <span className="pub-st-hero-cue-label">Scroll to explore the system</span>
        <span className="pub-st-hero-cue-line"><span /></span>
      </div>
    </section>
  );
}
