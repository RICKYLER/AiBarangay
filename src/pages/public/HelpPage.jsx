import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox, Route, MapPinned, Cpu, UserPlus, Lock, ChevronDown,
  LifeBuoy, ShieldCheck,
} from 'lucide-react';
import { HELP_TOPICS, PUBLIC_CONFIG } from '../../data/publicData';
import { Announcements, EmergencyContacts } from '../../components/public';

const TOPIC_ICONS = { Inbox, Route, MapPinned, Cpu, UserPlus, Lock };

/**
 * HelpPage — help center, privacy & accessibility statements,
 * announcements, and emergency contacts.
 */
export default function HelpPage() {
  const [open, setOpen] = useState(HELP_TOPICS[0].key);

  return (
    <div className="pub-page">
      <div className="pub-container">
        <div className="pub-page-head">
          <span className="pub-eyebrow">HELP CENTER</span>
          <h1 className="pub-section-title">How can we help you?</h1>
          <p className="pub-section-sub">
            Answers to common questions about reporting, tracking, privacy,
            and how the platform uses AI.
          </p>
        </div>

        {/* FAQ */}
        <div className="pub-grid-2" style={{ gap: 32, alignItems: 'start' }}>
          <div className="pub-faq">
            {HELP_TOPICS.map((topic) => {
              const Icon = TOPIC_ICONS[topic.icon];
              const isOpen = open === topic.key;
              return (
                <div key={topic.key} className={`pub-faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="pub-faq-q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${topic.key}`}
                    onClick={() => setOpen(isOpen ? null : topic.key)}
                  >
                    <span className="pub-row" style={{ gap: 10 }}>
                      {Icon && <Icon size={17} color="var(--pub-dark)" aria-hidden="true" />}
                      {topic.title}
                    </span>
                    <ChevronDown size={16} aria-hidden="true" />
                  </button>
                  {isOpen && (
                    <p className="pub-faq-a" id={`faq-${topic.key}`}>{topic.text}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Side panel: statements */}
          <div className="pub-stack">
            <section className="pub-panel" id="privacy" aria-labelledby="help-privacy">
              <span className="pub-feature-icon" aria-hidden="true"><Lock size={19} /></span>
              <h2 className="pub-panel-title" style={{ marginTop: 12 }} id="help-privacy">
                Privacy Notice (Summary)
              </h2>
              <p className="pub-panel-text">
                Your personal information is collected only to process and
                follow up on your reports. It is visible only to authorized
                barangay personnel. The public community map shows anonymized,
                generalized problem locations and never displays your name,
                contact details, or exact household location.
              </p>
            </section>

            <section className="pub-panel" id="accessibility" aria-labelledby="help-a11y">
              <span className="pub-feature-icon" aria-hidden="true"><LifeBuoy size={19} /></span>
              <h2 className="pub-panel-title" style={{ marginTop: 12 }} id="help-a11y">
                Accessibility Statement
              </h2>
              <p className="pub-panel-text">
                This website is designed to be usable by everyone. It supports
                keyboard navigation, screen readers, visible focus states, and
                reduced-motion preferences, and it is built to meet WCAG color
                contrast guidance. If you encounter an accessibility barrier,
                contact the {PUBLIC_CONFIG.lgu.office} so we can fix it.
              </p>
            </section>

            <section className="pub-panel" id="terms" aria-labelledby="help-terms">
              <span className="pub-feature-icon" aria-hidden="true"><ShieldCheck size={19} /></span>
              <h2 className="pub-panel-title" style={{ marginTop: 12 }} id="help-terms">
                Terms of Use (Summary)
              </h2>
              <p className="pub-panel-text">
                Use this platform to report genuine community problems in good
                faith. Knowingly submitting false reports may result in account
                action. Public content must not include personal information
                about other residents.
              </p>
            </section>

            <div className="pub-panel">
              <h2 className="pub-panel-title">Still need help?</h2>
              <p className="pub-panel-text">
                Visit the {PUBLIC_CONFIG.lgu.office} during office hours
                ({PUBLIC_CONFIG.lgu.hours}), or create an account to get started.
              </p>
              <div className="pub-row pub-wrap" style={{ marginTop: 14 }}>
                <Link to="/register" className="pub-btn pub-btn-primary">
                  <UserPlus size={15} aria-hidden="true" />
                  Create Resident Account
                </Link>
                <Link to="/how-it-works" className="pub-btn pub-btn-secondary">
                  How It Works
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements + emergency */}
        <div id="announcements" style={{ marginTop: 24 }}>
          <Announcements />
        </div>
        <EmergencyContacts />
      </div>
    </div>
  );
}
