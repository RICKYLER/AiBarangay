'use client';

import React, { useEffect, useState } from 'react';
import { Link } from '@/lib/router-shim';
import {
  ShieldCheck, Bell, Settings as SettingsIcon, Loader2, Pencil,
  CheckCircle2, AlertCircle, KeyRound, Save, X,
} from 'lucide-react';

/**
 * ResidentProfile — the resident's own identity and account summary,
 * on real data from GET /api/profile (RLS: the API only ever returns
 * the caller's own row). Includes the profile editor and the
 * change-password form.
 */

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function ResidentProfile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  /* ── profile editor state ── */
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* ── password change state ── */
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwNotice, setPwNotice] = useState(null); // { type, text }
  const [pwSaving, setPwSaving] = useState(false);

  const load = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load your profile.');
      setProfile(data.profile);
      setStats(data.stats);
      setForm({
        firstName: data.profile.firstName || '',
        middleName: data.profile.middleName || '',
        lastName: data.profile.lastName || '',
        phone: data.profile.phone || '',
        address: data.profile.address || '',
      });
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* ── save profile ── */
  const saveProfile = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setFormErrors({});
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormErrors(data.errors || {});
        return;
      }
      setEditing(false);
      await load(); // refresh with the saved values
    } catch {
      setFormErrors({ _: 'Cannot reach the server. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  /* ── change password ── */
  const changePassword = async (e) => {
    e.preventDefault();
    if (pwSaving) return;
    const errs = {};
    if (!pw.currentPassword) errs.currentPassword = 'Enter your current password.';
    if (!pw.newPassword || pw.newPassword.length < 8) errs.newPassword = 'At least 8 characters.';
    if (pw.newPassword && pw.newPassword !== pw.confirm) errs.confirm = 'The two passwords do not match.';
    setPwErrors(errs);
    if (Object.keys(errs).length) return;

    setPwSaving(true);
    setPwNotice(null);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwErrors(data.errors || {});
        setPwNotice({ type: 'error', text: data.error || 'The password was not changed.' });
        return;
      }
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwNotice({
        type: 'success',
        text: 'Password updated. Your other devices were signed out; this one stays signed in.',
      });
    } catch {
      setPwNotice({ type: 'error', text: 'Cannot reach the server. Please try again.' });
    } finally {
      setPwSaving(false);
    }
  };

  /* ── render ── */
  if (loading) {
    return (
      <div className="res-fade" style={{ padding: 48, textAlign: 'center', color: 'var(--res-text-3, #64748b)' }}>
        <Loader2 size={22} className="res-spin" />
        <p style={{ marginTop: 10 }}>Loading your profile…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="res-fade" style={{ maxWidth: 640 }}>
        <div className="res-card res-card-pad" style={{ color: 'var(--res-danger, #B3261E)' }}>
          <AlertCircle size={18} aria-hidden="true" />
          <span style={{ marginLeft: 8 }}>{loadError}</span>
        </div>
      </div>
    );
  }

  const fullName = [profile.firstName, profile.middleName, profile.lastName]
    .filter(Boolean).join(' ');
  const initial = (profile.firstName || '?').charAt(0).toUpperCase();

  return (
    <div className="res-fade" style={{ maxWidth: 980 }}>
      <div className="res-profile-grid">
        {/* Identity & details */}
        <div className="res-card res-card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div className="res-profile-id">
              <span className="res-side-avatar" aria-hidden="true">{initial}</span>
              <div>
                <h2 className="res-profile-name">{fullName}</h2>
                <p className="res-profile-role">
                  Registered Resident · Member since {formatDate(profile.memberSince)}
                </p>
              </div>
            </div>
            {!editing && (
              <button
                type="button"
                className="res-btn res-btn-secondary"
                style={{ flexShrink: 0 }}
                onClick={() => { setEditing(true); setFormErrors({}); }}
              >
                <Pencil size={14} aria-hidden="true" /> Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={saveProfile} style={{ marginTop: 18, display: 'grid', gap: 12 }} noValidate>
              {formErrors._ && (
                <div className="res-note" style={{ color: 'var(--res-danger, #B3261E)' }}>
                  <AlertCircle size={15} aria-hidden="true" /> <span>{formErrors._}</span>
                </div>
              )}
              <div className="res-kv-row" style={{ gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span className="res-kv-key">First name</span>
                  <input
                    className="res-input"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                  />
                  {formErrors.firstName && <span style={{ fontSize: 12, color: 'var(--res-danger, #B3261E)' }}>{formErrors.firstName}</span>}
                </label>
                <label style={{ display: 'grid', gap: 4 }}>
                  <span className="res-kv-key">Last name</span>
                  <input
                    className="res-input"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    required
                  />
                  {formErrors.lastName && <span style={{ fontSize: 12, color: 'var(--res-danger, #B3261E)' }}>{formErrors.lastName}</span>}
                </label>
              </div>
              <label style={{ display: 'grid', gap: 4 }}>
                <span className="res-kv-key">Middle name (optional)</span>
                <input
                  className="res-input"
                  value={form.middleName}
                  onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span className="res-kv-key">Mobile number</span>
                <input
                  className="res-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+63 9xx xxx xxxx"
                />
                {formErrors.phone && <span style={{ fontSize: 12, color: 'var(--res-danger, #B3261E)' }}>{formErrors.phone}</span>}
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span className="res-kv-key">Address</span>
                <input
                  className="res-input"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Zone, Barangay, City"
                />
              </label>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" className="res-btn res-btn-primary" disabled={saving}>
                  {saving ? <Loader2 size={14} className="res-spin" /> : <Save size={14} aria-hidden="true" />}
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button type="button" className="res-btn res-btn-secondary" onClick={() => setEditing(false)} disabled={saving}>
                  <X size={14} aria-hidden="true" /> Cancel
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--res-text-3, #64748b)', margin: 0 }}>
                Email and barangay cannot be changed here — contact your barangay office.
              </p>
            </form>
          ) : (
            <div className="res-kv" aria-label="Profile information" style={{ marginTop: 14 }}>
              <div className="res-kv-row">
                <span className="res-kv-key">Full Name</span>
                <span className="res-kv-value">{fullName}</span>
              </div>
              <div className="res-kv-row">
                <span className="res-kv-key">Email</span>
                <span className="res-kv-value">{profile.email}</span>
              </div>
              <div className="res-kv-row">
                <span className="res-kv-key">Mobile Number</span>
                <span className="res-kv-value">{profile.phone || '—'}</span>
              </div>
              <div className="res-kv-row">
                <span className="res-kv-key">Barangay</span>
                <span className="res-kv-value">{profile.barangayName || '—'}</span>
              </div>
              <div className="res-kv-row">
                <span className="res-kv-key">Address</span>
                <span className="res-kv-value">{profile.address || '—'}</span>
              </div>
              <div className="res-kv-row">
                <span className="res-kv-key">Email Verified</span>
                <span className="res-kv-value" style={{ color: 'var(--res-green-deep, #1B7A43)' }}>
                  {profile.isVerified ? 'Yes' : 'Pending'}
                </span>
              </div>
            </div>
          )}

          <div className="res-note" style={{ marginTop: 18 }}>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>
              Your personal information is visible only to you and to
              authorized barangay personnel who handle your reports. It is
              never shown on the public community map.
            </span>
          </div>
        </div>

        {/* Activity, password, quick links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="res-card res-card-pad">
            <span className="res-section-eyebrow">MY ACTIVITY</span>
            <div className="res-kv" style={{ marginTop: 8 }}>
              <div className="res-kv-row">
                <span className="res-kv-key">Reports Submitted</span>
                <span className="res-kv-value">{stats.total}</span>
              </div>
              <div className="res-kv-row">
                <span className="res-kv-key">Currently In Progress</span>
                <span className="res-kv-value" style={{ color: 'var(--res-teal)' }}>
                  {stats.pending + stats.verified}
                </span>
              </div>
              <div className="res-kv-row">
                <span className="res-kv-key">Resolved / Closed</span>
                <span className="res-kv-value" style={{ color: 'var(--res-green-deep)' }}>
                  {stats.resolved}
                </span>
              </div>
              <div className="res-kv-row">
                <span className="res-kv-key">Declined / Duplicate</span>
                <span className="res-kv-value">
                  {stats.rejected}
                </span>
              </div>
            </div>
          </div>

          {/* Change password */}
          <div className="res-card res-card-pad">
            <span className="res-section-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <KeyRound size={13} aria-hidden="true" /> CHANGE PASSWORD
            </span>
            {pwNotice && (
              <div
                className="res-note"
                style={{
                  marginTop: 10,
                  color: pwNotice.type === 'success'
                    ? 'var(--res-green-deep, #1B7A43)'
                    : 'var(--res-danger, #B3261E)',
                }}
                role="status"
              >
                {pwNotice.type === 'success'
                  ? <CheckCircle2 size={15} aria-hidden="true" />
                  : <AlertCircle size={15} aria-hidden="true" />}
                <span>{pwNotice.text}</span>
              </div>
            )}
            <form onSubmit={changePassword} style={{ marginTop: 10, display: 'grid', gap: 10 }} noValidate>
              <label style={{ display: 'grid', gap: 4 }}>
                <span className="res-kv-key">Current password</span>
                <input
                  type="password"
                  className="res-input"
                  value={pw.currentPassword}
                  onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
                  autoComplete="current-password"
                  required
                />
                {pwErrors.currentPassword && <span style={{ fontSize: 12, color: 'var(--res-danger, #B3261E)' }}>{pwErrors.currentPassword}</span>}
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span className="res-kv-key">New password</span>
                <input
                  type="password"
                  className="res-input"
                  value={pw.newPassword}
                  onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                  autoComplete="new-password"
                  required
                />
                {pwErrors.newPassword && <span style={{ fontSize: 12, color: 'var(--res-danger, #B3261E)' }}>{pwErrors.newPassword}</span>}
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span className="res-kv-key">Repeat new password</span>
                <input
                  type="password"
                  className="res-input"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  autoComplete="new-password"
                  required
                />
                {pwErrors.confirm && <span style={{ fontSize: 12, color: 'var(--res-danger, #B3261E)' }}>{pwErrors.confirm}</span>}
              </label>
              <button type="submit" className="res-btn res-btn-primary" disabled={pwSaving}>
                {pwSaving ? <Loader2 size={14} className="res-spin" /> : <KeyRound size={14} aria-hidden="true" />}
                {pwSaving ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </div>

          <div className="res-card res-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/resident/my-reports" className="res-btn res-btn-secondary">
              View My Reports
            </Link>
            <Link to="/resident/notifications" className="res-btn res-btn-secondary">
              <Bell size={15} aria-hidden="true" /> Notification Settings
            </Link>
            <Link to="/resident/settings" className="res-btn res-btn-secondary">
              <SettingsIcon size={15} aria-hidden="true" /> Account Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
