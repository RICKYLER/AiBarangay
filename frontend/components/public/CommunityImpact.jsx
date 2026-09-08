import React from 'react';
import { Inbox, Cpu, ShieldCheck, HardHat, CheckCircle2, TrendingUp } from 'lucide-react';
import { IMPACT_FLOW } from '@/lib/data/publicData';
import ChapterHead from './ChapterHead';
import { Reveal } from './scroll/scrollFx';

const ICONS = { Inbox, Cpu, ShieldCheck, HardHat, CheckCircle2, TrendingUp };

/**
 * CommunityImpact — chapter 09: "From reports to community action"
 * as an editorial chain. Each link rises in sequence with its mono
 * number, so the chain of custody assembles as you scroll along a
 * single hairline baseline.
 */
export default function CommunityImpact() {
  return (
    <section className="pub-st-chapter impact alt" aria-labelledby="pub-impact-title">
      <div className="pub-container">
        <ChapterHead
          index="09"
          eyebrow="COMMUNITY IMPACT"
          title="From reports to community action"
          sub="One resident report becomes a coordinated community response."
          id="pub-impact-title"
        />

        <ol className="pub-flow" aria-label="The path from report to community action">
          {IMPACT_FLOW.map((step, i) => {
            const Icon = ICONS[step.icon];
            const isFinal = i === IMPACT_FLOW.length - 1;
            return (
              <Reveal
                key={step.key}
                kind="up"
                delay={i * 90}
                as="li"
                className={`pub-flow-step ${isFinal ? 'final' : ''}`}
              >
                <span className="pub-flow-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="pub-flow-icon" aria-hidden="true">
                  {Icon && <Icon size={17} strokeWidth={1.9} />}
                </span>
                <span className="pub-flow-label">{step.label}</span>
                {!isFinal && <Chevron aria-hidden="true" />}
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* Arrow connector between chain links (desktop only) */
function Chevron() {
  return (
    <svg
      className="pub-flow-arrow"
      width="13"
      height="13"
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
