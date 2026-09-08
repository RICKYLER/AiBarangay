import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, MapPin, Clock, Phone } from 'lucide-react';
import {
  PUBLIC_CONFIG,
  FOOTER_SERVICES,
  FOOTER_INFORMATION,
} from '../../data/publicData';

/**
 * GovernmentFooter — four-column institutional footer with configurable
 * LGU contact block and legal links.
 */
export default function GovernmentFooter() {
  const { lgu } = PUBLIC_CONFIG;
  const year = new Date().getFullYear();

  return (
    <footer className="pub-footer">
      <div className="pub-container">
        <div className="pub-footer-main">
          {/* Column 1 — brand */}
          <div>
            <div className="pub-footer-brand">
              <span className="pub-brand-mark" aria-hidden="true">
                <Landmark size={19} />
              </span>
              <span className="pub-footer-name">{PUBLIC_CONFIG.siteName}</span>
            </div>
            <p className="pub-footer-tagline">
              Community digital reporting platform. {PUBLIC_CONFIG.subtitle}
            </p>
          </div>

          {/* Column 2 — public services */}
          <nav aria-label="Public services">
            <h2 className="pub-footer-heading">PUBLIC SERVICES</h2>
            <div className="pub-footer-links">
              {FOOTER_SERVICES.map((l) => (
                <Link key={l.label} to={l.to} className="pub-footer-link">
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Column 3 — information */}
          <nav aria-label="Information">
            <h2 className="pub-footer-heading">INFORMATION</h2>
            <div className="pub-footer-links">
              {FOOTER_INFORMATION.map((l) => (
                <a key={l.label} href={l.to} className="pub-footer-link">
                  {l.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Column 4 — contact (configurable LGU block) */}
          <div>
            <h2 className="pub-footer-heading">CONTACT</h2>
            <div className="pub-footer-contact">
              <span className="pub-footer-contact-item">
                <MapPin size={14} aria-hidden="true" />
                <span><strong>{lgu.office}</strong><br />{lgu.address}</span>
              </span>
              <span className="pub-footer-contact-item">
                <Phone size={14} aria-hidden="true" />
                <span><strong>Official Contact</strong><br />{lgu.phone} · {lgu.email}</span>
              </span>
              <span className="pub-footer-contact-item">
                <Clock size={14} aria-hidden="true" />
                <span><strong>Office Hours</strong><br />{lgu.hours}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pub-footer-bottom">
          <div className="pub-footer-bottom-inner">
            <span>
              {PUBLIC_CONFIG.siteName} · {lgu.name} · © {year} · All rights reserved.
            </span>
            <nav className="pub-footer-legal" aria-label="Legal">
              <a href="/help#accessibility">Accessibility Statement</a>
              <a href="/help">Site Map</a>
              <a href="/help#privacy">Privacy Notice</a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
