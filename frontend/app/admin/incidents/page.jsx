'use client';

import React, { useState } from 'react';
import { AlertTriangle, Download } from 'lucide-react';
import {
  DataTable, PageHeader, Card, Tabs, Drawer, Timeline, KVGrid, SearchInput,
  FilterSelect, FilterBar, PriorityBadge, StatusBadge, CategoryChip,
  CATEGORY_COLORS, AIDisclaimer,
} from '@/components/gov';
import { INCIDENTS } from '@/lib/data/adminData';

const TAB_STEPS = [
  { key: 'overview', label: 'Incident Overview' },
  { key: 'location', label: 'Location' },
  { key: 'ai', label: 'AI Analysis' },
  { key: 'assignment', label: 'Assignment' },
  { key: 'updates', label: 'Field Updates' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'resolution', label: 'Resolution' },
  { key: 'audit', label: 'Audit History' },
];

function IncidentDetail({ incident, onClose }) {
  const [tab, setTab] = useState('overview');

  const fieldUpdates = [
    { title: 'Incident created from verified report', time: `${incident.created} · Administrator`, status: 'done' },
    { title: 'Personnel assigned', time: `${incident.created} · Administrator`, note: `${incident.personnel} (${incident.office})`, status: 'done' },
    { title: 'En route to site', time: 'Sep 6, 09:42 · Field', note: 'Departed depot, ETA 12 minutes.', status: incident.status === 'En Route' ? 'active' : 'done' },
    { title: 'On site — inspection', time: '—', status: ['On Site', 'In Progress', 'Completed'].includes(incident.status) ? 'active' : 'pending' },
    { title: 'Resolution recorded', time: '—', status: incident.status === 'Completed' ? 'done' : 'pending' },
  ];

  return (
    <Drawer title={`Incident ${incident.id}`} onClose={onClose}>
      <Tabs steps={TAB_STEPS} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <KVGrid
          items={[
            { label: 'INCIDENT ID', value: incident.id },
            { label: 'CATEGORY', value: <CategoryChip category={incident.category} swatch={CATEGORY_COLORS[incident.category]} /> },
            { label: 'PRIORITY', value: <PriorityBadge priority={incident.priority} /> },
            { label: 'STATUS', value: <StatusBadge status={incident.status} /> },
            { label: 'CREATED', value: incident.created },
            { label: 'LAST UPDATED', value: incident.updated },
          ]}
        />
      )}

      {tab === 'location' && (
        <KVGrid
          items={[
            { label: 'ZONE', value: incident.zone },
            { label: 'BARANGAY', value: incident.barangay },
            { label: 'ADDRESS', value: incident.location },
            { label: 'COORDINATES', value: `${incident.lat}, ${incident.lng}` },
          ]}
        />
      )}

      {tab === 'ai' && (
        <div className="gov-stack">
          <KVGrid
            items={[
              { label: 'CATEGORY DETECTION', value: `${incident.category} · 94% confidence` },
              { label: 'PRIORITY ASSESSMENT', value: `${incident.priority} · 87% confidence` },
            ]}
          />
          <div className="gov-ai-rec">
            <div className="gov-ai-rec-label">AI RECOMMENDATION</div>
            <p className="gov-ai-rec-text">“Prioritize field inspection and confirm hazard severity before escalation.”</p>
          </div>
          <AIDisclaimer compact />
        </div>
      )}

      {tab === 'assignment' && (
        <KVGrid
          items={[
            { label: 'ASSIGNED OFFICE', value: incident.office },
            { label: 'ASSIGNED PERSONNEL', value: incident.personnel },
            { label: 'DISPATCH STATUS', value: <StatusBadge status={incident.status} /> },
            { label: 'SOURCE REPORT', value: <span className="gov-id">{incident.reportId}</span> },
          ]}
        />
      )}

      {tab === 'updates' && <Timeline items={fieldUpdates} />}

      {tab === 'evidence' && (
        <div className="gov-empty">
          <span className="gov-meta">Evidence attachments are managed by assigned field personnel from the Field Operations console.</span>
        </div>
      )}

      {tab === 'resolution' && (
        <div className="gov-stack">
          <p className="gov-text-secondary">
            Record the official resolution once field personnel confirm the action taken.
          </p>
          <button className="gov-btn gov-btn-success" style={{ alignSelf: 'flex-start' }}>
            Record Resolution
          </button>
        </div>
      )}

      {tab === 'audit' && (
        <Timeline
          items={[
            { title: 'Incident created', time: `${incident.created} · Administrator`, status: 'done' },
            { title: 'Assignment logged', time: `${incident.created} · Administrator`, status: 'done' },
            { title: 'Field update received', time: `${incident.updated} · ${incident.personnel}`, status: 'active' },
          ]}
        />
      )}
    </Drawer>
  );
}

export default function BarangayIncidents() {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('All');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = INCIDENTS.filter((inc) => {
    const q = search.toLowerCase();
    const matchesSearch =
      q === '' ||
      inc.id.toLowerCase().includes(q) ||
      inc.title.toLowerCase().includes(q) ||
      inc.location.toLowerCase().includes(q);
    return (
      matchesSearch &&
      (priority === 'All' || inc.priority === priority) &&
      (status === 'All' || inc.status === status)
    );
  });

  const columns = [
    {
      key: 'id',
      label: 'INCIDENT ID',
      sortable: true,
      render: (r) => (
        <div>
          <span className="gov-id">{r.id}</span>
          <span className="gov-meta" style={{ display: 'block' }}>{r.title}</span>
        </div>
      ),
    },
    { key: 'category', label: 'CATEGORY', sortable: true, render: (r) => <CategoryChip category={r.category} swatch={CATEGORY_COLORS[r.category]} /> },
    { key: 'priority', label: 'PRIORITY', sortable: true, render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: 'location', label: 'LOCATION', sortable: true, render: (r) => <span className="gov-cell-main">{r.location}</span> },
    { key: 'status', label: 'STATUS', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'office', label: 'ASSIGNED OFFICE', sortable: true, render: (r) => <span className="gov-text-secondary">{r.office}</span> },
    { key: 'personnel', label: 'PERSONNEL', sortable: true, render: (r) => <span className="gov-cell-main">{r.personnel}</span> },
    { key: 'created', label: 'CREATED', sortable: true, render: (r) => <span className="gov-meta gov-num">{r.created}</span> },
    { key: 'updated', label: 'LAST UPDATED', sortable: true, render: (r) => <span className="gov-meta gov-num">{r.updated}</span> },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (r) => <button className="gov-row-action" onClick={() => setSelected(r)}>Manage</button>,
    },
  ];

  return (
    <div className="gov-page">

      <PageHeader
        title="Incident Management"
        subtitle="Verified incidents queued for department dispatch and field operations."
        actions={
          <button className="gov-btn gov-btn-secondary">
            <Download size={14} /> Export
          </button>
        }
      />

      <Card
        title="Incident Command"
        subtitle={`${filtered.length} of ${INCIDENTS.length} incidents match the current query`}
        icon={AlertTriangle}
        flush
      >
        <FilterBar
          end={
            <>
              <FilterSelect label="Priority" value={priority} onChange={setPriority} options={['Critical', 'High', 'Medium']} />
              <FilterSelect label="Status" value={status} onChange={setStatus} options={['Assigned', 'In Progress', 'On Site', 'En Route', 'Completed']} />
            </>
          }
        >
          <SearchInput placeholder="Search incident ID, title, or location…" value={search} onChange={setSearch} width={280} />
        </FilterBar>

        <div className="gov-card-body gov-flush">
          <DataTable
            columns={columns}
            rows={filtered}
            pageSize={6}
            emptyTitle="No incidents match this query"
            mobileRender={(r) => (
              <>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">INCIDENT</span>
                  <span className="gov-id">{r.id}</span>
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">CATEGORY</span>
                  <CategoryChip category={r.category} swatch={CATEGORY_COLORS[r.category]} />
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">PRIORITY</span>
                  <PriorityBadge priority={r.priority} />
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">STATUS</span>
                  <StatusBadge status={r.status} />
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">LOCATION</span>
                  <span className="gov-cell-main">{r.location}</span>
                </div>
                <div className="gov-mc-actions">
                  <button className="gov-btn gov-btn-secondary gov-btn-sm" onClick={() => setSelected(r)}>Manage</button>
                </div>
              </>
            )}
          />
        </div>
      </Card>

      {selected && <IncidentDetail incident={selected} onClose={() => setSelected(null)} />}

    </div>
  );
}
