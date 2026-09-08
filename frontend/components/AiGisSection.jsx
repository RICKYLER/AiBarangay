'use client';

import React, { useState } from 'react';
import { Cpu, Globe, Sliders, ShieldCheck, Zap, Crosshair, BarChart3 } from 'lucide-react';

export default function AiGisSection() {
  const [activeTab, setActiveTab] = useState('vision');

  return (
    <section id="ai-gis" className="section ai-gis-section">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="badge badge-purple margin-auto">
            <Cpu size={14} /> Core Technology Stack
          </div>
          <h2 className="section-title">
            The Power of <span className="text-gradient-azure">AI Computer Vision</span> + GIS Mapping
          </h2>
          <p className="section-subtitle">
            How we transform crowd-sourced resident photos into precise spatial vector intelligence and automated LGU dispatch workflows.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="pillars-grid grid-3">
          
          <div className="glass-card pillar-card glass-card-hoverable">
            <div className="pillar-icon box-emerald">
              <Crosshair size={28} />
            </div>
            <h3>Computer Vision Hazard Recognition</h3>
            <p>
              Trained on over 100,000 Philippine civic infrastructure images. Instantly recognizes road potholes, flooded street levels, illegal trash dumps, and broken lighting.
            </p>
            <div className="pillar-footer">
              <span className="badge badge-emerald">95.8% Model Precision</span>
            </div>
          </div>

          <div className="glass-card pillar-card glass-card-hoverable">
            <div className="pillar-icon box-azure">
              <Globe size={28} />
            </div>
            <h3>Spatial GIS Clustering & Heatmaps</h3>
            <p>
              Aggregates individual geotagged pins into barangay hazard density vectors. Enables city engineers to plan preventative maintenance before typhoons.
            </p>
            <div className="pillar-footer">
              <span className="badge badge-azure">Real-Time Vector Layer</span>
            </div>
          </div>

          <div className="glass-card pillar-card glass-card-hoverable">
            <div className="pillar-icon box-purple">
              <Zap size={28} />
            </div>
            <h3>Dynamic Priority Dispatch Engine</h3>
            <p>
              Evaluates upvotes, depth measurements, and proximity to schools or main roads to auto-route urgent hazards directly to duty barangay tanods and LGU responders.
            </p>
            <div className="pillar-footer">
              <span className="badge badge-purple">Sub-4min Auto Dispatch</span>
            </div>
          </div>

        </div>

        {/* Interactive Technical Interactive Showcase */}
        <div className="glass-card ai-demo-card">
          <div className="demo-header flex-between">
            <div className="demo-title flex-center">
              <Sliders size={18} className="text-emerald" />
              <span>Interactive AI Computer Vision Inspector Simulator</span>
            </div>

            <div className="demo-tabs">
              <button 
                className={`demo-tab ${activeTab === 'vision' ? 'active' : ''}`}
                onClick={() => setActiveTab('vision')}
              >
                Pothole Vision
              </button>
              <button 
                className={`demo-tab ${activeTab === 'flood' ? 'active' : ''}`}
                onClick={() => setActiveTab('flood')}
              >
                Flood Water Depth
              </button>
              <button 
                className={`demo-tab ${activeTab === 'waste' ? 'active' : ''}`}
                onClick={() => setActiveTab('waste')}
              >
                Solid Waste Scan
              </button>
            </div>
          </div>

          <div className="demo-body grid-2">
            
            {/* Visual Scan Box */}
            <div className="scan-viewport">
              <img 
                src={
                  activeTab === 'vision'
                    ? 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
                    : activeTab === 'flood'
                    ? 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'
                    : 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80'
                }
                alt="AI Scan Demo" 
                className="scan-img"
              />

              {/* Bounding Box Overlays */}
              <div className="ai-bounding-box box-1">
                <span className="box-tag">
                  {activeTab === 'vision' ? 'DEFECT: Pothole 1.2m' : activeTab === 'flood' ? 'WATER DEPTH: 0.45m' : 'HAZARD: Unsegregated Trash'}
                </span>
                <span className="box-corner corner-tl"></span>
                <span className="box-corner corner-tr"></span>
                <span className="box-corner corner-bl"></span>
                <span className="box-corner corner-br"></span>
              </div>

              <div className="scan-laser-line"></div>
            </div>

            {/* AI Diagnostics Output */}
            <div className="scan-diagnostics flex-column">
              <div className="diag-header flex-between">
                <span className="badge badge-emerald">AI Diagnostic Report</span>
                <span className="diag-code">MODEL_VER: GEO-VISION-V4.2</span>
              </div>

              <div className="diag-metrics-list">
                <div className="metric-row flex-between">
                  <span className="row-label">Detected Primary Hazard:</span>
                  <span className="row-val text-emerald">
                    {activeTab === 'vision' ? 'Severe Asphalt Pothole' : activeTab === 'flood' ? 'Stormwater Inundation' : 'Illegal Waste Accumulation'}
                  </span>
                </div>

                <div className="metric-row flex-between">
                  <span className="row-label">Confidence Score:</span>
                  <span className="row-val">
                    {activeTab === 'vision' ? '96.4%' : activeTab === 'flood' ? '94.8%' : '91.2%'}
                  </span>
                </div>

                <div className="metric-row flex-between">
                  <span className="row-label">Calculated Severity Rating:</span>
                  <span className="row-val badge badge-rose">High Risk</span>
                </div>

                <div className="metric-row flex-between">
                  <span className="row-label">Target LGU Department:</span>
                  <span className="row-val text-azure">
                    {activeTab === 'vision' ? 'Engineering & Roads' : activeTab === 'flood' ? 'Flood Control Command' : 'Barangay Health & Env'}
                  </span>
                </div>
              </div>

              <div className="diag-action-box">
                <div className="action-title flex-center">
                  <BarChart3 size={16} className="text-emerald" />
                  <span>Automated Recommendation:</span>
                </div>
                <p className="action-text">
                  Dispatch repair unit within 24 hours. Proximity risk detected: 50 meters from Barangay Primary School.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        .ai-gis-section {
          background: radial-gradient(circle at 50% 100%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
        }

        .pillars-grid {
          margin-bottom: 3.5rem;
        }

        .pillar-card {
          padding: 2.2rem 1.75rem;
          display: flex;
          flex-direction: column;
        }

        .pillar-icon {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .pillar-card h3 {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .pillar-card p {
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .pillar-footer {
          margin-top: auto;
        }

        .ai-demo-card {
          padding: 1.5rem;
          border-radius: var(--radius-xl);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .demo-header {
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-glass);
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .demo-title {
          font-size: 1.05rem;
          font-weight: 700;
          gap: 0.5rem;
        }

        .demo-tabs {
          display: flex;
          gap: 0.5rem;
        }

        .demo-tab {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          color: var(--text-muted);
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
        }

        .demo-tab.active {
          background: var(--accent-emerald);
          color: #fff;
          border-color: transparent;
        }

        .demo-body {
          gap: 2rem;
          align-items: center;
        }

        .scan-viewport {
          position: relative;
          height: 300px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border-glass-bright);
        }

        .scan-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ai-bounding-box {
          position: absolute;
          top: 30%;
          left: 25%;
          width: 50%;
          height: 45%;
          border: 2px dashed var(--accent-emerald);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
          animation: pulseGlow 2s infinite;
        }

        .box-tag {
          position: absolute;
          top: -26px;
          left: 0;
          background: var(--accent-emerald);
          color: #000;
          font-weight: 800;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        }

        .scan-laser-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, transparent, var(--accent-emerald), transparent);
          box-shadow: 0 0 10px var(--accent-emerald);
          animation: scanLaser 3s linear infinite;
        }

        @keyframes scanLaser {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }

        .scan-diagnostics {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .diag-header {
          font-size: 0.8rem;
        }

        .diag-code {
          font-family: monospace;
          color: var(--text-subtle);
        }

        .diag-metrics-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: rgba(11, 17, 32, 0.6);
          padding: 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-glass);
        }

        .metric-row {
          font-size: 0.88rem;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
          padding-bottom: 0.4rem;
        }

        .metric-row:last-child { border-bottom: none; padding-bottom: 0; }

        .row-label { color: var(--text-muted); }
        .row-val { font-weight: 700; color: var(--text-main); }

        .diag-action-box {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
        }

        .action-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-main);
          gap: 0.4rem;
          margin-bottom: 0.3rem;
        }

        .action-text {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
      `}</style>
    </section>
  );
}
