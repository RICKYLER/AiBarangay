import React from 'react';

/* Status → semantic variant mapping. Colors communicate operational
   state only; unknown values fall back to a neutral treatment. */
const STATUS_VARIANTS = {
  // Lifecycle
  'pending review': 'warning',
  'under review': 'warning',
  'needs info': 'warning',
  verified: 'info',
  assigned: 'info',
  'in progress': 'info',
  'en route': 'info',
  'on site': 'teal',
  inspection: 'teal',
  'action taken': 'teal',
  completed: 'success',
  resolved: 'success',
  rejected: 'critical',
  failed: 'critical',
  error: 'critical',
  active: 'success',
  inactive: 'neutral',
  suspended: 'critical',
  success: 'success',
  // Priorities
  critical: 'critical',
  high: 'warning',
  medium: 'info',
  low: 'neutral',
  // Log types
  auth: 'info',
  field: 'warning',
  action: 'info',
  system: 'neutral',
};

const VARIANT_CLASS = {
  critical: 'critical',
  warning: 'warning',
  info: 'info',
  success: 'success',
  neutral: 'neutral',
  teal: 'teal',
};

export function StatusBadge({ status, dot = true }) {
  const key = String(status || '').toLowerCase();
  const variant = STATUS_VARIANTS[key] || 'neutral';
  return (
    <span className={`gov-badge ${VARIANT_CLASS[variant]}`}>
      {dot && <span className="gov-badge-dot" aria-hidden="true" />}
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const key = String(priority || '').toLowerCase();
  const variant = STATUS_VARIANTS[key] || 'neutral';
  return (
    <span className={`gov-badge ${VARIANT_CLASS[variant]}`}>
      {key === 'critical' && <span className="gov-badge-dot" aria-hidden="true" />}
      {priority}
    </span>
  );
}

export function CategoryChip({ category, swatch }) {
  return (
    <span className="gov-chip">
      {swatch && <span className="gov-chip-swatch" style={{ background: swatch }} aria-hidden="true" />}
      {category}
    </span>
  );
}

export function ResultBadge({ result }) {
  const ok = String(result).toUpperCase() === 'SUCCESS';
  return (
    <span className={`gov-badge ${ok ? 'success' : 'critical'}`}>
      {String(result).toUpperCase()}
    </span>
  );
}

export function SystemBadge({ children, variant = 'teal' }) {
  return <span className={`gov-badge ${VARIANT_CLASS[variant]}`}>{children}</span>;
}
