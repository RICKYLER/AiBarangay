/** Shared mappers: API rows (snake_case) → the legacy mock report shape
 *  used by ReportCard / ReportTimeline / ResidentStatusBadge. */

import type { ResidentReport } from '@/types/api';

/* DB status (incident_statuses.name) → citizen-friendly label. */
export const STATUS_LABEL: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  VERIFIED: 'Verified',
  ASSIGNED: 'Assigned',
  FIELD_RESPONSE: 'Field Response',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
  DUPLICATE: 'Duplicate',
  REOPENED: 'Reopened',
  CANCELLED: 'Cancelled',
};

/* Current stage for the 6-step ReportTimeline. */
export const STATUS_STAGE: Record<string, number> = {
  SUBMITTED: 1, UNDER_REVIEW: 2, VERIFIED: 3, ASSIGNED: 4,
  FIELD_RESPONSE: 5, RESOLVED: 6, CLOSED: 6, REOPENED: 2,
  REJECTED: 2, DUPLICATE: 2, CANCELLED: 2,
};

/* One-line "what's happening now" per status (shown on the card). */
export const STATUS_UPDATE: Record<string, string> = {
  SUBMITTED: 'Report received. Waiting for barangay review.',
  UNDER_REVIEW: 'Barangay personnel are checking your report.',
  VERIFIED: 'Confirmed as a real problem. A response will be assigned.',
  ASSIGNED: 'A response team has been assigned to this problem.',
  FIELD_RESPONSE: 'Personnel are on-site working on the problem.',
  RESOLVED: 'The problem has been fixed.',
  CLOSED: 'Complete and archived. Thank you for reporting.',
  REJECTED: 'This report was declined after review.',
  DUPLICATE: 'Merged with an existing report of the same problem.',
  REOPENED: 'This report was reopened.',
  CANCELLED: 'This report was withdrawn.',
};

export interface CardReport {
  id: string;
  uuid: string;
  category: string;
  title: string;
  location: string;
  status: string;
  stage: number;
  dateSubmitted: string;
  lastUpdated: string;
  photos: number;
  update: string;
  description: string;
  incidentNumber: string | null;
  isResolved: boolean;
}

export function friendlyStatus(dbStatus: string | null | undefined): string {
  if (!dbStatus) return 'Submitted';
  return STATUS_LABEL[dbStatus] || dbStatus.replace(/_/g, ' ');
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—';
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} minute${s < 7200 ? '' : 's'} ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hour${s < 7200 ? '' : 's'} ago`;
  return `${Math.floor(s / 86400)} day${s < 172800 ? '' : 's'} ago`;
}

/** v_resident_reports row → ReportCard shape. */
export function toCardReport(r: ResidentReport): CardReport {
  return {
    id: r.report_number,        // display ref + detail link (?ref=…)
    uuid: r.id,                 // real id, used to fetch the detail
    category: r.category || 'General',
    title: r.title,
    location: r.address || (r.latitude != null
      ? `Pinned location (${r.latitude.toFixed(5)}, ${r.longitude?.toFixed(5)})`
      : 'Pinned location'),
    status: friendlyStatus(r.status),
    stage: STATUS_STAGE[r.status || ''] || 1,
    dateSubmitted: formatDate(r.submitted_at),
    lastUpdated: timeAgo(r.closed_at || r.verified_at || r.submitted_at),
    photos: r.media_count,
    update: STATUS_UPDATE[r.status || ''] || 'Report submitted.',
    description: r.description,
    incidentNumber: r.incident_number,
    isResolved: r.is_resolved,
  };
}
