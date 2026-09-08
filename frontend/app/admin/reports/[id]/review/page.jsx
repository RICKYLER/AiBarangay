'use client';

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from '@/lib/router-shim';
import {
  ArrowLeft, Cpu, CheckCircle2, XCircle, HelpCircle, MapPin, CalendarDays,
  User, Camera, Image as ImageIcon, Copy,
} from 'lucide-react';
import {
  PageHeader, Card, KVGrid, CategoryChip, PriorityBadge, StatusBadge,
  AIDisclaimer, CATEGORY_COLORS,
} from '@/components/gov';
import { fetchReviewDetail, verifyReport, rejectReport } from '@/lib/api/barangay';

const STATUS_LABEL = {
  SUBMITTED: 'Pending Review',
  UNDER_REVIEW: 'Under Review',
  VERIFIED: 'Verified',
  ASSIGNED: 'Assigned',
  FIELD_RESPONSE: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Resolved',
  REJECTED: 'Rejected',
  DUPLICATE: 'Duplicate',
};

function friendlyStatus(s) {
  return STATUS_LABEL[s] || (s ? s.replaceAll('_', ' ') : 'Pending Review');
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function BarangayReviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [decision, setDecision] = useState(null);
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchReviewDetail(id)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [id]);

  const handleVerify = async () => {
    setWorking(true);
    setActionError(null);
    try {
      await verifyReport(id);
      setDecision('Verified & Created Incident');
      setTimeout(() => navigate('/admin/reports'), 1600);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const handleReject = async () => {
    setWorking(true);
    setActionError(null);
    try {
      await rejectReport(id);
      setDecision('Rejected Report');
      setTimeout(() => navigate('/admin/reports'), 1600);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const handleMoreInfo = () => {
    setDecision('Requested More Information');
    setTimeout(() => navigate('/admin/reports'), 1600);
  };

  if (error) {
    return (
      <div className="gov-page">
        <PageHeader
          title="Report Review"
          subtitle="Official verification of a citizen report"
          badge={
            <Link to="/admin/reports" className="gov-btn gov-btn-secondary gov-btn-sm">
              <ArrowLeft size={13} /> Back to Reports
            </Link>
          }
        />
        <Card title="Report not found">
          <p className="gov-text-secondary">{error}</p>
        </Card>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="gov-page">
        <PageHeader
          title="Report Review"
          subtitle="Loading citizen report…"
          badge={
            <Link to="/admin/reports" className="gov-btn gov-btn-secondary gov-btn-sm">
              <ArrowLeft size={13} /> Back to Reports
            </Link>
          }
        />
      </div>
    );
  }

  const { report, media, analyses, duplicates, suggestedPriority, residentName, barangayName } = detail;
  const analysis = analyses[0] || null;
  const aiConfidence = analysis?.confidence_score != null
    ? Math.round(analysis.confidence_score * 100)
    : null;
  const category = report.category || 'Uncategorized';
  const status = friendlyStatus(report.status);
  const location = report.address
    || (report.latitude != null
      ? `${report.latitude.toFixed(5)}, ${report.longitude?.toFixed(5)}`
      : 'Map pin');
  const alreadyDecided = !['SUBMITTED', 'UNDER_REVIEW'].includes(report.status || '');

  return (
    <div className="gov-page">

      <PageHeader
        title="Report Review"
        subtitle={`Official verification of citizen report ${report.report_number}`}
        badge={
          <Link to="/admin/reports" className="gov-btn gov-btn-secondary gov-btn-sm">
            <ArrowLeft size={13} /> Back to Reports
          </Link>
        }
      />

      <div className="gov-grid-sidebar">

        {/* CITIZEN REPORT DETAILS */}
        <Card
          title="Citizen Report"
          subtitle={`Submitted ${formatDateTime(report.submitted_at)}`}
          icon={User}
          actions={<CategoryChip category={category} swatch={CATEGORY_COLORS[category]} />}
        >
          <div className="gov-stack" style={{ gap: 16 }}>
            <div>
              <div className="gov-section-label" style={{ marginBottom: 6 }}>REPORT</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{report.title}</h3>
              <p className="gov-desc">{report.description}</p>
            </div>

            <div>
              <div className="gov-section-label" style={{ marginBottom: 6 }}>EVIDENCE</div>
              {media.length > 0 ? (
                <div className="gov-evidence">
                  {media.map((m) => (
                    <a key={m.id} href={m.file_url} target="_blank" rel="noreferrer" aria-label="View full evidence photo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.file_url} alt="Citizen evidence" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="gov-empty" style={{ padding: '20px 16px' }}>
                  <ImageIcon size={22} strokeWidth={1.5} />
                  <div className="gov-empty-sub">No photo evidence attached to this report.</div>
                </div>
              )}
            </div>

            <KVGrid
              items={[
                { label: 'LOCATION', value: <span className="gov-row" style={{ gap: 6 }}><MapPin size={13} /> {location}</span> },
                { label: 'BARANGAY', value: barangayName || 'Auto-detected' },
                { label: 'SUBMITTED BY', value: residentName || 'Anonymous resident' },
                { label: 'DATE SUBMITTED', value: <span className="gov-row" style={{ gap: 6 }}><CalendarDays size={13} /> {formatDateTime(report.submitted_at)}</span> },
                { label: 'PRIORITY', value: <PriorityBadge priority={report.priority || suggestedPriority?.name || 'Low'} /> },
                { label: 'STATUS', value: <StatusBadge status={status} /> },
              ]}
            />
          </div>
        </Card>

        <div className="gov-stack">

          {/* AI ANALYSIS */}
          <Card
            title="AI Analysis"
            subtitle="Decision-support output — requires human verification"
            icon={Cpu}
            className="gov-ai-card"
          >
            <div className="gov-stack" style={{ gap: 10 }}>
              {analysis ? (
                <>
                  <KVGrid
                    items={[
                      { label: 'CATEGORY DETECTION', value: `${analysis.category_prediction_name || category}${aiConfidence != null ? ` · ${aiConfidence}% confidence` : ''}` },
                      { label: 'PRIORITY ASSESSMENT', value: analysis.priority_prediction_name || suggestedPriority?.name || '—' },
                      { label: 'PRIORITY (RULE ENGINE)', value: suggestedPriority ? <PriorityBadge priority={suggestedPriority.name} /> : '—' },
                      { label: 'DUPLICATE CANDIDATES', value: duplicates.length > 0 ? `${duplicates.length} nearby` : 'None flagged' },
                      { label: 'MODEL', value: `${analysis.model_name}${analysis.model_version ? ` ${analysis.model_version}` : ''}` },
                    ]}
                  />

                  {analysis.detected_keywords?.length > 0 && (
                    <div>
                      <div className="gov-section-label" style={{ marginBottom: 6 }}>DETECTED SIGNALS</div>
                      <div className="gov-row" style={{ gap: 6, flexWrap: 'wrap' }}>
                        {analysis.detected_keywords.map((k) => (
                          <span key={k} className="gov-chip"><Copy size={11} style={{ marginRight: 4, verticalAlign: -1 }} />{k}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {duplicates.length > 0 && (
                    <div>
                      <div className="gov-section-label" style={{ marginBottom: 6 }}>NEARBY REPORTS (POSSIBLE DUPLICATES)</div>
                      <div className="gov-stack" style={{ gap: 4 }}>
                        {duplicates.map((d) => (
                          <div key={d.id} className="gov-row" style={{ gap: 8, fontSize: 12.5 }}>
                            <span className="gov-id">{d.matched_report_number}</span>
                            <span className="gov-text-secondary" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {d.matched_report_title}
                            </span>
                            <span className="gov-badge warning">{Math.round(d.similarity_score * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="gov-ai-rec">
                    <div className="gov-ai-rec-label">AI RECOMMENDATION</div>
                    <p className="gov-ai-rec-text">“{analysis.summary}”</p>
                  </div>
                </>
              ) : (
                <div className="gov-empty" style={{ padding: '20px 16px' }}>
                  <Cpu size={22} strokeWidth={1.5} />
                  <div className="gov-empty-sub">No AI analysis recorded for this report.</div>
                </div>
              )}

              <AIDisclaimer compact />
            </div>
          </Card>

          {/* OFFICIAL DECISION */}
          <Card title="Official Decision" subtitle="Logged to the immutable audit trail">
            {decision ? (
              <div className="gov-empty" style={{ padding: '28px 16px' }}>
                <CheckCircle2 size={34} color="var(--gov-green-deep)" strokeWidth={1.6} />
                <div className="gov-empty-title">Decision logged: {decision}</div>
                <div className="gov-empty-sub">Returning to the report queue…</div>
              </div>
            ) : alreadyDecided ? (
              <div className="gov-empty" style={{ padding: '28px 16px' }}>
                <CheckCircle2 size={34} color="var(--gov-teal)" strokeWidth={1.6} />
                <div className="gov-empty-title">This report is already {status}</div>
                <div className="gov-empty-sub">
                  {report.incident_number
                    ? `Tracked as incident ${report.incident_number}. Further actions happen in Incident Management.`
                    : 'No further review action is available.'}
                </div>
              </div>
            ) : (
              <div className="gov-stack" style={{ gap: 9 }}>
                <p className="gov-text-secondary">
                  Review the citizen evidence and AI analysis, then render the official
                  decision as authorized personnel:
                </p>
                {actionError && (
                  <p className="gov-badge critical" style={{ padding: '6px 10px', borderRadius: 6 }}>{actionError}</p>
                )}
                <button className="gov-btn gov-btn-success" onClick={handleVerify} disabled={working}>
                  <CheckCircle2 size={15} /> {working ? 'Recording…' : 'Verify Report'}
                </button>
                <button className="gov-btn gov-btn-secondary" onClick={handleMoreInfo} disabled={working}>
                  <HelpCircle size={15} /> Request More Information
                </button>
                <button className="gov-btn gov-btn-danger" onClick={handleReject} disabled={working}>
                  <XCircle size={15} /> {working ? 'Recording…' : 'Reject Report'}
                </button>
                <span className="gov-meta gov-row" style={{ gap: 6, marginTop: 4 }}>
                  <Camera size={12} /> All decisions are recorded in the audit log with your session identity.
                </span>
              </div>
            )}
          </Card>

        </div>
      </div>

    </div>
  );
}
