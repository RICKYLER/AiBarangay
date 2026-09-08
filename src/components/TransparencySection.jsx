import React from 'react';
import { ShieldCheck, CheckCircle2, TrendingUp, Award, Building, FileCheck } from 'lucide-react';

export default function TransparencySection() {
  const leaderboards = [
    { barangay: 'Barangay Magugpo Poblacion', resolved: 218, rate: '96.5%', time: '2.1 hrs', score: 98 },
    { barangay: 'Barangay Mankilam', resolved: 174, rate: '94.8%', time: '2.5 hrs', score: 96 },
    { barangay: 'Barangay Apokon', resolved: 142, rate: '92.1%', time: '3.1 hrs', score: 93 },
    { barangay: 'Barangay Visayan Village', resolved: 110, rate: '89.4%', time: '3.8 hrs', score: 90 },
  ];

  return (
    <section id="transparency" className="section transparency-section">
      <div className="container">
        
        {/* Header */}
        <div className="section-header text-center">
          <div className="badge badge-emerald margin-auto">
            <ShieldCheck size={14} /> Open Government Accountability
          </div>
          <h2 className="section-title">Barangay <span className="text-gradient-emerald">Transparency Dashboard</span></h2>
          <p className="section-subtitle">
            Every hazard reported is logged on a public immutable record. Track barangay resolution turnaround times, official LGU responses, and performance ratings.
          </p>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid-2 dashboard-main-grid">
          
          {/* Left Card: LGU Barangay Leaderboard */}
          <div className="glass-card trans-card">
            <div className="trans-card-header flex-between">
              <h3 className="flex-center">
                <Award size={20} className="text-amber" />
                Barangay Response Leaderboard
              </h3>
              <span className="badge badge-azure">Updated Hourly</span>
            </div>

            <div className="leaderboard-list">
              {leaderboards.map((item, index) => (
                <div key={index} className="leaderboard-row flex-between">
                  <div className="row-rank-name flex-center">
                    <span className={`rank-badge rank-${index + 1}`}>{index + 1}</span>
                    <div className="name-box">
                      <strong className="brgy-name">{item.barangay}</strong>
                      <span className="brgy-sub">{item.resolved} Problems Fixed</span>
                    </div>
                  </div>

                  <div className="row-metrics flex-center">
                    <div className="metric-box text-right">
                      <span className="m-val text-emerald">{item.rate}</span>
                      <span className="m-lbl">Fix Rate</span>
                    </div>
                    <div className="metric-box text-right">
                      <span className="m-val">{item.time}</span>
                      <span className="m-lbl">Avg Response</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Verified Proof-of-Work Timeline */}
          <div className="glass-card trans-card">
            <div className="trans-card-header flex-between">
              <h3 className="flex-center">
                <FileCheck size={20} className="text-emerald" />
                Verified Proof-of-Work Logs
              </h3>
              <span className="badge badge-emerald">Audit Verified</span>
            </div>

            <div className="audit-timeline">
              
              <div className="timeline-item">
                <div className="timeline-marker marker-green">
                  <CheckCircle2 size={14} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-top flex-between">
                    <strong>BRGY-2026-0893 • Garbage Clearance</strong>
                    <span className="timeline-time">2 hours ago</span>
                  </div>
                  <p className="timeline-desc">
                    Sanitation truck completed full waste clearance at Kalayaan Ave. Photo verification uploaded by Inspector Reyes.
                  </p>
                  <div className="proof-photo-strip flex-center">
                    <span className="badge badge-azure">Before & After Photo Verified</span>
                  </div>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker marker-blue">
                  <TrendingUp size={14} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-top flex-between">
                    <strong>BRGY-2026-0891 • Storm Drain Declogging</strong>
                    <span className="timeline-time">5 hours ago</span>
                  </div>
                  <p className="timeline-desc">
                    LGU Heavy Engineering team arrived at Paseo de Roxas. Debris removal in progress.
                  </p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker marker-amber">
                  <Building size={14} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-top flex-between">
                    <strong>BRGY-2026-0895 • Water Burst Containment</strong>
                    <span className="timeline-time">7 hours ago</span>
                  </div>
                  <p className="timeline-desc">
                    Manila Water emergency dispatch shut main valve on Ayala Ave. Repair team on site.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      <style>{`
        .transparency-section {
          background: radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 40%);
        }

        .dashboard-main-grid {
          gap: 2rem;
        }

        .trans-card {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
        }

        .trans-card-header {
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-glass);
          margin-bottom: 1.25rem;
        }

        .trans-card-header h3 {
          font-size: 1.15rem;
          font-weight: 700;
          gap: 0.5rem;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .leaderboard-row {
          background: rgba(11, 17, 32, 0.6);
          border: 1px solid var(--border-glass);
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
        }

        .row-rank-name {
          gap: 0.85rem;
        }

        .rank-badge {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-main);
        }

        .rank-1 { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid #f59e0b; }
        .rank-2 { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; border: 1px solid #cbd5e1; }
        .rank-3 { background: rgba(180, 83, 9, 0.2); color: #d97706; border: 1px solid #d97706; }

        .name-box {
          display: flex;
          flex-direction: column;
        }

        .brgy-name {
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .brgy-sub {
          font-size: 0.76rem;
          color: var(--text-muted);
        }

        .row-metrics {
          gap: 1.25rem;
        }

        .text-right { text-align: right; }

        .m-val {
          display: block;
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.05rem;
          line-height: 1;
        }

        .m-lbl {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .audit-timeline {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
          padding-left: 0.5rem;
        }

        .timeline-item {
          display: flex;
          gap: 1rem;
          position: relative;
        }

        .timeline-marker {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          z-index: 2;
        }

        .marker-green { background: rgba(16, 185, 129, 0.2); color: var(--accent-emerald); border: 1px solid var(--accent-emerald); }
        .marker-blue { background: rgba(59, 130, 246, 0.2); color: var(--accent-azure); border: 1px solid var(--accent-azure); }
        .marker-amber { background: rgba(245, 158, 11, 0.2); color: var(--accent-amber); border: 1px solid var(--accent-amber); }

        .timeline-content {
          flex: 1;
          background: rgba(11, 17, 32, 0.6);
          border: 1px solid var(--border-glass);
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
        }

        .timeline-top {
          font-size: 0.84rem;
          margin-bottom: 0.35rem;
        }

        .timeline-time {
          font-size: 0.72rem;
          color: var(--text-subtle);
        }

        .timeline-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .proof-photo-strip {
          margin-top: 0.6rem;
        }
      `}</style>
    </section>
  );
}
