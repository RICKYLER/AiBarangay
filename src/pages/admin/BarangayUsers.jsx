import React, { useState } from 'react';
import { UserCog, UserPlus, ShieldAlert } from 'lucide-react';
import {
  DataTable, PageHeader, Card, SearchInput, FilterSelect, FilterBar,
  StatusBadge, SystemBadge,
} from '../../components/gov';
import { USERS } from '../../data/adminData';

const PERMISSIONS = [
  { feature: 'View Public Map', resident: true, staff: true, admin: true, field: true },
  { feature: 'Submit Report', resident: true, staff: true, admin: true, field: false },
  { feature: 'View Own Reports', resident: true, staff: false, admin: false, field: false },
  { feature: 'Review Reports', resident: false, staff: true, admin: true, field: false },
  { feature: 'Verify Incident', resident: false, staff: true, admin: true, field: false },
  { feature: 'Assign Personnel', resident: false, staff: false, admin: true, field: false },
  { feature: 'Field Updates', resident: false, staff: false, admin: false, field: true },
  { feature: 'AI Intelligence', resident: 'limited', staff: true, admin: true, field: 'limited' },
  { feature: 'Analytics', resident: false, staff: true, admin: true, field: false },
  { feature: 'User Management', resident: false, staff: false, admin: true, field: false },
  { feature: 'Audit Logs', resident: false, staff: 'limited', admin: true, field: false },
  { feature: 'System Settings', resident: false, staff: false, admin: true, field: false },
];

const ROLE_TIER = {
  'Administrator': 'critical',
  'Incident Officer': 'info',
  'Field Personnel': 'neutral',
};

function PermCell({ value }) {
  if (value === true) return <span className="gov-badge success">GRANTED</span>;
  if (value === false) return <span className="gov-badge neutral">—</span>;
  return <span className="gov-badge warning">LIMITED</span>;
}

export default function BarangayUsers() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');

  const filtered = USERS.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      q === '' ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.office.toLowerCase().includes(q);
    return (
      matchesSearch &&
      (role === 'All' || u.role === role) &&
      (status === 'All' || u.status === status)
    );
  });

  const columns = [
    {
      key: 'name',
      label: 'USER',
      sortable: true,
      render: (u) => (
        <div>
          <span className="gov-cell-main">{u.name}</span>
          <span className="gov-meta" style={{ display: 'block' }}>{u.email}</span>
        </div>
      ),
    },
    { key: 'role', label: 'ROLE', sortable: true, render: (u) => <SystemBadge variant={ROLE_TIER[u.role] || 'neutral'}>{u.role}</SystemBadge> },
    { key: 'office', label: 'OFFICE / UNIT', sortable: true, render: (u) => <span className="gov-text-secondary">{u.office}</span> },
    { key: 'status', label: 'STATUS', sortable: true, render: (u) => <StatusBadge status={u.status} /> },
    { key: 'lastLogin', label: 'LAST LOGIN', sortable: true, render: (u) => <span className="gov-meta gov-num">{u.lastLogin}</span> },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: () => (
        <div className="gov-cell-actions">
          <button className="gov-row-action">Edit</button>
          <button className="gov-row-action">Suspend</button>
        </div>
      ),
    },
  ];

  return (
    <div className="gov-page">

      <PageHeader
        title="Users & Roles"
        subtitle="Manage system accounts, role assignments, and feature permissions."
        actions={
          <button className="gov-btn gov-btn-primary">
            <UserPlus size={14} /> Add User
          </button>
        }
      />

      {/* ROLE HIERARCHY */}
      <Card
        title="Role Hierarchy"
        subtitle="Authorization chain for San Isidro Barangay operations"
        icon={ShieldAlert}
      >
        <div className="gov-stack" style={{ gap: 8 }}>
          <div className="gov-row gov-wrap" style={{ gap: 8 }}>
            <span className="gov-badge critical">SUPER ADMIN — Municipal / DILG</span>
            <span className="gov-meta">›</span>
            <span className="gov-badge info">SYSTEM ADMIN — IT Command Center</span>
            <span className="gov-meta">›</span>
            <span className="gov-badge teal">BARANGAY ADMIN — Captain / Desk Officer</span>
          </div>
          <div className="gov-row gov-wrap" style={{ gap: 8 }}>
            <span className="gov-badge neutral">REVIEW OFFICER</span>
            <span className="gov-badge neutral">DEPARTMENT OFFICER</span>
            <span className="gov-badge neutral">FIELD PERSONNEL</span>
            <span className="gov-badge outline">RESIDENT</span>
          </div>
        </div>
      </Card>

      {/* USER ACCOUNTS */}
      <Card
        title="System Accounts"
        subtitle={`${filtered.length} of ${USERS.length} accounts match the current query`}
        icon={UserCog}
        flush
      >
        <FilterBar
          end={
            <>
              <FilterSelect label="Role" value={role} onChange={setRole} options={['Administrator', 'Incident Officer', 'Field Personnel']} />
              <FilterSelect label="Account Status" value={status} onChange={setStatus} options={['Active', 'Inactive']} />
            </>
          }
        >
          <SearchInput placeholder="Search name, email, or office…" value={search} onChange={setSearch} width={280} />
        </FilterBar>

        <div className="gov-card-body gov-flush">
          <DataTable
            columns={columns}
            rows={filtered}
            pageSize={6}
            emptyTitle="No accounts match this query"
            mobileRender={(u) => (
              <>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">USER</span>
                  <span className="gov-cell-main">{u.name}</span>
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">ROLE</span>
                  <SystemBadge variant={ROLE_TIER[u.role] || 'neutral'}>{u.role}</SystemBadge>
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">STATUS</span>
                  <StatusBadge status={u.status} />
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">OFFICE</span>
                  <span className="gov-text-secondary">{u.office}</span>
                </div>
              </>
            )}
          />
        </div>
      </Card>

      {/* PERMISSION MATRIX */}
      <Card
        title="Permission Matrix"
        subtitle="Feature access controls per role"
        icon={ShieldAlert}
        flush
      >
        <div className="gov-table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>FEATURE / ACTION</th>
                <th style={{ textAlign: 'center' }}>RESIDENT</th>
                <th style={{ textAlign: 'center' }}>BARANGAY STAFF</th>
                <th style={{ textAlign: 'center' }}>ADMIN</th>
                <th style={{ textAlign: 'center' }}>FIELD PERSONNEL</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.feature}>
                  <td><span className="gov-cell-main">{p.feature}</span></td>
                  <td style={{ textAlign: 'center' }}><PermCell value={p.resident} /></td>
                  <td style={{ textAlign: 'center' }}><PermCell value={p.staff} /></td>
                  <td style={{ textAlign: 'center' }}><PermCell value={p.admin} /></td>
                  <td style={{ textAlign: 'center' }}><PermCell value={p.field} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
