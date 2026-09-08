import React from 'react';
import { Info } from 'lucide-react';

/**
 * Government AI decision-support panel. Always renders the human-verification
 * disclaimer — AI output is advisory only, never an independent decision.
 */
export function AIInsightCard({ headline, zone, confidence, summary, recommendation, actions, status = 'AI ANALYSIS AVAILABLE' }) {
  return (
    <div className="gov-card gov-ai-card">
      <div className="gov-card-head">
        <div>
          <div className="gov-card-title">AI INTELLIGENCE BRIEF</div>
          <div className="gov-card-sub">Decision support for authorized personnel</div>
        </div>
        <span className="gov-ai-status">
          <span className="gov-pulse-dot live" style={{ background: 'var(--gov-teal)' }} aria-hidden="true" />
          {status}
        </span>
      </div>

      <div className="gov-card-body gov-stack">
        <div className="gov-row-between gov-wrap">
          <span className="gov-ai-headline">{headline}</span>
          {zone && <span className="gov-ai-zone">{zone}</span>}
        </div>

        {confidence !== undefined && (
          <span className="gov-ai-confidence">
            <span className="gov-meter"><span className="gov-meter-fill" style={{ width: `${confidence}%`, background: 'var(--gov-teal)' }} /></span>
            {confidence}% model confidence
          </span>
        )}

        <p className="gov-ai-text">{summary}</p>

        {recommendation && (
          <div className="gov-ai-rec">
            <div className="gov-ai-rec-label">RECOMMENDED ACTION</div>
            <p className="gov-ai-rec-text">“{recommendation}”</p>
          </div>
        )}

        <div className="gov-ai-disclaimer">
          <Info size={15} aria-hidden="true" />
          <span>
            AI-generated insights are decision-support recommendations and require
            human verification.
          </span>
        </div>

        {actions && <div className="gov-row gov-wrap">{actions}</div>}
      </div>
    </div>
  );
}

export function AIDisclaimer({ compact = false }) {
  return (
    <div className="gov-ai-disclaimer" style={compact ? { padding: '8px 11px' } : undefined}>
      <Info size={compact ? 14 : 15} aria-hidden="true" />
      <span>
        AI-generated insights are decision-support recommendations and require
        human verification.
      </span>
    </div>
  );
}
