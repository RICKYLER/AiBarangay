'use client';

import React, { useRef, useState } from 'react';
import { Link } from '@/lib/router-shim';
import {
  Droplets, Construction, Trash2, LightbulbOff, GlassWater, Waves,
  Landmark, TreePine, HelpCircle, ChevronLeft, ChevronRight, Check, Pencil,
  Camera, ImagePlus, Video, X, Crosshair, MapPinned, ShieldCheck,
  CheckCircle2, FileText, LayoutDashboard, Send,
} from 'lucide-react';
import { REPORT_CATEGORIES, ZONES, TAGUM_CENTER } from '@/lib/data/residentData';
import { createReport } from '@/lib/api/reports';
import { compressImage } from '@/lib/imageCompress';
import { useLookups } from '@/hooks/useLookups';
import { ResMap, ResidentStatusBadge } from '@/components/resident';

const CATEGORY_ICONS = {
  Droplets, Construction, Trash2, LightbulbOff, GlassWater, Waves,
  Landmark, TreePine, HelpCircle,
};

/* DB category name (lowercase) → icon, with a safe fallback. */
const ICON_BY_NAME = {
  flooding: Droplets, 'road damage': Construction, garbage: Trash2,
  streetlight: LightbulbOff, 'water supply': GlassWater, drainage: Waves,
  'public safety': ShieldCheck, traffic: Construction, noise: HelpCircle,
  'illegal dumping': Trash2, infrastructure: Landmark, other: HelpCircle,
};

const STEPS = [
  { n: 1, label: 'Problem' },
  { n: 2, label: 'Details' },
  { n: 3, label: 'Location' },
  { n: 4, label: 'Evidence' },
  { n: 5, label: 'Review' },
];

let evidenceSeq = 0;

/**
 * ResidentReportProblem — the citizen reporting experience:
 * a guided five-step wizard written in simple, friendly language.
 * Frontend demo: no data is actually transmitted.
 */
export default function ResidentReportProblem() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [when, setWhen] = useState('');
  const [howOften, setHowOften] = useState('');
  const [pin, setPin] = useState(null);
  const [picking, setPicking] = useState(false);
  const [zone, setZone] = useState('Zone 1');
  const [generalLocation, setGeneralLocation] = useState('');
  const [evidence, setEvidence] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [triedContinue, setTriedContinue] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [result, setResult] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const fileInputRef = useRef(null);
  const { categories: apiCategories } = useLookups();

  /* Prefer live categories from the API; fall back to the demo set. */
  const categories = apiCategories.length > 0
    ? apiCategories.map((c) => ({
        key: c.name.toLowerCase(),
        label: c.name,
        hint: c.description || 'Community problem',
        icon: null,
      }))
    : REPORT_CATEGORIES;
  const iconFor = (c) =>
    (apiCategories.length > 0 ? ICON_BY_NAME[c.key] : CATEGORY_ICONS[c.icon]) || HelpCircle;

  const stepValid = (n) => {
    if (n === 1) return Boolean(category);
    if (n === 2) return description.trim().length >= 20;
    if (n === 3) return Boolean(pin) && zone !== '' && generalLocation.trim() !== '';
    return true;
  };

  const goNext = () => {
    if (!stepValid(step)) {
      setTriedContinue(true);
      return;
    }
    setTriedContinue(false);
    setStep((s) => Math.min(5, s + 1));
  };

  const goBack = () => {
    setTriedContinue(false);
    setStep((s) => Math.max(1, s - 1));
  };

  const addEvidence = (type) => {
    if (type === 'photo') {
      fileInputRef.current?.click();
      return;
    }
    evidenceSeq += 1;
    const n = String(evidenceSeq).padStart(2, '0');
    setEvidence((list) => [
      ...list,
      { id: `ev-${evidenceSeq}`, type, name: `evidence_video_${n}.mp4` },
    ]);
  };

  const onPhotoPicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Big phone photos are resized/compressed in-browser first — the
    // serverless API only accepts ~4MB bodies (see lib/imageCompress.ts).
    const compressed = await compressImage(file);
    setPhotoFile(compressed);
    setEvidence([{ id: 'ev-photo', type: 'photo', name: compressed.name }]);
  };

  const removeEvidence = (id) =>
    setEvidence((list) => list.filter((e) => e.id !== id));

  /* Use the device GPS when available; fall back to the Tagum City
     center in this demo environment. */
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setPin({ lat: TAGUM_CENTER[0], lng: TAGUM_CENTER[1] });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setPin({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        }),
      () => setPin({ lat: TAGUM_CENTER[0], lng: TAGUM_CENTER[1] })
    );
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const cat = categories.find((c) => c.key === category);
      const extra = [when && `When: ${when}.`, howOften && `Occurs: ${howOften}.`]
        .filter(Boolean).join(' ');
      const res = await createReport({
        title: `${cat?.label || 'Community problem'} — ${generalLocation.trim()}`,
        description: extra ? `${description.trim()} (${extra})` : description.trim(),
        categoryName: cat?.label,
        latitude: pin.lat,
        longitude: pin.lng,
        address: `${generalLocation.trim()}${zone ? `, ${zone}` : ''}`,
        zone,
        photo: photoFile,
      });
      setResult(res);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err.message || 'Could not submit your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryLabel = REPORT_CATEGORIES.find((c) => c.key === category)?.label;
  const photoCount = evidence.filter((e) => e.type !== 'video').length;
  const videoCount = evidence.filter((e) => e.type === 'video').length;
  const evidenceSummary =
    evidence.length === 0
      ? 'No photos or videos added (optional)'
      : [photoCount > 0 && `${photoCount} photo${photoCount > 1 ? 's' : ''}`,
         videoCount > 0 && `${videoCount} video${videoCount > 1 ? 's' : ''}`]
          .filter(Boolean)
          .join(' · ');

  /* ------------------------- SUCCESS SCREEN ------------------------- */
  if (submitted) {
    return (
      <div className="res-success res-fade">
        <div className="res-success-icon res-pop" aria-hidden="true">
          <CheckCircle2 size={40} />
        </div>
        <p className="res-success-eyebrow">REPORT SUBMITTED</p>
        <h1 className="res-success-title">Thank you for helping improve your community.</h1>
        <p className="res-success-sub">
          Your report will be reviewed by authorized barangay personnel.
          Keep your reference number to track your report.
        </p>

        <div className="res-success-ref">
          <span className="res-success-ref-label">Reference Number</span>
          <span className="res-success-ref-value">{result?.reportNumber || 'RPT-…'}</span>
        </div>

        <div className="res-success-status">
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--res-text-3)' }}>
            Current Status:
          </span>
          <ResidentStatusBadge status="Submitted" />
        </div>

        {result?.ai && (
          <div className="res-note res-note-teal" style={{ marginTop: 16 }}>
            <ShieldCheck size={16} aria-hidden="true" />
            <span>
              AI triage suggests <strong>{result.ai.priority}</strong> priority
              ({Math.round(result.ai.confidence * 100)}% confidence).
              {result.ai.duplicateCandidates > 0 &&
                ` ${result.ai.duplicateCandidates} nearby report(s) will be checked for duplicates.`}
              A barangay reviewer makes the final decision.
            </span>
          </div>
        )}

        <div className="res-success-actions">
          <Link to="/resident/my-reports" className="res-btn res-btn-primary res-btn-lg">
            <FileText size={16} aria-hidden="true" /> Track My Report
          </Link>
          <Link to="/resident/dashboard" className="res-btn res-btn-secondary res-btn-lg">
            <LayoutDashboard size={16} aria-hidden="true" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  /* --------------------------- WIZARD --------------------------- */
  return (
    <div className="res-wizard res-fade">
      {/* Progress indicator */}
      <ol className="res-progress" aria-label={`Step ${step} of 5: ${STEPS[step - 1].label}`}>
        <span
          className="res-progress-fill"
          style={{ width: `calc((80% - 20px) * ${(step - 1) / 4})` }}
          aria-hidden="true"
        />
        {STEPS.map((s) => (
          <li
            key={s.n}
            className={`res-progress-step ${s.n === step ? 'active' : ''} ${s.n < step ? 'done' : ''}`}
            aria-current={s.n === step ? 'step' : undefined}
          >
            <span className="res-progress-dot" aria-hidden="true">
              {s.n < step ? <Check size={15} /> : s.n}
            </span>
            <span className="res-progress-label">{s.label}</span>
          </li>
        ))}
      </ol>

      <div className="res-wizard-body">
        {/* ---------------- STEP 1 — PROBLEM ---------------- */}
        {step === 1 && (
          <section aria-labelledby="wiz-1-title">
            <h2 id="wiz-1-title" className="res-wizard-title">What problem are you reporting?</h2>
            <p className="res-wizard-sub">Choose the category that best describes the issue.</p>

            <div className="res-cat-grid" role="group" aria-label="Problem category">
              {categories.map((c) => {
                const Icon = iconFor(c);
                const selected = category === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    className={`res-cat-card ${selected ? 'selected' : ''}`}
                    aria-pressed={selected}
                    onClick={() => setCategory(c.key)}
                  >
                    <span className="res-cat-icon" aria-hidden="true">
                      <Icon size={21} />
                    </span>
                    <span className="res-cat-name">{c.label}</span>
                    <span className="res-cat-hint">{c.hint}</span>
                  </button>
                );
              })}
            </div>

            {triedContinue && !category && (
              <p className="res-field-error" role="alert" style={{ marginTop: 12 }}>
                Please choose a category to continue.
              </p>
            )}
          </section>
        )}

        {/* ---------------- STEP 2 — DETAILS ---------------- */}
        {step === 2 && (
          <section aria-labelledby="wiz-2-title">
            <h2 id="wiz-2-title" className="res-wizard-title">Tell us what happened</h2>
            <p className="res-wizard-sub">
              Describe the problem. Include details that may help the barangay
              understand the situation.
            </p>

            <div className="res-field">
              <label className="res-label" htmlFor="wiz-desc">
                Description <span className="res-req" aria-hidden="true">*</span>
              </label>
              <textarea
                id="wiz-desc"
                className={`res-textarea ${triedContinue && description.trim().length < 20 ? 'invalid' : ''}`}
                placeholder="For example: Water accumulates along the road after heavy rainfall, and the drainage appears blocked…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                aria-describedby="wiz-desc-hint"
              />
              <span id="wiz-desc-hint" className="res-field-hint">
                At least 20 characters. {description.trim().length}/20
              </span>
              {triedContinue && description.trim().length < 20 && (
                <span className="res-field-error" role="alert">
                  Please describe the problem in at least 20 characters.
                </span>
              )}
            </div>

            <div className="res-form-row">
              <div className="res-field">
                <label className="res-label" htmlFor="wiz-when">
                  When did this happen?{' '}
                  <span className="res-label-optional">(optional)</span>
                </label>
                <input
                  id="wiz-when"
                  type="text"
                  className="res-input"
                  placeholder="For example: Yesterday afternoon"
                  value={when}
                  onChange={(e) => setWhen(e.target.value)}
                />
              </div>
              <div className="res-field">
                <label className="res-label" htmlFor="wiz-often">
                  How often does it occur?{' '}
                  <span className="res-label-optional">(optional)</span>
                </label>
                <select
                  id="wiz-often"
                  className="res-select"
                  value={howOften}
                  onChange={(e) => setHowOften(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>First time</option>
                  <option>Occasionally</option>
                  <option>Every rainy season</option>
                  <option>Ongoing / every day</option>
                </select>
              </div>
            </div>
          </section>
        )}

        {/* ---------------- STEP 3 — LOCATION ---------------- */}
        {step === 3 && (
          <section aria-labelledby="wiz-3-title">
            <h2 id="wiz-3-title" className="res-wizard-title">Where is the problem?</h2>
            <p className="res-wizard-sub">
              Mark the location of the problem — not your home. You can use
              your current location or tap the map.
            </p>

            <ResMap
              pin={pin}
              picking={picking}
              onPick={(lat, lng) => {
                setPin({ lat, lng });
                setPicking(false);
              }}
            />

            <div className="res-loc-actions">
              <button type="button" className="res-btn res-btn-secondary" onClick={useCurrentLocation}>
                <Crosshair size={15} aria-hidden="true" /> Use My Current Location
              </button>
              <button
                type="button"
                className={`res-btn ${picking ? 'res-btn-primary' : 'res-btn-secondary'}`}
                aria-pressed={picking}
                onClick={() => setPicking((p) => !p)}
              >
                <MapPinned size={15} aria-hidden="true" />
                {picking ? 'Now tap the map…' : 'Select Location on Map'}
              </button>
            </div>

            <div className="res-loc-fields">
              <div className="res-form-row">
                <div className="res-field">
                  <label className="res-label" htmlFor="wiz-zone">Zone</label>
                  <select
                    id="wiz-zone"
                    className="res-select"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                  >
                    {ZONES.map((z) => (
                      <option key={z}>{z}</option>
                    ))}
                  </select>
                </div>
                <div className="res-field">
                  <label className="res-label" htmlFor="wiz-loc">
                    General Location <span className="res-req" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="wiz-loc"
                    type="text"
                    className={`res-input ${triedContinue && !generalLocation.trim() ? 'invalid' : ''}`}
                    placeholder="For example: Near the chapel, along Riverside Road"
                    value={generalLocation}
                    onChange={(e) => setGeneralLocation(e.target.value)}
                  />
                  {triedContinue && !generalLocation.trim() && (
                    <span className="res-field-error" role="alert">
                      Please describe the general location.
                    </span>
                  )}
                </div>
              </div>

              <div className="res-field">
                <label className="res-label">Barangay</label>
                <input type="text" className="res-input" value="Auto-detected from your map pin" readOnly />
              </div>
            </div>

            <div className="res-note res-note-teal">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>
                Your location is used to help authorized personnel respond to
                the report. Your exact home address is never shown publicly.
              </span>
            </div>
          </section>
        )}

        {/* ---------------- STEP 4 — EVIDENCE ---------------- */}
        {step === 4 && (
          <section aria-labelledby="wiz-4-title">
            <h2 id="wiz-4-title" className="res-wizard-title">Add photos or videos</h2>
            <p className="res-wizard-sub">
              Photos can help barangay personnel understand the problem. This
              step is optional. Large photos are automatically resized before
              uploading (max 4&nbsp;MB after compression).
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={onPhotoPicked}
            />
            <div className="res-evidence-actions">
              <button type="button" className="res-evidence-btn" onClick={() => addEvidence('photo')}>
                <Camera size={24} aria-hidden="true" /> Take Photo
              </button>
              <button type="button" className="res-evidence-btn" onClick={() => addEvidence('photo')}>
                <ImagePlus size={24} aria-hidden="true" /> Upload Photo
              </button>
              <button type="button" className="res-evidence-btn" onClick={() => addEvidence('video')}>
                <Video size={24} aria-hidden="true" /> Upload Video
              </button>
            </div>

            {evidence.length > 0 ? (
              <div className="res-evidence-grid">
                {evidence.map((e) => (
                  <div key={e.id} className="res-evidence-item">
                    {e.type === 'video'
                      ? <Video size={26} aria-hidden="true" />
                      : <ImagePlus size={26} aria-hidden="true" />}
                    <span className="res-evidence-name">{e.name}</span>
                    <button
                      type="button"
                      className="res-evidence-remove"
                      onClick={() => removeEvidence(e.id)}
                      aria-label={`Remove ${e.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="res-empty">
                <span className="res-empty-icon"><ImagePlus size={22} /></span>
                <p className="res-empty-text">
                  No photos or videos yet. You can continue without them.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ---------------- STEP 5 — REVIEW ---------------- */}
        {step === 5 && (
          <section aria-labelledby="wiz-5-title">
            <h2 id="wiz-5-title" className="res-wizard-title">Review your report</h2>
            <p className="res-wizard-sub">
              Please check your report before submitting. You can edit any part.
            </p>

            <div className="res-review-block">
              <div className="res-review-head">
                <span className="res-review-label">Problem</span>
                <button type="button" className="res-review-edit" onClick={() => setStep(1)}>
                  <Pencil size={13} aria-hidden="true" /> Edit
                </button>
              </div>
              <div className="res-review-value">{categoryLabel}</div>
            </div>

            <div className="res-review-block">
              <div className="res-review-head">
                <span className="res-review-label">Description</span>
                <button type="button" className="res-review-edit" onClick={() => setStep(2)}>
                  <Pencil size={13} aria-hidden="true" /> Edit
                </button>
              </div>
              <div className="res-review-value">
                {description.trim()}
                {(when || howOften) && (
                  <span style={{ color: 'var(--res-text-3)', display: 'block', marginTop: 6, fontSize: 13 }}>
                    {when && <>When: {when}.</>} {howOften && <>Occurs: {howOften}.</>}
                  </span>
                )}
              </div>
            </div>

            <div className="res-review-block">
              <div className="res-review-head">
                <span className="res-review-label">Location</span>
                <button type="button" className="res-review-edit" onClick={() => setStep(3)}>
                  <Pencil size={13} aria-hidden="true" /> Edit
                </button>
              </div>
              <div className="res-review-value">
                {generalLocation}
                <span style={{ color: 'var(--res-text-3)', display: 'block', marginTop: 4, fontSize: 13 }}>
                  {zone} · detected from map pin
                </span>
              </div>
            </div>

            <div className="res-review-block">
              <div className="res-review-head">
                <span className="res-review-label">Evidence</span>
                <button type="button" className="res-review-edit" onClick={() => setStep(4)}>
                  <Pencil size={13} aria-hidden="true" /> Edit
                </button>
              </div>
              <div className="res-review-value">{evidenceSummary}</div>
            </div>

            <div className="res-note">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>
                By submitting, you confirm the information is true to the best
                of your knowledge. Your report will be reviewed by authorized
                barangay personnel.
              </span>
            </div>
          </section>
        )}

        {/* ---------------- WIZARD NAVIGATION ---------------- */}
        <div className="res-wizard-nav">
          {step > 1 ? (
            <button type="button" className="res-btn res-btn-ghost" onClick={goBack}>
              <ChevronLeft size={16} aria-hidden="true" /> Back
            </button>
          ) : (
            <span />
          )}

          <div className="res-wizard-nav-side">
            {step < 5 ? (
              <button type="button" className="res-btn res-btn-primary" onClick={goNext}>
                Continue <ChevronRight size={16} aria-hidden="true" />
              </button>
            ) : (
              <>
                <button type="button" className="res-btn res-btn-primary res-btn-lg" onClick={submit} disabled={submitting}>
                  <Send size={16} aria-hidden="true" /> {submitting ? 'Submitting…' : 'Submit Report'}
                </button>
                {submitError && (
                  <p className="res-field-error" role="alert" style={{ marginTop: 10, textAlign: 'right' }}>
                    {submitError}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
