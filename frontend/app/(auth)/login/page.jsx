'use client';

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from '@/lib/router-shim';
import {
  Landmark, ArrowLeft, ArrowRight, Eye, EyeOff,
  AlertCircle, CheckCircle2,
} from 'lucide-react';
import '@/styles/public.css';
import { PUBLIC_CONFIG } from '@/lib/data/publicData';
import { useAuth, homeForRole } from '@/hooks/useAuth';

/* The aside's numbered process — pure typography, no icons or boxes. */
const ASIDE_STEPS = [
  { n: '01', title: 'Report it', text: 'Drop a pin, add a photo, send.' },
  { n: '02', title: 'Barangay reviews', text: 'Staff verify every report.' },
  { n: '03', title: 'Follow it', text: 'Track status until it’s resolved.' },
];

/**
 * Login — split-screen entry, one door for everyone.
 *
 * Left: a typography-led civic panel (editorial poster style) —
 * headline, a live verified-report count as display typography, and
 * the report→review→track process as a numbered list. The wordmark
 * is the only non-text mark. Right: the sign-in form. There is no
 * resident/personnel selector: the account's own role decides the
 * portal after sign-in (residents → resident dashboard, staff →
 * operations portal), so nobody has to declare who they are.
 *
 * Residents must have a verified email (the link from the
 * registration email) before they can sign in.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [publicCount, setPublicCount] = useState(null);

  /* Live civic proof: how many verified incidents are published on
     the anonymous public map right now. Fails silently — the panel
     works without it. */
  useEffect(() => {
    fetch('/api/gis/public-map')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.incidents)) setPublicCount(data.incidents.length);
      })
      .catch(() => {});
  }, []);

  /* Already signed in (e.g. a new tab landed here) — the session cookie
     is still valid, so skip the form and go straight to the portal. */
  useEffect(() => {
    if (!loading && user) navigate(homeForRole(user.role), { replace: true });
  }, [loading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const errs = {};
    if (!email.trim()) errs.email = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const user = await login(email, password);

      /* The account's own role decides the portal — residents land on
         the resident dashboard, staff on the operations portal. */
      const staff = !['RESIDENT'].includes(user.role);
      setNotice({
        type: 'success',
        text: staff
          ? 'Personnel account detected — opening the operations portal…'
          : `Welcome back, ${user.firstName}! Opening your resident dashboard…`,
      });
      setTimeout(() => navigate(homeForRole(user.role)), 900);
    } catch (err) {
      setErrors({});
      setNotice({ type: 'error', text: err.message || 'Sign-in failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pub-app pub-login">
      <a className="pub-skip-link" href="#pub-main-content">Skip to main content</a>

      <div className="pub-login-shell">

        {/* ---- Left · civic context panel ---- */}
        <aside className="pub-login-aside">
          <div className="pub-login-aside-top">
            <Link to="/" className="pub-login-brand" aria-label="AI Barangay Problem Mapper — back to the public website">
              <span className="pub-login-brand-mark" aria-hidden="true"><Landmark size={18} /></span>
              <span className="pub-login-brand-text">
                <span className="pub-login-brand-title">AI Barangay</span>
                <span className="pub-login-brand-sub">Problem Mapper</span>
              </span>
            </Link>
          </div>

          <div className="pub-login-aside-main">
            <p className="pub-login-kicker">
              Public services portal · {PUBLIC_CONFIG.lgu.municipality}
            </p>
            <h2 className="pub-login-headline">
              See a problem in your barangay?
              <span className="pub-login-headline-em">Report it — and follow it until it&rsquo;s fixed.</span>
            </h2>
            {publicCount != null && (
              <div className="pub-login-hero-stat">
                <span className="pub-login-hero-stat-num">{publicCount.toLocaleString()}</span>
                <span className="pub-login-hero-stat-label">
                  incident report{publicCount === 1 ? '' : 's'} verified and published to the community map
                </span>
              </div>
            )}
          </div>

          <div className="pub-login-aside-foot">
            <ol className="pub-login-steps">
              {ASIDE_STEPS.map((s) => (
                <li key={s.n}>
                  <span className="pub-login-step-n">{s.n}</span>
                  <span className="pub-login-step-body">
                    <span className="pub-login-step-t">{s.title}</span>
                    <span className="pub-login-step-x">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* ---- Right · sign-in ---- */}
        <main id="pub-main-content" className="pub-login-main">
          <div className="pub-login-main-top">
            <Link to="/" className="pub-login-back">
              <ArrowLeft size={15} aria-hidden="true" />
              Back to public website
            </Link>
          </div>

          <div className="pub-login-formwrap pub-fade">
            <header className="pub-login-head">
              <p className="pub-login-form-kicker">Sign in</p>
              <h1 className="pub-login-title">Welcome back</h1>
              <p className="pub-login-sub">
                One sign-in for everyone — residents and barangay personnel.
                Your account opens the right portal automatically.
              </p>
            </header>

            <form className="pub-login-form" onSubmit={handleSubmit} noValidate>
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
                  Email address <span className="pub-req" aria-hidden="true">*</span>
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
                  Keep me signed in
                </label>
                <Link to="/forgot-password" className="pub-login-link">Forgot password?</Link>
              </div>

              <button
                type="submit"
                className="pub-login-submit"
                disabled={submitting}
              >
                {submitting ? 'Signing in…' : 'Sign in'}
                <ArrowRight size={16} aria-hidden="true" />
              </button>

              <p className="pub-login-alt">
                New to the platform?{' '}
                <Link to="/register" className="pub-login-link">Create a resident account</Link>
              </p>
            </form>
          </div>

          <p className="pub-login-legal">
            {PUBLIC_CONFIG.lgu.name} · {PUBLIC_CONFIG.lgu.municipality}
            <span className="pub-login-legal-sep" aria-hidden="true">·</span>
            For urgent hazards, call {PUBLIC_CONFIG.lgu.phone}
          </p>
        </main>
      </div>
    </div>
  );
}
