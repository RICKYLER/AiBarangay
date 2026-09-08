import React from 'react';
import { Info, Tags, Copy, Flag, LineChart } from 'lucide-react';
import { AI_CAPABILITIES } from '../../data/publicData';

const ICONS = { Tags, Copy, Flag, LineChart };

/**
 * AIExplanation — transparent, honest description of what the AI does
 * and, just as importantly, what it does not do: it never makes
 * government decisions.
 */
export default function AIExplanation({ showHeading = true }) {
  return (
    <section className="pub-section alt" aria-labelledby="pub-ai-title">
      <div className="pub-container">
        {showHeading && (
          <div className="pub-section-head">
            <span className="pub-eyebrow">ARTIFICIAL INTELLIGENCE</span>
            <h2 className="pub-section-title" id="pub-ai-title">
              AI-ASSISTED COMMUNITY INTELLIGENCE
            </h2>
            <p className="pub-section-sub">
              The system uses artificial intelligence to assist authorized
              personnel in understanding community reports and identifying patterns.
            </p>
          </div>
        )}

        <div className="pub-feature-grid">
          {AI_CAPABILITIES.map((cap) => {
            const Icon = ICONS[cap.icon];
            return (
              <article key={cap.key} className="pub-feature-card">
                <span className="pub-feature-icon" aria-hidden="true">
                  {Icon && <Icon size={19} />}
                </span>
                <h3 className="pub-feature-title">{cap.title}</h3>
                <p className="pub-feature-text">{cap.text}</p>
              </article>
            );
          })}
        </div>

        <div className="pub-ai-note" role="note">
          <Info size={18} aria-hidden="true" />
          <span>
            <strong>AI provides decision support only.</strong> Final verification
            and decisions remain with authorized human personnel. The system never
            issues penalties, approvals, or government decisions on its own.
          </span>
        </div>
      </div>
    </section>
  );
}
