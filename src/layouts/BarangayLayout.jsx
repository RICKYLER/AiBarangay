import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Inbox, AlertTriangle, Map, Users, Radio, Cpu,
  BarChart3, Building2, Tags, ScrollText, Settings, LogOut, Menu, ChevronLeft,
  ChevronRight, Bell, Search, ChevronDown, UserCog, KeyRound, Lock, User,
} from 'lucide-react';
import '../styles/admin.css';
import { ORG, NOTIFICATIONS } from '../data/adminData';

const PAGE_META = {
  '/admin/dashboard': { title: 'Barangay Operations Dashboard', category: 'Operations' },
  '/admin/reports': { title: 'Report Management', category: 'Operations' },
  '/admin/incidents': { title: 'Incident Management', category: 'Operations' },
  '/admin/live-map': { title: 'Live Incident Map', category: 'Operations' },
  '/admin/assignments': { title: 'Assignments', category: 'Operations' },
  '/admin/field-ops': { title: 'Field Operations', category: 'Operations' },
  '/admin/ai-intel': { title: 'AI Intelligence', category: 'Operations' },
  '/admin/analytics': { title: 'Analytics', category: 'Operations' },
  '/admin/users': { title: 'Users & Roles', category: 'Administration' },
  '/admin/zones': { title: 'Barangays & Zones', category: 'Administration' },
  '/admin/categories': { title: 'Incident Categories', category: 'Administration' },
  '/admin/audit-logs': { title: 'Audit Logs', category: 'Administration' },
  '/admin/settings': { title: 'System Settings', category: 'Administration' },
};

function currentMeta(pathname) {
  if (pathname.startsWith('/admin/reports/review')) {
    return { title: 'Report Review', category: 'Operations' };
  }
  return PAGE_META[pathname] || { title: 'Operations', category: 'Operations' };
}

const OPERATIONS_NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/reports', label: 'Report Management', icon: Inbox, count: '24' },
  { to: '/admin/incidents', label: 'Incidents', icon: AlertTriangle, count: '12' },
  { to: '/admin/live-map', label: 'Live Incident Map', icon: Map },
  { to: '/admin/assignments', label: 'Assignments', icon: Users },
  { to: '/admin/field-ops', label: 'Field Operations', icon: Radio },
  { to: '/admin/ai-intel', label: 'AI Intelligence', icon: Cpu },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

const ADMIN_NAV = [
  { to: '/admin/users', label: 'Users & Roles', icon: UserCog },
  { to: '/admin/zones', label: 'Barangays & Zones', icon: Building2 },
  { to: '/admin/categories', label: 'Incident Categories', icon: Tags },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
  { to: '/admin/settings', label: 'System Settings', icon: Settings },
];

function NavItem({ item, onNavigate, onShowTip, onHideTip }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => `gov-nav-item ${isActive ? 'active' : ''}`}
      onClick={onNavigate}
      data-tip={item.label}
      onMouseEnter={onShowTip}
      onMouseLeave={onHideTip}
      onFocus={onShowTip}
      onBlur={onHideTip}
    >
      <span className="gov-nav-icon"><Icon size={17} /></span>
      <span className="gov-nav-label">{item.label}</span>
      {item.count && <span className="gov-nav-count">{item.count}</span>}
    </NavLink>
  );
}

/* Collapsed by default on tablet-and-below, unless the administrator
   has an explicit saved preference. try/catch: private-mode Safari throws. */
function initialCollapsed() {
  try {
    const saved = window.localStorage.getItem('gov-side-collapsed');
    if (saved === '1') return true;
    if (saved === '0') return false;
  } catch { /* storage unavailable — fall through */ }
  return window.innerWidth < 1024;
}

export default function BarangayLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tip, setTip] = useState(null); // { label, top } for the collapsed tooltip
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const shellRef = useRef(null);
  const asideRef = useRef(null);
  const menuBtnRef = useRef(null);

  const meta = currentMeta(location.pathname);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  /* Track viewport class for the sidebar toggle behavior (drawer <768px) */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobileViewport(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  /* Close dropdowns when navigating */
  useEffect(() => {
    setNotifOpen(false);
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDown = (e) => {
      if (!shellRef.current?.contains(e.target)) {
        setNotifOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  /* Drawer (mobile): lock background scroll, close on Escape, and
     restore focus to the menu button on close. */
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
      if (menuBtnRef.current) menuBtnRef.current.focus();
    };
  }, [mobileOpen]);

  const handleSignOut = () => navigate('/login');

  const toggleCollapsed = () => {
    setTip(null);
    setCollapsed((prev) => {
      try {
        window.localStorage.setItem('gov-side-collapsed', prev ? '0' : '1');
      } catch { /* storage unavailable */ }
      return !prev;
    });
  };

  /* Collapsed-state tooltip: shown for hovered/focused items only while
     the rail is collapsed. Positioned against the aside (not inside the
     scrollable nav) so it is never clipped. */
  const showTip = (e) => {
    if (!collapsed || mobileOpen) return;
    const aside = asideRef.current;
    const el = e.currentTarget;
    if (!aside) return;
    const a = aside.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setTip({ label: el.dataset.tip, top: r.top - a.top + r.height / 2 });
  };
  const hideTip = () => setTip(null);

  /* In drawer mode the rail always shows full labels, so the
     collapsed class is only applied while the drawer is closed. */
  const sideClass = [
    'gov-sidebar',
    !mobileOpen && collapsed ? 'gov-collapsed' : '',
    mobileOpen ? 'gov-mobile-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="gov-app" ref={shellRef}>
      <div className="gov-shell">

        {/* ---------------- SIDEBAR (white, collapsible / mobile drawer) ---------------- */}
        <aside ref={asideRef} className={sideClass} aria-label="Barangay operations navigation">
          <div className="gov-brand">
            <Link to="/admin/dashboard" className="gov-brand-mark" aria-label="Operations home">
              <Shield size={20} />
            </Link>
            <div className="gov-brand-text">
              <span className="gov-brand-title">AI BARANGAY</span>
              <span className="gov-brand-sub">Problem Mapper</span>
            </div>
          </div>

          <div className="gov-org">
            <div className="gov-org-text">
              <span className="gov-org-title">BARANGAY OPERATIONS</span>
              <span className="gov-org-name">{ORG.barangay}</span>
            </div>
          </div>

          <nav id="gov-side-nav" className="gov-nav" aria-label="Primary">
            <div className="gov-nav-section">
              <span className="gov-nav-section-label">OPERATIONS</span>
            </div>
            {OPERATIONS_NAV.map((item) => (
              <NavItem
                key={item.to}
                item={item}
                onNavigate={() => setMobileOpen(false)}
                onShowTip={showTip}
                onHideTip={hideTip}
              />
            ))}

            <div className="gov-nav-section">
              <span className="gov-nav-section-label">ADMINISTRATION</span>
            </div>
            {ADMIN_NAV.map((item) => (
              <NavItem
                key={item.to}
                item={item}
                onNavigate={() => setMobileOpen(false)}
                onShowTip={showTip}
                onHideTip={hideTip}
              />
            ))}
          </nav>

          <div className="gov-sidebar-footer">
            <div className="gov-sys-status" role="status">
              <span className="gov-side-icon" aria-hidden="true">
                <span className="gov-pulse-dot live" />
              </span>
              <span className="gov-sys-text">
                <span className="gov-sys-label">SYSTEM OPERATIONAL</span>
                <span className="gov-sys-sub">All services operational</span>
              </span>
            </div>

            <div className="gov-session">
              <span className="gov-session-avatar" aria-hidden="true">AD</span>
              <div className="gov-session-info">
                <span className="gov-session-name">Administrator</span>
                <span className="gov-session-org">{ORG.barangay}</span>
              </div>
            </div>

            <button type="button" className="gov-signout" onClick={handleSignOut}>
              <span className="gov-side-icon">
                <LogOut size={15} aria-hidden="true" />
              </span>
              <span className="gov-nav-label">Sign Out</span>
            </button>
          </div>

          {/* Collapse / expand control — floats on the sidebar edge */}
          <button
            type="button"
            className="gov-side-toggle"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-controls="gov-side-nav"
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
            className={`gov-side-tip ${tip ? 'show' : ''}`}
            role="tooltip"
            style={tip ? { top: `${tip.top}px` } : undefined}
          >
            {tip ? tip.label : ''}
          </div>
        </aside>

        {mobileOpen && (
          <div className="gov-sidebar-backdrop gov-backdrop-open" onClick={() => setMobileOpen(false)} aria-hidden="true" />
        )}

        {/* ---------------- MAIN AREA ---------------- */}
        <div className={`gov-main ${collapsed && !isMobileViewport ? 'gov-main-collapsed' : ''}`}>

          <header className="gov-topbar">
            <div className="gov-row" style={{ gap: 12, minWidth: 0 }}>
              <button
                ref={menuBtnRef}
                className="gov-sidebar-toggle"
                onClick={() => (isMobileViewport ? setMobileOpen(true) : toggleCollapsed())}
                aria-label={isMobileViewport ? 'Open navigation menu' : (collapsed ? 'Expand sidebar' : 'Collapse sidebar')}
                aria-expanded={isMobileViewport ? mobileOpen : !collapsed}
              >
                {isMobileViewport
                  ? <Menu size={16} />
                  : (collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />)}
              </button>

              <nav className="gov-breadcrumb" aria-label="Breadcrumb">
                <span>Home</span>
                <span className="gov-crumb-sep">/</span>
                <span>{meta.category}</span>
                <span className="gov-crumb-sep">/</span>
                <span className="gov-crumb-current">{meta.title}</span>
              </nav>
            </div>

            <div className="gov-topbar-right" ref={shellRef}>
              <div className="gov-topbar-search">
                <Search size={14} className="gov-search-icon" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search reports, incidents, zones…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Global search"
                />
              </div>

              <span className="gov-header-status" title="System status">
                <span className="gov-pulse-dot live" aria-hidden="true" />
                <span className="gov-status-full">SYSTEM OPERATIONAL</span>
                <span className="gov-status-short" aria-hidden="true">OK</span>
              </span>

              {/* Notifications */}
              <div className="gov-user-menu" style={{ position: 'relative' }}>
                <button
                  className="gov-icon-btn"
                  onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                  aria-label={`Notifications (${unreadCount} unread)`}
                >
                  <Bell size={16} />
                  {unreadCount > 0 && <span className="gov-dot-alert" aria-hidden="true" />}
                </button>

                {notifOpen && (
                  <div className="gov-notif-panel">
                    <div className="gov-notif-head">
                      <span className="gov-notif-title">SYSTEM NOTIFICATIONS</span>
                      <span className="gov-meta">{unreadCount} unread</span>
                    </div>
                    <div className="gov-notif-list">
                      {NOTIFICATIONS.map((n) => (
                        <div key={n.id} className={`gov-notif-item ${n.unread ? 'unread' : ''}`}>
                          <span className="gov-notif-dot" aria-hidden="true" />
                          <div className="gov-notif-body">
                            <div className="gov-notif-text">{n.text}</div>
                            <div className="gov-notif-time">{n.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Administrator menu */}
              <div className="gov-user-menu">
                <button
                  className="gov-user-chip"
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                  aria-label="Account menu"
                  aria-expanded={userMenuOpen}
                >
                  <span className="gov-session-avatar" aria-hidden="true">AD</span>
                  <span className="gov-user-chip-name">Administrator</span>
                  <ChevronDown size={13} className="gov-chevron" color="var(--gov-text-3)" />
                </button>

                {userMenuOpen && (
                  <div className="gov-dropdown">
                    <div className="gov-dropdown-head">
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>Administrator</div>
                      <div className="gov-meta">{ORG.barangay} · {ORG.role}</div>
                    </div>
                    <button className="gov-dropdown-item"><User size={14} /> Profile</button>
                    <button className="gov-dropdown-item"><Settings size={14} /> Account Settings</button>
                    <button className="gov-dropdown-item"><KeyRound size={14} /> Security</button>
                    <button className="gov-dropdown-item danger" onClick={handleSignOut}>
                      <Lock size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="gov-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
