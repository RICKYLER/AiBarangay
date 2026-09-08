import React from 'react';
import { Inbox, MapPinned, Cpu, ShieldCheck } from 'lucide-react';
import { TRUST_ITEMS } from '@/lib/data/publicData';

const ICONS = { Inbox, MapPinned, Cpu, ShieldCheck };

/**
 * TrustBar — service principles strip directly under the hero.
 */
export default function TrustBar() {
  return (
    <section className="pub-trustbar" aria-label="How this service works for the community">
      <div className="pub-container pub-trustbar-inner">
        {TRUST_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <div key={item.key} className="pub-trust-item">
              {Icon && <Icon size={19} aria-hidden="true" />}
              <div>
                <div className="pub-trust-title">{item.title}</div>
                <div className="pub-trust-text">{item.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
