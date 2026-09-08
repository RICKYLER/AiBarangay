import React from 'react';
import { Link } from '@/lib/router-shim';
import { Flag, UserPlus } from 'lucide-react';
import { REPORT_ROUTE } from '@/lib/data/publicData';
import { Reveal } from './scroll/scrollFx';

/**
 * CTASection — final call to action band. The headline and actions
 * rise in sequence as the band scrolls into view.
 */
export default function CTASection({
  title = 'SEE A PROBLEM IN YOUR COMMUNITY?',
  subtitle = 'Your report can help your barangay understand what needs attention.',
}) {
  return (
    <section className="pub-cta-band" aria-labelledby="pub-cta-title">
      <div className="pub-container pub-cta-inner">
        <div className="pub-cta-copy">
          <Reveal kind="up">
            <h2 className="pub-cta-title" id="pub-cta-title">{title}</h2>
          </Reveal>
          <Reveal kind="up" delay={110}>
            <p className="pub-cta-sub">{subtitle}</p>
          </Reveal>
        </div>
        <Reveal kind="up" delay={220} className="pub-cta-actions">
          <Link to={REPORT_ROUTE} className="pub-btn pub-btn-primary pub-btn-lg">
            <Flag size={16} aria-hidden="true" />
            Report a Problem
          </Link>
          <Link to="/register" className="pub-btn pub-btn-secondary pub-btn-lg">
            <UserPlus size={16} aria-hidden="true" />
            Create Resident Account
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
