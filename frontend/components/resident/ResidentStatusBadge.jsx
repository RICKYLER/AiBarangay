import React from 'react';

/**
 * ResidentStatusBadge — status pill with a colored dot AND a text label,
 * so status is never communicated by color alone.
 */
const STATUS_CLASS = {
  'Submitted': 'res-badge-submitted',
  'Under Review': 'res-badge-review',
  'Verified': 'res-badge-resolved',
  'Assigned': 'res-badge-progress',
  'Field Response': 'res-badge-progress',
  'In Progress': 'res-badge-progress',
  'Reopened': 'res-badge-progress',
  'Resolved': 'res-badge-resolved',
  'Closed': 'res-badge-resolved',
  'Rejected': 'res-badge-review',
  'Duplicate': 'res-badge-review',
  'Cancelled': 'res-badge-review',
};

export default function ResidentStatusBadge({ status }) {
  return (
    <span className={`res-badge ${STATUS_CLASS[status] || 'res-badge-submitted'}`}>
      {status}
    </span>
  );
}
