import React from 'react';
import { Link } from 'react-router-dom';
import { Flag, UserPlus } from 'lucide-react';
import { REPORT_ROUTE } from '../../data/publicData';

/**
 * CTASection — final call to action band.
 */
export default function CTASection({
  title = 'SEE A PROBLEM IN YOUR COMMUNITY?',
  subtitle = 'Your report can help your barangay understand what needs attention.',
}) {
  return (
    <section className="pub-cta-band" aria-labelledby="pub-cta-title">
      <div className="pub-container pub-cta-inner">
        <h2 className="pub-cta-title" id="pub-cta-title">{title}</h2>
        <p className="pub-cta-sub">{subtitle}</p>
        <div className="pub-cta-actions">
          <Link to={REPORT_ROUTE} className="pub-btn pub-btn-primary pub-btn-lg">
            <Flag size={16} aria-hidden="true" />
            Report a Problem
          </Link>
          <Link to="/register" className="pub-btn pub-btn-secondary pub-btn-lg">
            <UserPlus size={16} aria-hidden="true" />
            Create Resident Account
          </Link>
        </div>
      </div>
    </section>
  );
}
