'use client';

import React, { useState } from 'react';
import { Link } from '@/lib/router-shim';
import {
  Landmark, ArrowLeft, Eye, EyeOff,
  CheckCircle2, UserPlus, ShieldCheck, MailWarning, Loader2,
} from 'lucide-react';
import '@/styles/public.css';
import { PUBLIC_CONFIG } from '@/lib/data/publicData';
import { TAGUM_BARANGAYS } from '@/lib/data/tagumBarangays';

const ZONE_OPTIONS = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6', 'Zone 7'];

/**
 * Create Resident Account — posts to the auth API, which emails a
 * verification link the user must click before signing in.
 */
export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    barangay: TAGUM_BARANGAYS[12], // Barangay Magugpo South
    zone: ZONE_OPTIONS[0],
  });
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setServerError(null);
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required.';
    if (!form.email.trim()) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Please enter a valid email address.';
    if (!form.mobile.trim()) errs.mobile = 'Mobile number is required.';
    if (!form.password || form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match.';
    if (!form.barangay) errs.barangay = 'Please select your barangay.';
    if (!agree) errs.agree = 'You must agree to the privacy notice to continue.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          mobile: form.mobile,
          barangay: form.barangay,
          zone: form.zone,
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data.error || 'Registration failed. Please try again.');
        return;
      }
      setSuccess(true);
    } catch {
      setServerError('Cannot reach the registration server. Is the API running? (npm run server)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pub-app pub-auth">
      <a className="pub-skip-link" href="#pub-main-content">Skip to main content</a>

      <div className="pub-auth-topbar">
        <div className="pub-container pub-auth-topbar-inner">
          <Link to="/" className="pub-brand" aria-label="Back to the public website">
            <span className="pub-brand-mark" aria-hidden="true"><Landmark size={19} /></span>
            <span className="pub-brand-text">
              <span className="pub-brand-title">AI BARANGAY PROBLEM MAPPER</span>
              <span className="pub-brand-sub">{PUBLIC_CONFIG.lgu.name}</span>
            </span>
          </Link>
          <Link to="/" className="pub-auth-back">
            <ArrowLeft size={15} aria-hidden="true" />
            Back to public website
          </Link>
        </div>
      </div>

      <div className="pub-auth-body">
        <main id="pub-main-content">
          <div className="pub-auth-card wide pub-fade">
            <div className="pub-auth-head">
              <span className="pub-auth-head-icon" aria-hidden="true">
                <UserPlus size={21} />
              </span>
              <h1 className="pub-auth-title">Create Resident Account</h1>
              <p className="pub-auth-sub">
                Register to report community problems and track their progress.
                Only authorized barangay personnel can see your personal details.
              </p>
            </div>

            {success ? (
              <div className="pub-auth-body-form" role="status">
                <div className="pub-auth-alert success">
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>
                    <strong>Almost done!</strong> We sent a verification link to{' '}
                    <strong>{form.email}</strong>. Open that email and click
                    <strong> "Verify My Account"</strong> to activate your account, then sign in.
                    <span style={{ display: 'block', marginTop: 6, fontSize: 12.5 }}>
                      The link expires in 24 hours. Remember to check your spam folder.
                    </span>
                  </span>
                </div>
                <div className="pub-row" style={{ justifyContent: 'center', marginTop: 14 }}>
                  <Link to="/login" className="pub-link">Go to sign in</Link>
                </div>
              </div>
            ) : (
              <form className="pub-auth-body-form" onSubmit={handleSubmit} noValidate>
                {serverError && (
                  <div className="pub-auth-alert error" role="alert" style={{ marginBottom: 16 }}>
                    <MailWarning size={18} aria-hidden="true" />
                    <span>{serverError}</span>
                  </div>
                )}
                <div className="pub-grid-2">
                  <div className="pub-field">
                    <label className="pub-label" htmlFor="reg-name">
                      Full Name <span className="pub-req" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      className={`pub-input ${errors.fullName ? 'invalid' : ''}`}
                      placeholder="Juan D. Dela Cruz"
                      value={form.fullName}
                      onChange={set('fullName')}
                      autoComplete="name"
                      required
                    />
                    {errors.fullName && <span className="pub-field-error" role="alert">{errors.fullName}</span>}
                  </div>

                  <div className="pub-field">
                    <label className="pub-label" htmlFor="reg-email">
                      Email <span className="pub-req" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      className={`pub-input ${errors.email ? 'invalid' : ''}`}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set('email')}
                      autoComplete="email"
                      required
                    />
                    {errors.email && <span className="pub-field-error" role="alert">{errors.email}</span>}
                  </div>

                  <div className="pub-field">
                    <label className="pub-label" htmlFor="reg-mobile">
                      Mobile Number <span className="pub-req" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="reg-mobile"
                      type="tel"
                      className={`pub-input ${errors.mobile ? 'invalid' : ''}`}
                      placeholder="09XX XXX XXXX"
                      value={form.mobile}
                      onChange={set('mobile')}
                      autoComplete="tel"
                      required
                    />
                    {errors.mobile && <span className="pub-field-error" role="alert">{errors.mobile}</span>}
                  </div>

                  <div className="pub-field">
                    <label className="pub-label" htmlFor="reg-barangay">
                      Barangay <span className="pub-req" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="reg-barangay"
                      className={`pub-input pub-select ${errors.barangay ? 'invalid' : ''}`}
                      value={form.barangay}
                      onChange={set('barangay')}
                      required
                    >
                      {TAGUM_BARANGAYS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {errors.barangay && <span className="pub-field-error" role="alert">{errors.barangay}</span>}
                  </div>

                  <div className="pub-field">
                    <label className="pub-label" htmlFor="reg-zone">Zone</label>
                    <select
                      id="reg-zone"
                      className="pub-input pub-select"
                      value={form.zone}
                      onChange={set('zone')}
                    >
                      {ZONE_OPTIONS.map((z) => <option key={z} value={z}>{z}</option>)}
                    </select>
                    <span className="pub-field-hint">Your zone helps route reports to the right personnel.</span>
                  </div>

                  <div className="pub-field">
                    <label className="pub-label" htmlFor="reg-password">
                      Password <span className="pub-req" aria-hidden="true">*</span>
                    </label>
                    <div className="pub-password-wrap">
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        className={`pub-input ${errors.password ? 'invalid' : ''}`}
                        placeholder="At least 8 characters"
                        value={form.password}
                        onChange={set('password')}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="pub-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.password && <span className="pub-field-error" role="alert">{errors.password}</span>}
                  </div>

                  <div className="pub-field" style={{ gridColumn: '1 / -1' }}>
                    <label className="pub-label" htmlFor="reg-confirm">
                      Confirm Password <span className="pub-req" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="reg-confirm"
                      type={showPassword ? 'text' : 'password'}
                      className={`pub-input ${errors.confirmPassword ? 'invalid' : ''}`}
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={set('confirmPassword')}
                      autoComplete="new-password"
                      required
                    />
                    {errors.confirmPassword && <span className="pub-field-error" role="alert">{errors.confirmPassword}</span>}
                  </div>
                </div>

                <div>
                  <label className="pub-check">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      aria-describedby="reg-agree-error"
                    />
                    <span>
                      I agree that my report details and contact information will be
                      processed by {PUBLIC_CONFIG.lgu.name} to handle my community
                      reports, in accordance with the{' '}
                      <a href="/help#privacy" className="pub-link">Privacy Notice</a> and{' '}
                      <a href="/help#terms" className="pub-link">Terms of Use</a>.
                    </span>
                  </label>
                  {errors.agree && (
                    <span className="pub-field-error" id="reg-agree-error" role="alert" style={{ display: 'block', marginTop: 6 }}>
                      {errors.agree}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="pub-btn pub-btn-primary pub-btn-lg"
                  style={{ width: '100%' }}
                  disabled={submitting}
                >
                  {submitting
                    ? <Loader2 size={16} className="pub-spin" aria-hidden="true" />
                    : <UserPlus size={16} aria-hidden="true" />}
                  {submitting ? 'Creating account…' : 'Create Account'}
                </button>

                <div className="pub-row" style={{ gap: 7, justifyContent: 'center', flexWrap: 'wrap', fontSize: 12.5, color: 'var(--pub-text-3)' }}>
                  <ShieldCheck size={14} aria-hidden="true" />
                  Your details stay private. Only authorized barangay personnel can see them.
                </div>
              </form>
            )}

            <div className="pub-auth-foot">
              <p>
                Already have an account? <Link to="/login" className="pub-link">Sign in</Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}