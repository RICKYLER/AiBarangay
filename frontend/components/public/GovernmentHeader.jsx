'use client';

import React, { useState } from 'react';
import { Link, NavLink, useLocation } from '@/lib/router-shim';
import {
  ShieldCheck, Menu, X, Landmark, CalendarDays, Accessibility,
  Siren, LifeBuoy,
} from 'lucide-react';
import GovernmentNav from './GovernmentNav';
import { PUBLIC_CONFIG, REPORT_ROUTE, LOGIN_ROUTE } from '@/lib/data/publicData';
import { useAuth, homeForRole } from '@/hooks/useAuth';

/**
 * GovernmentHeader — thin institutional information bar above the main
 * public navigation. The LGU identity is read from PUBLIC_CONFIG so a
 * deployment can re-brand the site without touching components.
 */
export default function GovernmentHeader() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  /* Close the mobile menu on navigation */
  React.useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header>
      {/* ---- Top information bar ---- */}
      <div className="pub-infobar" role="note">
        <div className="pub-container pub-infobar-inner">
          <div className="pub-infobar-left">
            <span className="pub-infobar-flag">
              <ShieldCheck size={13} aria-hidden="true" />
              {PUBLIC_CONFIG.serviceStatement}
            </span>
            <span className="pub-infobar-sep" aria-hidden="true" />
            <span className="pub-infobar-lgu pub-row" style={{ gap: 5 }}>
              <Landmark size={12} aria-hidden="true" />
              {PUBLIC_CONFIG.lgu.name}
            </span>
            <span className="pub-infobar-sep" aria-hidden="true" />
            <span className="pub-infobar-updated pub-row" style={{ gap: 5 }}>
              <CalendarDays size={12} aria-hidden="true" />
              Last updated: {PUBLIC_CONFIG.lgu.lastUpdated}
            </span>
          </div>

          <nav className="pub-infobar-right" aria-label="Utility links">
            <a className="pub-infobar-link" href="/help#accessibility">
              <Accessibility size={12} aria-hidden="true" />
              Accessibility
            </a>
            <a className="pub-infobar-link" href="/help#emergency">
              <Siren size={12} aria-hidden="true" />
              Emergency Contacts
            </a>
            <Link className="pub-infobar-link" to="/help">
              <LifeBuoy size={12} aria-hidden="true" />
              Help
            </Link>
          </nav>
        </div>
      </div>

      {/* ---- Main navigation ---- */}
      <div className="pub-nav">
        <div className="pub-container pub-nav-inner">
          <Link to="/" className="pub-brand" aria-label={`${PUBLIC_CONFIG.siteName} — home`}>
            <span className="pub-brand-mark" aria-hidden="true">
              <Landmark size={21} />
            </span>
            <span className="pub-brand-text">
              <span className="pub-brand-title">
                {PUBLIC_CONFIG.brandTop} {PUBLIC_CONFIG.brandBottom}
              </span>
              <span className="pub-brand-sub">
                {PUBLIC_CONFIG.lgu.name} · {PUBLIC_CONFIG.lgu.type}
              </span>
            </span>
          </Link>

          <GovernmentNav />

          <div className="pub-nav-actions">
            {user ? (
              <Link to={homeForRole(user.role)} className="pub-btn pub-btn-secondary pub-btn-sm">
                My Dashboard
              </Link>
            ) : (
              <Link to={LOGIN_ROUTE} className="pub-btn pub-btn-secondary pub-btn-sm">
                Log In
              </Link>
            )}
            <Link to={REPORT_ROUTE} className="pub-btn pub-btn-primary pub-btn-sm">
              Report a Problem
            </Link>

            <button
              type="button"
              className="pub-nav-toggle"
              aria-expanded={menuOpen}
              aria-controls="pub-mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ---- Mobile menu ---- */}
        <div id="pub-mobile-menu" className={`pub-mobile-menu ${menuOpen ? 'open' : ''}`}>
          <div className="pub-container">
            <nav className="pub-mobile-links" aria-label="Main menu">
              <NavLink to="/" end className={({ isActive }) => `pub-mobile-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
              <NavLink to="/how-it-works" className={({ isActive }) => `pub-mobile-link ${isActive ? 'active' : ''}`}>
                How It Works
              </NavLink>
              <NavLink to="/community-map" className={({ isActive }) => `pub-mobile-link ${isActive ? 'active' : ''}`}>
                Community Map
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => `pub-mobile-link ${isActive ? 'active' : ''}`}>
                About
              </NavLink>
              <NavLink to="/help" className={({ isActive }) => `pub-mobile-link ${isActive ? 'active' : ''}`}>
                Help
              </NavLink>
            </nav>
            <div className="pub-mobile-actions">
              {user ? (
                <Link to={homeForRole(user.role)} className="pub-btn pub-btn-secondary">My Dashboard</Link>
              ) : (
                <Link to={LOGIN_ROUTE} className="pub-btn pub-btn-secondary">Log In</Link>
              )}
              <Link to={REPORT_ROUTE} className="pub-btn pub-btn-primary">Report a Problem</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
