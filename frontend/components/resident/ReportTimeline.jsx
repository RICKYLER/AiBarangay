import React from 'react';
import { Check } from 'lucide-react';
import { REPORT_STAGES } from '@/lib/data/residentData';

/**
 * ReportTimeline — the six civic stages of a report, rendered as a
 * simple vertical progress tracker for the resident.
 *
 * Props:
 *   stage — current stage number (1–6)
 */
export default function ReportTimeline({ stage }) {
  return (
    <ol className="res-timeline">
      {REPORT_STAGES.map((s) => {
        const state = s.n < stage ? 'done' : s.n === stage ? 'current' : '';
        return (
          <li key={s.n} className={`res-tl-item ${state}`.trim()}>
            <span className="res-tl-dot" aria-hidden="true">
              {s.n < stage && <Check size={13} />}
            </span>
            <span className="res-tl-body">
              <span className="res-tl-label">{s.label}</span>
              <span className="res-tl-hint">{s.hint}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}