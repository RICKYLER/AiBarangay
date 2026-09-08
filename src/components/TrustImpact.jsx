import React from 'react';
import { BARANGAY_STATS } from '../data/mockProblems';
import { FileText, CheckCircle2, Building2, Clock, Award, ShieldCheck } from 'lucide-react';

export default function TrustImpact() {
  return (
    <section className="trust-impact-section">
      <div className="container">
        <div className="impact-grid glass-card">
          
          {/* Metric 1: Reports */}
          <div className="impact-metric-item">
            <div className="metric-icon-box box-emerald">
              <FileText size={26} />
            </div>
            <div className="metric-data">
              <div className="metric-value">{BARANGAY_STATS.totalReports.toLocaleString()}+</div>
              <div className="metric-label">Hazards Reported</div>
              <p className="metric-sub">Across 6 major urban categories</p>
            </div>
          </div>

          {/* Metric 2: Issues Resolved */}
          <div className="impact-metric-item">
            <div className="metric-icon-box box-azure">
              <CheckCircle2 size={26} />
            </div>
            <div className="metric-data">
              <div className="metric-value text-gradient-azure">{BARANGAY_STATS.resolutionRate}</div>
              <div className="metric-label">Resolution Success Rate</div>
              <p className="metric-sub">{BARANGAY_STATS.resolvedCount} verified fixes posted</p>
            </div>
          </div>

          {/* Metric 3: Active Areas */}
          <div className="impact-metric-item">
            <div className="metric-icon-box box-amber">
              <Building2 size={26} />
            </div>
            <div className="metric-data">
              <div className="metric-value">{BARANGAY_STATS.activeBarangays}</div>
              <div className="metric-label">Barangays Active</div>
              <p className="metric-sub">Connected directly with LGU</p>
            </div>
          </div>

          {/* Metric 4: Response Rate */}
          <div className="impact-metric-item">
            <div className="metric-icon-box box-purple">
              <Clock size={26} />
            </div>
            <div className="metric-data">
              <div className="metric-value">{BARANGAY_STATS.avgResponseTime}</div>
              <div className="metric-label">Avg Officer Response</div>
              <p className="metric-sub">AI Priority Dispatch Engine</p>
            </div>
          </div>

        </div>

        {/* Endorsement Trust Ribbon */}
        <div className="trust-ribbon">
          <div className="ribbon-title">
            <ShieldCheck size={18} className="text-emerald" />
            <span>Trusted & Co-Engineered for Philippine Local Government Units (LGUs)</span>
          </div>
          <div className="ribbon-tags">
            <span className="ribbon-tag"><Award size={14} /> AI Computer Vision 95.8% Accuracy</span>
            <span className="ribbon-tag">DILG Guidelines Compliant</span>
            <span className="ribbon-tag">Open Data Transparency</span>
          </div>
        </div>

      </div>

      <style>{`
        .trust-impact-section {
          position: relative;
          margin-top: -2rem;
          z-index: 10;
        }

        .impact-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          padding: 2.5rem 2rem;
          gap: 2rem;
          border-color: var(--border-glass-bright);
          background: rgba(15, 23, 42, 0.85);
        }

        .impact-metric-item {
          display: flex;
          align-items: flex-start;
          gap: 1.2rem;
          padding-right: 1rem;
          border-right: 1px solid var(--border-glass);
        }

        .impact-metric-item:last-child {
          border-right: none;
          padding-right: 0;
        }

        .metric-icon-box {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .box-emerald {
          background: rgba(16, 185, 129, 0.12);
          color: var(--accent-emerald);
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .box-azure {
          background: rgba(59, 130, 246, 0.12);
          color: var(--accent-azure);
          border: 1px solid rgba(59, 130, 246, 0.25);
        }

        .box-amber {
          background: rgba(245, 158, 11, 0.12);
          color: var(--accent-amber);
          border: 1px solid rgba(245, 158, 11, 0.25);
        }

        .box-purple {
          background: rgba(139, 92, 246, 0.12);
          color: var(--accent-purple);
          border: 1px solid rgba(139, 92, 246, 0.25);
        }

        .metric-data {
          display: flex;
          flex-direction: column;
        }

        .metric-value {
          font-family: var(--font-heading);
          font-size: 2.1rem;
          font-weight: 800;
          line-height: 1.1;
          color: var(--text-main);
        }

        .metric-label {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-main);
          margin-top: 0.2rem;
        }

        .metric-sub {
          font-size: 0.76rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }

        .trust-ribbon {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 1.5rem;
          padding: 0.8rem 1.5rem;
          background: rgba(15, 23, 42, 0.4);
          border-radius: var(--radius-md);
          border: 1px dashed var(--border-glass);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .ribbon-title {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .ribbon-tags {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .ribbon-tag {
          font-size: 0.78rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.04);
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
        }

        @media (max-width: 1024px) {
          .impact-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2.5rem;
          }
          .impact-metric-item {
            border-right: none;
          }
        }

        @media (max-width: 640px) {
          .impact-grid {
            grid-template-columns: 1fr;
          }
          .trust-ribbon {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </section>
  );
}
