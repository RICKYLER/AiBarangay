import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TrustImpact from '../components/TrustImpact';
import HowItWorks from '../components/HowItWorks';
import CommunityProblems from '../components/CommunityProblems';
import CommunityMapPreview from '../components/CommunityMapPreview';
import AiGisSection from '../components/AiGisSection';
import TransparencySection from '../components/TransparencySection';
import CtaSection from '../components/CtaSection';
import Footer from '../components/Footer';
import ReportModal from '../components/ReportModal';
import HelpModal from '../components/HelpModal';

import { INITIAL_PROBLEMS } from '../data/mockProblems';

export default function LandingPage() {
  const [problems, setProblems] = useState(INITIAL_PROBLEMS);
  const [activeProblem, setActiveProblem] = useState(null);

  // Modals state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleUpvote = (id) => {
    setProblems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item
      )
    );
  };

  const handleSelectProblemForMap = (problem) => {
    setActiveProblem(problem);
    const mapElement = document.getElementById('community-map');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddNewReport = (newReport) => {
    setProblems(prev => [newReport, ...prev]);
    setActiveProblem(newReport);
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar
        onOpenReport={() => setIsReportOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Hero Section */}
      <Hero onOpenReport={() => setIsReportOpen(true)} />

      {/* Trust & Impact Stats Section */}
      <TrustImpact />

      {/* How It Works Section */}
      <HowItWorks onOpenReport={() => setIsReportOpen(true)} />

      {/* Reported Community Problems Grid */}
      <CommunityProblems
        problems={problems}
        onSelectProblem={handleSelectProblemForMap}
        onUpvote={handleUpvote}
      />

      {/* Interactive GIS Community Map Preview */}
      <CommunityMapPreview
        problems={problems}
        activeProblem={activeProblem}
        onSelectProblem={(prob) => setActiveProblem(prob)}
        onUpvote={handleUpvote}
      />

      {/* AI + GIS Technology Section */}
      <AiGisSection />

      {/* Barangay Open Transparency Dashboard */}
      <TransparencySection />

      {/* Call To Action Banner */}
      <CtaSection
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Footer */}
      <Footer onOpenHelp={() => setIsHelpOpen(true)} />

      {/* Modals */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmitReport={handleAddNewReport}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
