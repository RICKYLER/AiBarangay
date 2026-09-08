import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../data/mockProblems';
import { Camera, Cpu, Send, CheckCircle2, ArrowRight } from 'lucide-react';

const ICON_MAP = {
  Camera: Camera,
  Cpu: Cpu,
  Send: Send,
  CheckCircle2: CheckCircle2,
};

export default function HowItWorks({ onOpenReport }) {
  return (
    <section id="how-it-works" className="section how-it-works-section">
      <div className="container">
        
        {/* Header */}
        <div className="section-header text-center">
          <div className="badge badge-azure margin-auto">4-Step Automated Pipeline</div>
          <h2 className="section-title">How <span className="text-gradient-azure">AI Barangay Mapper</span> Operates</h2>
          <p className="section-subtitle">
            From resident hazard upload to computer-vision classification and verified LGU resolution in 4 simple steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="steps-grid">
          {HOW_IT_WORKS_STEPS.map((item, index) => {
            const IconComponent = ICON_MAP[item.icon] || Camera;

            return (
              <div key={index} className="glass-card step-card glass-card-hoverable">
                <div className="step-number" style={{ color: item.color }}>
                  {item.step}
                </div>

                <div className="step-icon-wrapper" style={{ borderColor: item.color, background: `rgba(255,255,255,0.03)` }}>
                  <IconComponent size={28} style={{ color: item.color }} />
                </div>

                <h3 className="step-title">{item.title}</h3>
                <p className="step-description">{item.description}</p>

                {index < HOW_IT_WORKS_STEPS.length - 1 && (
                  <div className="step-connector">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Interactive Try CTA Banner */}
        <div className="how-cta-banner glass-card">
          <div className="banner-content">
            <h3>Spotted a hazard in your barangay right now?</h3>
            <p>Snap a picture with your phone or camera to see AI automatic tag classification in action.</p>
          </div>
          <button onClick={onOpenReport} className="btn btn-primary">
            <Camera size={18} />
            Test AI Hazard Reporter
          </button>
        </div>

      </div>

      <style>{`
        .how-it-works-section {
          background: radial-gradient(circle at 0% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 40%);
        }

        .text-center { text-align: center; }
        .margin-auto { margin-left: auto; margin-right: auto; margin-bottom: 1rem; }

        .section-title {
          font-size: 2.6rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          font-size: 1.05rem;
          color: var(--text-muted);
          max-width: 640px;
          margin: 0 auto 4rem auto;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.8rem;
          position: relative;
        }

        .step-card {
          padding: 2.2rem 1.5rem;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .step-number {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 1rem;
          opacity: 0.9;
        }

        .step-icon-wrapper {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.2rem;
        }

        .step-title {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--text-main);
        }

        .step-description {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .step-connector {
          position: absolute;
          top: 45%;
          right: -1.1rem;
          transform: translateY(-50%);
          color: var(--text-subtle);
          z-index: 2;
          pointer-events: none;
        }

        .how-cta-banner {
          margin-top: 4rem;
          padding: 2rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-color: rgba(16, 185, 129, 0.3);
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(16, 185, 129, 0.1) 100%);
          gap: 2rem;
        }

        .banner-content h3 {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
        }

        .banner-content p {
          font-size: 0.92rem;
          color: var(--text-muted);
        }

        @media (max-width: 1024px) {
          .steps-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .step-connector { display: none; }
        }

        @media (max-width: 640px) {
          .steps-grid { grid-template-columns: 1fr; }
          .how-cta-banner {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
}
