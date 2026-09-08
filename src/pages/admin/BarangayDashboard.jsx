import React from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox, FileSearch, ShieldCheck, AlertTriangle, Download, ClipboardCheck,
  ArrowRight, Activity,
} from 'lucide-react';
import {
  StatCard, PageHeader, Card, SecurityStrip, PriorityBadge, StatusBadge,
  CategoryChip, GisMap, AIInsightCard, CATEGORY_COLORS,
} from '../../components/gov';
import {
  ORG, DASHBOARD_KPI, PRIORITIES, REPORTS, INCIDENTS, ZONES, HOTSPOTS,
} from '../../data/adminData';

export default function BarangayDashboard() {
  const recentReports = REPORTS.slice(0, 5);

  return (
    <div className="gov-page">

      <PageHeader
        title="Barangay Operations Dashboard"
        subtitle="Community reports, incidents, field response, and AI-assisted decision support."
        actions={
          <>
            <button className="gov-btn gov-btn-secondary">
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
          label="TOTAL REPORTS"
          value={DASHBOARD_KPI.totalReports}
          icon={Inbox}
          variant="info"
          trend={DASHBOARD_KPI.totalReportsTrend}
          note={DASHBOARD_KPI.totalReportsNote}
        />
        <StatCard
          label="PENDING REVIEW"
          value={DASHBOARD_KPI.pendingReview}
          icon={FileSearch}
          variant="attention"
          note={DASHBOARD_KPI.pendingReviewNote}
        />
        <StatCard
          label="VERIFIED INCIDENTS"
          value={DASHBOARD_KPI.verifiedIncidents}
          icon={ShieldCheck}
          variant="good"
          trend={DASHBOARD_KPI.verifiedIncidentsTrend}
          note={DASHBOARD_KPI.verifiedIncidentsNote}
        />
        <StatCard
          label="CRITICAL INCIDENTS"
          value={DASHBOARD_KPI.criticalIncidents}
          icon={AlertTriangle}
          variant="critical"
          trend={DASHBOARD_KPI.criticalIncidentsTrend}
          note={DASHBOARD_KPI.criticalIncidentsNote}
        />
      </div>

      {/* OPERATIONAL PRIORITIES */}
      <Card
        title="Today's Operational Priorities"
        subtitle="Active workload by response priority"
        icon={Activity}
        actions={<span className="gov-meta">Updated 09:42 · auto-refresh 5 min</span>}
      >
        <div className="gov-priorities">
          {PRIORITIES.map((p) => (
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
          incidents={INCIDENTS}
          zones={ZONES}
          hotspots={HOTSPOTS}
          subtitle="Current incident distribution and emerging problem hotspots."
        />

        <div className="gov-stack">
          <AIInsightCard
            headline="FLOODING TREND DETECTED"
            zone="Zone 3 · 94% model confidence"
            confidence={94}
            summary="An increase in flooding-related reports has been detected following recent rainfall. Flooding reports in Zone 3 increased 42% over the last 48 hours, concentrated along Riverside Road."
            recommendation="Consider prioritizing drainage inspection along Riverside Road."
            actions={
              <>
                <Link to="/admin/reports/review/RPT-2026-001284" className="gov-btn gov-btn-primary gov-btn-sm">
                  Review Analysis
                </Link>
                <Link to="/admin/incidents" className="gov-btn gov-btn-secondary gov-btn-sm">
                  View Related Incidents
                </Link>
              </>
            }
          />

          <Card title="Zone Alert" subtitle="Emerging hotspot" icon={AlertTriangle} className="gov-ai-card">
            <div className="gov-stack" style={{ gap: 10 }}>
              <div className="gov-row-between">
                <span className="gov-id" style={{ color: 'var(--gov-red-deep)' }}>FLOODING HOTSPOT</span>
                <span className="gov-badge critical">12 incidents nearby</span>
              </div>
              <p className="gov-text-secondary">
                Zone 3 — Riverside Road. Cluster of drainage blockage and flood reports
                detected within a 260&nbsp;m radius.
              </p>
              <Link to="/admin/live-map" className="gov-btn gov-btn-secondary gov-btn-sm" style={{ alignSelf: 'flex-start' }}>
                Open Live Map <ArrowRight size={13} />
              </Link>
            </div>
          </Card>
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
                  <td><span className="gov-num gov-text-secondary">{rpt.aiConfidence}%</span></td>
                  <td><StatusBadge status={rpt.status} /></td>
                  <td><span className="gov-meta gov-num">{rpt.submitted}</span></td>
                  <td>
                    <div className="gov-cell-actions">
                      <Link to={`/admin/reports/review/${rpt.id}`} className="gov-row-action">View</Link>
                      <button className="gov-row-action">Assign</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
