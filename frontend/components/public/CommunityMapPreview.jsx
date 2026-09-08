'use client';

import React, { useState } from 'react';
import { Link } from '@/lib/router-shim';
import { MapPinned, ShieldCheck, ArrowRight } from 'lucide-react';
import MapMockup from './MapMockupClient';
import { MAP_FILTERS, MAP_MARKERS } from '@/lib/data/publicData';

/**
 * CommunityMapPreview — public GIS panel with category filters, legend,
 * and an anonymization notice. `expanded` renders the tall page variant.
 *
 * Privacy: the public map never shows resident names, contact details,
 * or exact household locations — only generalized, anonymized markers.
 */
export default function CommunityMapPreview({ expanded = false }) {
  const [filter, setFilter] = useState('all');

  const visibleCount = MAP_MARKERS.filter(
    (m) => filter === 'all' || m.category === filter
  ).length;

  return (
    <section
      className={expanded ? 'pub-page' : 'pub-section alt'}
      aria-labelledby="pub-map-title"
    >
      <div className="pub-container">
        {!expanded && (
          <div className="pub-section-head">
            <span className="pub-eyebrow">LOCATION INTELLIGENCE</span>
            <h2 className="pub-section-title" id="pub-map-title">
              COMMUNITY PROBLEM MAP
            </h2>
            <p className="pub-section-sub">
              View anonymized community problem reports and emerging hotspots.
            </p>
          </div>
        )}

        <div className="pub-map-panel">
          <div className="pub-map-panel-head">
            <div>
              <h3 className="pub-map-panel-title">
                <MapPinned size={16} style={{ verticalAlign: -2, marginRight: 7 }} aria-hidden="true" />
                {expanded ? 'Community Problem Map' : 'Public Community View'}
              </h3>
              <p className="pub-map-panel-sub">
                Generalized incident markers, zone boundaries, and emerging hotspots.
              </p>
            </div>
            <span className="pub-demo-badge">ANONYMIZED · SAMPLE DATA</span>
          </div>

          {/* Category filters */}
          <div className="pub-map-filters" role="group" aria-label="Filter map by category">
            <span className="pub-map-filter-label" aria-hidden="true">FILTER</span>
            {MAP_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`pub-filter-chip ${filter === f.key ? 'on' : ''}`}
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
              >
                {f.key !== 'all' && <span className="pub-chip-dot" aria-hidden="true" />}
                {f.label}
              </button>
            ))}
          </div>

          <MapMockup filter={filter} labeled />

          <p className="pub-map-privacy">
            <ShieldCheck size={15} aria-hidden="true" />
            Public map information is anonymized to protect resident privacy.
          </p>

          <div className="pub-map-panel-foot">
            <span className="pub-map-count" aria-live="polite">
              Showing {visibleCount} of {MAP_MARKERS.length} sample markers
              {filter !== 'all' && ' · filtered view'}
            </span>
            <Link to={expanded ? '/register' : '/community-map'} className="pub-btn pub-btn-primary">
              {expanded ? 'Report a Problem' : 'Open Community Map'}
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
