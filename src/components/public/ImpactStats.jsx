import React from 'react';
import { Inbox, ShieldCheck, CheckCircle2, FileSearch, Info } from 'lucide-react';
import { IMPACT_STATS } from '../../data/publicData';

const ICONS = { Inbox, ShieldCheck, CheckCircle2, FileSearch };

/**
 * ImpactStats — platform statistics, always labeled as sample data so
 * demonstration numbers are never mistaken for real government figures.
 */
export default function ImpactStats() {
  return (
    <section className="pub-section" aria-labelledby="pub-stats-title">
      <div className="pub-container">
        <div className="pub-section-head center">
          <span className="pub-eyebrow">COMMUNITY IMPACT</span>
          <h2 className="pub-section-title" id="pub-stats-title">
            Reports turning into results
          </h2>
          <p className="pub-section-sub">
            A picture of how the community and the barangay work together
            through the platform.
          </p>
        </div>

        <div className="pub-stats-grid">
          {IMPACT_STATS.map((stat) => {
            const Icon = ICONS[stat.icon];
            return (
              <div key={stat.label} className="pub-stat">
                {Icon && (
                  <span className="pub-stat-icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                )}
                <span className="pub-stat-value">{stat.value}</span>
                <span className="pub-stat-label">{stat.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center' }}>
          <span className="pub-demo-note">
            <Info size={14} aria-hidden="true" />
            Sample / Demonstration Data — illustrative figures, not official statistics.
          </span>
        </div>
      </div>
    </section>
  );
}
