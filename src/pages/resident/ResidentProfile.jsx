import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Bell, Settings as SettingsIcon } from 'lucide-react';
import { RESIDENT, MY_REPORTS, reportSummary } from '../../data/residentData';

/**
 * ResidentProfile — the resident's own identity and account summary.
 * Personal data is shown only here, never on public pages.
 */
export default function ResidentProfile() {
  const summary = reportSummary(MY_REPORTS);

  return (
    <div className="res-fade" style={{ maxWidth: 860 }}>
      <div className="res-profile-grid">
        {/* Identity & details */}
        <div className="res-card res-card-pad">
          <div className="res-profile-id">
            <span className="res-side-avatar" aria-hidden="true">{RESIDENT.initial}</span>
            <div>
              <h2 className="res-profile-name">{RESIDENT.name}</h2>
              <p className="res-profile-role">
                Registered Resident · Member since {RESIDENT.memberSince}
              </p>
            </div>
          </div>

          <div className="res-kv" aria-label="Profile information">
            <div className="res-kv-row">
              <span className="res-kv-key">Full Name</span>
              <span className="res-kv-value">{RESIDENT.name}</span>
            </div>
            <div className="res-kv-row">
              <span className="res-kv-key">Email</span>
              <span className="res-kv-value">{RESIDENT.email}</span>
            </div>
            <div className="res-kv-row">
              <span className="res-kv-key">Mobile Number</span>
              <span className="res-kv-value">{RESIDENT.mobile}</span>
            </div>
            <div className="res-kv-row">
              <span className="res-kv-key">Barangay</span>
              <span className="res-kv-value">{RESIDENT.barangay}</span>
            </div>
            <div className="res-kv-row">
              <span className="res-kv-key">Zone</span>
              <span className="res-kv-value">{RESIDENT.zone}</span>
            </div>
          </div>

          <div className="res-note" style={{ marginTop: 18 }}>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>
              Your personal information is visible only to you and to
              authorized barangay personnel who handle your reports. It is
              never shown on the public community map.
            </span>
          </div>
        </div>

        {/* Activity & quick links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="res-card res-card-pad">
            <span className="res-section-eyebrow">MY ACTIVITY</span>
            <div className="res-kv" style={{ marginTop: 8 }}>
              <div className="res-kv-row">
                <span className="res-kv-key">Reports Submitted</span>
                <span className="res-kv-value">{summary.total}</span>
              </div>
              <div className="res-kv-row">
                <span className="res-kv-key">Currently In Progress</span>
                <span className="res-kv-value" style={{ color: 'var(--res-teal)' }}>
                  {summary.inProgress}
                </span>
              </div>
              <div className="res-kv-row">
                <span className="res-kv-key">Resolved</span>
                <span className="res-kv-value" style={{ color: 'var(--res-green-deep)' }}>
                  {summary.resolved}
                </span>
              </div>
            </div>
            <span className="res-demo-note" style={{ marginTop: 12 }}>
              Sample / Demonstration Data
            </span>
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
