import React from 'react';
import { Link } from '@/lib/router-shim';
import { AlertTriangle, Shield, ArrowRight } from 'lucide-react';

export default function CtaSection({ onOpenReport }) {
  return (
    <section className="section cta-section">
      <div className="container">
        <div className="glass-card cta-box text-center">
          <div className="cta-glow"></div>
          
          <div className="badge badge-emerald margin-auto">
            <Shield size={14} /> Join the Smart Tagum Barangay Movement
          </div>

          <h2 className="cta-heading">
            Make Your Tagum Neighborhood Safer, Cleaner, and Flood-Resistant Today
          </h2>

          <p className="cta-sub">
            Whether you are a resident spotting a neighborhood defect or a Barangay Captain ready to modernize your Tagum LGU response, AI Barangay Problem Mapper is 100% free for citizens.
          </p>

          <div className="cta-actions flex-center">
            <button onClick={onOpenReport} className="btn btn-primary btn-hero">
              <AlertTriangle size={20} />
              <span>Report a Hazard Now</span>
            </button>

            <Link to="/register" className="btn btn-secondary btn-hero">
              <span>Register as Barangay Officer</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .cta-section {
          padding-bottom: 6rem;
        }

        .cta-box {
          position: relative;
          padding: 4.5rem 2.5rem;
          border-radius: var(--radius-xl);
          overflow: hidden;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(16, 185, 129, 0.12) 50%, rgba(59, 130, 246, 0.12) 100%);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .cta-glow {
          position: absolute;
          top: -50%;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 300px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
        }

        .cta-heading {
          font-size: 2.6rem;
          font-weight: 800;
          max-width: 780px;
          margin: 1.25rem auto;
          line-height: 1.2;
        }

        .cta-sub {
          font-size: 1.08rem;
          color: var(--text-muted);
          max-width: 640px;
          margin: 0 auto 2.5rem auto;
          line-height: 1.6;
        }

        .cta-actions {
          gap: 1.2rem;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .cta-heading { font-size: 2rem; }
          .cta-box { padding: 3rem 1.5rem; }
        }
      `}</style>
    </section>
  );
}
