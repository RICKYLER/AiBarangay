import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Landmark, ArrowLeft, Eye, EyeOff, LogIn,
  AlertCircle, CheckCircle2, User, ShieldCheck, Info,
} from 'lucide-react';
import '../styles/public.css';
import { PUBLIC_CONFIG } from '../data/publicData';

/**
 * Resident Login — posts to the auth API. Residents must have a
 * verified email (the link from the registration email) before they
 * can sign in. A secondary tab lets authorized barangay personnel
 * reach the operations portal.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('resident'); // 'resident' | 'official'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const errs = {};
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    /* Barangay personnel tab: demo shortcut straight to the ops portal. */
    if (role === 'official') {
      setNotice({ type: 'success', text: 'Sign-in accepted (demo). Opening the operations portal…' });
      setTimeout(() => navigate('/admin/dashboard'), 900);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({});
        setNotice({ type: 'error', text: data.error || 'Sign-in failed. Please try again.' });
        return;
      }
      setNotice({ type: 'success', text: 'Welcome back! Opening your dashboard…' });
      setTimeout(() => navigate('/resident/dashboard'), 900);
    } catch {
      setNotice({ type: 'error', text: 'Cannot reach the sign-in server. Is the API running? (npm run server)' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pub-app pub-auth">
      <a className="pub-skip-link" href="#pub-main-content">Skip to main content</a>

      {/* Minimal top bar — auth pages sit outside the main public nav */}
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
          <div className="pub-auth-card pub-fade">
            <div className="pub-auth-head">
              <span className="pub-auth-head-icon" aria-hidden="true">
                {role === 'resident' ? <User size={21} /> : <ShieldCheck size={21} />}
              </span>
              <h1 className="pub-auth-title">
                {role === 'resident' ? 'Resident Login' : 'Personnel Login'}
              </h1>
              <p className="pub-auth-sub">
                {role === 'resident'
                  ? 'Sign in to report problems and track your community reports.'
                  : 'Authorized barangay personnel access to the operations portal.'}
              </p>
            </div>

            <form className="pub-auth-body-form" onSubmit={handleSubmit} noValidate>
              {/* Role switch */}
              <div className="pub-map-filters" style={{ padding: 0, background: 'transparent', borderBottom: 'none' }} role="group" aria-label="Account type">
                <button
                  type="button"
                  className={`pub-filter-chip ${role === 'resident' ? 'on' : ''}`}
                  aria-pressed={role === 'resident'}
                  onClick={() => setRole('resident')}
                >
                  <User size={13} aria-hidden="true" /> Resident
                </button>
                <button
                  type="button"
                  className={`pub-filter-chip ${role === 'official' ? 'on' : ''}`}
                  aria-pressed={role === 'official'}
                  onClick={() => setRole('official')}
                >
                  <ShieldCheck size={13} aria-hidden="true" /> Barangay Personnel
                </button>
              </div>

              {notice && (
                <div className={`pub-auth-alert ${notice.type === 'success' ? 'success' : 'error'}`} role="status">
                  {notice.type === 'success'
                    ? <CheckCircle2 size={16} aria-hidden="true" />
                    : <AlertCircle size={16} aria-hidden="true" />}
                  <span>{notice.text}</span>
                </div>
              )}

              <div className="pub-field">
                <label className="pub-label" htmlFor="login-email">
                  Email <span className="pub-req" aria-hidden="true">*</span>
                </label>
                <input
                  id="login-email"
                  type="email"
                  className={`pub-input ${errors.email ? 'invalid' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                {errors.email && <span className="pub-field-error" role="alert">{errors.email}</span>}
              </div>

              <div className="pub-field">
                <label className="pub-label" htmlFor="login-password">
                  Password <span className="pub-req" aria-hidden="true">*</span>
                </label>
                <div className="pub-password-wrap">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`pub-input ${errors.password ? 'invalid' : ''}`}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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

              <div className="pub-row-between pub-wrap">
                <label className="pub-check">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <a href="/help" className="pub-link" style={{ fontSize: 13 }}>Forgot Password?</a>
              </div>

              <button
                type="submit"
                className="pub-btn pub-btn-primary pub-btn-lg"
                style={{ width: '100%' }}
                disabled={submitting}
              >
                <LogIn size={16} aria-hidden="true" />
                {submitting ? 'Signing in…' : 'Sign In'}
              </button>

              <div className="pub-auth-alert" style={{ background: 'var(--pub-surface-inset)', border: '1px solid var(--pub-border)', color: 'var(--pub-text-2)' }}>
                <Info size={16} aria-hidden="true" />
                <span>
                  {role === 'resident'
                    ? 'New here? Create an account — we will email you a link to verify it before your first sign-in.'
                    : 'Personnel tab is a demo shortcut — real personnel accounts are provisioned by the administrator.'}
                </span>
              </div>
            </form>

            <div className="pub-auth-foot">
              {role === 'resident' ? (
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="pub-link">Create Resident Account</Link>
                </p>
              ) : (
                <p>
                  Personnel accounts are provisioned by the LGU.{' '}
                  <Link to="/help" className="pub-link">Contact the Help Center</Link>
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
