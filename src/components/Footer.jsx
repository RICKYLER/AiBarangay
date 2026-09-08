import React from 'react';
import { Shield, PhoneCall, Heart, ExternalLink } from 'lucide-react';

export default function Footer({ onOpenHelp }) {
  return (
    <footer className="footer-wrapper">
      <div className="container">
        
        {/* Emergency Hotline Alert Banner */}
        <div className="emergency-banner glass-card flex-between">
          <div className="banner-left flex-center">
            <div className="pulse-dot"></div>
            <div>
              <strong>Emergency Assistance Needed?</strong>
              <span className="banner-sub">For immediate life-threatening situations, dial local emergency hotlines directly.</span>
            </div>
          </div>

          <div className="hotline-numbers flex-center">
            <span className="phone-chip"><PhoneCall size={14} /> Tagum CDRRMO: (084) 216-2911</span>
            <span className="phone-chip"><PhoneCall size={14} /> Tagum PNP: (084) 216-3285</span>
            <span className="phone-chip"><PhoneCall size={14} /> Tagum BFP Fire: (084) 216-2580</span>
          </div>
        </div>

        {/* Main Footer Links Grid */}
        <div className="footer-grid">
          
          {/* Column 1: Brand Info */}
          <div className="footer-col brand-col">
            <div className="brand-logo">
              <div className="logo-icon-wrapper">
                <Shield size={22} />
                <span className="logo-ai-badge">AI</span>
              </div>
              <div className="logo-text">
                <span className="brand-title">AI BARANGAY</span>
                <span className="brand-sub">PROBLEM MAPPER</span>
              </div>
            </div>

            <p className="footer-about">
              Next-generation civic technology empowering Philippine Barangays and LGUs with computer vision hazard detection, GIS spatial mapping, and open government transparency.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="footer-col">
            <h4 className="col-title">Platform Navigation</h4>
            <ul className="footer-links">
              <li><a href="#home">Home Overview</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#community-map">Interactive GIS Map</a></li>
              <li><a href="#problems">Reported Hazards Stream</a></li>
              <li><a href="#ai-gis">AI & Vision Technology</a></li>
              <li><a href="#transparency">LGU Transparency Logs</a></li>
            </ul>
          </div>

          {/* Column 3: Hazard Categories */}
          <div className="footer-col">
            <h4 className="col-title">Hazard Categories</h4>
            <ul className="footer-links">
              <li><a href="#problems">Street Flooding & Drainage</a></li>
              <li><a href="#problems">Road Potholes & Asphalt</a></li>
              <li><a href="#problems">Solid Waste & Dumping</a></li>
              <li><a href="#problems">Streetlight Maintenance</a></li>
              <li><a href="#problems">Water Pipe Leakages</a></li>
            </ul>
          </div>

          {/* Column 4: LGU & Community Support */}
          <div className="footer-col">
            <h4 className="col-title">Help & LGU Resources</h4>
            <ul className="footer-links">
              <li><button onClick={onOpenHelp} className="btn-footer-link">Resident Help Guide</button></li>
              <li><a href="#transparency">Barangay Leaderboard</a></li>
              <li><a href="#home">API & Open Data Access <ExternalLink size={12} /></a></li>
              <li><a href="#home">Privacy & Data Governance</a></li>
              <li><a href="#home">Contact LGU Admin</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom flex-between">
          <div className="copy-text">
            © 2026 AI Barangay Problem Mapper — Tagum City Edition. Engineered for Barangays & LGU of Tagum City, Davao del Norte.
          </div>
          <div className="made-with flex-center">
            <span>Built with</span>
            <Heart size={14} className="text-rose" />
            <span>for Community Safety</span>
          </div>
        </div>

      </div>

      <style>{`
        .footer-wrapper {
          background: #060911;
          border-top: 1px solid var(--border-glass);
          padding-top: 4rem;
          padding-bottom: 2rem;
        }

        .emergency-banner {
          padding: 1.25rem 1.75rem;
          margin-bottom: 3.5rem;
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .banner-left {
          gap: 1rem;
        }

        .banner-sub {
          display: block;
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 400;
        }

        .hotline-numbers {
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .phone-chip {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 3rem;
          padding-bottom: 3.5rem;
          border-bottom: 1px solid var(--border-glass);
        }

        .footer-about {
          margin-top: 1rem;
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.6;
          max-width: 320px;
        }

        .col-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1.25rem;
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .footer-links a, .btn-footer-link {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.88rem;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color var(--transition-fast);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .footer-links a:hover, .btn-footer-link:hover {
          color: var(--accent-emerald);
        }

        .footer-bottom {
          padding-top: 2rem;
          font-size: 0.82rem;
          color: var(--text-subtle);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .made-with {
          gap: 0.35rem;
        }

        .text-rose { color: var(--accent-rose); }

        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr; }
          .emergency-banner { flex-direction: column; align-items: flex-start; }
          .footer-bottom { flex-direction: column; }
        }
      `}</style>
    </footer>
  );
}
