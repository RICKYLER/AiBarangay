import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Compass, FileSearch, Bell, CheckCircle2, ChevronRight } from 'lucide-react';
import { RESIDENT, MY_REPORTS, reportSummary } from '../../data/residentData';
import { ReportCard } from '../../components/resident';

/**
 * ResidentDashboard — the welcoming home of the citizen portal.
 * Simple personal summary, clear next steps, no analytics.
 */
export default function ResidentDashboard() {
  const summary = reportSummary(MY_REPORTS);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const recent = [...MY_REPORTS]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 3);

  const journey = [
    { icon: PlusCircle, label: 'Report a Problem', hint: 'Tell us what you saw' },
    { icon: FileSearch, label: 'Track My Report', hint: 'Follow its progress' },
    { icon: Bell, label: 'Receive Updates', hint: 'Get status changes' },
    { icon: CheckCircle2, label: 'See Resolution', hint: 'Know it was fixed' },
  ];

  return (
    <div className="res-fade">
      {/* ---------- Greeting ---------- */}
      <section className="res-greet" aria-labelledby="res-greet-title">
        <div>
          <span className="res-greet-eyebrow">RESIDENT DASHBOARD</span>
          <h1 id="res-greet-title" className="res-greet-title">
            {greeting}, {RESIDENT.firstName}
          </h1>
          <p className="res-greet-sub">
            Help improve your community by reporting problems and tracking
            their progress.
          </p>
        </div>
        <div className="res-greet-actions">
          <Link to="/resident/report" className="res-btn res-btn-primary res-btn-lg">
            <PlusCircle size={17} aria-hidden="true" /> Report a Problem
          </Link>
          <Link to="/resident/my-reports" className="res-btn res-btn-secondary res-btn-lg">
            <Compass size={16} aria-hidden="true" /> Track My Reports
          </Link>
        </div>
      </section>

      {/* ---------- My report summary ---------- */}
      <section className="res-section" aria-labelledby="res-summary-title">
        <div className="res-section-head">
          <div>
            <span className="res-section-eyebrow">MY REPORTS</span>
            <h2 id="res-summary-title" className="res-section-title">
              My report summary
            </h2>
          </div>
          <span className="res-demo-note">Sample / Demonstration Data</span>
        </div>

        <div className="res-stats">
          <div className="res-stat">
            <span className="res-stat-label">My Reports</span>
            <span className="res-stat-value">{summary.total}</span>
            <span className="res-stat-hint">All reports you submitted</span>
          </div>
          <div className="res-stat warning">
            <span className="res-stat-label">Under Review</span>
            <span className="res-stat-value">{summary.underReview}</span>
            <span className="res-stat-hint">Being checked by personnel</span>
          </div>
          <div className="res-stat accent">
            <span className="res-stat-label">In Progress</span>
            <span className="res-stat-value">{summary.inProgress}</span>
            <span className="res-stat-hint">Work is underway</span>
          </div>
          <div className="res-stat success">
            <span className="res-stat-label">Resolved</span>
            <span className="res-stat-value">{summary.resolved}</span>
            <span className="res-stat-hint">Problems fixed</span>
          </div>
        </div>
      </section>

      {/* ---------- How the service works ---------- */}
      <section className="res-section" aria-labelledby="res-journey-title">
        <div className="res-section-head">
          <div>
            <span className="res-section-eyebrow">HOW IT WORKS</span>
            <h2 id="res-journey-title" className="res-section-title">
              From report to resolution
            </h2>
          </div>
        </div>
        <div className="res-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {journey.map((j, i) => (
            <div key={j.label} className="res-stat" style={{ gap: 10 }}>
              <span className="res-cat-icon" aria-hidden="true">
                <j.icon size={20} />
              </span>
              <span className="res-stat-label">
                Step {i + 1} · {j.label}
              </span>
              <span className="res-stat-hint">{j.hint}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Recent reports ---------- */}
      <section className="res-section" aria-labelledby="res-recent-title">
        <div className="res-section-head">
          <div>
            <span className="res-section-eyebrow">RECENT REPORTS</span>
            <h2 id="res-recent-title" className="res-section-title">
              Your latest reports
            </h2>
          </div>
          <Link to="/resident/my-reports" className="res-btn res-btn-ghost res-btn-sm">
            View all <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="res-reports">
          {recent.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
