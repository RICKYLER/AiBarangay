'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import QRCode from 'qrcode';
import {
  Download, Share, PlusSquare, Smartphone, CheckCircle2,
  ShieldCheck, Zap, Home, Expand, Bell, PlusCircle,
  FileText, Landmark, Wifi, BatteryCharging, MapPin, Search,
  MessageSquare, Shield, Check, Monitor, Signal, User, Filter, AlertTriangle
} from 'lucide-react';
import { PUBLIC_CONFIG } from '@/lib/data/publicData';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

/* Dynamically load the client-side Leaflet street map component (No SSR) */
const PhoneMap = dynamic(() => import('@/components/public/DownloadPhoneMap'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', background: '#e5efe7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
      Loading OpenStreetMap Tiles...
    </div>
  ),
});

/**
 * DownloadPage — Featuring REAL OpenStreetMap Street Map Tiles (identical to Admin & Resident Map),
 * Interactive Incident Pins, Real Smartphone Frames, Status Bars, and Resident Portal Interface.
 */
export default function DownloadPage() {
  const { canInstall, isStandalone, platform, promptInstall } = useInstallPrompt();
  const [outcome, setOutcome] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [mapFilter, setMapFilter] = useState('All');

  useEffect(() => {
    QRCode.toDataURL(`${window.location.origin}/download`, {
      width: 240,
      margin: 1,
      color: { dark: '#0E4C41', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    }).then(setQrUrl).catch(() => setQrUrl(null));
  }, []);

  const onInstall = async () => {
    if (canInstall) {
      setOutcome(await promptInstall());
    } else {
      document.getElementById('dl-steps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const androidCard = (
    <div key="android" className={`pub-dl-card${platform === 'android' ? ' is-current' : ''}`}>
      <div className="pub-dl-card-head">
        <span className="pub-dl-card-tag" aria-hidden="true">A</span>
        <div>
          <h3 className="pub-dl-card-title">Android Devices</h3>
          <p className="pub-dl-card-sub">Google Chrome, Edge, Samsung Internet</p>
        </div>
        {platform === 'android' && <span className="pub-dl-card-you">DETECTED DEVICE</span>}
      </div>
      <ol className="pub-dl-steps-list">
        <li>
          <span className="pub-dl-step-n">1</span>
          <span>Tap the <strong>Google Play / Install</strong> badge above.</span>
        </li>
        <li>
          <span className="pub-dl-step-n">2</span>
          <span>Confirm <strong>Install</strong> when prompted by your browser.</span>
        </li>
        <li>
          <span className="pub-dl-step-n">3</span>
          <span>Access <strong>AI Barangay</strong> anytime directly from your app drawer.</span>
        </li>
      </ol>
      <p className="pub-dl-card-note">
        Or open your browser menu <strong>(⋮)</strong> and select <strong>Install app</strong> or <strong>Add to Home Screen</strong>.
      </p>
    </div>
  );

  const iphoneCard = (
    <div key="ios" className={`pub-dl-card${platform === 'ios' ? ' is-current' : ''}`}>
      <div className="pub-dl-card-head">
        <span className="pub-dl-card-tag" aria-hidden="true"><Smartphone size={16} /></span>
        <div>
          <h3 className="pub-dl-card-title">iPhone &amp; iPad</h3>
          <p className="pub-dl-card-sub">Apple Safari Browser</p>
        </div>
        {platform === 'ios' && <span className="pub-dl-card-you">DETECTED DEVICE</span>}
      </div>
      <ol className="pub-dl-steps-list">
        <li>
          <span className="pub-dl-step-n">1</span>
          <span>Open this platform in <strong>Safari</strong>.</span>
        </li>
        <li>
          <span className="pub-dl-step-n">2</span>
          <span>Tap the <strong>Share</strong> button <Share size={14} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-2px' }} /> in the toolbar.</span>
        </li>
        <li>
          <span className="pub-dl-step-n">3</span>
          <span>Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare size={13} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-2px' }} />.</span>
        </li>
        <li>
          <span className="pub-dl-step-n">4</span>
          <span>Tap <strong>Add</strong> in the top right corner to save the app to your home screen.</span>
        </li>
      </ol>
      <p className="pub-dl-card-note">
        Safari creates a standalone PWA application on your iOS home screen.
      </p>
    </div>
  );

  return (
    <div className="pub-page">
      <div className="pub-container" style={{ maxWidth: '1100px' }}>

        {/* ============ CENTERED HERO UI/UX ============ */}
        <section className="pub-dl-ref-hero">
          <span className="pub-dl-ref-eyebrow">Download Now</span>
          <h1 className="pub-dl-ref-title">
            Take charge of your barangay<br />
            Download AI Barangay now
          </h1>

          {/* Store Badges Row */}
          <div className="pub-dl-ref-badges">
            {/* Apple App Store Badge */}
            <button type="button" onClick={onInstall} className="pub-dl-store-badge">
              <svg width="22" height="26" viewBox="0 0 170 170" fill="currentColor">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.9.13-9.74-1.92-14.52-6.15-3.23-2.8-7.14-7.51-11.74-14.12-6.42-9.26-11.44-19.86-15.06-31.79-3.63-11.93-5.45-23.47-5.45-34.61 0-14.86 3.65-27.18 10.95-36.96 7.3-9.78 16.71-14.77 28.23-14.97 4.9.13 10.15 1.25 15.76 3.37 5.61 2.12 9.5 3.24 11.66 3.35 1.93 0 5.96-1.18 12.09-3.56 6.13-2.38 11.39-3.46 15.77-3.26 12.33.66 22.18 5.48 29.56 14.47-11.01 6.67-16.38 15.93-16.1 27.79.28 9.38 3.93 17.15 10.95 23.3 7.02 6.15 15.42 9.77 25.21 10.87-2.61 7.7-6.24 15.34-10.89 22.92zM119.22 31.87c0-6.95 2.5-13.43 7.5-19.44 5.01-6.01 11.34-9.72 19-11.13.42 5.94-1.12 12.18-4.63 18.72-3.51 6.54-8.87 11.39-16.07 14.55-.71-.9-1.28-1.74-1.7-2.52-.71-1.34-1.1-2.48-1.1-3.41"/>
              </svg>
              <div style={{ textAlign: 'left' }}>
                <span className="pub-dl-store-badge-sub">Download on the</span>
                <span className="pub-dl-store-badge-title">App Store</span>
              </div>
            </button>

            {/* Google Play Badge */}
            <button type="button" onClick={onInstall} className="pub-dl-store-badge">
              <svg width="20" height="22" viewBox="0 0 512 512" fill="currentColor">
                <path d="M99.617 8.057a50.06 50.06 0 0 0-38.867 17.65L263.1 228.058l62.247-62.247L99.617 8.057zM38.008 45.452v421.096l195.955-195.955L38.008 45.452zM263.1 283.942L60.75 486.293a50.06 50.06 0 0 0 38.867 17.65l225.73-157.744-62.247-62.257zm40.384-40.384l71.744 71.744 88.083-61.54c15.86-11.082 15.86-39.308 0-50.39l-88.083-61.54-71.744 71.726v.004z"/>
              </svg>
              <div style={{ textAlign: 'left' }}>
                <span className="pub-dl-store-badge-sub">GET IT ON</span>
                <span className="pub-dl-store-badge-title">Google Play</span>
              </div>
            </button>

            {/* Direct PWA Badge */}
            <button
              type="button"
              onClick={onInstall}
              className="pub-dl-store-badge"
              style={{ background: '#135747', borderColor: '#10b981' }}
            >
              <Download size={22} />
              <div style={{ textAlign: 'left' }}>
                <span className="pub-dl-store-badge-sub">INSTANT WEB APP</span>
                <span className="pub-dl-store-badge-title">{canInstall ? 'Install App' : 'Guide'}</span>
              </div>
            </button>
          </div>

          {outcome === 'accepted' && (
            <p className="pub-dl-outcome ok" style={{ marginBottom: 20 }}>
              <CheckCircle2 size={16} /> App installed successfully! Check your home screen.
            </p>
          )}

          {/* ============ 3-PHONE SHOWCASE WITH REAL OPENSTREETMAP TILES ============ */}
          <div className="pub-dl-phones-container">

            {/* ================= LEFT PHONE: REAL OPENSTREETMAP STREET MAP & RESIDENT INTERACTION ================= */}
            <div className="pub-dl-phone-card phone-left">
              {/* Dynamic Island Notch */}
              <div className="pub-dl-phone-notch" />

              {/* Status Bar */}
              <div className="pub-dl-phone-statusbar">
                <span>09:41</span>
                <div className="pub-dl-phone-status-icons">
                  <Signal size={10} />
                  <span style={{ fontSize: 9 }}>5G</span>
                  <Wifi size={10} />
                  <BatteryCharging size={12} />
                </div>
              </div>

              {/* Resident Map App Toolbar */}
              <div style={{ padding: '6px 8px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#0f172a' }}>San Isidro Street Map</span>
                  <span style={{ fontSize: 8, background: '#dcfce7', color: '#16a34a', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>LIVE</span>
                </div>
                {/* Category Chips */}
                <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
                  {['All', 'Flooding', 'Road Damage', 'Streetlights'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMapFilter(cat)}
                      style={{
                        fontSize: '8px',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: mapFilter === cat ? '#135747' : '#cbd5e1',
                        background: mapFilter === cat ? '#135747' : '#ffffff',
                        color: mapFilter === cat ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* REAL OPENSTREETMAP STREET TILES CANVAS (STATIC PICTURE DISPLAY) */}
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden', pointerEvents: 'none', userSelect: 'none' }}>
                <PhoneMap activeFilter={mapFilter} />

                {/* Resident Location Picker Floating Action Bar */}
                <div style={{
                  position: 'absolute',
                  top: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 1000,
                  background: 'rgba(19, 87, 71, 0.95)',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: '8.5px',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                }}>
                  <MapPin size={10} color="#10b981" />
                  Tap map to pick incident location
                </div>
              </div>

              {/* Bottom Phone Navigation */}
              <div className="pub-dl-phone-bottom-nav">
                <div className="pub-dl-phone-nav-item">
                  <Home size={14} />
                  <span>Home</span>
                </div>
                <div className="pub-dl-phone-nav-item active">
                  <MapPin size={14} />
                  <span>Map</span>
                </div>
                <div className="pub-dl-phone-nav-fab">
                  <PlusCircle size={20} />
                </div>
                <div className="pub-dl-phone-nav-item">
                  <FileText size={14} />
                  <span>Reports</span>
                </div>
                <div className="pub-dl-phone-nav-item">
                  <User size={14} />
                  <span>Profile</span>
                </div>
              </div>
              <div className="pub-dl-phone-home-indicator" />
            </div>

            {/* ================= CENTER PHONE: MAIN RESIDENT DASHBOARD ================= */}
            <div className="pub-dl-phone-card phone-center">
              {/* Dynamic Island Notch */}
              <div className="pub-dl-phone-notch" />

              {/* Status Bar */}
              <div className="pub-dl-phone-statusbar">
                <span>09:41</span>
                <div className="pub-dl-phone-status-icons">
                  <Signal size={10} />
                  <span style={{ fontSize: 9 }}>5G</span>
                  <Wifi size={10} />
                  <BatteryCharging size={12} />
                </div>
              </div>

              {/* App Content */}
              <div style={{ flex: 1, padding: '8px 12px', background: '#f8fafc', overflow: 'hidden', textAlign: 'left' }}>
                {/* Greeting Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 9, color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>SAN ISIDRO BARANGAY</span>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Hi, Resident!</h4>
                  </div>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#135747', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={13} />
                  </div>
                </div>

                {/* Search Bar */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Search size={12} color="#94a3b8" />
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>Search reports, incidents, zones...</span>
                </div>

                {/* Quick Action Services */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
                  <div style={{ background: '#ffffff', padding: '7px 2px', borderRadius: 8, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                    <PlusCircle size={14} color="#135747" style={{ margin: '0 auto 2px' }} />
                    <span style={{ fontSize: 8, fontWeight: 600, color: '#334155', display: 'block' }}>Report</span>
                  </div>
                  <div style={{ background: '#ffffff', padding: '7px 2px', borderRadius: 8, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                    <MapPin size={14} color="#135747" style={{ margin: '0 auto 2px' }} />
                    <span style={{ fontSize: 8, fontWeight: 600, color: '#334155', display: 'block' }}>GIS Map</span>
                  </div>
                  <div style={{ background: '#ffffff', padding: '7px 2px', borderRadius: 8, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                    <Zap size={14} color="#135747" style={{ margin: '0 auto 2px' }} />
                    <span style={{ fontSize: 8, fontWeight: 600, color: '#334155', display: 'block' }}>AI Triage</span>
                  </div>
                  <div style={{ background: '#ffffff', padding: '7px 2px', borderRadius: 8, textAlign: 'center', border: '1px solid #f1f5f9' }}>
                    <Shield size={14} color="#135747" style={{ margin: '0 auto 2px' }} />
                    <span style={{ fontSize: 8, fontWeight: 600, color: '#334155', display: 'block' }}>Hotline</span>
                  </div>
                </div>

                {/* Main Banner */}
                <div style={{ background: 'linear-gradient(135deg, #135747 0%, #10b981 100%)', borderRadius: 10, padding: '10px 12px', color: '#ffffff', marginBottom: 10 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 4 }}>
                    AI DISPATCH ACTIVE
                  </span>
                  <h5 style={{ margin: '4px 0 2px', fontSize: 12, fontWeight: 700 }}>Severe Flooding Reported</h5>
                  <p style={{ margin: 0, fontSize: 9, opacity: 0.9 }}>Response team assigned to Pioneer Avenue Sector 3.</p>
                </div>

                {/* Incident Status Feed */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#0f172a' }}>Community Feed</span>
                    <span style={{ fontSize: 8, color: '#10b981', fontWeight: 600 }}>● LIVE</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d14343' }}></span>
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#1e293b' }}>Flooding on Pioneer Ave</span>
                    </div>
                    <span style={{ fontSize: 8, color: '#d14343', fontWeight: 700, marginLeft: 'auto' }}>CRITICAL</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', padding: '4px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }}></span>
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#1e293b' }}>Pothole near Magugpo</span>
                    </div>
                    <span style={{ fontSize: 8, color: '#d97706', fontWeight: 700, marginLeft: 'auto' }}>HIGH</span>
                  </div>
                </div>
              </div>

              {/* Bottom Phone Navigation */}
              <div className="pub-dl-phone-bottom-nav">
                <div className="pub-dl-phone-nav-item active">
                  <Home size={14} />
                  <span>Home</span>
                </div>
                <div className="pub-dl-phone-nav-item">
                  <MapPin size={14} />
                  <span>Map</span>
                </div>
                <div className="pub-dl-phone-nav-fab">
                  <PlusCircle size={20} />
                </div>
                <div className="pub-dl-phone-nav-item">
                  <FileText size={14} />
                  <span>Reports</span>
                </div>
                <div className="pub-dl-phone-nav-item">
                  <User size={14} />
                  <span>Profile</span>
                </div>
              </div>
              <div className="pub-dl-phone-home-indicator" />
            </div>

            {/* ================= RIGHT PHONE: RESIDENT INCIDENT DETAILS & AI CHAT ================= */}
            <div className="pub-dl-phone-card phone-right">
              {/* Dynamic Island Notch */}
              <div className="pub-dl-phone-notch" />

              {/* Status Bar */}
              <div className="pub-dl-phone-statusbar">
                <span>09:41</span>
                <div className="pub-dl-phone-status-icons">
                  <Signal size={10} />
                  <span style={{ fontSize: 9 }}>5G</span>
                  <Wifi size={10} />
                  <BatteryCharging size={12} />
                </div>
              </div>

              {/* Content Screen */}
              <div style={{ flex: 1, padding: '10px 12px', background: '#ffffff', overflow: 'hidden', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#15803d', fontWeight: 700 }}>
                    AI
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', display: 'block', lineHeight: 1.1 }}>
                      AI Triage Officer
                    </span>
                    <span style={{ fontSize: 8, color: '#16a34a', fontWeight: 600 }}>● 98% Confidence Match</span>
                  </div>
                </div>

                {/* Report Details Card */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                    <span>Report #INC-2026-089</span>
                    <span style={{ color: '#d14343' }}>CRITICAL</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 9, color: '#475569' }}>
                    Chest-deep flood waters along Pioneer Avenue. Emergency response requested.
                  </p>
                </div>

                {/* Chat Stream */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 9 }}>
                  <div style={{ background: '#f1f5f9', padding: '6px 8px', borderRadius: '8px 8px 8px 2px', color: '#334155' }}>
                    Report received. AI classified priority as CRITICAL.
                  </div>
                  <div style={{ background: '#dcfce7', padding: '6px 8px', borderRadius: '8px 8px 2px 8px', color: '#14532d', alignSelf: 'flex-end' }}>
                    Thank you! Is the barangay rescue team dispatched?
                  </div>
                  <div style={{ background: '#f1f5f9', padding: '6px 8px', borderRadius: '8px 8px 8px 2px', color: '#334155' }}>
                    Yes, San Isidro Sector 3 officers are en route.
                  </div>
                </div>
              </div>

              {/* Bottom Phone Navigation */}
              <div className="pub-dl-phone-bottom-nav">
                <div className="pub-dl-phone-nav-item">
                  <Home size={14} />
                  <span>Home</span>
                </div>
                <div className="pub-dl-phone-nav-item">
                  <MapPin size={14} />
                  <span>Map</span>
                </div>
                <div className="pub-dl-phone-nav-fab">
                  <PlusCircle size={20} />
                </div>
                <div className="pub-dl-phone-nav-item active">
                  <FileText size={14} />
                  <span>Reports</span>
                </div>
                <div className="pub-dl-phone-nav-item">
                  <User size={14} />
                  <span>Profile</span>
                </div>
              </div>
              <div className="pub-dl-phone-home-indicator" />
            </div>

          </div>
        </section>

        {/* ============ DESKTOP QR CODE SCANNER ============ */}
        <div className="pub-dl-qr" style={{ marginTop: 20 }}>
          <div className="pub-dl-qr-box">
            {qrUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={qrUrl} alt="QR Code to scan and open app on mobile" width={150} height={150} />
            ) : (
              <span className="pub-dl-qr-placeholder" style={{ width: 150, height: 150 }} />
            )}
          </div>
          <div className="pub-dl-qr-copy">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#135747', marginBottom: 4 }}>
              <Monitor size={18} />
              <span style={{ fontFamily: 'var(--pub-font-mono)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Desktop Scanner</span>
            </div>
            <h2 className="pub-dl-qr-title">Viewing on a desktop computer?</h2>
            <p className="pub-dl-qr-text">
              Scan this QR code with your smartphone camera to open this app directly on your mobile device, then follow the quick installation prompt.
            </p>
          </div>
        </div>

        {/* ============ INSTALL STEPS ============ */}
        <section id="dl-steps" className="pub-dl-steps" aria-label="Installation Instructions">
          <h2 className="pub-dl-steps-title">Installation Guide by Platform</h2>
          <div className="pub-dl-steps-grid">
            {platform === 'ios' ? [iphoneCard, androidCard] : [androidCard, iphoneCard]}
          </div>
        </section>

      </div>
    </div>
  );
}
