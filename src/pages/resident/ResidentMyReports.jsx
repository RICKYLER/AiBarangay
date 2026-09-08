import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, CalendarDays, ImagePlus, ArrowLeft } from 'lucide-react';
import { MY_REPORTS, STATUS_ORDER } from '../../data/residentData';
import { ReportCard, ReportTimeline, ResidentStatusBadge } from '../../components/resident';

/**
 * ResidentMyReports — every report the resident has submitted, with a
 * simple status filter, search, and a full detail view showing the
 * civic timeline and update history.
 */
export default function ResidentMyReports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const ref = searchParams.get('ref');
  const selected = MY_REPORTS.find((r) => r.id === ref) || null;

  const closeDetail = () => setSearchParams({});

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MY_REPORTS.filter((r) => {
      const matchStatus = filter === 'All' || r.status === filter;
      const matchQuery =
        q === '' ||
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [filter, query]);

  const countFor = (status) =>
    status === 'All' ? MY_REPORTS.length : MY_REPORTS.filter((r) => r.status === status).length;

  /* ------------------------- DETAIL VIEW ------------------------- */
  if (selected) {
    return (
      <div className="res-detail res-fade">
        <div className="res-detail-head">
          <button type="button" className="res-btn res-btn-ghost res-btn-sm" onClick={closeDetail}>
            <ArrowLeft size={15} aria-hidden="true" /> Back to My Reports
          </button>
        </div>

        <div className="res-detail-body">
          <div className="res-report-top" style={{ marginBottom: 8 }}>
            <span className="res-report-ref">{selected.id}</span>
            <ResidentStatusBadge status={selected.status} />
          </div>

          <h2 className="res-detail-title">
            {selected.category} — {selected.title}
          </h2>

          <div className="res-report-meta">
            <span><MapPin size={14} aria-hidden="true" /> {selected.location}</span>
            <span><CalendarDays size={14} aria-hidden="true" /> Submitted {selected.dateSubmitted}</span>
            <span><ImagePlus size={14} aria-hidden="true" /> {selected.photos} photo{selected.photos === 1 ? '' : 's'}</span>
          </div>

          <p className="res-detail-desc">{selected.description}</p>

          <h3 className="res-section-title" style={{ fontSize: 16, marginBottom: 14 }}>
            Report progress
          </h3>
          <ReportTimeline stage={selected.stage} />

          <h3 className="res-section-title" style={{ fontSize: 16, marginBottom: 12 }}>
            Updates on your report
          </h3>
          <div className="res-updates">
            {selected.updates.map((u, i) => (
              <div key={i} className="res-update-item">
                <span className="res-update-date">{u.date}</span>
                <span className="res-update-text">{u.text}</span>
              </div>
            ))}
          </div>

          <div className="res-note res-note-teal" style={{ marginTop: 20 }}>
            <CalendarDays size={16} aria-hidden="true" />
            <span>
              Last updated: {selected.lastUpdated}. You will receive a
              notification whenever the status of this report changes.
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------- LIST VIEW --------------------------- */
  return (
    <div className="res-fade">
      <div className="res-reports-toolbar">
        <div className="res-search">
          <Search size={16} aria-hidden="true" />
          <label htmlFor="res-report-search" className="res-visually-hidden">Search reports</label>
          <input
            id="res-report-search"
            type="search"
            className="res-input"
            placeholder="Search by reference, category, or location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <span className="res-demo-note">Sample / Demonstration Data</span>
      </div>

      <div className="res-chips" role="group" aria-label="Filter reports by status" style={{ marginBottom: 18 }}>
        {['All', ...STATUS_ORDER].map((s) => (
          <button
            key={s}
            type="button"
            className={`res-chip ${filter === s ? 'on' : ''}`}
            aria-pressed={filter === s}
            onClick={() => setFilter(s)}
          >
            {s} <span className="res-chip-count">{countFor(s)}</span>
          </button>
        ))}
      </div>

      <div className="res-reports" aria-live="polite">
        {results.length > 0 ? (
          results.map((r) => <ReportCard key={r.id} report={r} />)
        ) : (
          <div className="res-empty">
            <span className="res-empty-icon"><Search size={22} /></span>
            <p className="res-empty-title">No reports found</p>
            <p className="res-empty-text">
              Try a different search or filter. If you haven't reported a
              problem yet, you can report one now.
            </p>
            <Link to="/resident/report" className="res-btn res-btn-primary res-btn-sm">
              Report a Problem
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
