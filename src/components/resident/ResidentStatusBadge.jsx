import React from 'react';

/**
 * ResidentStatusBadge — status pill with a colored dot AND a text label,
 * so status is never communicated by color alone.
 */
const STATUS_CLASS = {
  'Submitted': 'res-badge-submitted',
  'Under Review': 'res-badge-review',
  'In Progress': 'res-badge-progress',
  'Verified': 'res-badge-resolved',
  'Resolved': 'res-badge-resolved',
};

export default function ResidentStatusBadge({ status }) {
  return (
    <span className={`res-badge ${STATUS_CLASS[status] || 'res-badge-submitted'}`}>
      {status}
    </span>
  );
}
