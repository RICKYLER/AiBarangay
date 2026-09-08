import React from 'react';
import { Lock, MapPinned, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import { PRIVACY_ITEMS } from '@/lib/data/publicData';
import { Reveal } from './scroll/scrollFx';

const ICONS = { Lock, MapPinned, ShieldCheck, KeyRound };

/**
 * PrivacySection — "Your information matters" trust section.
 * Cards reveal in a gentle stagger as the section scrolls in.
 */
export default function PrivacySection({ showHeading = true }) {
  return (
    <section className="pub-section" aria-labelledby="pub-privacy-title">
      <div className="pub-container">
        {showHeading && (
          <div className="pub-section-head">
            <Reveal kind="up">
              <span className="pub-eyebrow">PRIVACY & TRUST</span>
            </Reveal>
            <Reveal kind="up" delay={90}>
              <h2 className="pub-section-title" id="pub-privacy-title">
                YOUR INFORMATION MATTERS
              </h2>
            </Reveal>
            <Reveal kind="up" delay={180}>
              <p className="pub-section-sub">
                Reporting a problem should never cost you your privacy.
              </p>
            </Reveal>
          </div>
        )}

        <div className="pub-privacy-grid">
          {PRIVACY_ITEMS.map((item, i) => {
            const Icon = ICONS[item.icon];
            return (
              <Reveal
                key={item.key}
                kind="up"
                delay={i * 110}
                as="article"
                className="pub-privacy-card"
              >
                {Icon && <Icon size={20} aria-hidden="true" />}
                <div>
                  <h3 className="pub-privacy-title">{item.title}</h3>
                  <p className="pub-privacy-text">{item.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal kind="up">
          <div style={{ marginTop: 26 }}>
            <a href="/help#privacy" className="pub-btn pub-btn-secondary">
              Read Privacy Information <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
