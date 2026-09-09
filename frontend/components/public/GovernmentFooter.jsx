import React from 'react';
import { Link } from '@/lib/router-shim';
import { Landmark } from 'lucide-react';
import {
  PUBLIC_CONFIG,
  FOOTER_SERVICES,
  FOOTER_INFORMATION,
} from '@/lib/data/publicData';

/**
 * GovernmentFooter — compact single-band institutional footer:
 * one row for brand + all links, one slim line for LGU identity.
 */
export default function GovernmentFooter() {
  const { lgu } = PUBLIC_CONFIG;
  const year = new Date().getFullYear();
  const links = [...FOOTER_SERVICES, ...FOOTER_INFORMATION];

  return (
    <footer className="pub-footer">
      <div className="pub-container">
        <div className="pub-footer-main">
          <div className="pub-footer-brand">
            <span className="pub-brand-mark" aria-hidden="true">
              <Landmark size={15} />
            </span>
            <span className="pub-footer-name">{PUBLIC_CONFIG.siteName}</span>
          </div>

          <nav className="pub-footer-links" aria-label="Footer">
            {links.map((l) => (
              <Link key={l.label} to={l.to} className="pub-footer-link">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="pub-footer-bottom">
          <div className="pub-footer-bottom-inner">
            <span>
              © {year} {lgu.name} · {lgu.phone} · {lgu.hours}
            </span>
            <a href={`mailto:${lgu.email}`}>{lgu.email}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
