import React from 'react';
import { NavLink } from '@/lib/router-shim';
import { NAV_LINKS } from '@/lib/data/publicData';

/**
 * GovernmentNav — sticky, accessible primary navigation.
 * Hidden below 1024px in favor of the header's hamburger menu.
 */
export default function GovernmentNav() {
  return (
    <nav className="pub-nav-links" aria-label="Main navigation">
      {NAV_LINKS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `pub-nav-link ${isActive ? 'active' : ''}`}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
