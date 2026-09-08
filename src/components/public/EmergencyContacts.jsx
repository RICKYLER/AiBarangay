import React from 'react';
import { Building2, PhoneCall, Shield, Flame, HeartPulse, Info } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../../data/publicData';

const ICONS = { Building2, PhoneCall, Shield, Flame, HeartPulse };

/**
 * EmergencyContacts — clearly separated emergency information area.
 * Contact numbers are DEMO placeholders until the real LGU directory
 * is configured in PUBLIC_CONFIG.
 */
export default function EmergencyContacts({ showHeading = true }) {
  return (
    <section className="pub-emergency pub-section" aria-labelledby="pub-emergency-title" id="emergency">
      <div className="pub-container">
        {showHeading && (
          <div className="pub-section-head">
            <span className="pub-eyebrow" style={{ color: 'var(--pub-red-deep)' }}>
              IMPORTANT NUMBERS
            </span>
            <h2 className="pub-section-title" id="pub-emergency-title">
              EMERGENCY & IMPORTANT CONTACTS
            </h2>
            <p className="pub-section-sub">
              For immediate danger to life or property, contact emergency
              services directly.
            </p>
          </div>
        )}

        <div className="pub-emergency-grid">
          {EMERGENCY_CONTACTS.map((c) => {
            const Icon = ICONS[c.icon];
            return (
              <article key={c.key} className="pub-emergency-card">
                <span className="pub-emergency-icon" aria-hidden="true">
                  {Icon && <Icon size={18} />}
                </span>
                <span className="pub-emergency-label">{c.label}</span>
                <span className="pub-emergency-value">{c.value}</span>
                <span className="pub-emergency-note">{c.note}</span>
              </article>
            );
          })}
        </div>

        <div style={{ marginTop: 22 }}>
          <span className="pub-demo-note">
            <Info size={14} aria-hidden="true" />
            Demo contact information — official numbers will be published once
            the LGU directory is configured.
          </span>
        </div>
      </div>
    </section>
  );
}
