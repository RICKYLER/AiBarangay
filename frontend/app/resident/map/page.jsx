'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { COMMUNITY_MAP_CATEGORIES } from '@/lib/data/residentData';
import { ResMap } from '@/components/resident';

/**
 * ResidentMap — the community map as residents see it: anonymized
 * problem markers and emerging hotspots. No personal information,
 * no exact household locations.
 */
export default function ResidentMap() {
  const [filter, setFilter] = useState('all');

  return (
    <div className="res-fade">
      <div className="res-map-panel">
        <div className="res-map-toolbar">
          <div>
            <span className="res-section-eyebrow">COMMUNITY MAP</span>
            <h2 className="res-section-title">Problems reported in Tagum City</h2>
            <p className="res-section-sub">
              Anonymized reports across Tagum City, Davao del Norte.
              Public information is anonymized to protect resident privacy.
            </p>
          </div>
          <span className="res-demo-note">Sample / Demonstration Data</span>
        </div>

        <div className="res-chips" role="group" aria-label="Filter map by category" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={`res-chip ${filter === 'all' ? 'on' : ''}`}
            aria-pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {Object.entries(COMMUNITY_MAP_CATEGORIES).map(([key, c]) => (
            <button
              key={key}
              type="button"
              className={`res-chip ${filter === key ? 'on' : ''}`}
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              <span
                className="res-map-legend-dot"
                style={{ background: c.color }}
                aria-hidden="true"
              />
              {c.label}
            </button>
          ))}
        </div>

        <ResMap filter={filter} />

        <div className="res-map-legend" aria-hidden="true">
          {Object.values(COMMUNITY_MAP_CATEGORIES).map((c) => (
            <span key={c.label} className="res-map-legend-item">
              <span className="res-map-legend-dot" style={{ background: c.color }} />
              {c.label}
            </span>
          ))}
          <span className="res-map-legend-item">
            <span
              className="res-map-legend-dot"
              style={{ background: 'transparent', border: '1.5px dashed #d14343' }}
            />
            Hotspot
          </span>
        </div>
      </div>

      <div className="res-note res-note-teal" style={{ marginTop: 16 }}>
        <ShieldCheck size={16} aria-hidden="true" />
        <span>
          Markers show the general area of anonymized reports — never names,
          contact details, or exact household locations.
        </span>
      </div>
    </div>
  );
}
