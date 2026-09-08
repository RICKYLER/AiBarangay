'use client';

import React, { useState } from 'react';
import { Link } from '@/lib/router-shim';
import { Shield, MapPin, AlertCircle, Menu, X, UserCheck, PlusCircle, HelpCircle } from 'lucide-react';

export default function Navbar({ onOpenReport, onOpenHelp }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="logo-icon-wrapper">
            <Shield className="logo-icon" size={24} />
            <span className="logo-ai-badge">AI</span>
          </div>
          <div className="logo-text">
            <span className="brand-title">AI BARANGAY</span>
            <span className="brand-sub">PROBLEM MAPPER</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav">
          <a href="#home" className="nav-link">Home</a>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#community-map" className="nav-link flex-center">
            <MapPin size={16} className="text-emerald" />
            Community Map
          </a>
          <a href="#problems" className="nav-link">Issues</a>
          <a href="#ai-gis" className="nav-link">AI + GIS</a>
          <a href="#transparency" className="nav-link">Transparency</a>
        </nav>

        {/* Action Controls */}
        <div className="nav-actions">
          <button onClick={onOpenHelp} className="btn-icon" title="Help & FAQs">
            <HelpCircle size={20} />
          </button>
          
          <Link to="/login" className="btn btn-secondary nav-btn-sm">
            <UserCheck size={16} />
            Login
          </Link>

          <Link to="/register" className="btn btn-secondary nav-btn-sm btn-register">
            Register
          </Link>

          <button onClick={onOpenReport} className="btn btn-primary nav-report-btn">
            <PlusCircle size={18} />
            <span>Report Problem</span>
          </button>

          <button 
            className="mobile-burger" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
          <a href="#community-map" onClick={() => setMobileMenuOpen(false)}>Community Map</a>
          <a href="#problems" onClick={() => setMobileMenuOpen(false)}>Reported Hazards</a>
          <a href="#ai-gis" onClick={() => setMobileMenuOpen(false)}>AI + GIS Technology</a>
          <a href="#transparency" onClick={() => setMobileMenuOpen(false)}>LGU Transparency</a>
          <div className="mobile-drawer-actions">
            <button onClick={() => { setMobileMenuOpen(false); onOpenReport(); }} className="btn btn-primary w-full">
              <PlusCircle size={18} /> Report a Hazard
            </button>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary w-full text-center">
              Login / Barangay Officer Portal
            </Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-secondary w-full text-center">
              Register Account
            </Link>
          </div>
        </div>
      )}

      <style>{`
        .navbar-header {
          position: sticky;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 900;
          background: rgba(9, 13, 22, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-glass);
        }

        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .logo-icon-wrapper {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
          border: 1px solid rgba(16, 185, 129, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-emerald);
        }

        .logo-ai-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--accent-emerald);
          color: #000;
          font-size: 0.65rem;
          font-weight: 900;
          padding: 1px 4px;
          border-radius: 4px;
          line-height: 1;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.15rem;
          letter-spacing: 0.05em;
          color: var(--text-main);
          line-height: 1.1;
        }

        .brand-sub {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: var(--accent-emerald);
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 1.75rem;
        }

        .nav-link {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.92rem;
          font-weight: 500;
          transition: color var(--transition-fast);
        }

        .nav-link:hover {
          color: var(--text-main);
        }

        .flex-center {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .text-emerald {
          color: var(--accent-emerald);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-icon {
          background: transparent;
          border: 1px solid var(--border-glass);
          color: var(--text-muted);
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-icon:hover {
          color: var(--text-main);
          border-color: var(--border-glass-bright);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.88rem;
          text-decoration: none;
        }

        .mobile-burger {
          display: none;
          background: transparent;
          border: none;
          color: var(--text-main);
          cursor: pointer;
        }

        .mobile-drawer {
          position: absolute;
          top: 72px;
          left: 0;
          width: 100%;
          background: #0b1120;
          border-bottom: 1px solid var(--border-glass);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        .mobile-drawer a {
          color: var(--text-main);
          text-decoration: none;
          font-size: 1.05rem;
          font-weight: 500;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .mobile-drawer-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .w-full { width: 100%; }
        .text-center { text-align: center; }

        @media (max-width: 1024px) {
          .desktop-nav { display: none; }
          .mobile-burger { display: block; }
          .btn-register { display: none; }
        }

        @media (max-width: 640px) {
          .nav-report-btn span { display: none; }
          .nav-report-btn { padding: 0.6rem; }
        }
      `}</style>
    </header>
  );
}
