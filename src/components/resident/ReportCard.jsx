import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, CalendarDays, Clock, ChevronRight } from 'lucide-react';
import ResidentStatusBadge from './ResidentStatusBadge';

/**
 * ReportCard — a resident's own report, shown in simple citizen language:
 * what it is, where, when, current status, and what happens next.
 *
 * Props:
 *   report — report object from residentData.MY_REPORTS
 */
export default function ReportCard({ report }) {
  return (
    <article className="res-report res-fade">
      <div className="res-report-top">
        <span className="res-report-ref">{report.id}</span>
        <ResidentStatusBadge status={report.status} />
      </div>

      <h3 className="res-report-title">
        {report.category} — {report.title}
      </h3>

      <div className="res-report-meta">
        <span>
          <MapPin size={14} aria-hidden="true" />
          {report.location}
        </span>
        <span>
          <CalendarDays size={14} aria-hidden="true" />
          Submitted: {report.dateSubmitted}
        </span>
      </div>

      <p className="res-report-update">{report.update}</p>

      <div className="res-report-foot">
        <span className="res-report-last">
          <Clock size={13} aria-hidden="true" style={{ verticalAlign: -2, marginRight: 4 }} />
          Last updated: {report.lastUpdated}
        </span>
        <Link
          to={`/resident/my-reports?ref=${report.id}`}
          className="res-btn res-btn-secondary res-btn-sm"
        >
          View Report <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
