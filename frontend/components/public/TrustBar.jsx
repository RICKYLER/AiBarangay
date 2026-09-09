import React from 'react';
import { Inbox, MapPinned, Cpu, ShieldCheck } from 'lucide-react';
import { TRUST_ITEMS } from '@/lib/data/publicData';
import { Reveal } from './scroll/scrollFx';

const ICONS = { Inbox, MapPinned, Cpu, ShieldCheck };

/**
 * TrustBar — service principles strip directly under the hero.
 *
 * Four capabilities on one deep-forest band, divided by hairline
 * rules (no cards). Each item stacks a thin teal line icon over an
 * uppercase label and a muted description; the items reveal in a
 * short 120ms stagger as the strip scrolls into view.
 */
export default function TrustBar() {
  return (
    <section className="pub-trustbar" aria-label="How this service works for the community">
      <div className="pub-container pub-trustbar-inner">
        {TRUST_ITEMS.map((item, i) => {
          const Icon = ICONS[item.icon];
          return (
            <Reveal key={item.key} kind="zoom" delay={i * 120} className="pub-trust-item">
              {Icon && (
                <span className="pub-trust-icon">
                  <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                </span>
              )}
              <div className="pub-trust-title">{item.title}</div>
              <div className="pub-trust-text">{item.text}</div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
