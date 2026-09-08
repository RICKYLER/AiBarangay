import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinned, ShieldCheck, ArrowRight, Flag } from 'lucide-react';
import MapMockup from './MapMockup';
import { PUBLIC_CONFIG, REPORT_ROUTE } from '../../data/publicData';

/**
 * HeroSection — restrained civic-tech hero with an SVG GIS visual.
 */
export default function HeroSection() {
  return (
    <section className="pub-hero" aria-labelledby="pub-hero-title">
      <div className="pub-container pub-hero-inner">
        {/* Left — message */}
        <div>
          <span className="pub-hero-eyebrow">
            <Flag size={12} aria-hidden="true" />
            {PUBLIC_CONFIG.lgu.name.toUpperCase()} · {PUBLIC_CONFIG.lgu.type.toUpperCase()}
          </span>

          <h1 className="pub-hero-title" id="pub-hero-title">
            COMMUNITY PROBLEMS.
            <br />
            SMARTER RESPONSE.
          </h1>

          <p className="pub-hero-headline">
            Report community problems.
            <br />
            Help your barangay respond faster.
          </p>

          <p className="pub-hero-desc">
            {PUBLIC_CONFIG.siteName} helps residents report community issues while
            giving authorized barangay personnel better tools to review, prioritize,
            map, and resolve problems.
          </p>

          <div className="pub-hero-actions">
            <Link to={REPORT_ROUTE} className="pub-btn pub-btn-primary pub-btn-lg">
              Report a Problem
            </Link>
            <Link to="/community-map" className="pub-btn pub-btn-secondary pub-btn-lg">
              <MapPinned size={16} aria-hidden="true" />
              Explore Community Map
            </Link>
          </div>

          <p className="pub-hero-trust">
            <ShieldCheck size={15} aria-hidden="true" />
            AI-assisted. Human-verified. Community-focused.
          </p>
        </div>

        {/* Right — GIS visual */}
        <div className="pub-hero-map">
          <div className="pub-hero-map-caption">
            <span className="pub-map-name">
              {PUBLIC_CONFIG.lgu.name.toUpperCase()} · COMMUNITY MAP
            </span>
            <span className="pub-map-live">
              <span className="pub-map-dot live" aria-hidden="true" />
              LIVE COMMUNITY VIEW
            </span>
          </div>
          <MapMockup legend={false} labeled />
          <div className="pub-map-legend">
            <span className="pub-map-legend-item">
              <span className="pub-map-dot" style={{ background: '#2fa084' }} aria-hidden="true" />
              Zones
            </span>
            <span className="pub-map-legend-item">
              <span className="pub-map-legend-mark" style={{ background: '#d14343' }} aria-hidden="true" />
              Problem markers
            </span>
            <span className="pub-map-legend-item">
              <span className="pub-map-legend-mark" style={{ background: 'transparent', border: '1.5px dashed #d14343' }} aria-hidden="true" />
              Emerging hotspots
            </span>
            <span className="pub-map-legend-item" style={{ marginLeft: 'auto' }}>
              <ArrowRight size={13} aria-hidden="true" />
              Anonymized preview
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
