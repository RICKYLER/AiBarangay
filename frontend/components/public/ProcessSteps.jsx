import React from 'react';
import { Link } from '@/lib/router-shim';
import { ArrowRight } from 'lucide-react';
import { PROCESS_STEPS } from '@/lib/data/publicData';

/**
 * ProcessSteps — the four-step civic workflow (Report → Analyze → Verify → Respond).
 * `detailed` adds the expanded explanation (used on the How It Works page);
 * `vertical` switches to the stacked layout.
 */
export default function ProcessSteps({ detailed = false, vertical = false, showCta = true }) {
  return (
    <section className="pub-section alt" aria-labelledby="pub-steps-title">
      <div className="pub-container">
        <div className="pub-section-head">
          <span className="pub-eyebrow">HOW IT WORKS</span>
          <h2 className="pub-section-title" id="pub-steps-title">
            From report to resolution — in four steps
          </h2>
          <p className="pub-section-sub">
            Every community problem follows the same transparent civic workflow.
          </p>
        </div>

        <ol className={`pub-steps ${vertical ? 'vertical' : ''}`}>
          {PROCESS_STEPS.map((step) => (
            <li key={step.key} className="pub-step">
              <span className="pub-step-num" aria-hidden="true">{step.num}</span>
              <div className="pub-step-body">
                <h3 className="pub-step-title">{step.title}</h3>
                <p className="pub-step-text">{detailed ? step.detail : step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        {showCta && (
          <div style={{ marginTop: 28 }}>
            <Link to="/how-it-works" className="pub-btn pub-btn-secondary">
              Learn How It Works <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
