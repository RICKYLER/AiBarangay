import React from 'react';

export function PageHeader({ title, subtitle, actions, badge }) {
  return (
    <div className="gov-page-header">
      <div>
        {badge && <div style={{ marginBottom: 8 }}>{badge}</div>}
        <h1 className="gov-page-title">{title}</h1>
        {subtitle && <p className="gov-page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="gov-page-actions">{actions}</div>}
    </div>
  );
}

export function Card({ title, subtitle, icon: Icon, actions, children, flush, className = '' }) {
  return (
    <section className={`gov-card ${className}`}>
      {(title || actions) && (
        <div className="gov-card-head">
          <div>
            <div className="gov-card-title">
              {Icon && <Icon size={16} />}
              {title}
            </div>
            {subtitle && <div className="gov-card-sub">{subtitle}</div>}
          </div>
          {actions && <div className="gov-row">{actions}</div>}
        </div>
      )}
      <div className={`gov-card-body ${flush ? 'gov-flush' : ''}`}>{children}</div>
    </section>
  );
}

export function SecurityStrip({ role, organization }) {
  return (
    <div className="gov-security-strip">
      <span className="gov-sec-item">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <strong>SECURE GOVERNMENT OPERATIONS</strong>
      </span>
      <span className="gov-sec-divider" aria-hidden="true" />
      <span className="gov-sec-item">Authenticated Session</span>
      <span className="gov-sec-divider" aria-hidden="true" />
      <span className="gov-sec-item">Role: <strong>{role}</strong></span>
      <span className="gov-sec-divider" aria-hidden="true" />
      <span className="gov-sec-item">Organization: <strong>{organization}</strong></span>
      <span className="gov-sec-divider" aria-hidden="true" />
      <span className="gov-sec-item">
        <span className="gov-pulse-dot live" aria-hidden="true" /> Session <strong>Active</strong>
      </span>
    </div>
  );
}
