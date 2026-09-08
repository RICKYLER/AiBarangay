import React, { useState } from 'react';
import { ScrollText, Lock, Download } from 'lucide-react';
import {
  DataTable, PageHeader, Card, SearchInput, FilterSelect, FilterBar,
  ResultBadge, SystemBadge, SecurityStrip,
} from '../../components/gov';
import { AUDIT_LOGS, ORG } from '../../data/adminData';

const ROLE_TIER = {
  'Administrator': 'critical',
  'Incident Officer': 'info',
  'Sanitation Officer': 'info',
  'Field Personnel': 'neutral',
};

export default function BarangayAuditLogs() {
  const [search, setSearch] = useState('');
  const [user, setUser] = useState('All');
  const [action, setAction] = useState('All');
  const [result, setResult] = useState('All');

  const filtered = AUDIT_LOGS.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      q === '' ||
      log.resource.toLowerCase().includes(q) ||
      log.detail.toLowerCase().includes(q) ||
      log.id.toLowerCase().includes(q);
    return (
      matchesSearch &&
      (user === 'All' || log.user === user) &&
      (action === 'All' || log.action === action) &&
      (result === 'All' || log.result === result)
    );
  });

  const columns = [
    {
      key: 'time',
      label: 'TIMESTAMP',
      sortable: true,
      sortValue: (r) => r.timestamp,
      render: (r) => (
        <div>
          <span className="gov-id gov-num">{r.time}</span>
          <span className="gov-meta gov-num" style={{ display: 'block' }}>{r.timestamp.slice(0, 10)}</span>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'USER',
      sortable: true,
      render: (r) => (
        <div>
          <span className="gov-cell-main">{r.user}</span>
        </div>
      ),
    },
    { key: 'role', label: 'ROLE', sortable: true, render: (r) => <SystemBadge variant={ROLE_TIER[r.role] || 'neutral'}>{r.role}</SystemBadge> },
    { key: 'action', label: 'ACTION', sortable: true, render: (r) => <span className="gov-cell-main">{r.action}</span> },
    {
      key: 'resource',
      label: 'RESOURCE',
      sortable: true,
      render: (r) => (
        <div>
          <span className="gov-id">{r.resource}</span>
          <span className="gov-meta" style={{ display: 'block' }}>{r.detail}</span>
        </div>
      ),
    },
    {
      key: 'ip',
      label: 'IP / SESSION',
      sortable: true,
      render: (r) => (
        <div>
          <span className="gov-meta gov-num">{r.ip}</span>
          <span className="gov-meta gov-num" style={{ display: 'block' }}>{r.session}</span>
        </div>
      ),
    },
    { key: 'result', label: 'RESULT', sortable: true, render: (r) => <ResultBadge result={r.result} /> },
  ];

  const users = Array.from(new Set(AUDIT_LOGS.map((l) => l.user)));
  const actions = Array.from(new Set(AUDIT_LOGS.map((l) => l.action)));

  return (
    <div className="gov-page">

      <PageHeader
        title="Audit Logs"
        subtitle="Immutable security and activity trail for every action in the operations system."
        actions={
          <>
            <span className="gov-badge success"><Lock size={12} /> Audit logging active</span>
            <button className="gov-btn gov-btn-secondary">
              <Download size={14} /> Export
            </button>
          </>
        }
      />

      <SecurityStrip role={ORG.role} organization={ORG.barangay} />

      <Card
        title="System Audit Trail"
        subtitle={`${filtered.length} of ${AUDIT_LOGS.length} entries match the current query · write-once retention 7 years`}
        icon={ScrollText}
        flush
      >
        <FilterBar
          end={
            <>
              <FilterSelect label="Users" value={user} onChange={setUser} options={users} />
              <FilterSelect label="Actions" value={action} onChange={setAction} options={actions} />
              <FilterSelect label="Results" value={result} onChange={setResult} options={['SUCCESS', 'FAILED']} />
              <FilterSelect label="Date" value="All" onChange={() => {}} options={['Today', 'Last 7 Days', 'Last 30 Days']} />
            </>
          }
        >
          <SearchInput placeholder="Search resource or detail…" value={search} onChange={setSearch} width={280} />
        </FilterBar>

        <div className="gov-card-body gov-flush">
          <DataTable
            columns={columns}
            rows={filtered}
            pageSize={8}
            emptyTitle="No audit entries match this query"
            mobileRender={(r) => (
              <>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">TIME</span>
                  <span className="gov-id gov-num">{r.time}</span>
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">USER / ROLE</span>
                  <span className="gov-cell-main">{r.user} · {r.role}</span>
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">ACTION</span>
                  <span className="gov-cell-main">{r.action}</span>
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">RESOURCE</span>
                  <span className="gov-id">{r.resource}</span>
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">RESULT</span>
                  <ResultBadge result={r.result} />
                </div>
              </>
            )}
          />
        </div>
      </Card>

    </div>
  );
}
