'use client';

import React, { useRef } from 'react';
import { Link } from '@/lib/router-shim';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { PUBLIC_CONFIG, REPORT_ROUTE } from '@/lib/data/publicData';
import { useScrub, useReducedMotion } from './scroll/scrollFx';



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
        <div className="pub-st-hero-copy">
          <div className="pub-hero-eyebrow pub-in" style={{ '--d': 0 }}>
            <span className="pub-hero-eyebrow-dot" aria-hidden="true" />
            <span>{PUBLIC_CONFIG.serviceStatement.toUpperCase()}</span>
          </div>

          <h1 className="pub-st-hero-title" id="pub-hero-title">
            <span className="pub-st-hero-line headline-main pub-in" style={{ '--d': 1 }}>
              Your barangay,
            </span>
            <span className="pub-st-hero-line pub-in accent" style={{ '--d': 2 }}>
              heard.
            </span>
          </h1>

          <p className="pub-hero-support pub-in" style={{ '--d': 3 }}>
            A simpler way for residents to report community concerns—and for local
            teams to respond with clarity, speed, and care.
          </p>

          <div className="pub-st-hero-actions pub-in" style={{ '--d': 4 }}>
            <Link to={REPORT_ROUTE} className="pub-btn pub-btn-primary pub-btn-lg">
              Report a problem
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/community-map" className="pub-btn pub-btn-secondary pub-btn-lg">
              Explore the community map
            </Link>
          </div>

          <p className="pub-st-hero-trust pub-in" style={{ '--d': 5 }}>
            <ShieldCheck size={14} aria-hidden="true" />
            AI-assisted. Human-reviewed. Community-first.
          </p>
        </div>


      </div>
    </section>
  );
}
