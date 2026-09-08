import React, { useState } from 'react';
import { Radio, Navigation, Camera, Upload, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';
import {
  PageHeader, Card, Timeline, PriorityBadge, StatusBadge, KVGrid,
} from '../../components/gov';
import { FIELD_OPS } from '../../data/adminData';

const FIELD_FORM_STEPS = ['Assigned', 'En Route', 'On Site', 'Inspection', 'Action Taken', 'Completed'];

export default function BarangayFieldOps() {
  const [activeTask, setActiveTask] = useState(FIELD_OPS[0]);
  const [status, setStatus] = useState('En Route');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setNotes('');
      setPhoto(null);
    }, 2400);
  };

  return (
    <div className="gov-page">

      <PageHeader
        title="Field Operations"
        subtitle="Active field-response tracking and real-time update submission from deployed personnel."
      />

      {/* ACTIVE FIELD OPERATIONS OVERVIEW */}
      <Card
        title="Active Field Operations"
        subtitle="Live status of personnel deployed against verified incidents"
        icon={Radio}
        flush
      >
        <div className="gov-table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>INCIDENT</th>
                <th>PERSONNEL</th>
                <th>OFFICE</th>
                <th>LOCATION</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>LAST UPDATE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {FIELD_OPS.map((op) => (
                <tr key={op.id}>
                  <td>
                    <span className="gov-id">{op.id}</span>
                    <span className="gov-meta" style={{ display: 'block' }}>{op.incident}</span>
                  </td>
                  <td><span className="gov-cell-main">{op.personnel}</span></td>
                  <td><span className="gov-text-secondary">{op.office}</span></td>
                  <td><span className="gov-cell-main">{op.location}</span></td>
                  <td><PriorityBadge priority={op.priority} /></td>
                  <td><StatusBadge status={op.status} /></td>
                  <td><span className="gov-meta">{op.lastUpdate}</span></td>
                  <td>
                    <button className="gov-row-action" onClick={() => setActiveTask(op)}>Select</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="gov-grid-2">

        {/* SELECTED OPERATION TIMELINE */}
        <Card
          title={`Operation Timeline — ${activeTask.id}`}
          subtitle={`${activeTask.incident} · ${activeTask.location}`}
          icon={Clock}
          actions={<PriorityBadge priority={activeTask.priority} />}
        >
          <div className="gov-stack" style={{ gap: 14 }}>
            <KVGrid
              items={[
                { label: 'PERSONNEL', value: activeTask.personnel },
                { label: 'OFFICE', value: activeTask.office },
                { label: 'CURRENT STATUS', value: <StatusBadge status={activeTask.status} /> },
                { label: 'LAST UPDATE', value: activeTask.lastUpdate },
              ]}
            />
            <Timeline items={activeTask.steps} />
          </div>
        </Card>

        {/* FIELD UPDATE SUBMISSION */}
        <Card
          title="Field Update Submission"
          subtitle="Log work status, notes, and photo proof from the site"
          icon={Send}
        >
          {submitted ? (
            <div className="gov-empty" style={{ padding: '32px 16px' }}>
              <CheckCircle2 size={34} color="var(--gov-green-deep)" strokeWidth={1.6} />
              <div className="gov-empty-title">Field update logged</div>
              <div className="gov-empty-sub">Status updated and evidence attached to the incident record.</div>
            </div>
          ) : (
            <form className="gov-stack" style={{ gap: 14 }} onSubmit={handleSubmit}>
              <div className="gov-field">
                <label className="gov-label" htmlFor="field-status">Update Incident Status</label>
                <div className="gov-stepper" id="field-status">
                  {FIELD_FORM_STEPS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`gov-step-btn ${status === s ? 'active' : ''}`}
                      onClick={() => setStatus(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="gov-field">
                <label className="gov-label" htmlFor="field-notes">Field Execution Notes</label>
                <textarea
                  id="field-notes"
                  className="gov-textarea"
                  rows={3}
                  placeholder="Describe field findings, debris volume cleared, or equipment used…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="gov-field">
                <span className="gov-label">Proof of Work Evidence</span>
                <div className="gov-row gov-wrap" style={{ gap: 8 }}>
                  <button
                    type="button"
                    className="gov-btn gov-btn-secondary gov-btn-sm"
                    onClick={() => setPhoto('https://images.unsplash.com/photo-1611284446314-60a55ac7de9f?auto=format&fit=crop&w=800&q=80')}
                  >
                    <Camera size={13} /> Take Photo
                  </button>
                  <label className="gov-btn gov-btn-secondary gov-btn-sm">
                    <Upload size={13} /> Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => e.target.files[0] && setPhoto(URL.createObjectURL(e.target.files[0]))}
                    />
                  </label>
                </div>
                {photo && (
                  <div style={{ position: 'relative', marginTop: 8 }}>
                    <img src={photo} alt="Work proof preview" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 'var(--gov-radius)', border: '1px solid var(--gov-border-strong)' }} />
                    <span className="gov-badge success" style={{ position: 'absolute', bottom: 8, left: 8 }}>PROOF ATTACHED</span>
                  </div>
                )}
              </div>

              <div className="gov-meta gov-row" style={{ gap: 6 }}>
                <MapPin size={12} /> GPS auto-stamp: 7.4475, 125.8055 · accuracy 3 m
              </div>

              <button type="submit" className="gov-btn gov-btn-primary">
                <Send size={14} /> Submit Field Update
              </button>
            </form>
          )}
        </Card>

      </div>

    </div>
  );
}
