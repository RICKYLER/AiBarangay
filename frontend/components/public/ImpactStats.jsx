import React from 'react';
import { Info } from 'lucide-react';
import { IMPACT_STATS } from '@/lib/data/publicData';
import ChapterHead from './ChapterHead';
import { Reveal } from './scroll/scrollFx';

/**
 * ImpactStats — chapter 08: platform statistics as editorial rows.
 * Each figure is set large in the display face beside a small mono
 * label, separated by hairline rules — numbers first, chrome nowhere.
 * Always labeled as sample data so demonstration numbers are never
 * mistaken for real government figures.
 */
export default function ImpactStats() {
  return (
    <section className="pub-st-chapter stats" aria-labelledby="pub-stats-title">
      <div className="pub-container">
        <ChapterHead
          index="08"
          eyebrow="COMMUNITY IMPACT"
          title="Reports turning into results"
          sub="A picture of how the community and the barangay work together through the platform."
          id="pub-stats-title"
        />

        <ol className="pub-stats-rows" aria-label="Platform statistics">
          {IMPACT_STATS.map((stat, i) => (
            <Reveal
              as="li"
              key={stat.label}
              kind="up"
              delay={i * 90}
              className="pub-stat-row"
            >
              <span className="pub-stat-num">{stat.value}</span>
              <span className="pub-stat-meta">
                <span className="pub-stat-index" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {stat.label}
              </span>
            </Reveal>
          ))}
        </ol>

        <Reveal kind="up">
          <span className="pub-demo-note">
            <Info size={14} aria-hidden="true" />
            Sample / Demonstration Data — illustrative figures, not official statistics.
          </span>
        </Reveal>
      </div>
    </section>
  );
}
