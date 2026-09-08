import React from 'react';
import { AlertTriangle, MapPin, ArrowRight, ShieldCheck, Cpu, Zap, Activity } from 'lucide-react';

export default function Hero({ onOpenReport }) {
  return (
    <section id="home" className="section hero-section">
      <div className="container hero-grid">
        {/* Left Column: Headline & Call To Actions */}
        <div className="hero-content">
          <div className="badge badge-emerald hero-badge">
            <span className="pulse-dot"></span>
            <span>Next-Gen Barangay Civic Intelligence</span>
          </div>

          <h1 className="hero-title">
            Empowering Communities via <span className="text-gradient-emerald">AI Problem Mapping</span> & Rapid Response
          </h1>

          <p className="hero-description">
            Report neighborhood hazards like flooding, road potholes, uncollected waste, and broken streetlights. Our <strong>Computer Vision AI</strong> identifies defects, tags GPS coordinates, and dispatches real-time work orders to Barangay & LGU officers.
          </p>

          <div className="hero-ctas">
            <button onClick={onOpenReport} className="btn btn-primary btn-hero">
              <AlertTriangle size={20} />
              <span>Report a Problem Now</span>
            </button>

            <a href="#community-map" className="btn btn-secondary btn-hero">
              <MapPin size={20} className="text-azure" />
              <span>Explore GIS Map</span>
              <ArrowRight size={18} />
            </a>
          </div>

          {/* Quick Features List */}
          <div className="hero-features">
            <div className="hero-feature-item">
              <ShieldCheck size={18} className="feature-icon" />
              <span>Verified LGU Dispatch</span>
            </div>
            <div className="hero-feature-item">
              <Cpu size={18} className="feature-icon" />
              <span>AI Auto Hazard Tagging</span>
            </div>
            <div className="hero-feature-item">
              <Zap size={18} className="feature-icon" />
              <span>Sub-4hr Response Target</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Visual & Live AI Ticker Widget */}
        <div className="hero-visual">
          <div className="visual-glow-bg"></div>
          
          <div className="glass-card hero-map-preview-card">
            <div className="card-top-bar">
              <div className="dot-group">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <span className="card-live-label flex-center">
                <Activity size={14} className="text-emerald animate-pulse" />
                Live Stream: Tagum City / Magugpo Poblacion
              </span>
            </div>

            <div className="visual-map-mockup">
              <img 
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80" 
                alt="Barangay GIS Map Radar" 
                className="map-bg-img" 
              />
              <div className="map-overlay-dark"></div>

              {/* Radar pulse target */}
              <div className="radar-target radar-1" style={{ top: '35%', left: '42%' }}>
                <span className="radar-ping"></span>
                <div className="radar-tooltip">
                  <strong>Pothole Hazard</strong>
                  <span>AI Severity: 94% High</span>
                </div>
              </div>

              <div className="radar-target radar-2" style={{ top: '60%', left: '70%' }}>
                <span className="radar-ping ping-blue"></span>
                <div className="radar-tooltip">
                  <strong>Flooding Warning</strong>
                  <span>Knee Depth (0.45m)</span>
                </div>
              </div>

              {/* Floating Widget 1: AI Analysis Toast */}
              <div className="glass-card floating-card card-ai-toast">
                <div className="toast-icon">
                  <Cpu size={20} />
                </div>
                <div className="toast-content">
                  <div className="toast-title flex-between">
                    <span>AI Detection Active</span>
                    <span className="badge badge-emerald">Verified</span>
                  </div>
                  <p className="toast-sub">San Lorenzo: Drainage blockage resolved in 2.1h</p>
                </div>
              </div>

              {/* Floating Widget 2: Resolution Counter */}
              <div className="glass-card floating-card card-resolution-stat">
                <div className="stat-number">89.4%</div>
                <div className="stat-label">Monthly Barangay Issues Fixed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          padding-top: 4rem;
          padding-bottom: 5rem;
          overflow: hidden;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 3.5rem;
          align-items: center;
        }

        .hero-badge {
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: 3.2rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 1.5rem;
        }

        .hero-description {
          font-size: 1.12rem;
          color: var(--text-muted);
          margin-bottom: 2.2rem;
          max-width: 580px;
          line-height: 1.7;
        }

        .hero-ctas {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }

        .btn-hero {
          padding: 0.95rem 1.8rem;
          font-size: 1.05rem;
        }

        .text-azure {
          color: var(--accent-azure);
        }

        .hero-features {
          display: flex;
          align-items: center;
          gap: 1.8rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-glass);
          flex-wrap: wrap;
        }

        .hero-feature-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .feature-icon {
          color: var(--accent-emerald);
        }

        .hero-visual {
          position: relative;
        }

        .visual-glow-bg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 70%);
          filter: blur(50px);
          z-index: 0;
          pointer-events: none;
        }

        .hero-map-preview-card {
          position: relative;
          z-index: 1;
          overflow: hidden;
          border-radius: var(--radius-xl);
          padding: 0.75rem;
        }

        .card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem 0.75rem 0.75rem;
        }

        .dot-group {
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot-red { background: #ef4444; }
        .dot-yellow { background: #f59e0b; }
        .dot-green { background: #10b981; }

        .card-live-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          gap: 0.4rem;
        }

        .visual-map-mockup {
          position: relative;
          height: 380px;
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .map-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.65) contrast(1.2) hue-rotate(-20deg);
        }

        .map-overlay-dark {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(11, 17, 32, 0.85) 100%);
        }

        .radar-target {
          position: absolute;
          transform: translate(-50%, -50%);
          cursor: pointer;
        }

        .radar-ping {
          display: block;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent-rose);
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.8);
          animation: pulseGlow 1.8s infinite;
        }

        .ping-blue {
          background: var(--accent-azure);
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.8);
        }

        .radar-tooltip {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          border: 1px solid var(--border-glass-bright);
          border-radius: 8px;
          padding: 0.4rem 0.75rem;
          white-space: nowrap;
          box-shadow: var(--shadow-card);
          display: flex;
          flex-direction: column;
          font-size: 0.75rem;
        }

        .radar-tooltip strong {
          color: #fff;
        }

        .radar-tooltip span {
          color: var(--accent-amber);
        }

        .floating-card {
          position: absolute;
          z-index: 5;
          padding: 0.85rem 1.1rem;
        }

        .card-ai-toast {
          bottom: 1.2rem;
          left: 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          max-width: 310px;
          border-color: rgba(16, 185, 129, 0.4);
        }

        .toast-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(16, 185, 129, 0.15);
          color: var(--accent-emerald);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .toast-content {
          flex: 1;
        }

        .toast-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.15rem;
        }

        .toast-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .flex-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .card-resolution-stat {
          top: 1.2rem;
          right: 1.2rem;
          text-align: center;
          border-color: rgba(59, 130, 246, 0.4);
        }

        .stat-number {
          font-family: var(--font-heading);
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--accent-emerald);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }

        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-badge { margin-left: auto; margin-right: auto; }
          .hero-description { margin-left: auto; margin-right: auto; }
          .hero-ctas { justify-content: center; }
          .hero-features { justify-content: center; }
          .hero-title { font-size: 2.5rem; }
        }

        @media (max-width: 640px) {
          .hero-title { font-size: 2rem; }
          .card-ai-toast { display: none; }
        }
      `}</style>
    </section>
  );
}
