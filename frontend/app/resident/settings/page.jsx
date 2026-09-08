'use client';

import React, { useState } from 'react';
import { useNavigate } from '@/lib/router-shim';
import { LogOut, ShieldCheck } from 'lucide-react';

/**
 * ResidentSettings — notification and privacy preferences.
 * Preferences are local demo state; nothing is transmitted.
 */
const NOTIFICATION_PREFS = [
  {
    key: 'status',
    name: 'Report status updates',
    desc: 'Notify me when the status of my report changes',
    initial: true,
  },
  {
    key: 'messages',
    name: 'New messages',
    desc: 'Notify me when the barangay sends me a message',
    initial: true,
  },
  {
    key: 'announcements',
    name: 'Community announcements',
    desc: 'Clean-up drives, advisories, and barangay announcements',
    initial: false,
  },
];

const PRIVACY_PREFS = [
  {
    key: 'map',
    name: 'Show my reports on the community map',
    desc: 'Reports always appear anonymized — only the general area and category are shown',
    initial: true,
  },
];

export default function ResidentSettings() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(() =>
    Object.fromEntries(
      [...NOTIFICATION_PREFS, ...PRIVACY_PREFS].map((p) => [p.key, p.initial])
    )
  );

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const Toggle = ({ on, label, onClick }) => (
    <button
      type="button"
      className={`res-toggle ${on ? 'on' : ''}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
    />
  );

  return (
    <div className="res-fade" style={{ maxWidth: 700 }}>
      {/* Notifications */}
      <section className="res-card res-card-pad" style={{ marginBottom: 16 }} aria-labelledby="set-notif-title">
        <span className="res-section-eyebrow">NOTIFICATIONS</span>
        <h2 id="set-notif-title" className="res-section-title" style={{ fontSize: 17, marginBottom: 6 }}>
          How we keep you updated
        </h2>

        <div>
          {NOTIFICATION_PREFS.map((p) => (
            <div key={p.key} className="res-setting-row">
              <span className="res-setting-text">
                <span className="res-setting-name">{p.name}</span>
                <span className="res-setting-desc">{p.desc}</span>
              </span>
              <Toggle on={prefs[p.key]} label={p.name} onClick={() => toggle(p.key)} />
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="res-card res-card-pad" style={{ marginBottom: 16 }} aria-labelledby="set-priv-title">
        <span className="res-section-eyebrow">PRIVACY</span>
        <h2 id="set-priv-title" className="res-section-title" style={{ fontSize: 17, marginBottom: 6 }}>
          Your information
        </h2>

        <div>
          {PRIVACY_PREFS.map((p) => (
            <div key={p.key} className="res-setting-row">
              <span className="res-setting-text">
                <span className="res-setting-name">{p.name}</span>
                <span className="res-setting-desc">{p.desc}</span>
              </span>
              <Toggle on={prefs[p.key]} label={p.name} onClick={() => toggle(p.key)} />
            </div>
          ))}
        </div>

        <div className="res-note res-note-teal" style={{ marginTop: 14 }}>
          <ShieldCheck size={16} aria-hidden="true" />
          <span>
            Your name and contact details are never shown publicly, on the
            community map, or in announcements — regardless of this setting.
          </span>
        </div>
      </section>

      {/* Account */}
      <section className="res-card res-card-pad" aria-labelledby="set-acct-title">
        <span className="res-section-eyebrow">ACCOUNT</span>
        <h2 id="set-acct-title" className="res-section-title" style={{ fontSize: 17, marginBottom: 6 }}>
          Session
        </h2>
        <p className="res-section-sub" style={{ marginBottom: 14 }}>
          You are signed in to the Resident Portal (demo environment).
        </p>
        <button
          type="button"
          className="res-btn res-btn-secondary"
          onClick={() => navigate('/login')}
        >
          <LogOut size={15} aria-hidden="true" /> Sign Out
        </button>
      </section>
    </div>
  );
}
