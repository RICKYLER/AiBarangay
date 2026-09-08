import React from 'react';
import { Link } from '@/lib/router-shim';
import { Lock, MapPinned, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import { PRIVACY_ITEMS } from '@/lib/data/publicData';

const ICONS = { Lock, MapPinned, ShieldCheck, KeyRound };

/**
 * PrivacySection — "Your information matters" trust section.
 */
export default function PrivacySection({ showHeading = true }) {
  return (
    <section className="pub-section" aria-labelledby="pub-privacy-title">
      <div className="pub-container">
        {showHeading && (
          <div className="pub-section-head">
            <span className="pub-eyebrow">PRIVACY & TRUST</span>
            <h2 className="pub-section-title" id="pub-privacy-title">
              YOUR INFORMATION MATTERS
            </h2>
            <p className="pub-section-sub">
              Reporting a problem should never cost you your privacy.
            </p>
          </div>
        )}

        <div className="pub-privacy-grid">
          {PRIVACY_ITEMS.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <article key={item.key} className="pub-privacy-card">
                {Icon && <Icon size={20} aria-hidden="true" />}
                <div>
                  <h3 className="pub-privacy-title">{item.title}</h3>
                  <p className="pub-privacy-text">{item.text}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div style={{ marginTop: 26 }}>
          <a href="/help#privacy" className="pub-btn pub-btn-secondary">
            Read Privacy Information <ArrowRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
