'use client';

import React from 'react';
import { Link } from '@/lib/router-shim';
import {
  Send, ClipboardCheck, ShieldCheck, UserRoundCheck, HardHat, CircleCheck,
  LogIn, ArrowRight, Stamp,
} from 'lucide-react';
import { LOGIN_ROUTE, REPORT_ROUTE, LIFECYCLE_STAGES } from '@/lib/data/publicData';
import ChapterHead from './ChapterHead';
import { Reveal, useReveal } from './scroll/scrollFx';

const ICONS = { Send, ClipboardCheck, ShieldCheck, UserRoundCheck, HardHat, CircleCheck };

/* What each stage leaves behind — the record that makes the path
   verifiable, not just visible. */
const RECORDS = [
  'Time-stamped entry created',
  'Review logged with reviewer',
  'Incident record opened',
  'Routing recorded to office',
  'Field update attached',
  'Resolution filed & closed',
];

/* One roadmap row: a single IntersectionObserver reveal drives the
   card, the spine node, and the dotted segment below it together. */
function TimelineRow({ stage, record, index }) {
  const [ref, shown] = useReveal(0.3);
  const Icon = ICONS[stage.icon];
  const side = index % 2 ? 'right' : 'left';

  return (
    <li
      ref={ref}
      className={`pub-tl-item side-${side} ${shown ? 'in' : ''}`}
    >
      {/* Spine node + drawing segment */}
      <span className="pub-tl-node" aria-hidden="true">
        <span className="pub-tl-node-ring" />
        <span className="pub-tl-node-dot">
          <Icon size={16} strokeWidth={2.1} />
        </span>
      </span>
      <span className="pub-tl-seg" aria-hidden="true">
        <span className="pub-tl-seg-fill" />
      </span>

      <article className={`pub-tl-card tone-${stage.tone}`}>
        <header className="pub-tl-card-head">
          <span className="pub-tl-num">{stage.num}</span>
          <h3 className="pub-tl-title">{stage.title}</h3>
        </header>
        <p className="pub-tl-text">{stage.text}</p>
        <footer className="pub-tl-record">
          <Stamp size={12} aria-hidden="true" />
          {record}
        </footer>
      </article>
    </li>
  );
}

/**
 * TransparencyTimeline — "WHERE YOUR REPORT GOES", redesigned as a
 * staggered editorial roadmap.
 *
 * Content is unchanged: the six official stages and their exact public
 * wording. The presentation is a civic ledger — a dotted spine that
 * draws itself downward as each stage scrolls into view, stages
 * alternating left and right of the spine on wide screens and stacking
 * cleanly on mobile. Every stage also states the record it leaves
 * behind, because transparency here means verifiable, not decorative.
 *
 * Reveals are IntersectionObserver one-shots (the shared reveal
 * primitive); the spine fill is a CSS scaleY transition on the same
 * trigger. Under prefers-reduced-motion everything renders complete.
 */
export default function TransparencyTimeline() {
  return (
    <section className="pub-st-chapter transparency alt" aria-labelledby="pub-transparency-title">
      <div className="pub-container">
        <ChapterHead
          index="07"
          eyebrow="TRANSPARENCY"
          title="WHERE YOUR REPORT GOES"
          sub="Every report follows a clear, verifiable path — from submission to resolution."
          id="pub-transparency-title"
          align="center"
        />

        <div className="pub-tl">
          <ol className="pub-tl-list" aria-label="The path of a report, stage by stage">
            {LIFECYCLE_STAGES.map((stage, i) => (
              <TimelineRow
                key={stage.num}
                stage={stage}
                record={RECORDS[i]}
                index={i}
              />
            ))}
          </ol>
        </div>

        <Reveal kind="up" className="pub-tl-foot">
          <p className="pub-tl-foot-text">
            Every stage above is recorded with a timestamp. Residents who
            submit reports can follow exactly this path for their own
            submissions.
          </p>
          <div className="pub-tl-foot-actions">
            <Link to={LOGIN_ROUTE} className="pub-btn pub-btn-secondary">
              <LogIn size={15} aria-hidden="true" />
              Log In to Track a Report
            </Link>
            <Link to={REPORT_ROUTE} className="pub-road-cta-alt">
              Create a Resident Account
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
