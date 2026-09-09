import React from 'react';
import { Link } from '@/lib/router-shim';
import { ArrowRight } from 'lucide-react';
import {
  ProcessSteps, ReportableProblems, TransparencyTimeline,
  AIExplanation,
} from '@/components/public';

/**
 * HowItWorksPage — the civic workflow in detail.
 */
export default function HowItWorksPage() {
  return (
    <>
      <div className="pub-page">
        <div className="pub-container">
          <div className="pub-page-head">
            <span className="pub-eyebrow">HOW IT WORKS</span>
            <h1 className="pub-section-title">
              A transparent civic workflow, from report to resolution
            </h1>
            <p className="pub-section-sub">
              AI Barangay Problem Mapper connects residents who see problems
              with barangay personnel who can solve them — through one clear,
              trackable process.
            </p>
            <div className="pub-hero-actions" style={{ marginTop: 24 }}>
              <Link to="/register" className="pub-btn pub-btn-primary">
                Report a Problem <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link to="/community-map" className="pub-btn pub-btn-secondary">
                Explore Community Map
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ProcessSteps detailed vertical showCta={false} />
      <ReportableProblems />
      <TransparencyTimeline />
      <AIExplanation />
    </>
  );
}
