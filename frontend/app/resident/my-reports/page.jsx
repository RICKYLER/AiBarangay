'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from '@/lib/router-shim';
import { Search, MapPin, CalendarDays, ImagePlus, ArrowLeft } from 'lucide-react';
import { useMyReports } from '@/hooks/useMyReports';
import { fetchReport } from '@/lib/api/reports';
import { toCardReport, friendlyStatus, STATUS_STAGE } from '@/lib/reportAdapter';
import { ReportCard, ReportTimeline, ResidentStatusBadge } from '@/components/resident';

/**
 * ResidentMyReports — every report the resident has submitted, with a
 * simple status filter, search, and a full detail view showing the
 * civic timeline and update history. Data comes from the API
 * (RLS-enforced: only the resident's own reports are returned).
 */

/* Chip order (REPORT_STAGES order + terminal outcomes). */
const STATUS_FLOW = [
  'Submitted', 'Under Review', 'Verified', 'Assigned', 'Field Response',
  'Resolved', 'Closed', 'Rejected', 'Duplicate',
];

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

function timeAgo(iso) {
  if (!iso) return '—';
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} minute${s < 7200 ? '' : 's'} ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hour${s < 7200 ? '' : 's'} ago`;
  return `${Math.floor(s / 86400)} day${s < 172800 ? '' : 's'} ago`;
}

function ResidentMyReportsInner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const { reports, loading, error } = useMyReports();

  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState(null);

  const ref = searchParams.get('ref');
  const selected =
    (reports || []).find((r) => r.report_number === ref) || null;

  /* Load the full detail (timeline + media) when a report is opened. */
  useEffect(() => {
    setDetail(null);
    setDetailError(null);
    if (!selected) return undefined;
    let cancelled = false;
    fetchReport(selected.id)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch((err) => { if (!cancelled) setDetailError(err.message); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, reports]);

  const closeDetail = () => setSearchParams({});

  const cards = useMemo(() => (reports || []).map(toCardReport), [reports]);

  const availableStatuses = useMemo(() => {
    const present = new Set(cards.map((c) => c.status));
    return STATUS_FLOW.filter((s) => present.has(s));
  }, [cards]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((r) => {
      const matchStatus = filter === 'All' || r.status === filter;
      const matchQuery =
        q === '' ||
        r.id.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [cards, filter, query]);

  const countFor = (status) =>
    status === 'All' ? cards.length : cards.filter((r) => r.status === status).length;

  /* ------------------------- DETAIL VIEW ------------------------- */
  if (ref) {
    if (!selected) {
      return (
        <div className="res-detail res-fade">
          <div className="res-detail-head">
            <button type="button" className="res-btn res-btn-ghost res-btn-sm" onClick={closeDetail}>
              <ArrowLeft size={15} aria-hidden="true" /> Back to My Reports
            </button>
          </div>
          <div className="res-empty">
            <p className="res-empty-title">Report not found</p>
            <p className="res-empty-text">
              {loading ? 'Loading your reports…' : `No report with reference ${ref}.`}
            </p>
          </div>
        </div>
      );
    }

    const card = toCardReport(selected);
    const photos = detail ? detail.media.length : card.photos;
    const updates = (detail?.timeline || []).map((t) => ({
      date: formatDateTime(t.at),
      text: t.text,
    }));

    return (
      <div className="res-detail res-fade">
        <div className="res-detail-head">
          <button type="button" className="res-btn res-btn-ghost res-btn-sm" onClick={closeDetail}>
            <ArrowLeft size={15} aria-hidden="true" /> Back to My Reports
          </button>
        </div>

        <div className="res-detail-body">
          <div className="res-report-top" style={{ marginBottom: 8 }}>
            <span className="res-report-ref">{card.id}</span>
            <ResidentStatusBadge status={card.status} />
          </div>

          <h2 className="res-detail-title">
            {card.category} — {card.title}
          </h2>

          <div className="res-report-meta">
            <span><MapPin size={14} aria-hidden="true" /> {card.location}</span>
            <span><CalendarDays size={14} aria-hidden="true" /> Submitted {card.dateSubmitted}</span>
            <span><ImagePlus size={14} aria-hidden="true" /> {photos} photo{photos === 1 ? '' : 's'}</span>
          </div>

          <p className="res-detail-desc">{card.description}</p>

          {card.incidentNumber && (
            <div className="res-note res-note-teal" style={{ marginTop: 0, marginBottom: 18 }}>
              <MapPin size={16} aria-hidden="true" />
              <span>Verified and tracked as incident <strong>{card.incidentNumber}</strong>.</span>
            </div>
          )}

          <h3 className="res-section-title" style={{ fontSize: 16, marginBottom: 14 }}>
            Report progress
          </h3>
          <ReportTimeline stage={card.stage} />

          <h3 className="res-section-title" style={{ fontSize: 16, marginBottom: 12 }}>
            Updates on your report
          </h3>
          <div className="res-updates">
            {detailError && (
              <div className="res-update-item">
                <span className="res-update-date">—</span>
                <span className="res-update-text">Could not load updates: {detailError}</span>
              </div>
            )}
            {!detailError && !detail && <p className="res-empty-text">Loading updates…</p>}
            {!detailError && detail && updates.length === 0 && (
              <p className="res-empty-text">
                No updates yet. You will be notified whenever the status changes.
              </p>
            )}
            {updates.map((u, i) => (
              <div key={i} className="res-update-item">
                <span className="res-update-date">{u.date}</span>
                <span className="res-update-text">{u.text}</span>
              </div>
            ))}
          </div>

          <div className="res-note res-note-teal" style={{ marginTop: 20 }}>
            <CalendarDays size={16} aria-hidden="true" />
            <span>
              Last updated: {card.lastUpdated}. You will receive a
              notification whenever the status of this report changes.
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------- LIST VIEW --------------------------- */

  if (loading) {
    return (
      <div className="res-fade">
        <div className="res-empty" aria-live="polite">
          <p className="res-empty-title">Loading your reports…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="res-fade">
        <div className="res-empty">
          <p className="res-empty-title">Could not load your reports</p>
          <p className="res-empty-text">{error}</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="res-fade">
        <div className="res-empty">
          <span className="res-empty-icon"><Search size={22} /></span>
          <p className="res-empty-title">No reports yet</p>
          <p className="res-empty-text">
            You haven&apos;t submitted any reports. If you spot a problem in
            your barangay — a pothole, a broken streetlight, flooding — let
            your barangay know.
          </p>
          <Link to="/resident/report" className="res-btn res-btn-primary res-btn-sm">
            Report a Problem
          </Link>
        </div>
      </div>
    );
  }

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
        <span className="res-demo-note">
          {cards.length} report{cards.length === 1 ? '' : 's'} submitted
        </span>
      </div>

      <div className="res-chips" role="group" aria-label="Filter reports by status" style={{ marginBottom: 18 }}>
        {['All', ...availableStatuses].map((s) => (
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
              Try a different search or filter. If you haven&apos;t reported a
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

/* useSearchParams() requires a Suspense boundary during prerender. */
export default function ResidentMyReports() {
  return (
    <Suspense fallback={<div className="res-fade"><p className="res-empty-text">Loading…</p></div>}>
      <ResidentMyReportsInner />
    </Suspense>
  );
}
