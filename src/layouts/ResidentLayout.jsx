import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Landmark, LayoutDashboard, PlusCircle, FileText, MapPin, Bell,
  MessageSquare, LifeBuoy, User, Settings, Menu, X, LogOut,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import '../styles/resident.css';
import { RESIDENT, NOTIFICATIONS } from '../data/residentData';

/**
 * ResidentLayout — citizen-facing application shell.
 *
 * Desktop / tablet: collapsible teal sidebar (72px icons-only <-> 250px
 * full labels), white top header. The collapsed state persists across
 * visits and defaults to collapsed on screens narrower than 1024px.
 * Mobile (<768px): off-canvas drawer + bottom navigation with a
 * prominent "+ Report" action.
 */

const PAGE_META = [
  { path: '/resident/dashboard',    title: 'Dashboard',      category: 'Home' },
  { path: '/resident/report',       title: 'Report a Problem', category: 'Home' },
  { path: '/resident/my-reports',   title: 'My Reports',     category: 'Home' },
  { path: '/resident/map',          title: 'Community Map',  category: 'Home' },
  { path: '/resident/notifications', title: 'Notifications', category: 'Communication' },
  { path: '/resident/messages',     title: 'Messages',       category: 'Communication' },
  { path: '/resident/help',         title: 'Help Center',    category: 'Support' },
  { path: '/resident/profile',      title: 'My Profile',     category: 'Account' },
  { path: '/resident/settings',     title: 'Settings',       category: 'Account' },
];

const NAV_GROUPS = [
  {
    title: 'HOME',
    links: [
      { to: '/resident/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/resident/report', icon: PlusCircle, label: 'Report a Problem' },
      { to: '/resident/my-reports', icon: FileText, label: 'My Reports' },
      { to: '/resident/map', icon: MapPin, label: 'Community Map' },
    ],
  },
  {
    title: 'COMMUNICATION',
    links: [
      { to: '/resident/notifications', icon: Bell, label: 'Notifications', badge: NOTIFICATIONS.filter((n) => !n.read).length },
      { to: '/resident/messages', icon: MessageSquare, label: 'Messages' },
    ],
  },
  {
    title: 'SUPPORT',
    links: [
      { to: '/resident/help', icon: LifeBuoy, label: 'Help Center' },
    ],
  },
  {
    title: 'ACCOUNT',
    links: [
      { to: '/resident/profile', icon: User, label: 'My Profile' },
      { to: '/resident/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

/* Collapsed by default on tablet-and-below, unless the resident has
   an explicit saved preference. try/catch: private-mode Safari throws. */
function initialCollapsed() {
  try {
    const saved = window.localStorage.getItem('res-side-collapsed');
    if (saved === '1') return true;
    if (saved === '0') return false;
  } catch { /* storage unavailable — fall through */ }
  return window.innerWidth < 1024;
}

export default function ResidentLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [tip, setTip] = useState(null); // { label, top } for the collapsed tooltip

  const menuBtnRef = useRef(null);
  const asideRef = useRef(null);

  const meta =
    PAGE_META.find((p) => pathname.startsWith(p.path)) ||
    { title: 'Dashboard', category: 'Home' };
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  const closeDrawer = () => setDrawerOpen(false);
  const handleLogout = () => navigate('/login');

  const toggleCollapsed = () => {
    setTip(null);
    setCollapsed((prev) => {
      try {
        window.localStorage.setItem('res-side-collapsed', prev ? '0' : '1');
      } catch { /* storage unavailable */ }
      return !prev;
    });
  };

  /* Collapsed-state tooltip: shown for hovered/focused items only while
     the sidebar is collapsed. Positioned against the aside (not inside
     the scrollable nav) so it is never clipped. */
  const showTip = (e) => {
    if (!collapsed || drawerOpen) return;
    const aside = asideRef.current;
    const el = e.currentTarget;
    if (!aside) return;
    const a = aside.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setTip({ label: el.dataset.tip, top: r.top - a.top + r.height / 2 });
  };
  const hideTip = () => setTip(null);

  /* Drawer (mobile): lock background scroll, close on Escape, and
     restore focus to the menu button on close. */
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
      if (menuBtnRef.current) menuBtnRef.current.focus();
    };
  }, [drawerOpen]);

  /* A route change while the drawer is open (e.g. via the bottom nav)
     should also close it. */
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  /* In drawer mode the sidebar always shows full labels, so the
     collapsed class is only applied when the drawer is closed. */
  const sideClass = [
    'res-side',
    drawerOpen ? 'open' : '',
    !drawerOpen && collapsed ? 'collapsed' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="res-app">
      <a href="#res-main-content" className="res-skip-link">
        Skip to main content
      </a>

      <div className="res-shell">
        {/* ============ SIDEBAR (collapsible / mobile drawer) ============ */}
        <aside ref={asideRef} className={sideClass}>
          <div className="res-side-brand">
            <span className="res-side-logo" aria-hidden="true">
              <Landmark size={20} />
            </span>
            <span className="res-side-brand-text">
              <span className="res-side-title">AI BARANGAY</span>
              <span className="res-side-subtitle">Problem Mapper</span>
            </span>
            <button
              type="button"
              className="res-side-close"
              onClick={closeDrawer}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav id="resident-side-nav" className="res-side-nav" aria-label="Resident menu">
            {NAV_GROUPS.map((group) => (
              <React.Fragment key={group.title}>
                <div className="res-side-group">
                  <span className="res-side-group-label">{group.title}</span>
                </div>
                {group.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/resident/dashboard'}
                    className={({ isActive }) => `res-side-link ${isActive ? 'active' : ''}`}
                    onClick={closeDrawer}
                    data-tip={link.label}
                    onMouseEnter={showTip}
                    onMouseLeave={hideTip}
                    onFocus={showTip}
                    onBlur={hideTip}
                  >
                    <span className="res-side-icon">
                      <link.icon size={18} aria-hidden="true" />
                    </span>
                    <span className="res-side-label">{link.label}</span>
                    {link.badge > 0 && <span className="res-side-count">{link.badge}</span>}
                  </NavLink>
                ))}
              </React.Fragment>
            ))}
          </nav>

          <div className="res-side-footer">
            <div className="res-side-status" role="status">
              <span className="res-side-icon" aria-hidden="true">
                <span className="res-side-status-dot" />
              </span>
              <span className="res-side-status-text">SYSTEM OPERATIONAL</span>
            </div>
            <Link to="/resident/profile" className="res-side-account" onClick={closeDrawer}>
              <span className="res-side-avatar" aria-hidden="true">{RESIDENT.initial}</span>
              <span className="res-side-account-text">
                <span className="res-side-account-name">{RESIDENT.name}</span>
                <span className="res-side-account-role">Resident Account</span>
              </span>
            </Link>
            <button
              type="button"
              className="res-side-signout"
              onClick={handleLogout}
            >
              <span className="res-side-icon">
                <LogOut size={16} aria-hidden="true" />
              </span>
              <span className="res-side-label">Sign Out</span>
            </button>
          </div>

          {/* Collapse / expand control — floats on the sidebar edge */}
          <button
            type="button"
            className="res-side-toggle"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-controls="resident-side-nav"
            aria-label={collapsed ? 'Expand sidebar navigation' : 'Collapse sidebar navigation'}
            data-tip={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onMouseEnter={showTip}
            onMouseLeave={hideTip}
            onFocus={showTip}
            onBlur={hideTip}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Collapsed-state tooltip (one element, follows hover/focus) */}
          <div
            className={`res-side-tip ${tip ? 'show' : ''}`}
            role="tooltip"
            style={tip ? { top: `${tip.top}px` } : undefined}
          >
            {tip ? tip.label : ''}
          </div>
        </aside>

        {/* Drawer scrim (mobile) */}
        <div
          className={`res-scrim ${drawerOpen ? 'show' : ''}`}
          onClick={closeDrawer}
          aria-hidden="true"
        />

        {/* ============ MAIN AREA ============ */}
        <div className="res-main">
          <header className="res-header">
            <div className="res-header-left">
              <button
                type="button"
                ref={menuBtnRef}
                className="res-menu-btn"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                aria-expanded={drawerOpen}
              >
                <Menu size={20} />
              </button>
              <div>
                <div className="res-crumb" aria-hidden="true">
                  <span>Resident Portal</span>
                  <span className="res-crumb-sep">/</span>
                  <span>{meta.category}</span>
                  <span className="res-crumb-sep">/</span>
                  <span className="res-crumb-current">{meta.title}</span>
                </div>
                <h1 className="res-header-title">{meta.title}</h1>
              </div>
            </div>

            <div className="res-header-right">
              <NavLink to="/resident/notifications" className="res-bell" aria-label={`Notifications (${unread} unread)`}>
                <Bell size={18} />
                {unread > 0 && <span className="res-bell-dot" aria-hidden="true" />}
              </NavLink>
              <Link to="/resident/profile" className="res-header-profile">
                <span className="res-side-avatar" aria-hidden="true">{RESIDENT.initial}</span>
                <span className="res-header-profile-text">
                  <span className="res-header-profile-name">{RESIDENT.firstName}</span>
                  <span className="res-header-profile-role">Resident</span>
                </span>
              </Link>
            </div>
          </header>

          <main className="res-content" id="res-main-content">
            <Outlet />
          </main>
        </div>
      </div>

      {/* ============ MOBILE BOTTOM NAVIGATION ============ */}
      <nav className="res-bottom-nav" aria-label="Main menu">
        <NavLink
          to="/resident/dashboard"
          end
          className={({ isActive }) => `res-bottom-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} aria-hidden="true" />
          <span>Home</span>
        </NavLink>
        <NavLink
          to="/resident/my-reports"
          className={({ isActive }) => `res-bottom-item ${isActive ? 'active' : ''}`}
        >
          <FileText size={20} aria-hidden="true" />
          <span>Reports</span>
        </NavLink>
        <div className="res-bottom-cta">
          <Link to="/resident/report" className="res-bottom-cta-btn" aria-label="Report a Problem">
            <PlusCircle size={26} />
          </Link>
          <span className="res-bottom-cta-label" aria-hidden="true">+ Report</span>
        </div>
        <NavLink
          to="/resident/map"
          className={({ isActive }) => `res-bottom-item ${isActive ? 'active' : ''}`}
        >
          <MapPin size={20} aria-hidden="true" />
          <span>Map</span>
        </NavLink>
        <NavLink
          to="/resident/profile"
          className={({ isActive }) => `res-bottom-item ${isActive ? 'active' : ''}`}
        >
          <User size={20} aria-hidden="true" />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
