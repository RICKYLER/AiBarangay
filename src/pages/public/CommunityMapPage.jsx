import React from 'react';
import { CommunityMapPreview, CTASection, PrivacySection } from '../../components/public';

/**
 * CommunityMapPage — full public map view.
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

        <CommunityMapPreview expanded />
      </div>

      <PrivacySection />
      <CTASection
        title="SPOT SOMETHING ON THE MAP?"
        subtitle="Reports from residents like you build this picture. Add yours."
      />
    </>
  );
}
