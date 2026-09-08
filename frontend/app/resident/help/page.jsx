'use client';

import React, { useState } from 'react';
import { ChevronDown, Phone, Clock, MapPin, PlusCircle } from 'lucide-react';
import { RESIDENT_HELP_TOPICS } from '@/lib/data/residentData';
import { PUBLIC_CONFIG } from '@/lib/data/publicData';

/**
 * ResidentHelpCenter — simple answers to common resident questions,
 * plus how to reach the barangay office directly.
 */
export default function ResidentHelpCenter() {
  const [open, setOpen] = useState(RESIDENT_HELP_TOPICS[0].key);
  const { lgu } = PUBLIC_CONFIG;

  const contact = [
    {
      icon: Phone,
      label: 'Barangay Hotline',
      value: lgu.phone,
      sub: 'Sample contact information',
    },
    {
      icon: MapPin,
      label: 'Barangay Office',
      value: lgu.office,
      sub: lgu.address,
    },
    {
      icon: Clock,
      label: 'Office Hours',
      value: lgu.hours,
      sub: 'Monday to Friday',
    },
  ];

  return (
    <div className="res-fade" style={{ maxWidth: 760 }}>
      <div className="res-section-head">
        <div>
          <span className="res-section-eyebrow">HELP CENTER</span>
          <h2 className="res-section-title">How can we help you?</h2>
          <p className="res-section-sub">
            Answers to common questions about reporting problems and tracking
            your reports.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="res-faq">
        {RESIDENT_HELP_TOPICS.map((t) => {
          const isOpen = open === t.key;
          return (
            <div key={t.key} className={`res-faq-item ${isOpen ? 'open' : ''}`}>
              <button
                type="button"
                className="res-faq-q"
                aria-expanded={isOpen}
                aria-controls={`faq-${t.key}`}
                onClick={() => setOpen(isOpen ? null : t.key)}
              >
                {t.q}
                <ChevronDown size={17} aria-hidden="true" />
              </button>
              {isOpen && (
                <p className="res-faq-a" id={`faq-${t.key}`}>
                  {t.a}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact strip */}
      <div style={{ marginTop: 28 }}>
        <div className="res-section-head">
          <div>
            <span className="res-section-eyebrow">STILL NEED HELP?</span>
            <h3 className="res-section-title" style={{ fontSize: 17 }}>
              Reach the barangay office
            </h3>
          </div>
          <span className="res-demo-note">Demo contact information</span>
        </div>

        <div className="res-help-contact">
          {contact.map((c) => (
            <div key={c.label} className="res-help-contact-item">
              <span className="res-help-contact-icon" aria-hidden="true">
                <c.icon size={18} />
              </span>
              <span>
                <span className="res-help-contact-label">{c.label}</span>
                <span
                  className="res-help-contact-value"
                  style={{ display: 'block' }}
                >
                  {c.value}
                </span>
                <span className="res-help-contact-sub">{c.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick action */}
      <div className="res-note res-note-teal" style={{ marginTop: 20 }}>
        <PlusCircle size={16} aria-hidden="true" />
        <span>
          Ready to report a community problem? Open "Report a Problem" from
          the menu — it only takes a few minutes.
        </span>
      </div>
    </div>
  );
}
