'use client';

import React, { useEffect, useState } from 'react';
import { Link } from '@/lib/router-shim';
import { Cpu, Copy, TrendingUp, AlertTriangle, ArrowRight, Target } from 'lucide-react';
import {
  PageHeader, Card, StatCard, AIInsightCard, AIDisclaimer, SecurityStrip,
} from '@/components/gov';
import { ORG } from '@/lib/data/adminData';

const DUPLICATE_MATCHES = [
  { pair: ['RPT-2026-001284', 'RPT-2026-001281'], confidence: 94.2 },
  { pair: ['RPT-2026-001284', 'RPT-2026-001279'], confidence: 88.5 },
  { pair: ['RPT-2026-001275', 'RPT-2026-001270'], confidence: 71.3 },
];

export default function BarangayAiIntel() {
  // Live accuracy: how often the AI's suggested priority matched the
  // reviewer's final call (from /api/ai/accuracy). The rest of this
  // page's overview numbers are still placeholder data.
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    fetch('/api/ai/accuracy')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setAccuracy(data); })
      .catch(() => {});
  }, []);

  // Prefer this month; fall back to all-time until the month has data.
  const period = accuracy
    ? (accuracy.month.total ? accuracy.month : accuracy.allTime.total ? accuracy.allTime : null)
    : null;

  return (
    <div className="gov-page">

      <PageHeader
        title="AI Intelligence"
        subtitle="Pattern detection, duplicate analysis, and decision-support output for authorized personnel."
        actions={<span className="gov-badge teal"><Cpu size={12} /> Vision v4.2</span>}
      />

      <SecurityStrip role={ORG.role} organization={ORG.barangay} />

      {/* AI OVERVIEW */}
      <div className="gov-stat-grid">
        <StatCard
          label="AI PRIORITY ACCURACY"
          value={period ? `${period.rate}%` : '—'}
          icon={Target}
          variant="info"
          note={period
            ? `AI suggestion vs reviewer's final call · ${period.total} verified report${period.total === 1 ? '' : 's'}`
            : 'no verified reports to compare yet'}
        />
        <StatCard label="POTENTIAL DUPLICATES" value="73" icon={Copy} variant="attention" note="clustered within 30 m radius" />
        <StatCard label="HIGH-RISK HAZARDS" value="49" icon={AlertTriangle} variant="critical" note="sub-24 hr target action" />
        <StatCard label="EMERGING HOTSPOTS" value="8" icon={TrendingUp} variant="neutral" note="across barangay zones" />
      </div>

      <div className="gov-grid-2">

        {/* PRIMARY PATTERN BRIEF */}
        <AIInsightCard
          headline="FLOODING TREND DETECTED"
          zone="Zone 3 · 94% model confidence"
          confidence={94}
          summary="Flooding reports in Zone 3 (Riverside Road) increased 42% over the last 48 hours following heavy monsoon downpours. Drainage-related reports cluster along a single culvert line."
          recommendation="Inspect drainage infrastructure along Riverside Road and deploy high-capacity pumps to prevent secondary street inundation."
          actions={
            <>
              <Link to="/admin/live-map" className="gov-btn gov-btn-primary gov-btn-sm">Review Analysis</Link>
              <Link to="/admin/incidents" className="gov-btn gov-btn-secondary gov-btn-sm">View Related Incidents</Link>
            </>
          }
        />

        {/* DUPLICATE DETECTION ENGINE */}
        <Card
          title="Duplicate Detection Engine"
          subtitle="Cross-referenced image features, timestamps, and GPS proximity"
          icon={Copy}
          actions={<span className="gov-badge warning">{DUPLICATE_MATCHES.length} potential matches</span>}
        >
          <div className="gov-stack" style={{ gap: 10 }}>
            {DUPLICATE_MATCHES.map((m) => (
              <div key={m.pair.join('-')} className="gov-priority" style={{ gap: 7 }}>
                <div className="gov-row-between">
                  <span className="gov-id">{m.pair[0]} & {m.pair[1]}</span>
                  <span className="gov-ai-confidence">
                    <span className="gov-meter"><span className="gov-meter-fill" style={{ width: `${m.confidence}%`, background: 'var(--gov-teal)' }} /></span>
                    {m.confidence}%
                  </span>
                </div>
                <div className="gov-row-between">
                  <span className="gov-meta">Match confidence — image + GPS + time</span>
                  <button className="gov-btn gov-btn-secondary gov-btn-sm">Review Match</button>
                </div>
              </div>
            ))}

            <AIDisclaimer compact />

            <button className="gov-btn gov-btn-secondary" style={{ alignSelf: 'flex-start' }}>
              Review All Duplicate Matches <ArrowRight size={13} />
            </button>
          </div>
        </Card>

      </div>

    </div>
  );
}
