'use client';

import React, { Suspense, useState } from 'react';
import { Link, useNavigate, useSearchParams } from '@/lib/router-shim';
import {
  Landmark, ArrowLeft, KeyRound, Eye, EyeOff, AlertCircle,
  CheckCircle2, Loader2, ShieldCheck, LogIn,
} from 'lucide-react';
import '@/styles/public.css';
import { PUBLIC_CONFIG } from '@/lib/data/publicData';

/**
 * ResetPasswordPage — step 2 of the reset flow. The email link lands
 * here with ?token=…; the user picks a new password. On success all
 * of that account's sessions are revoked server-side and the user is
 * sent to the sign-in page.
 */
function ResetPasswordPageInner() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const rules = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One number or symbol', ok: /[0-9[^A-Za-z]]/.test(password) },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || done) return;
    const errs = {};
    if (!token) errs.token = 'This page needs to be opened from the reset link in your email.';
    if (!password) errs.password = 'A new password is required.';
    else if (password.length < 8) errs.password = 'The new password must be at least 8 characters.';
    if (!confirm) errs.confirm = 'Please repeat the new password.';
    else if (password !== confirm) errs.confirm = 'The two passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({});
        setNotice({ type: 'error', text: data.error || 'The reset failed. Please request a new link.' });
        return;
      }
      setDone(true);
      setNotice(null);
      setTimeout(() => navigate('/login'), 2600);
    } catch {
      setNotice({ type: 'error', text: 'Cannot reach the server. Please try again in a moment.' });
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
          <Link to="/login" className="pub-auth-back">
            <ArrowLeft size={15} aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </div>

      <div className="pub-auth-body">
        <main id="pub-main-content">
          <div className="pub-auth-card pub-fade" style={{ maxWidth: 460 }}>
            <div className="pub-auth-head">
              <span className="pub-auth-head-icon" aria-hidden="true">
                {done ? <ShieldCheck size={21} /> : <KeyRound size={21} />}
              </span>
              <h1 className="pub-auth-title">
                {done ? 'Password updated' : 'Choose a new password'}
              </h1>
              <p className="pub-auth-sub">
                {done
                  ? 'Your password has been changed and all other devices were signed out. Taking you to the sign-in page…'
                  : 'Pick a strong new password for your account. The reset link works only once.'}
              </p>
            </div>

            <div className="pub-auth-body-form">
              {notice && (
                <div className="pub-auth-alert error" role="alert">
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>{notice.text}</span>
                </div>
              )}

              {notice?.type === 'error' && notice.text.includes('reset link') && (
                <Link
                  to="/forgot-password"
                  className="pub-btn pub-btn-secondary pub-btn-lg"
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  Request a new reset link
                </Link>
              )}

              {done ? (
                <Link
                  to="/login"
                  className="pub-btn pub-btn-primary pub-btn-lg"
                  style={{ width: '100%', textDecoration: 'none' }}
                >
                  <LogIn size={16} aria-hidden="true" />
                  Sign in with your new password
                </Link>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {!token && (
                    <div className="pub-auth-alert error" role="alert">
                      <AlertCircle size={16} aria-hidden="true" />
                      <span>
                        This page is missing its reset token. Please open it from the
                        link in your email, or request a new one.
                      </span>
                    </div>
                  )}

                  <div className="pub-field">
                    <label className="pub-label" htmlFor="reset-password">
                      New password <span className="pub-req" aria-hidden="true">*</span>
                    </label>
                    <div className="pub-password-wrap">
                      <input
                        id="reset-password"
                        type={showPassword ? 'text' : 'password'}
                        className={`pub-input ${errors.password ? 'invalid' : ''}`}
                        placeholder="Your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        autoFocus
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

                  {/* Live strength checklist */}
                  {password && (
                    <ul style={{ listStyle: 'none', margin: '0 0 14px', padding: 0, display: 'grid', gap: 4 }}>
                      {rules.map((r) => (
                        <li key={r.label} style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          fontSize: 12.5, color: r.ok ? 'var(--pub-ok, #1B7A43)' : 'var(--pub-text-3)',
                        }}>
                          <CheckCircle2 size={13} aria-hidden="true"
                            style={{ opacity: r.ok ? 1 : 0.3, flexShrink: 0 }} />
                          {r.label}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="pub-field">
                    <label className="pub-label" htmlFor="reset-confirm">
                      Confirm new password <span className="pub-req" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="reset-confirm"
                      type={showPassword ? 'text' : 'password'}
                      className={`pub-input ${errors.confirm ? 'invalid' : ''}`}
                      placeholder="Repeat your new password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    {errors.confirm && <span className="pub-field-error" role="alert">{errors.confirm}</span>}
                  </div>

                  <button
                    type="submit"
                    className="pub-btn pub-btn-primary pub-btn-lg"
                    style={{ width: '100%' }}
                    disabled={submitting || !token}
                  >
                    {submitting
                      ? <Loader2 size={16} className="pub-spin" aria-hidden="true" />
                      : <KeyRound size={16} aria-hidden="true" />}
                    {submitting ? 'Saving…' : 'Set new password'}
                  </button>
                </form>
              )}
            </div>

            <div className="pub-auth-foot">
              <p>
                Didn't request a reset?{' '}
                <Link to="/login" className="pub-link">Sign in as usual</Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* useSearchParams() requires a Suspense boundary during prerender. */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading…</div>}>
      <ResetPasswordPageInner />
    </Suspense>
  );
}
