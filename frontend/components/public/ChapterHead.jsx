'use client';

import React from 'react';
import { Reveal } from './scroll/scrollFx';

/**
 * ChapterHead — shared editorial header for every landing-page chapter.
 * Gives the page one continuous rhythm: a chapter index, a rule that
 * draws in, a large title, and an optional standfirst paragraph.
 */
export default function ChapterHead({
  index, eyebrow, title, sub, align = 'left', id,
}) {
  return (
    <div className={`pub-st-head ${align === 'center' ? 'center' : ''}`}>
      <Reveal kind="up" className="pub-st-kicker">
        {index && <span className="pub-st-index" aria-hidden="true">{index}</span>}
        <span className="pub-st-rule" aria-hidden="true" />
        <span className="pub-st-eyebrow">{eyebrow}</span>
      </Reveal>
      <Reveal kind="up" delay={90} as="h2" className="pub-st-title" id={id}>
        {title}
      </Reveal>
      {sub && (
        <Reveal kind="up" delay={180} as="p" className="pub-st-sub">
          {sub}
        </Reveal>
      )}
    </div>
  );
}
