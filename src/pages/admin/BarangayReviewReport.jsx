import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Cpu, CheckCircle2, XCircle, HelpCircle, MapPin, CalendarDays,
  User, Camera, Image as ImageIcon,
} from 'lucide-react';
import {
  PageHeader, Card, KVGrid, CategoryChip, PriorityBadge, StatusBadge,
  AIDisclaimer, CATEGORY_COLORS,
} from '../../components/gov';
import { REPORTS } from '../../data/adminData';

export default function BarangayReviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const report = REPORTS.find((r) => r.id === id) || REPORTS[0];
  const [decision, setDecision] = useState(null);

  const handleDecision = (action) => {
    setDecision(action);
    setTimeout(() => navigate('/admin/incidents'), 1400);
  };

  return (
    <div className="gov-page">

      <PageHeader
        title="Report Review"
        subtitle={`Official verification of citizen report ${report.id}`}
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
          subtitle={`Submitted ${report.submitted} · ${report.submittedTime}`}
          icon={User}
          actions={<CategoryChip category={report.category} swatch={CATEGORY_COLORS[report.category]} />}
        >
          <div className="gov-stack" style={{ gap: 16 }}>
            <div>
              <div className="gov-section-label" style={{ marginBottom: 6 }}>DESCRIPTION</div>
              <p className="gov-desc">{report.description}</p>
            </div>

            <div>
              <div className="gov-section-label" style={{ marginBottom: 6 }}>EVIDENCE</div>
              {report.images.length > 0 ? (
                <div className="gov-evidence">
                  {report.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Citizen evidence ${idx + 1}`} />
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
                { label: 'LOCATION', value: <span className="gov-row" style={{ gap: 6 }}><MapPin size={13} /> {report.location}</span> },
                { label: 'BARANGAY', value: `${report.barangay}` },
                { label: 'SUBMITTED BY', value: report.reporter },
                { label: 'DATE SUBMITTED', value: <span className="gov-row" style={{ gap: 6 }}><CalendarDays size={13} /> {report.submitted}</span> },
                { label: 'PRIORITY', value: <PriorityBadge priority={report.priority} /> },
                { label: 'STATUS', value: <StatusBadge status={report.status} /> },
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
              <KVGrid
                items={[
                  { label: 'CATEGORY DETECTION', value: `${report.category} · ${report.aiConfidence}% confidence` },
                  { label: 'PRIORITY ASSESSMENT', value: `${report.severity} · ${Math.round(report.aiConfidence * 0.93)}% confidence` },
                  { label: 'DUPLICATE PROBABILITY', value: `${report.aiDuplicateRisk}% risk` },
                  { label: 'MODEL', value: 'Vision v4.2' },
                ]}
              />

              <div className="gov-ai-rec">
                <div className="gov-ai-rec-label">AI RECOMMENDATION</div>
                <p className="gov-ai-rec-text">“{report.aiRecommendation}”</p>
              </div>

              <AIDisclaimer compact />
            </div>
          </Card>

          {/* OFFICIAL DECISION */}
          <Card title="Official Decision" subtitle="Logged to the immutable audit trail">
            {decision ? (
              <div className="gov-empty" style={{ padding: '28px 16px' }}>
                <CheckCircle2 size={34} color="var(--gov-green-deep)" strokeWidth={1.6} />
                <div className="gov-empty-title">Decision logged: {decision}</div>
                <div className="gov-empty-sub">Transferring to Incident Management…</div>
              </div>
            ) : (
              <div className="gov-stack" style={{ gap: 9 }}>
                <p className="gov-text-secondary">
                  Review the citizen evidence and AI analysis, then render the official
                  decision as authorized personnel:
                </p>
                <button className="gov-btn gov-btn-success" onClick={() => handleDecision('Verified & Created Incident')}>
                  <CheckCircle2 size={15} /> Verify Report
                </button>
                <button className="gov-btn gov-btn-secondary" onClick={() => handleDecision('Requested More Information')}>
                  <HelpCircle size={15} /> Request More Information
                </button>
                <button className="gov-btn gov-btn-danger" onClick={() => handleDecision('Rejected Report')}>
                  <XCircle size={15} /> Reject Report
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
