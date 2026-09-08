import React, { useState } from 'react';
import { Save, Cpu, ShieldCheck } from 'lucide-react';
import { PageHeader, Card, Tabs, KVGrid, SecurityStrip } from '../../components/gov';
import { ORG } from '../../data/adminData';

function ToggleRow({ label, sub, on, onChange }) {
  return (
    <label className="gov-priority" style={{ gap: 8, cursor: 'pointer' }}>
      <div className="gov-row-between">
        <div>
          <div className="gov-cell-main">{label}</div>
          <div className="gov-meta">{sub}</div>
        </div>
        <span className={`gov-layer-chip ${on ? 'on' : ''}`}>
          <input type="checkbox" checked={on} onChange={onChange} />
          {on ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    </label>
  );
}

export default function BarangaySettings() {
  const [tab, setTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [flags, setFlags] = useState({
    aiAnalysis: true,
    autoPriority: true,
    fieldSms: false,
    auditRetention: true,
    publicTransparency: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div className="gov-page">

      <PageHeader
        title="System Settings"
        subtitle="Operational configuration for the barangay management information system."
        actions={
          <button className="gov-btn gov-btn-primary" onClick={handleSave}>
            <Save size={14} /> Save Changes
          </button>
        }
      />

      {saved && (
        <div className="gov-ai-disclaimer" style={{ background: 'var(--gov-green-dim)', borderColor: 'rgba(111, 207, 151, 0.45)' }}>
          <ShieldCheck size={15} color="var(--gov-green-deep)" />
          <span style={{ color: 'var(--gov-green-deep)' }}>Settings saved. Change recorded in the audit log.</span>
        </div>
      )}

      <Card flush>
        <Tabs
          steps={[
            { key: 'general', label: 'General' },
            { key: 'ai', label: 'AI Analysis' },
            { key: 'notifications', label: 'Notifications' },
            { key: 'security', label: 'Security & Audit' },
          ]}
          active={tab}
          onChange={setTab}
        />

        <div className="gov-card-body gov-stack">

          {tab === 'general' && (
            <>
              <KVGrid
                items={[
                  { label: 'ORGANIZATION', value: ORG.barangay },
                  { label: 'MUNICIPALITY', value: ORG.municipality },
                  { label: 'TIME ZONE', value: 'Asia/Manila (PHT)' },
                  { label: 'SYSTEM VERSION', value: 'v4.2.0' },
                ]}
              />
              <div className="gov-grid-2">
                <div className="gov-field">
                  <label className="gov-label" htmlFor="set-org">Display Name</label>
                  <input id="set-org" className="gov-input" defaultValue="San Isidro Barangay Operations System" />
                </div>
                <div className="gov-field">
                  <label className="gov-label" htmlFor="set-contact">Operations Contact</label>
                  <input id="set-contact" className="gov-input" defaultValue="ops@sanisidro.gov.ph" />
                </div>
              </div>
            </>
          )}

          {tab === 'ai' && (
            <>
              <ToggleRow
                label="AI Category & Priority Analysis"
                sub="Analyze submitted reports with the Vision v4.2 model on intake"
                on={flags.aiAnalysis}
                onChange={() => setFlags((f) => ({ ...f, aiAnalysis: !f.aiAnalysis }))}
              />
              <ToggleRow
                label="Automatic Priority Suggestion"
                sub="Propose Critical / High / Medium / Low classification for reviewer confirmation"
                on={flags.autoPriority}
                onChange={() => setFlags((f) => ({ ...f, autoPriority: !f.autoPriority }))}
              />
              <div className="gov-ai-disclaimer">
                <Cpu size={15} />
                <span>
                  AI output is always advisory. The system never auto-verifies reports or
                  dispatches personnel without an authorized decision.
                </span>
              </div>
            </>
          )}

          {tab === 'notifications' && (
            <ToggleRow
              label="Field Personnel SMS Alerts"
              sub="Send assignment alerts to field personnel via SMS gateway"
              on={flags.fieldSms}
              onChange={() => setFlags((f) => ({ ...f, fieldSms: !f.fieldSms }))}
            />
          )}

          {tab === 'security' && (
            <>
              <ToggleRow
                label="Extended Audit Retention"
                sub="Retain immutable audit records for 7 years (DILG compliance)"
                on={flags.auditRetention}
                onChange={() => setFlags((f) => ({ ...f, auditRetention: !f.auditRetention }))}
              />
              <ToggleRow
                label="Public Transparency Portal"
                sub="Publish resolved incident summaries to the resident portal"
                on={flags.publicTransparency}
                onChange={() => setFlags((f) => ({ ...f, publicTransparency: !f.publicTransparency }))}
              />
              <KVGrid
                items={[
                  { label: 'SESSION TIMEOUT', value: '30 minutes of inactivity' },
                  { label: 'MFA', value: 'Required for Administrator accounts' },
                  { label: 'AUDIT RETENTION', value: flags.auditRetention ? '7 years' : '1 year' },
                  { label: 'DATA RESIDENCY', value: 'Philippines region' },
                ]}
              />
            </>
          )}

          <SecurityStrip role={ORG.role} organization={ORG.barangay} />
        </div>
      </Card>

    </div>
  );
}
