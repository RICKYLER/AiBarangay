'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UserCog, UserPlus, ShieldAlert, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  DataTable, PageHeader, Card, SearchInput, FilterSelect, FilterBar,
  StatusBadge, SystemBadge, Modal,
} from '@/components/gov';
import { useAuth } from '@/hooks/useAuth';

/**
 * Users & Roles — real accounts from Supabase (GET /api/admin/users,
 * RLS-scoped: a barangay admin sees their own barangay, city
 * officials see everyone). "Add User" provisions an account through
 * POST /api/admin/users; Suspend/Reactivate goes through the status
 * endpoint and signs the account out of every device.
 */

const PERMISSIONS = [
  { feature: 'View Public Map', resident: true, staff: true, admin: true, field: true },
  { feature: 'Submit Report', resident: true, staff: true, admin: true, field: false },
  { feature: 'View Own Reports', resident: true, staff: false, admin: false, field: false },
  { feature: 'Review Reports', resident: false, staff: true, admin: true, field: false },
  { feature: 'Verify Incident', resident: false, staff: true, admin: true, field: false },
  { feature: 'Assign Personnel', resident: false, staff: false, admin: true, field: false },
  { feature: 'Field Updates', resident: false, staff: false, admin: false, field: true },
  { feature: 'Chat Inbox', resident: 'limited', staff: true, admin: true, field: false },
  { feature: 'AI Intelligence', resident: 'limited', staff: true, admin: true, field: 'limited' },
  { feature: 'Analytics', resident: false, staff: true, admin: true, field: false },
  { feature: 'User Management', resident: false, staff: false, admin: true, field: false },
  { feature: 'Audit Logs', resident: false, staff: 'limited', admin: true, field: false },
  { feature: 'System Settings', resident: false, staff: false, admin: true, field: false },
];

const ROLE_LABEL = {
  RESIDENT: 'Resident',
  BARANGAY_STAFF: 'Barangay Staff',
  BARANGAY_ADMIN: 'Barangay Admin',
  DESK_OFFICER: 'Desk Officer',
  FIELD_PERSONNEL: 'Field Personnel',
  OFFICE_HEAD: 'Office Head',
  LGU_ADMIN: 'LGU Admin',
  SYSTEM_ADMIN: 'System Admin',
};
const ROLE_TIER = {
  BARANGAY_ADMIN: 'teal',
  BARANGAY_STAFF: 'info',
  DESK_OFFICER: 'info',
  FIELD_PERSONNEL: 'neutral',
  RESIDENT: 'neutral',
  OFFICE_HEAD: 'critical',
  LGU_ADMIN: 'critical',
  SYSTEM_ADMIN: 'critical',
};

function PermCell({ value }) {
  if (value === true) return <span className="gov-badge success">GRANTED</span>;
  if (value === false) return <span className="gov-badge neutral">—</span>;
  return <span className="gov-badge warning">LIMITED</span>;
}

function formatLastLogin(iso) {
  if (!iso) return 'Never';
  const d = new Date(iso);
  const now = new Date();
  const mins = Math.floor((now - d) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '', role: 'RESIDENT', password: '',
};
export default function BarangayUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [status, setStatus] = useState('All');

  /* Add User modal */
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* Desks for DESK_OFFICER accounts (chat inbox assignment). */
  const [desks, setDesks] = useState([]);

  /* banner after an action */
  const [notice, setNotice] = useState(null); // { type, text }

  const isCityOfficial = ['OFFICE_HEAD', 'LGU_ADMIN', 'SYSTEM_ADMIN'].includes(me?.role);
  const creationRoles = isCityOfficial
    ? ['RESIDENT', 'BARANGAY_STAFF', 'FIELD_PERSONNEL', 'DESK_OFFICER', 'BARANGAY_ADMIN']
    : ['RESIDENT', 'BARANGAY_STAFF', 'FIELD_PERSONNEL', 'DESK_OFFICER'];

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load the accounts.');
      setUsers(data.users);
      setLoadError(null);
    } catch (err) {
      setLoadError(err.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Desk options for the DESK_OFFICER role (needed only when the
     admin opens the Add User modal). */
  useEffect(() => {
    if (!adding || desks.length) return;
    fetch('/api/chat/desks')
      .then((res) => (res.ok ? res.json() : { desks: [] }))
      .then((data) => setDesks(data.desks || []))
      .catch(() => setDesks([]));
  }, [adding, desks.length]);

  const filtered = useMemo(() => (users || []).filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      q === '' ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.barangay || '').toLowerCase().includes(q);
    return (
      matchesSearch &&
      (role === 'All' || u.role === role) &&
      (status === 'All' || (status === 'Active') === u.isActive)
    );
  }), [users, search, role, status]);

  /* ── create account ── */
  const submitUser = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormErrors({});
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          deskId: form.role === 'DESK_OFFICER' ? form.deskId : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormErrors(data.errors || {});
        if (data.error) setFormErrors((prev) => ({ _: data.error, ...prev }));
        return;
      }
      setAdding(false);
      setForm(EMPTY_FORM);
      setNotice({
        type: 'success',
        text: `Account created for ${form.firstName} ${form.lastName}. They can sign in with the email and initial password you set.`,
      });
      await load();
    } catch {
      setFormErrors({ _: 'Cannot reach the server. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  /* ── suspend / reactivate ── */
  const setStatusFor = async (u, active) => {
    if (active === false && !window.confirm(
      `Suspend ${u.name}?\n\nThey will be signed out immediately and cannot sign in until reactivated.`
    )) return;
    try {
      const res = await fetch(`/api/admin/users/${u.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'The change did not go through.');
      setNotice({
        type: 'success',
        text: active
          ? `${u.name} was reactivated.`
          : `${u.name} was suspended and signed out of all devices.`,
      });
      await load();
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'USER',
      sortable: true,
      render: (u) => (
        <div>
          <span className="gov-cell-main">{u.name}</span>
          <span className="gov-meta" style={{ display: 'block' }}>
            {u.email}
            {!u.isVerified && (
              <span className="gov-badge warning" style={{ marginLeft: 8 }}>UNVERIFIED</span>
            )}
          </span>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'ROLE',
      sortable: true,
      render: (u) => (
        <div>
          <SystemBadge variant={ROLE_TIER[u.role] || 'neutral'}>
            {ROLE_LABEL[u.role] || u.role}
          </SystemBadge>
          {u.desk && (
            <span className="gov-meta" style={{ display: 'block', marginTop: 4 }}>
              {u.desk}
            </span>
          )}
        </div>
      ),
    },
    { key: 'barangay', label: 'BARANGAY', sortable: true, render: (u) => <span className="gov-text-secondary">{u.barangay || '—'}</span> },
    { key: 'isActive', label: 'STATUS', sortable: true, render: (u) => <StatusBadge status={u.isActive ? 'Active' : 'Inactive'} /> },
    { key: 'lastLoginAt', label: 'LAST LOGIN', sortable: true, render: (u) => <span className="gov-meta gov-num">{formatLastLogin(u.lastLoginAt)}</span> },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: (u) => (
        <div className="gov-cell-actions">
          {u.isActive ? (
            <button className="gov-row-action" onClick={() => setStatusFor(u, false)}>Suspend</button>
          ) : (
            <button className="gov-row-action" onClick={() => setStatusFor(u, true)}>Reactivate</button>
          )}
        </div>
      ),
    },
  ];

  const fieldErr = (k) => formErrors[k] && (
    <span className="gov-field-error" role="alert">{formErrors[k]}</span>
  );

  return (
    <div className="gov-page">

      <PageHeader
        title="Users & Roles"
        subtitle="Manage system accounts, role assignments, and feature permissions."
        actions={
          <button className="gov-btn gov-btn-primary" onClick={() => { setAdding(true); setFormErrors({}); }}>
            <UserPlus size={14} /> Add User
          </button>
        }
      />

      {notice && (
        <div className={`gov-alert ${notice.type === 'success' ? 'success' : 'error'}`} role="status">
          {notice.type === 'success'
            ? <CheckCircle2 size={16} aria-hidden="true" />
            : <AlertCircle size={16} aria-hidden="true" />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* ROLE HIERARCHY */}
      <Card
        title="Role Hierarchy"
        subtitle="Authorization chain for barangay operations"
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
        subtitle={
          users === null
            ? 'Loading accounts…'
            : `${filtered.length} of ${users.length} accounts match the current query`
        }
        icon={UserCog}
        flush
      >
        <FilterBar
          end={
            <>
              <FilterSelect
                label="Role"
                value={role}
                onChange={setRole}
                options={['All', 'RESIDENT', 'BARANGAY_STAFF', 'FIELD_PERSONNEL', 'DESK_OFFICER', 'BARANGAY_ADMIN']}
              />
              <FilterSelect label="Account Status" value={status} onChange={setStatus} options={['All', 'Active', 'Inactive']} />
            </>
          }
        >
          <SearchInput placeholder="Search name, email, or barangay…" value={search} onChange={setSearch} width={280} />
        </FilterBar>

        <div className="gov-card-body gov-flush">
          {loadError ? (
            <div className="gov-empty" style={{ padding: 32, color: 'var(--gov-critical, #B3261E)' }}>
              <AlertCircle size={18} aria-hidden="true" style={{ verticalAlign: -3 }} />
              <span style={{ marginLeft: 8 }}>{loadError}</span>
            </div>
          ) : users === null ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--gov-text-3, #64748b)' }}>
              <Loader2 size={20} className="gov-spin" />
              <p style={{ marginTop: 8 }}>Loading accounts from the database…</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              rows={filtered}
              pageSize={8}
              emptyTitle="No accounts match this query"
              mobileRender={(u) => (
                <>
                  <div className="gov-mc-row">
                    <span className="gov-mc-label">USER</span>
                    <span className="gov-cell-main">{u.name}</span>
                  </div>
                  <div className="gov-mc-row">
                    <span className="gov-mc-label">ROLE</span>
                    <SystemBadge variant={ROLE_TIER[u.role] || 'neutral'}>{ROLE_LABEL[u.role] || u.role}</SystemBadge>
                  </div>
                  <div className="gov-mc-row">
                    <span className="gov-mc-label">STATUS</span>
                    <StatusBadge status={u.isActive ? 'Active' : 'Inactive'} />
                  </div>
                  <div className="gov-mc-row">
                    <span className="gov-mc-label">BARANGAY</span>
                    <span className="gov-text-secondary">{u.barangay || '—'}</span>
                  </div>
                </>
              )}
            />
          )}
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
                <th style={{ textAlign: 'center' }}>DESK OFFICER</th>
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
                  <td style={{ textAlign: 'center' }}><PermCell value={p.desk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD USER MODAL */}
      {adding && (
        <Modal title="Add User Account" onClose={() => setAdding(false)} width={560}>
          <form onSubmit={submitUser} className="gov-stack" style={{ gap: 14 }} noValidate>
            {formErrors._ && (
              <div className="gov-alert error" role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                <span>{formErrors._}</span>
              </div>
            )}
            <p className="gov-meta" style={{ margin: 0 }}>
              Creates a real account in the database. Desk-created accounts are
              pre-verified — the person signs in with the initial password you set
              and can change it from their profile.
            </p>
            <div className="gov-grid-2" style={{ gap: 12 }}>
              <label className="gov-field">
                <span className="gov-label">First name <span className="gov-req">*</span></span>
                <input
                  className={`gov-input ${formErrors.firstName ? 'invalid' : ''}`}
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
                {fieldErr('firstName')}
              </label>
              <label className="gov-field">
                <span className="gov-label">Last name <span className="gov-req">*</span></span>
                <input
                  className={`gov-input ${formErrors.lastName ? 'invalid' : ''}`}
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
                {fieldErr('lastName')}
              </label>
            </div>
            <label className="gov-field">
              <span className="gov-label">Email <span className="gov-req">*</span></span>
              <input
                type="email"
                className={`gov-input ${formErrors.email ? 'invalid' : ''}`}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com"
                required
              />
              {fieldErr('email')}
            </label>
            <div className="gov-grid-2" style={{ gap: 12 }}>
              <label className="gov-field">
                <span className="gov-label">Mobile number</span>
                <input
                  className={`gov-input ${formErrors.phone ? 'invalid' : ''}`}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+63 9xx xxx xxxx"
                />
                {fieldErr('phone')}
              </label>
              <label className="gov-field">
                <span className="gov-label">Role <span className="gov-req">*</span></span>
                <select
                  className="gov-input"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value, deskId: '' })}
                >
                  {creationRoles.map((r) => (
                    <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                  ))}
                </select>
                {fieldErr('role')}
              </label>
            </div>
            {form.role === 'DESK_OFFICER' && (
              <label className="gov-field">
                <span className="gov-label">Desk <span className="gov-req">*</span></span>
                <select
                  className={`gov-input ${formErrors.deskId ? 'invalid' : ''}`}
                  value={form.deskId || ''}
                  onChange={(e) => setForm({ ...form, deskId: e.target.value })}
                  required
                >
                  <option value="" disabled>Choose the desk they will answer…</option>
                  {desks.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <span className="gov-meta" style={{ display: 'block', marginTop: 4 }}>
                  A desk officer can only see their desk's chat inbox — nothing else.
                </span>
                {fieldErr('deskId')}
              </label>
            )}
            <label className="gov-field">
              <span className="gov-label">Initial password <span className="gov-req">*</span></span>
              <input
                type="text"
                className={`gov-input ${formErrors.password ? 'invalid' : ''}`}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 8 characters"
                autoComplete="off"
                required
              />
              {fieldErr('password')}
            </label>
            {!isCityOfficial && me?.barangay_id && (
              <p className="gov-meta" style={{ margin: 0 }}>
                The account will be registered under your barangay.
              </p>
            )}
            <div className="gov-row" style={{ gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="gov-btn gov-btn-secondary" onClick={() => setAdding(false)} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="gov-btn gov-btn-primary" disabled={submitting}>
                {submitting
                  ? <Loader2 size={14} className="gov-spin" />
                  : <UserPlus size={14} aria-hidden="true" />}
                {submitting ? 'Creating…' : 'Create Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
