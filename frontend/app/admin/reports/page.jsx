'use client';

import React, { useMemo, useState } from 'react';
import { Link } from '@/lib/router-shim';
import { Inbox, Download, Eye } from 'lucide-react';
import {
  DataTable, PageHeader, Card, SearchInput, FilterSelect, FilterBar,
  PriorityBadge, StatusBadge, CategoryChip,
} from '@/components/gov';
import { useReviewQueue } from '@/hooks/useReviewQueue';
import { CATEGORY_COLORS } from '@/components/gov';

/* DB status → queue label. */
const STATUS_LABEL = {
  SUBMITTED: 'Pending Review',
  UNDER_REVIEW: 'Under Review',
  VERIFIED: 'Verified',
  ASSIGNED: 'Assigned',
  FIELD_RESPONSE: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Resolved',
  REJECTED: 'Rejected',
  DUPLICATE: 'Rejected',
};

function friendlyStatus(s) {
  return STATUS_LABEL[s] || (s ? s.replaceAll('_', ' ') : 'Pending Review');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

const RANGE_DAYS = { 'Last 24 Hours': 1, 'Last 7 Days': 7, 'Last 30 Days': 30 };

export default function BarangayReports() {
  const { items, loading, error } = useReviewQueue();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [dateRange, setDateRange] = useState('All');

  /* Adapt v_barangay_review_queue rows to the table's row shape. */
  const rows = useMemo(() => (items || []).map((r) => ({
    id: r.report_number,
    uuid: r.id,
    title: r.title,
    reporter: r.resident_name || 'Anonymous resident',
    category: r.category || 'Uncategorized',
    location: r.zone && r.barangay
      ? `${r.zone} · ${r.barangay}`
      : (r.barangay || (r.latitude != null ? `${r.latitude.toFixed(4)}, ${r.longitude?.toFixed(4)}` : 'Map pin')),
    zone: r.zone || '—',
    priority: r.suggested_priority || r.ai_priority || 'Low',
    aiConfidence: r.ai_confidence != null ? Math.round(r.ai_confidence * 100) : null,
    status: friendlyStatus(r.status),
    submitted: formatDate(r.submitted_at),
    submittedAt: r.submitted_at,
    duplicateFlags: r.pending_duplicate_flags,
  })), [items]);

  const categoryOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category))).sort(),
    [rows]
  );
  const statusOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.status))),
    [rows]
  );
  const priorityOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.priority))),
    [rows]
  );

  const filtered = rows.filter((rpt) => {
    const q = search.toLowerCase();
    const matchesSearch =
      q === '' ||
      rpt.id.toLowerCase().includes(q) ||
      rpt.title.toLowerCase().includes(q) ||
      rpt.location.toLowerCase().includes(q) ||
      rpt.reporter.toLowerCase().includes(q);
    const matchesRange =
      dateRange === 'All' ||
      (Date.now() - new Date(rpt.submittedAt).getTime()) <= RANGE_DAYS[dateRange] * 86400000;
    return (
      matchesSearch &&
      matchesRange &&
      (status === 'All' || rpt.status === status) &&
      (category === 'All' || rpt.category === category) &&
      (priority === 'All' || rpt.priority === priority)
    );
  });

  const columns = [
    {
      key: 'id',
      label: 'REPORT ID',
      sortable: true,
      render: (r) => (
        <div>
          <span className="gov-id">{r.id}</span>
          <span className="gov-meta" style={{ display: 'block' }}>{r.reporter}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'CATEGORY',
      sortable: true,
      render: (r) => <CategoryChip category={r.category} swatch={CATEGORY_COLORS[r.category]} />,
    },
    {
      key: 'location',
      label: 'LOCATION',
      sortable: true,
      render: (r) => <span className="gov-cell-main">{r.location}</span>,
    },
    { key: 'priority', label: 'PRIORITY', sortable: true, render: (r) => <PriorityBadge priority={r.priority} /> },
    {
      key: 'aiConfidence',
      label: 'AI ANALYSIS',
      sortable: true,
      render: (r) => r.aiConfidence == null ? (
        <span className="gov-meta" style={{ fontSize: 12 }}>—</span>
      ) : (
        <span className="gov-ai-confidence" style={{ fontSize: 12 }}>
          <span className="gov-meter"><span className="gov-meter-fill" style={{ width: `${r.aiConfidence}%`, background: 'var(--gov-teal)' }} /></span>
          {r.aiConfidence}%
        </span>
      ),
    },
    {
      key: 'duplicateFlags',
      label: 'DUPLICATES',
      sortable: true,
      render: (r) => r.duplicateFlags > 0 ? (
        <span className="gov-badge warning">{r.duplicateFlags} flagged</span>
      ) : (
        <span className="gov-meta" style={{ fontSize: 12 }}>None</span>
      ),
    },
    { key: 'status', label: 'STATUS', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'submitted', label: 'SUBMITTED', sortable: true, render: (r) => <span className="gov-meta gov-num">{r.submitted}</span> },
    {
      key: 'actions',
      label: 'ACTIONS',
      sortable: false,
      render: (r) => (
        <div className="gov-cell-actions">
          <Link to={`/admin/reports/${r.uuid}/review`} className="gov-row-action">View</Link>
        </div>
      ),
    },
  ];

  return (
    <div className="gov-page">

      <PageHeader
        title="Report Management"
        subtitle="Review, verify, and dispatch citizen-submitted community reports."
        actions={
          <button className="gov-btn gov-btn-secondary" disabled title="Available once the export service is wired">
            <Download size={14} /> Export
          </button>
        }
      />

      <Card
        title="Incoming Resident Reports"
        subtitle={
          loading ? 'Loading reports…'
            : error ? `Could not load reports: ${error}`
              : `${filtered.length} of ${rows.length} records match the current query`
        }
        icon={Inbox}
        flush
      >
        <FilterBar
          end={
            <>
              <FilterSelect label="Date Range" value={dateRange} onChange={setDateRange}
                options={['Last 24 Hours', 'Last 7 Days', 'Last 30 Days']} />
              <FilterSelect label="Status" value={status} onChange={setStatus}
                options={statusOptions} />
              <FilterSelect label="Category" value={category} onChange={setCategory}
                options={categoryOptions} />
              <FilterSelect label="Priority" value={priority} onChange={setPriority}
                options={priorityOptions} />
            </>
          }
        >
          <SearchInput
            placeholder="Search Report ID, title, or location…"
            value={search}
            onChange={setSearch}
            width={280}
          />
        </FilterBar>

        <div className="gov-card-body gov-flush">
          <DataTable
            columns={columns}
            rows={filtered}
            pageSize={6}
            emptyTitle={loading ? 'Loading reports…' : 'No reports match this query'}
            emptySub={loading ? 'Fetching the barangay review queue.' : 'Clear a filter or widen the search terms to see more records.'}
            mobileRender={(r) => (
              <>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">REPORT</span>
                  <span className="gov-id">{r.id}</span>
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">CATEGORY</span>
                  <CategoryChip category={r.category} swatch={CATEGORY_COLORS[r.category]} />
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">LOCATION</span>
                  <span className="gov-cell-main">{r.location}</span>
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">PRIORITY</span>
                  <PriorityBadge priority={r.priority} />
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">STATUS</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="gov-mc-actions">
                  <Link to={`/admin/reports/${r.uuid}/review`} className="gov-btn gov-btn-secondary gov-btn-sm">
                    <Eye size={12} /> View
                  </Link>
                </div>
              </>
            )}
          />
        </div>
      </Card>

    </div>
  );
}
