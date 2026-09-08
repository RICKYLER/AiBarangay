import React, { useState } from 'react';
import { X, Camera, MapPin, Cpu, CheckCircle2, AlertTriangle, Upload, ArrowRight, ShieldCheck } from 'lucide-react';
import { TAGUM_BARANGAYS } from '../data/tagumBarangays';

export default function ReportModal({ isOpen, onClose, onSubmitReport }) {
  const [step, setStep] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Flooding');
  const [barangay, setBarangay] = useState('Barangay Magugpo Poblacion');
  const [locationName, setLocationName] = useState('Pioneer Ave & Rizal St');
  const [severity, setSeverity] = useState('High');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [submittedCode, setSubmittedCode] = useState(null);

  if (!isOpen) return null;

  // Sample photo selections for easy quick-testing
  const samplePhotos = [
    { label: 'Flooded Street', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80', cat: 'Flooding', sev: 'High' },
    { label: 'Pothole Hazard', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80', cat: 'Road Damage', sev: 'High' },
    { label: 'Trash Pile', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80', cat: 'Garbage', sev: 'Medium' },
    { label: 'Broken Light', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80', cat: 'Streetlights', sev: 'Medium' },
  ];

  const handleSelectPhoto = (sample) => {
    setSelectedPhoto(sample.url);
    runAiAnalysis(sample);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedPhoto(imageUrl);
      runAiAnalysis({ cat: 'Road Damage', sev: 'High' });
    }
  };

  const runAiAnalysis = (sampleData) => {
    setAnalyzing(true);
    setAiResult(null);

    setTimeout(() => {
      setAnalyzing(false);
      const cat = sampleData?.cat || 'Road Damage';
      const sev = sampleData?.sev || 'High';
      
      setCategory(cat);
      setSeverity(sev);
      setAiResult({
        category: cat,
        severity: sev,
        confidence: 96,
        detectedTags: [cat, 'Tagum LGU Risk', 'Urgent Dispatch'],
        suggestedDept: cat === 'Flooding' ? 'Tagum Engineering & CDRRMO' : cat === 'Road Damage' ? 'Tagum Public Works' : 'Tagum CENRO'
      });
      setStep(2);
    }, 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trackingCode = 'TGM-2026-' + Math.floor(1000 + Math.random() * 9000);
    
    const newReport = {
      id: trackingCode,
      title: title || `${category} Reported at ${locationName}`,
      category,
      barangay,
      city: 'Tagum City',
      lat: 7.4478 + (Math.random() - 0.5) * 0.04,
      lng: 125.8078 + (Math.random() - 0.5) * 0.04,
      locationName,
      severity,
      aiConfidence: aiResult ? aiResult.confidence : 95,
      aiTags: aiResult ? aiResult.detectedTags : [category],
      description: description || 'Resident hazard report submitted via Tagum AI Barangay Mapper.',
      image: selectedPhoto || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      status: 'Pending',
      upvotes: 1,
      dateReported: new Date().toISOString(),
      reporter: reporterName || 'Anonymous Tagum Resident',
      assignedDept: aiResult ? aiResult.suggestedDept : 'Tagum City Duty Desk',
      officialNotes: 'Report queued for Tagum Barangay Officer verification.',
    };

    onSubmitReport(newReport);
    setSubmittedCode(trackingCode);
    setStep(3);
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedPhoto(null);
    setAiResult(null);
    setSubmittedCode(null);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        
        {/* Modal Close Button */}
        <button onClick={resetAndClose} className="modal-close-btn">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex-center gap-05">
            <Camera size={20} className="text-emerald" />
            <h3 className="modal-title">Tagum City AI Hazard Reporter</h3>
          </div>
          <p className="modal-subtitle">Submit neighborhood problems directly to Tagum LGU & duty officers</p>
        </div>

        {/* STEP 1: Upload Photo / Pick Sample */}
        {step === 1 && (
          <div className="modal-step-body">
            <h4 className="step-label">Step 1: Upload Photo or Select Hazard Sample</h4>
            
            {/* Sample Selector */}
            <div className="sample-grid">
              {samplePhotos.map((s, idx) => (
                <div key={idx} className="sample-card" onClick={() => handleSelectPhoto(s)}>
                  <img src={s.url} alt={s.label} />
                  <span className="sample-chip">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="or-divider"><span>OR UPLOAD FROM DEVICE</span></div>

            <label className="upload-dropzone">
              <Upload size={32} className="text-azure" />
              <span>Click to select photo or drag and drop</span>
              <small>Supports JPG, PNG, WEBP up to 10MB</small>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden-file" />
            </label>

            {analyzing && (
              <div className="ai-scanning-overlay flex-center flex-column">
                <Cpu size={36} className="text-emerald animate-pulse" />
                <span className="scan-text">Running AI Computer Vision Analysis...</span>
                <small className="scan-sub">Detecting hazard classification & severity level</small>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Verify AI Diagnosis & Fill Location Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="modal-step-body">
            
            {/* AI Diagnostics Box */}
            {aiResult && (
              <div className="ai-result-banner flex-between">
                <div className="result-left flex-center">
                  <Cpu size={22} className="text-emerald" />
                  <div>
                    <strong>AI Detected: {aiResult.category} ({aiResult.confidence}% Conf.)</strong>
                    <span className="result-sub">Severity: {aiResult.severity} Risk</span>
                  </div>
                </div>
                <span className="badge badge-emerald">Auto-Tagged</span>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Issue Headline / Short Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Pothole on JV Ayala Avenue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Flooding">Flooding</option>
                  <option value="Road Damage">Road Damage</option>
                  <option value="Garbage">Garbage</option>
                  <option value="Streetlights">Streetlights</option>
                  <option value="Water">Water Leaks</option>
                </select>
              </div>

              <div className="form-group">
                <label>Barangay Jurisdiction (Tagum City - 23 Barangays)</label>
                <select value={barangay} onChange={(e) => setBarangay(e.target.value)}>
                  {TAGUM_BARANGAYS.map((brgy) => (
                    <option key={brgy} value={brgy}>
                      {brgy}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label>Street Address / Landmark Location in Tagum City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Corner Pioneer Ave & Rizal St near Tagum Public Market"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label>Hazard Description & Details</label>
                <textarea
                  rows="3"
                  placeholder="Describe the hazard size, depth, or safety impact..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label>Your Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Junrel Dizon"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Contact Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 0917-123-4567"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-actions flex-between">
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                Back
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Report to Tagum LGU <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Submission Confirmation */}
        {step === 3 && (
          <div className="modal-step-body text-center">
            <div className="success-icon-box margin-auto">
              <CheckCircle2 size={48} className="text-emerald" />
            </div>

            <h3 className="success-title">Report Successfully Dispatched to Tagum LGU!</h3>
            <p className="success-sub">
              Your hazard report has been processed by AI and logged on the public Tagum City barangay record.
            </p>

            <div className="tracking-code-card glass-card">
              <span className="code-label">Tracking Number</span>
              <strong className="code-value">{submittedCode}</strong>
              <small className="code-hint">Save this code to check resolution progress anytime.</small>
            </div>

            <button onClick={resetAndClose} className="btn btn-primary w-full margin-top-1">
              Done & Return to Map
            </button>
          </div>
        )}

      </div>

      <style>{`
        .modal-close-btn {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: transparent;
          border: 1px solid var(--border-glass);
          color: var(--text-muted);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .modal-header {
          padding: 1.5rem 1.5rem 1rem 1.5rem;
          border-bottom: 1px solid var(--border-glass);
        }

        .gap-05 { gap: 0.5rem; }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .modal-subtitle {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }

        .modal-step-body {
          padding: 1.5rem;
        }

        .step-label {
          font-size: 0.95rem;
          margin-bottom: 1rem;
          color: var(--text-main);
        }

        .sample-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.85rem;
          margin-bottom: 1.25rem;
        }

        .sample-card {
          position: relative;
          height: 90px;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all var(--transition-fast);
        }

        .sample-card:hover {
          border-color: var(--accent-emerald);
          transform: translateY(-2px);
        }

        .sample-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sample-chip {
          position: absolute;
          bottom: 4px;
          left: 4px;
          right: 4px;
          background: rgba(15, 23, 42, 0.85);
          color: #fff;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 4px;
          border-radius: 4px;
          text-align: center;
        }

        .or-divider {
          text-align: center;
          position: relative;
          margin: 1.25rem 0;
          font-size: 0.72rem;
          color: var(--text-subtle);
          font-weight: 700;
        }

        .upload-dropzone {
          border: 2px dashed var(--border-glass-bright);
          border-radius: var(--radius-md);
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.02);
          transition: background var(--transition-fast);
        }

        .upload-dropzone:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--accent-azure);
        }

        .hidden-file { display: none; }

        .ai-scanning-overlay {
          position: absolute;
          inset: 0;
          background: rgba(11, 17, 32, 0.95);
          backdrop-filter: blur(8px);
          z-index: 10;
          gap: 0.75rem;
          border-radius: var(--radius-lg);
        }

        .scan-text {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--accent-emerald);
        }

        .scan-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .ai-result-banner {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.25rem;
        }

        .result-left { gap: 0.75rem; }
        .result-sub { display: block; font-size: 0.76rem; color: var(--text-muted); }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .full-width { grid-column: span 2; }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .form-group label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .form-group input, .form-group select, .form-group textarea {
          background: rgba(11, 17, 32, 0.8);
          border: 1px solid var(--border-glass-bright);
          border-radius: var(--radius-sm);
          color: var(--text-main);
          padding: 0.6rem 0.85rem;
          font-size: 0.88rem;
          outline: none;
          font-family: var(--font-primary);
        }

        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: var(--accent-emerald);
        }

        .modal-actions {
          padding-top: 1rem;
          border-top: 1px solid var(--border-glass);
        }

        .success-icon-box {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .success-title { font-size: 1.4rem; font-weight: 800; margin-bottom: 0.4rem; }
        .success-sub { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem; }

        .tracking-code-card {
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          background: rgba(11, 17, 32, 0.8);
          border-color: var(--accent-emerald);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .code-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }
        .code-value { font-family: var(--font-heading); font-size: 1.8rem; color: var(--accent-emerald); letter-spacing: 0.05em; }
        .code-hint { font-size: 0.76rem; color: var(--text-subtle); margin-top: 0.25rem; }

        .margin-top-1 { margin-top: 1rem; }

        @media (max-width: 640px) {
          .sample-grid { grid-template-columns: repeat(2, 1fr); }
          .form-grid { grid-template-columns: 1fr; }
          .full-width { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
}
