'use client';

import React, { useState } from 'react';
import { Link } from '@/lib/router-shim';
import {
  Landmark, ArrowLeft, KeyRound, Mail, AlertCircle,
  CheckCircle2, Loader2, ArrowRight,
} from 'lucide-react';
import '@/styles/public.css';
import { PUBLIC_CONFIG } from '@/lib/data/publicData';

/**
 * ForgotPasswordPage — step 1 of the reset flow. The resident enters
 * the account email; the API always answers ok (it never reveals
 * whether the address has an account) and emails a one-hour reset
 * link to /reset-password?token=… when it does.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const errs = {};
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(data.errors || {});
        setNotice({ type: 'error', text: data.error || 'Something went wrong. Please try again.' });
        return;
      }
      setSent(true);
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
                {sent ? <Mail size={21} /> : <KeyRound size={21} />}
              </span>
              <h1 className="pub-auth-title">
                {sent ? 'Check your email' : 'Forgot your password?'}
              </h1>
              <p className="pub-auth-sub">
                {sent
                  ? `If an account exists for ${email.trim()}, a password reset link is on its way.`
                  : 'Enter the email address of your account and we will send you a link to choose a new password.'}
              </p>
            </div>

            <div className="pub-auth-body-form">
              {notice && (
                <div className={`pub-auth-alert ${notice.type === 'success' ? 'success' : 'error'}`} role="status">
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>{notice.text}</span>
                </div>
              )}

              {sent ? (
                <>
                  <div className="pub-auth-alert success" role="status">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>
                      <strong>Reset link sent.</strong> The link expires in 1 hour and can be
                      used only once. Don't forget to check your spam folder.
                    </span>
                  </div>

                  <div className="pub-auth-alert" style={{ background: 'var(--pub-surface-inset)', border: '1px solid var(--pub-border)', color: 'var(--pub-text-2)' }}>
                    <Mail size={16} aria-hidden="true" />
                    <span>Didn't get it? Make sure the address is correct, then request another link.</span>
                  </div>

                  <button
                    type="button"
                    className="pub-btn pub-btn-secondary pub-btn-lg"
                    style={{ width: '100%' }}
                    onClick={() => { setSent(false); setEmail(''); }}
                  >
                    Use a different email
                  </button>

                  <Link
                    to="/login"
                    className="pub-btn pub-btn-primary pub-btn-lg"
                    style={{ width: '100%', textDecoration: 'none' }}
                  >
                    Back to sign in
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="pub-field">
                    <label className="pub-label" htmlFor="forgot-email">
                      Email address <span className="pub-req" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      className={`pub-input ${errors.email ? 'invalid' : ''}`}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      autoFocus
                    />
                    {errors.email && <span className="pub-field-error" role="alert">{errors.email}</span>}
                  </div>

                  <button
                    type="submit"
                    className="pub-btn pub-btn-primary pub-btn-lg"
                    style={{ width: '100%' }}
                    disabled={submitting}
                  >
                    {submitting
                      ? <Loader2 size={16} className="pub-spin" aria-hidden="true" />
                      : <Mail size={16} aria-hidden="true" />}
                    {submitting ? 'Sending…' : 'Send reset link'}
                  </button>
                </form>
              )}
            </div>

            <div className="pub-auth-foot">
              <p>
                Remembered it after all?{' '}
                <Link to="/login" className="pub-link">Sign in</Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
