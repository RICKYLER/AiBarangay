'use client';

import React from 'react';
import { NavLink, Link, useLocation } from '@/lib/router-shim';
import { Home, MapPinned, Newspaper, User, Plus } from 'lucide-react';
import { REPORT_ROUTE, LOGIN_ROUTE } from '@/lib/data/publicData';
import { useAuth, homeForRole } from '@/hooks/useAuth';

/**
 * MobileTabBar — app-style bottom navigation for phone widths.
 * The five resident tasks are always one thumb-reach away: home,
 * map, report (the raised primary action), news, and account.
 * Hidden above 768px; hides on scroll-down and returns on
 * scroll-up, mirroring the header's behaviour.
 */
export default function MobileTabBar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [hidden, setHidden] = React.useState(false);

  /* Auto-hide scroll logic — rAF-throttled, passive */
  React.useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (delta > 4 && y > 160) setHidden(true);
      else if (delta < -4) setHidden(false);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const accountTo = user ? homeForRole(user.role) : LOGIN_ROUTE;

  const itemClass = (active) => `pub-tabbar-item${active ? ' active' : ''}`;

  return (
    <nav
      className={`pub-tabbar${hidden ? ' tabbar-hidden' : ''}`}
      aria-label="Quick navigation"
    >
      <NavLink to="/" end className={({ isActive }) => itemClass(isActive)}>
        <Home size={21} aria-hidden="true" />
        <span className="pub-tabbar-label">Home</span>
      </NavLink>

      <NavLink to="/community-map" className={({ isActive }) => itemClass(isActive)}>
        <MapPinned size={21} aria-hidden="true" />
        <span className="pub-tabbar-label">Map</span>
      </NavLink>

      {/* Primary action — raised above the bar */}
      <Link to={REPORT_ROUTE} className="pub-tabbar-item pub-tabbar-report" aria-label="Report a problem">
        <span className="pub-tabbar-report-btn" aria-hidden="true">
          <Plus size={24} strokeWidth={2.4} />
        </span>
        <span className="pub-tabbar-label">Report</span>
      </Link>

      <NavLink to="/news" className={({ isActive }) => itemClass(isActive)}>
        <Newspaper size={21} aria-hidden="true" />
        <span className="pub-tabbar-label">News</span>
      </NavLink>

      <Link to={accountTo} className="pub-tabbar-item">
        <User size={21} aria-hidden="true" />
        <span className="pub-tabbar-label">{user ? 'Account' : 'Log In'}</span>
      </Link>
    </nav>
  );
}
