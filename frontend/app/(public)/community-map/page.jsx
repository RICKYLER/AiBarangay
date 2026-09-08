'use client';

import React from 'react';
import { CommunityMapLive, CTASection, PrivacySection } from '@/components/public';

/**
 * CommunityMapPage — full public map view, backed by live verified
 * incident points and PostGIS hotspot clusters.
 */
export default function CommunityMapPage() {
  return (
    <>
      <div className="pub-page">
        <div className="pub-container">
          <div className="pub-page-head">
            <span className="pub-eyebrow">LOCATION INTELLIGENCE</span>
            <h1 className="pub-section-title">Community Problem Map</h1>
            <p className="pub-section-sub">
              View anonymized community problem reports and emerging hotspots
              across the barangay. Filter by category to focus on a specific
              type of community problem.
            </p>
          </div>
        </div>

        <div className="pub-container">
          <div className="pub-map-panel">
            <div className="pub-map-panel-head">
              <div>
                <h3 className="pub-map-panel-title">Community Problem Map</h3>
                <p className="pub-map-panel-sub">
                  Verified incident markers and AI-detected hotspot clusters,
                  updated as reports are verified.
                </p>
              </div>
              <span className="pub-demo-badge">ANONYMIZED · LIVE DATA</span>
            </div>

            <CommunityMapLive />
          </div>
        </div>
      </div>

      <PrivacySection />
      <CTASection
        title="SPOT SOMETHING ON THE MAP?"
        subtitle="Reports from residents like you build this picture. Add yours."
      />
    </>
  );
}
