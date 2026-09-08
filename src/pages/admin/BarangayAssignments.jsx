import React, { useState } from 'react';
import { Users, UserPlus, CheckCircle2 } from 'lucide-react';
import { PageHeader, Card, PriorityBadge, StatusBadge } from '../../components/gov';
import { INCIDENTS, PERSONNEL } from '../../data/adminData';

const UNASSIGNED = [
  {
    id: 'INC-2026-00325',
    title: 'Drainage Overflow near Day Care Center',
    zone: 'Zone 4 · Rizal Ext',
    priority: 'CRITICAL',
  },
];

export default function BarangayAssignments() {
  const [selectedPersonnel, setSelectedPersonnel] = useState({});
  const [assigned, setAssigned] = useState(null);

  const handleAssign = (incidentId) => {
    setAssigned({ incidentId, personnel: selectedPersonnel[incidentId] || 'Juan Dela Cruz' });
    setTimeout(() => setAssigned(null), 2600);
  };

  const activeAssignments = INCIDENTS.filter((inc) => inc.status !== 'Completed');

  return (
    <div className="gov-page">

      <PageHeader
        title="Assignments"
        subtitle="Dispatch LGU engineering, sanitation, and electrical teams to verified incidents."
      />

      {assigned && (
        <div className="gov-ai-disclaimer" style={{ background: 'var(--gov-green-dim)', borderColor: 'rgba(111, 207, 151, 0.45)' }}>
          <CheckCircle2 size={15} color="var(--gov-green-deep)" />
          <span style={{ color: 'var(--gov-green-deep)' }}>
            {assigned.personnel} assigned to {assigned.incidentId}. The action has been recorded in the audit log.
          </span>
        </div>
      )}

      <div className="gov-grid-2">

        {/* UNASSIGNED QUEUE */}
        <Card
          title="Unassigned Queue"
          subtitle="Verified incidents awaiting dispatch"
          icon={Users}
          actions={<span className="gov-badge critical">{UNASSIGNED.length} awaiting</span>}
        >
          <div className="gov-stack" style={{ gap: 12 }}>
            {UNASSIGNED.map((inc) => (
              <div key={inc.id} className="gov-priority" style={{ gap: 10, padding: '13px 15px' }}>
                <div className="gov-row-between">
                  <span className="gov-id">{inc.id}</span>
                  <PriorityBadge priority={inc.priority} />
                </div>
                <div>
                  <div className="gov-cell-main">{inc.title}</div>
                  <div className="gov-meta">{inc.zone}</div>
                </div>
                <div className="gov-row gov-wrap" style={{ gap: 8 }}>
                  <select
                    className="gov-filter-select"
                    value={selectedPersonnel[inc.id] || ''}
                    onChange={(e) => setSelectedPersonnel((p) => ({ ...p, [inc.id]: e.target.value }))}
                    aria-label="Select field personnel"
                  >
                    <option value="">Select field personnel…</option>
                    {PERSONNEL.map((p) => (
                      <option key={p.name} value={p.name}>{p.name} ({p.unit})</option>
                    ))}
                  </select>
                  <button className="gov-btn gov-btn-primary gov-btn-sm" onClick={() => handleAssign(inc.id)}>
                    <UserPlus size={13} /> Assign Personnel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ACTIVE ASSIGNMENTS */}
        <Card
          title="Active Assignments"
          subtitle="Personnel currently deployed in the field"
          icon={Users}
          actions={<span className="gov-badge success">{activeAssignments.length} active</span>}
        >
          <div className="gov-stack" style={{ gap: 10 }}>
            {activeAssignments.map((inc) => (
              <div key={inc.id} className="gov-priority" style={{ gap: 8 }}>
                <div className="gov-row-between">
                  <div>
                    <div className="gov-cell-main">{inc.personnel}</div>
                    <div className="gov-meta">{inc.office}</div>
                  </div>
                  <StatusBadge status={inc.status} />
                </div>
                <div className="gov-meta gov-row" style={{ gap: 6 }}>
                  <span className="gov-id">{inc.id}</span> · {inc.category} · {inc.location}
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
}
