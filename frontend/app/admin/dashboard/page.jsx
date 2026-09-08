'use client';

import React, { useMemo } from 'react';
import { Link } from '@/lib/router-shim';
import {
  Inbox, FileSearch, ShieldCheck, AlertTriangle, Download, ClipboardCheck,
  ArrowRight, Activity,
} from 'lucide-react';
import {
  StatCard, PageHeader, Card, SecurityStrip, PriorityBadge, StatusBadge,
  CategoryChip, GisMap, AIInsightCard, CATEGORY_COLORS,
} from '@/components/gov';
import { ORG, ZONES } from '@/lib/data/adminData';
import { useReviewQueue } from '@/hooks/useReviewQueue';
import { usePublicMap } from '@/hooks/usePublicMap';

const STATUS_LABEL = {
  VERIFIED: 'Verified',
  ASSIGNED: 'Assigned',
  FIELD_RESPONSE: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Resolved',
  REOPENED: 'Reopened',
};

function friendlyStatus(s) {
  return STATUS_LABEL[s] || (s ? s.replaceAll('_', ' ') : 'Verified');
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BarangayDashboard() {
  const { items: queue, loading: queueLoading } = useReviewQueue();
  const { incidents, hotspots, loading: mapLoading } = usePublicMap();

  const kpi = useMemo(() => ({
    pendingReview: queue?.length ?? 0,
    verifiedIncidents: incidents.length,
    criticalIncidents: incidents.filter((i) => i.priority === 'CRITICAL').length,
    totalTracked: (queue?.length ?? 0) + incidents.length,
  }), [queue, incidents]);

  const priorities = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const inc of incidents) {
      const p = (inc.priority || 'LOW').toUpperCase();
      if (p in counts) counts[p] += 1;
    }
    const total = incidents.length || 1;
    return [
      { key: 'critical', label: 'Critical', count: counts.CRITICAL, pct: Math.round((counts.CRITICAL / total) * 100), sub: 'Immediate safety risk' },
      { key: 'high', label: 'High', count: counts.HIGH, pct: Math.round((counts.HIGH / total) * 100), sub: 'Urgent response needed' },
      { key: 'medium', label: 'Medium', count: counts.MEDIUM, pct: Math.round((counts.MEDIUM / total) * 100), sub: 'Scheduled response' },
      { key: 'low', label: 'Low', count: counts.LOW, pct: Math.round((counts.LOW / total) * 100), sub: 'Routine monitoring' },
    ];
  }, [incidents]);

  const recentReports = useMemo(() => (queue || []).slice(0, 5).map((r) => ({
    id: r.report_number,
    uuid: r.id,
    category: r.category || 'Uncategorized',
    location: r.zone && r.barangay ? `${r.zone} · ${r.barangay}` : (r.barangay || 'Map pin'),
    priority: r.suggested_priority || r.ai_priority || 'Low',
    aiConfidence: r.ai_confidence != null ? Math.round(r.ai_confidence * 100) : null,
    status: r.status === 'SUBMITTED' ? 'Pending Review' : 'Under Review',
    submitted: formatDate(r.submitted_at),
  })), [queue]);

  const mapIncidents = useMemo(() => incidents.map((i) => ({
    id: i.id,
    title: i.incident_number,
    category: i.category,
    priority: i.priority,
    barangay: i.barangay,
    status: friendlyStatus(i.status),
    lat: i.latitude,
    lng: i.longitude,
  })), [incidents]);

  const mapHotspots = useMemo(() => hotspots.map((h) => ({
    label: `${h.category ? `${h.category} cluster` : 'Multiple issues'} — ${h.barangay}`,
    sub: `${h.incident_count} incidents · 30 days`,
    lat: h.latitude,
    lng: h.longitude,
    radius: h.radius_meters,
  })), [hotspots]);

  const topCategory = useMemo(() => {
    const counts = new Map();
    for (const i of incidents) counts.set(i.category, (counts.get(i.category) || 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0] || null;
  }, [incidents]);

  return (
    <div className="gov-page">

      <PageHeader
        title="Barangay Operations Dashboard"
        subtitle="Community reports, incidents, field response, and AI-assisted decision support."
        actions={
          <>
            <button className="gov-btn gov-btn-secondary" disabled title="Available once the export service is wired">
              <Download size={14} /> Export Report
            </button>
            <Link to="/admin/reports" className="gov-btn gov-btn-primary">
              <ClipboardCheck size={14} /> Review Reports
            </Link>
          </>
        }
      />

      <SecurityStrip role={ORG.role} organization={ORG.barangay} />

      {/* KPI SECTION */}
      <div className="gov-stat-grid">
        <StatCard
          label="TRACKED REPORTS & INCIDENTS"
          value={queueLoading && mapLoading ? '…' : kpi.totalTracked}
          icon={Inbox}
          variant="info"
          note="Pending reports plus verified incidents"
        />
        <StatCard
          label="PENDING REVIEW"
          value={queueLoading ? '…' : kpi.pendingReview}
          icon={FileSearch}
          variant="attention"
          note={kpi.pendingReview > 0 ? 'Awaiting barangay verification' : 'Queue is clear'}
        />
        <StatCard
          label="VERIFIED INCIDENTS"
          value={mapLoading ? '…' : kpi.verifiedIncidents}
          icon={ShieldCheck}
          variant="good"
          note="Confirmed community problems"
        />
        <StatCard
          label="CRITICAL INCIDENTS"
          value={mapLoading ? '…' : kpi.criticalIncidents}
          icon={AlertTriangle}
          variant="critical"
          note={kpi.criticalIncidents > 0 ? 'Immediate safety risk — act first' : 'No critical incidents open'}
        />
      </div>

      {/* OPERATIONAL PRIORITIES */}
      <Card
        title="Operational Priorities"
        subtitle="Active verified incidents by response priority"
        icon={Activity}
      >
        <div className="gov-priorities">
          {priorities.map((p) => (
            <div key={p.key} className={`gov-priority ${p.key}`}>
              <div className="gov-priority-head">
                <span className="gov-priority-name">{p.label}</span>
                <span className="gov-priority-count gov-num">{p.count}</span>
              </div>
              <div className="gov-meter">
                <div className="gov-meter-fill" style={{ width: `${p.pct}%` }} />
              </div>
              <span className="gov-priority-sub">{p.sub}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* LOCATION INTELLIGENCE + AI BRIEF */}
      <div className="gov-grid-sidebar">
        <GisMap
          incidents={mapIncidents}
          zones={ZONES}
          hotspots={mapHotspots}
          subtitle="Current verified incident distribution and PostGIS-computed hotspots."
        />

        <div className="gov-stack">
          {topCategory ? (
            <AIInsightCard
              headline={`${topCategory[0].toUpperCase()} LEADS THIS WEEK`}
              zone={`${topCategory[1]} verified incident${topCategory[1] === 1 ? '' : 's'} on the board`}
              confidence={undefined}
              summary={`Verified incident data currently shows ${topCategory[0]} as the most common community problem, with ${topCategory[1]} incident${topCategory[1] === 1 ? '' : 's'} recorded. Counts update as barangay personnel verify new resident reports.`}
              recommendation="Review pending reports to keep this picture current."
              actions={
                <>
                  <Link to="/admin/reports" className="gov-btn gov-btn-primary gov-btn-sm">
                    Review Pending Reports
                  </Link>
                  <Link to="/admin/incidents" className="gov-btn gov-btn-secondary gov-btn-sm">
                    View Incidents
                  </Link>
                </>
              }
            />
          ) : (
            <AIInsightCard
              headline="NO VERIFIED INCIDENTS YET"
              zone="Awaiting first verification"
              confidence={undefined}
              summary="Once resident reports are verified by barangay personnel, they become incidents and appear here with AI-assisted pattern summaries."
              recommendation="Start by reviewing the pending report queue."
              actions={
                <Link to="/admin/reports" className="gov-btn gov-btn-primary gov-btn-sm">
                  Review Pending Reports
                </Link>
              }
            />
          )}

          {mapHotspots.length > 0 && (
            <Card title="Zone Alert" subtitle="Emerging hotspot" icon={AlertTriangle} className="gov-ai-card">
              <div className="gov-stack" style={{ gap: 10 }}>
                <div className="gov-row-between">
                  <span className="gov-id" style={{ color: 'var(--gov-red-deep)' }}>
                    {(mapHotspots[0].label || 'HOTSPOT').toUpperCase()}
                  </span>
                  <span className="gov-badge critical">{mapHotspots[0].sub}</span>
                </div>
                <p className="gov-text-secondary">
                  {mapHotspots[0].label} — clustered within a {Math.round(mapHotspots[0].radius)}&nbsp;m radius.
                </p>
                <Link to="/admin/live-map" className="gov-btn gov-btn-secondary gov-btn-sm" style={{ alignSelf: 'flex-start' }}>
                  Open Live Map <ArrowRight size={13} />
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* RECENT REPORT QUEUE */}
      <Card
        title="Recent Report Queue"
        subtitle="Latest citizen submissions awaiting action"
        icon={Inbox}
        flush
        actions={
          <Link to="/admin/reports" className="gov-btn gov-btn-secondary gov-btn-sm">
            View All <ArrowRight size={13} />
          </Link>
        }
      >
        <div className="gov-table-wrap">
          <table className="gov-table">
            <thead>
              <tr>
                <th>REPORT ID</th>
                <th>CATEGORY</th>
                <th>LOCATION</th>
                <th>PRIORITY</th>
                <th>AI ANALYSIS</th>
                <th>STATUS</th>
                <th>SUBMITTED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((rpt) => (
                <tr key={rpt.id}>
                  <td><span className="gov-id">{rpt.id}</span></td>
                  <td><CategoryChip category={rpt.category} swatch={CATEGORY_COLORS[rpt.category]} /></td>
                  <td><span className="gov-cell-main">{rpt.location}</span></td>
                  <td><PriorityBadge priority={rpt.priority} /></td>
                  <td>
                    {rpt.aiConfidence == null
                      ? <span className="gov-meta">—</span>
                      : <span className="gov-num gov-text-secondary">{rpt.aiConfidence}%</span>}
                  </td>
                  <td><StatusBadge status={rpt.status} /></td>
                  <td><span className="gov-meta gov-num">{rpt.submitted}</span></td>
                  <td>
                    <div className="gov-cell-actions">
                      <Link to={`/admin/reports/${rpt.uuid}/review`} className="gov-row-action">View</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {recentReports.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '22px 16px', textAlign: 'center' }}>
                    <span className="gov-text-secondary">
                      {queueLoading ? 'Loading the review queue…' : 'The review queue is empty — no reports awaiting action.'}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
