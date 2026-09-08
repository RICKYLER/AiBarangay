import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Download, Eye, UserPlus } from 'lucide-react';
import {
  DataTable, PageHeader, Card, SearchInput, FilterSelect, FilterBar,
  PriorityBadge, StatusBadge, CategoryChip, CATEGORY_COLORS,
} from '../../components/gov';
import { REPORTS } from '../../data/adminData';

const ZONE_OPTIONS = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'];

export default function BarangayReports() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [zone, setZone] = useState('All');
  const [dateRange, setDateRange] = useState('All');

  const filtered = REPORTS.filter((rpt) => {
    const q = search.toLowerCase();
    const matchesSearch =
      q === '' ||
      rpt.id.toLowerCase().includes(q) ||
      rpt.title.toLowerCase().includes(q) ||
      rpt.location.toLowerCase().includes(q);
    return (
      matchesSearch &&
      (status === 'All' || rpt.status === status) &&
      (category === 'All' || rpt.category === category) &&
      (priority === 'All' || rpt.priority === priority) &&
      (zone === 'All' || rpt.zone === zone)
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
      render: (r) => (
        <span className="gov-ai-confidence" style={{ fontSize: 12 }}>
          <span className="gov-meter"><span className="gov-meter-fill" style={{ width: `${r.aiConfidence}%`, background: 'var(--gov-teal)' }} /></span>
          {r.aiConfidence}%
        </span>
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
          <Link to={`/admin/reports/review/${r.id}`} className="gov-row-action">View</Link>
          <button className="gov-row-action">Assign</button>
          <button className="gov-row-action" aria-label="More actions">•••</button>
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
          <button className="gov-btn gov-btn-secondary">
            <Download size={14} /> Export
          </button>
        }
      />

      <Card
        title="Incoming Resident Reports"
        subtitle={`${filtered.length} of ${REPORTS.length} records match the current query`}
        icon={Inbox}
        flush
      >
        <FilterBar
          end={
            <>
              <FilterSelect label="Date Range" value={dateRange} onChange={setDateRange}
                options={['Last 24 Hours', 'Last 7 Days', 'Last 30 Days']} />
              <FilterSelect label="Status" value={status} onChange={setStatus}
                options={['Pending Review', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Resolved']} />
              <FilterSelect label="Category" value={category} onChange={setCategory}
                options={['Flooding', 'Road Damage', 'Garbage', 'Streetlight', 'Water Leak']} />
              <FilterSelect label="Priority" value={priority} onChange={setPriority}
                options={['Critical', 'High', 'Medium', 'Low']} />
              <FilterSelect label="Zone" value={zone} onChange={setZone} options={ZONE_OPTIONS} />
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
            emptyTitle="No reports match this query"
            emptySub="Clear a filter or widen the search terms to see more records."
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
                  <Link to={`/admin/reports/review/${r.id}`} className="gov-btn gov-btn-secondary gov-btn-sm">
                    <Eye size={12} /> View
                  </Link>
                  <button className="gov-btn gov-btn-secondary gov-btn-sm">
                    <UserPlus size={12} /> Assign
                  </button>
                </div>
              </>
            )}
          />
        </div>
      </Card>

    </div>
  );
}
