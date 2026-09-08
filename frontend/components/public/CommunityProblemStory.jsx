'use client';

import React from 'react';
import {
  CloudRain, Route, Trash2, Lightbulb, Droplets, Waves,
  Building2, Leaf, HelpCircle,
} from 'lucide-react';
import { REPORT_CATEGORIES } from '@/lib/data/publicData';
import ChapterHead from './ChapterHead';
import { Reveal } from './scroll/scrollFx';

const ICONS = {
  CloudRain, Route, Trash2, Lightbulb, Droplets, Waves, Building2, Leaf, HelpCircle,
};

/* The most visible community concerns lead the chapter; the full
   reportable list follows as a quieter index. */
const LEAD_KEYS = ['flooding', 'garbage', 'streetlights', 'roads', 'water'];
const leadCategories = LEAD_KEYS
  .map((k) => REPORT_CATEGORIES.find((c) => c.key === k))
  .filter(Boolean);

/**
 * CommunityProblemStory — chapter 01: the problems themselves.
 *
 * Opens with a large editorial statement, then reveals the most common
 * barangay problems one by one as large typographic rows — flooding,
 * garbage, broken streetlights, damaged roads, water — before the full
 * reportable index settles in below. The row-by-row reveal turns a
 * category list into a recognition moment: "that's my street".
 */
export default function CommunityProblemStory() {
  return (
    <section className="pub-st-chapter problems" aria-labelledby="pub-st-problem-title">
      <div className="pub-container">
        <ChapterHead
          index="01"
          eyebrow="THE COMMUNITY PROBLEM"
          title={<>Every barangay knows<br />these problems.</>}
          sub="Flooding after rain. Uncollected garbage. Streets that go dark at night. They are reported day after day — scattered across calls, texts, and walk-in visits, and too often lost along the way."
          id="pub-st-problem-title"
        />

        <ol className="pub-st-problem-rows" aria-label="Most common community problems">
          {leadCategories.map((c, i) => {
            const Icon = ICONS[c.icon];
            return (
              <Reveal
                as="li"
                key={c.key}
                kind="up"
                delay={i === 0 ? 0 : 120}
                className="pub-st-problem-row"
              >
                <span className="pub-st-problem-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="pub-st-problem-icon" aria-hidden="true">
                  {Icon && <Icon size={26} strokeWidth={1.8} />}
                </span>
                <span className="pub-st-problem-word">{c.label}</span>
                <span className="pub-st-problem-text">{c.text}</span>
              </Reveal>
            );
          })}
        </ol>

        <Reveal kind="up" className="pub-st-problem-more">
          <span className="pub-st-problem-more-label">
            And everything else the barangay should know about
          </span>
          <ul className="pub-st-problem-tags" aria-label="Other reportable problems">
            {REPORT_CATEGORIES
              .filter((c) => !LEAD_KEYS.includes(c.key))
              .map((c) => {
                const Icon = ICONS[c.icon];
                return (
                  <li key={c.key} className="pub-st-problem-tag">
                    {Icon && <Icon size={14} aria-hidden="true" />}
                    {c.label}
                  </li>
                );
              })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
