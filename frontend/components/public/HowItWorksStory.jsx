'use client';

import React, { useRef } from 'react';
import {
  Inbox, Cpu, UserRoundCheck, FileCheck2, Route, HardHat, CircleCheck,
} from 'lucide-react';
import { SYSTEM_STEPS } from '@/lib/data/publicData';
import ChapterHead from './ChapterHead';
import { useScrubIndex, Reveal } from './scroll/scrollFx';

const ICONS = [
  Inbox, Cpu, UserRoundCheck, FileCheck2, Route, HardHat, CircleCheck,
];

/**
 * HowItWorksStory — chapter 03: the complete system, built by scrolling.
 *
 * Seven steps, from RESIDENT REPORT to RESOLUTION. On desktop the
 * chapter head and a live progress rail (step counter + progress bar)
 * stay beside the steps; each step reveals as it enters the viewport
 * and is highlighted while it is the current one, so the process is
 * literally assembled as the visitor scrolls. The rail is driven by
 * useScrubIndex — a scroll-spy that reports whichever step currently
 * sits at the viewport anchor, so React re-renders only when the
 * active step changes, and the counter climbs 01 → 02 → … in step
 * with the cards on screen.
 *
 * Under prefers-reduced-motion every step is simply present, in order;
 * the counter still tracks scroll (it is information, not motion).
 */
export default function HowItWorksStory() {
  const stepsRef = useRef(null);
  const active = useScrubIndex(stepsRef, SYSTEM_STEPS.length - 1);
  const current = active;
  const progress = ((current + 1) / SYSTEM_STEPS.length) * 100;

  return (
    <section className="pub-st-chapter how" aria-labelledby="pub-st-how-title">
      <div className="pub-container">
        <div className="pub-st-how-layout">
          {/* Sticky rail — chapter head + live progress */}
          <div className="pub-st-how-rail">
            <ChapterHead
              index="03"
              eyebrow="HOW IT WORKS"
              title={<>From one report<br />to a resolution.</>}
              sub="Follow a single community problem through the whole system. Each step below appears as you scroll."
              id="pub-st-how-title"
            />

            <div className="pub-st-how-progress" aria-hidden="true">
              <span className="pub-st-how-progress-count">
                <strong>{String(Math.min(current + 1, SYSTEM_STEPS.length)).padStart(2, '0')}</strong>
                {' / '}
                {String(SYSTEM_STEPS.length).padStart(2, '0')}
              </span>
              <span className="pub-st-how-progress-bar">
                <span className="pub-st-how-progress-fill" style={{ width: `${progress}%` }} />
              </span>
              <span className="pub-st-how-progress-label">
                {SYSTEM_STEPS[Math.min(current, SYSTEM_STEPS.length - 1)].title.toLowerCase()}
              </span>
            </div>
          </div>

          {/* The seven steps, revealed one by one */}
          <ol className="pub-st-how-steps" ref={stepsRef} aria-label="The seven steps of the system">
            {SYSTEM_STEPS.map((step, i) => {
              const Icon = ICONS[i];
              const state = i < current ? 'done' : i === current ? 'active' : '';
              return (
                <li
                  key={step.key}
                  className={`pub-st-how-step ${state}`}
                  aria-current={i === current ? 'step' : undefined}
                >
                  <Reveal kind="up" className="pub-st-how-step-card">
                    <div className="pub-st-how-step-top">
                      <span className="pub-st-how-step-num" aria-hidden="true">
                        {step.num}
                      </span>
                      <span className="pub-st-how-step-icon" aria-hidden="true">
                        <Icon size={21} strokeWidth={1.9} />
                      </span>
                    </div>
                    <h3 className="pub-st-how-step-title">{step.title}</h3>
                    <p className="pub-st-how-step-text">{step.text}</p>
                    <span className="pub-st-how-step-state" aria-hidden="true">
                      {state === 'done' && '✓ completed'}
                      {state === 'active' && '● in view'}
                    </span>
                  </Reveal>
                  <span className="pub-st-how-connector" aria-hidden="true">
                    <span className="pub-st-how-connector-fill" />
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
