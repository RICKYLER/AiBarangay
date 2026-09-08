import React from 'react';
import {
  HeroSection, TrustBar, ImpactStats, ProcessSteps, ReportableProblems,
  CommunityMapPreview, TransparencyTimeline, AIExplanation, PrivacySection,
  CommunityImpact, Announcements, EmergencyContacts, CTASection,
} from '@/components/public';

/**
 * HomePage — the public landing page. Information, trust, transparency,
 * and public services only; no administrator functions, no private data.
 */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <ImpactStats />
      <ProcessSteps />
      <ReportableProblems />
      <CommunityMapPreview />
      <TransparencyTimeline />
      <AIExplanation />
      <PrivacySection />
      <CommunityImpact />
      <Announcements />
      <EmergencyContacts />
      <CTASection />
    </>
  );
}
