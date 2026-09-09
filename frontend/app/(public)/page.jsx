import React from 'react';
import {
  StoryHero, TrustBar,
  CommunityProblemStory, WhatIsSection, HowItWorksStory,
  AiIntelligence,
  ImpactStats, CommunityImpact, PrivacySection,
  Announcements, EmergencyContacts, CTASection,
} from '@/components/public';

/**
 * HomePage — the public landing page, told as one continuous story.
 *
 * The visitor discovers the system progressively while scrolling:
 * the hero promise → the community problem → what the platform is →
 * how it works (7 steps) → AI intelligence → community impact → privacy
 * & trust → public services → final call to action.
 *
 * Information, trust, transparency, and public services only; no
 * administrator functions, no private data.
 */
export default function HomePage() {
  return (
    <>
      <StoryHero />
      <TrustBar />
      <CommunityProblemStory />
      <WhatIsSection />
      <HowItWorksStory />
      <AiIntelligence />
      <ImpactStats />
      <CommunityImpact />
      <PrivacySection />
      <Announcements />
      <EmergencyContacts />
      <CTASection />
    </>
  );
}
