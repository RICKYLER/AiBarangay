'use client';

import React, { Suspense, useState } from 'react';
import { Link, useSearchParams } from '@/lib/router-shim';
import {
  Landmark, ArrowLeft, CheckCircle2, XCircle, MailWarning,
  Loader2, LogIn, RefreshCw,
} from 'lucide-react';
import '@/styles/public.css';
import { PUBLIC_CONFIG } from '@/lib/data/publicData';

/**
 * VerifyAccountPage — the destination of the email's "Verify My Account"
 * button. The backend verifies the token and redirects here with a status:
 * ok | expired | invalid.
 */
function VerifyAccountPageInner() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || 'ok';
  const email = searchParams.get('email') || '';

  const [resendState, setResendState] = useState('idle'); // idle | sending | sent | error
  const [resendMsg, setResendMsg] = useState('');

  const resend = async () => {
    if (resendState === 'sending' || !email) return;
    setResendState('sending');
    try {
      const res = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResendState('error');
        setResendMsg(data.error || 'Could not resend the email. Please try again.');
        return;
      }
      setResendState('sent');
      setResendMsg(`A new verification link was sent to ${email}.`);
    } catch {
      setResendState('error');
      setResendMsg('Cannot reach the server. Please try again in a moment.');
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
          <div className="pub-auth-card pub-fade" style={{ maxWidth: 460 }}>
            <div className="pub-auth-head">
              <span className="pub-auth-head-icon" aria-hidden="true">
                {status === 'ok' ? <CheckCircle2 size={21} /> : <MailWarning size={21} />}
              </span>
              <h1 className="pub-auth-title">
                {status === 'ok' ? 'Email verified' : 'Verification'}
              </h1>
              <p className="pub-auth-sub">
                {status === 'ok' && 'Your account is activated. You can now sign in and start reporting community problems.'}
                {status === 'expired' && 'Your verification link has expired (links last 24 hours). We can send you a fresh one.'}
                {status === 'invalid' && 'This verification link is not valid. It may have already been used, or the account does not need it.'}
              </p>
            </div>

            <div className="pub-auth-body-form">
              {status === 'ok' && (
                <>
                  <div className="pub-auth-alert success" role="status">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>
                      <strong>Account activated{email ? ` for ${email}` : ''}.</strong>
                    </span>
                  </div>
                  <Link
                    to="/login"
                    className="pub-btn pub-btn-primary pub-btn-lg"
                    style={{ width: '100%', textDecoration: 'none' }}
                  >
                    <LogIn size={16} aria-hidden="true" />
                    Sign in now
                  </Link>
                </>
              )}

              {(status === 'expired' || status === 'invalid') && (
                <>
                  <div className="pub-auth-alert error" role="alert">
                    {status === 'expired' ? <MailWarning size={18} aria-hidden="true" /> : <XCircle size={18} aria-hidden="true" />}
                    <span>
                      {status === 'expired'
                        ? 'The link expired. Use the resend option below if you still need to verify.'
                        : 'If you just registered, open the newest email and use its link. Otherwise, try signing in — your account may already be verified.'}
                    </span>
                  </div>

                  {email && (
                    <button
                      type="button"
                      className="pub-btn pub-btn-secondary pub-btn-lg"
                      style={{ width: '100%' }}
                      onClick={resend}
                      disabled={resendState === 'sending' || resendState === 'sent'}
                    >
                      {resendState === 'sending'
                        ? <Loader2 size={16} className="pub-spin" aria-hidden="true" />
                        : <RefreshCw size={16} aria-hidden="true" />}
                      {resendState === 'sent' ? 'New link sent' : 'Send a new verification link'}
                    </button>
                  )}

                  {resendMsg && (
                    <p
                      role={resendState === 'error' ? 'alert' : 'status'}
                      style={{
                        margin: 0, fontSize: 13,
                        color: resendState === 'error' ? 'var(--pub-danger, #B3261E)' : 'var(--pub-text-3)',
                        textAlign: 'center',
                      }}
                    >
                      {resendMsg}
                    </p>
                  )}

                  <div className="pub-row" style={{ justifyContent: 'center' }}>
                    <Link to="/login" className="pub-link">Go to sign in</Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
/* useSearchParams() requires a Suspense boundary during prerender. */
export default function VerifyAccountPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading…</div>}>
      <VerifyAccountPageInner />
    </Suspense>
  );
}
