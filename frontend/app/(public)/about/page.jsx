import React from 'react';
import { Link } from '@/lib/router-shim';
import { Landmark, ShieldCheck, Cpu, Users } from 'lucide-react';
import { PUBLIC_CONFIG } from '@/lib/data/publicData';
import { AIExplanation, PrivacySection, CTASection } from '@/components/public';

/**
 * AboutPage — what the platform is, who runs it, and the safeguards
 * behind it. The LGU identity block is driven by PUBLIC_CONFIG.
 */
export default function AboutPage() {
  const { lgu } = PUBLIC_CONFIG;

  return (
    <>
      <div className="pub-page">
        <div className="pub-container">
          <div className="pub-page-head">
            <span className="pub-eyebrow">ABOUT</span>
            <h1 className="pub-section-title">
              A digital public service for the community
            </h1>
            <p className="pub-section-sub">
              {PUBLIC_CONFIG.siteName} is a community problem reporting and
              response platform operated by {lgu.name}. It helps residents
              report problems and helps the barangay understand, prioritize,
              and resolve them — transparently.
            </p>
          </div>

          <div className="pub-grid-2" style={{ gap: 16 }}>
            {/* Who we are */}
            <article className="pub-panel">
              <span className="pub-feature-icon" aria-hidden="true">
                <Landmark size={19} />
              </span>
              <h2 className="pub-panel-title" style={{ marginTop: 12 }}>
                Who operates this service
              </h2>
              <p className="pub-panel-text">
                This platform is operated by <strong>{lgu.name}</strong>
                {lgu.municipality ? ` in ${lgu.municipality}` : ''}, a{' '}
                {lgu.type.toLowerCase()} serving its community. Reports
                submitted through the platform are received by authorized
                barangay personnel, not by an automated system.
              </p>
              <div className="pub-kv" style={{ marginTop: 16 }}>
                <div className="pub-kv-item">
                  <div className="pub-kv-label">LGU</div>
                  <div className="pub-kv-value">{lgu.name}</div>
                </div>
                <div className="pub-kv-item">
                  <div className="pub-kv-label">OFFICE</div>
                  <div className="pub-kv-value">{lgu.office}</div>
                </div>
                <div className="pub-kv-item">
                  <div className="pub-kv-label">OFFICE HOURS</div>
                  <div className="pub-kv-value">{lgu.hours}</div>
                </div>
                <div className="pub-kv-item">
                  <div className="pub-kv-label">OFFICIAL CONTACT</div>
                  <div className="pub-kv-value">{lgu.phone}</div>
                </div>
              </div>
            </article>

            {/* What we stand for */}
            <article className="pub-panel">
              <span className="pub-feature-icon" aria-hidden="true">
                <ShieldCheck size={19} />
              </span>
              <h2 className="pub-panel-title" style={{ marginTop: 12 }}>
                What we stand for
              </h2>
              <p className="pub-panel-text">
                Three principles govern how this platform works for the
                community:
              </p>
              <div className="pub-stack" style={{ gap: 14, marginTop: 14 }}>
                <div className="pub-row" style={{ alignItems: 'flex-start' }}>
                  <Cpu size={18} color="var(--pub-dark)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                  <div>
                    <strong style={{ fontSize: 14 }}>AI assists people — never replaces them.</strong>
                    <p className="pub-panel-text" style={{ marginTop: 2 }}>
                      Every analysis the system produces is a recommendation
                      reviewed by authorized personnel.
                    </p>
                  </div>
                </div>
                <div className="pub-row" style={{ alignItems: 'flex-start' }}>
                  <Users size={18} color="var(--pub-dark)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                  <div>
                    <strong style={{ fontSize: 14 }}>Residents are partners.</strong>
                    <p className="pub-panel-text" style={{ marginTop: 2 }}>
                      The community knows its problems best. Reporting should
                      be easy, safe, and worth the effort.
                    </p>
                  </div>
                </div>
                <div className="pub-row" style={{ alignItems: 'flex-start' }}>
                  <ShieldCheck size={18} color="var(--pub-dark)" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                  <div>
                    <strong style={{ fontSize: 14 }}>Transparency builds trust.</strong>
                    <p className="pub-panel-text" style={{ marginTop: 2 }}>
                      Public information stays public; private information
                      stays protected. Progress on reports is trackable.
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <Link to="/how-it-works" className="pub-btn pub-btn-secondary">
                  See the full workflow
                </Link>
              </div>
            </article>
          </div>
        </div>
      </div>

      <AIExplanation />
      <PrivacySection />
      <CTASection
        title="PART OF THIS COMMUNITY?"
        subtitle="Your reports help the barangay decide where attention is needed most."
      />
    </>
  );
}
