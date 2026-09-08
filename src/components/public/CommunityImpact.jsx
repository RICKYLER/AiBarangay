import React from 'react';
import { Inbox, Cpu, ShieldCheck, HardHat, CheckCircle2, TrendingUp } from 'lucide-react';
import { IMPACT_FLOW } from '../../data/publicData';

const ICONS = { Inbox, Cpu, ShieldCheck, HardHat, CheckCircle2, TrendingUp };

/**
 * CommunityImpact — "From reports to community action" visual flow.
 */
export default function CommunityImpact() {
  return (
    <section className="pub-section alt" aria-labelledby="pub-impact-title">
      <div className="pub-container">
        <div className="pub-section-head center">
          <span className="pub-eyebrow">COMMUNITY IMPACT</span>
          <h2 className="pub-section-title" id="pub-impact-title">
            FROM REPORTS TO COMMUNITY ACTION
          </h2>
          <p className="pub-section-sub">
            One resident report becomes a coordinated community response.
          </p>
        </div>

        <ol className="pub-flow">
          {IMPACT_FLOW.map((step, i) => {
            const Icon = ICONS[step.icon];
            const isFinal = i === IMPACT_FLOW.length - 1;
            return (
              <li
                key={step.key}
                className={`pub-flow-step ${isFinal ? 'final' : ''}`}
              >
                <span className="pub-flow-icon" aria-hidden="true">
                  {Icon && <Icon size={18} />}
                </span>
                <span className="pub-flow-label">{step.label}</span>
                <Chevron aria-hidden="true" />
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* Arrow connector between flow steps (desktop only) */
function Chevron() {
  return (
    <svg
      className="pub-flow-arrow"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}
