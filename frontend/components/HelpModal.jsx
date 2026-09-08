'use client';

import React, { useState } from 'react';
import { X, HelpCircle, ChevronDown, ShieldCheck, PhoneCall, AlertCircle, FileText } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  const [openFaq, setOpenFaq] = useState(null);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How does the AI auto-classify reported hazard photos?',
      a: 'When you upload a photo, our deep-learning computer vision algorithm analyzes pixel patterns for water depth, road crack dimensions, or waste bag contours. It suggests the appropriate category and severity within seconds.'
    },
    {
      q: 'What happens after I submit a problem report?',
      a: 'The report is assigned a unique tracking ID (e.g. BRGY-2026-0891) and instantly dispatched to the designated Barangay & LGU department duty desk. You can monitor progress on the interactive map.'
    },
    {
      q: 'Is this platform free for Philippine Barangays?',
      a: 'Yes! AI Barangay Problem Mapper is open-access for all Philippine citizens and Local Government Units to improve civic safety and transparency.'
    },
    {
      q: 'How do upvotes influence hazard prioritization?',
      a: 'Hazards with higher upvote counts from verified residents are elevated on the LGU dispatch matrix, alerting duty officers to urgent community concerns.'
    }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card help-modal-card">
        
        <button onClick={onClose} className="modal-close-btn">
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="flex-center gap-05">
            <HelpCircle size={22} className="text-emerald" />
            <h3 className="modal-title">Help & Frequently Asked Questions</h3>
          </div>
          <p className="modal-subtitle">Guide for Residents and Barangay Officials</p>
        </div>

        <div className="help-body">
          
          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item glass-card">
                <div 
                  className="faq-question flex-between"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <strong>{faq.q}</strong>
                  <ChevronDown size={18} className={`faq-arrow ${openFaq === idx ? 'rotated' : ''}`} />
                </div>
                {openFaq === idx && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="emergency-help-box glass-card flex-between">
            <div className="flex-center gap-05">
              <PhoneCall size={20} className="text-rose" />
              <div>
                <strong>Need Immediate Emergency Assistance?</strong>
                <span className="emergency-sub">Dial National Emergency Hotline 911 directly.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        .help-modal-card {
          max-width: 620px;
        }

        .help-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .faq-item {
          padding: 1rem 1.25rem;
          cursor: pointer;
        }

        .faq-question {
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .faq-arrow {
          transition: transform var(--transition-fast);
          color: var(--text-muted);
        }

        .faq-arrow.rotated {
          transform: rotate(180deg);
          color: var(--accent-emerald);
        }

        .faq-answer {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-glass);
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .emergency-help-box {
          padding: 1rem 1.25rem;
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .emergency-sub {
          display: block;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
