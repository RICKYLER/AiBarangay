import React from 'react';
import '@/styles/public.css';
import { GovernmentHeader, GovernmentFooter } from '@/components/public';

/**
 * PublicLayout — shared shell for all public website pages:
 * skip link, government header (info bar + nav), page content, footer.
 * The resident portal and the barangay operations portal each use
 * their own separate layouts.
 */
export default function PublicLayout({ children }) {
  return (
    <div className="pub-app">
      <a className="pub-skip-link" href="#pub-main-content">
        Skip to main content
      </a>

      <GovernmentHeader />

      <main id="pub-main-content">
        {children}
      </main>

      <GovernmentFooter />
    </div>
  );
}
