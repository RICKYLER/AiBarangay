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
        <span className="pub-dl-card-tag" aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4126 13.8533 8.1 12 8.1s-3.5902.3126-5.1367.8497L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
          </svg>
        </span>
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
        <span className="pub-dl-card-tag" aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="18" viewBox="0 0 384 512" fill="currentColor">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
          </svg>
        </span>
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
          <span className="pub-dl-ref-eyebrow">Official Barangay Mobile App</span>
          <h1 className="pub-dl-ref-title">
            Take charge of your barangay<br />
            Download AI Barangay now
          </h1>

          {/* Primary Direct PWA Install CTA */}
          <div className="pub-dl-hero-cta-wrap">
            <button type="button" onClick={onInstall} className="pub-dl-primary-cta">
              <Download size={20} aria-hidden="true" />
              <span>{canInstall ? 'Install App on This Device' : 'Install AI Barangay Web App'}</span>
            </button>
            <p className="pub-dl-hero-subtag">
              <Zap size={13} aria-hidden="true" /> No App Store needed · Installs in 3 seconds · Works offline
            </p>
          </div>

          {/* Store Badges Row */}
          <div className="pub-dl-ref-badges">
            {/* Apple App Store / iOS Badge */}
            <button
              type="button"
              onClick={() => {
                document.getElementById('dl-steps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="pub-dl-store-badge"
              title="View iOS Safari installation steps"
            >
              <svg width="20" height="24" viewBox="0 0 384 512" fill="#ffffff" style={{ flexShrink: 0 }}>
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>
              <div style={{ textAlign: 'left' }}>
                <span className="pub-dl-store-badge-sub">Install on iOS</span>
                <span className="pub-dl-store-badge-title">App Store PWA</span>
              </div>
            </button>

            {/* Google Play Badge */}
            <button
              type="button"
              onClick={onInstall}
              className="pub-dl-store-badge"
              title="Install on Android devices"
            >
              <svg width="22" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M3.609 1.814C3.23 2.217 3 2.768 3 3.383v17.234c0 .615.23 1.166.609 1.569l.082.082 9.68-9.68V12.4l-9.68-9.68-.082.094z" fill="#00C3FF" />
                <path d="M17.02 15.424l-3.649-3.648v-.176l3.649-3.648.082.047 4.329 2.459c1.235.706 1.235 1.859 0 2.565l-4.329 2.459-.082-.058z" fill="#FFD400" />
                <path d="M17.102 15.366L13.371 11.6 3.609 22.186c.412.435 1.094.494 1.847.07l11.646-6.89z" fill="#FF334B" />
                <path d="M17.102 8.634L5.456 1.744c-.753-.424-1.435-.365-1.847.07L13.371 12.4l3.731-3.766z" fill="#00E676" />
              </svg>
              <div style={{ textAlign: 'left' }}>
                <span className="pub-dl-store-badge-sub">GET IT FOR</span>
                <span className="pub-dl-store-badge-title">Google Play PWA</span>
              </div>
            </button>

            {/* Direct PWA Guide Badge */}
            <button
              type="button"
              onClick={() => {
                document.getElementById('dl-steps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="pub-dl-store-badge"
              title="Step-by-step device installation guide"
            >
              <Smartphone size={22} style={{ flexShrink: 0, color: '#ffffff' }} />
              <div style={{ textAlign: 'left' }}>
                <span className="pub-dl-store-badge-sub">STEP-BY-STEP</span>
                <span className="pub-dl-store-badge-title">Device Guide</span>
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
                <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2 }}>
                  {['All', 'Flooding', 'Road Damage', 'Streetlights'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMapFilter(cat)}
                      style={{
                        fontSize: '8.5px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: mapFilter === cat ? '#135747' : '#cbd5e1',
                        background: mapFilter === cat ? '#135747' : '#ffffff',
                        color: mapFilter === cat ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                        boxShadow: mapFilter === cat ? '0 2px 5px rgba(19,87,71,0.25)' : 'none',
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
                  <div style={{ background: '#ffffff', padding: '8px 2px 6px', borderRadius: 8, textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3px' }}>
                      <PlusCircle size={12} />
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 600, color: '#334155', display: 'block' }}>Report</span>
                  </div>
                  <div style={{ background: '#ffffff', padding: '8px 2px 6px', borderRadius: 8, textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3px' }}>
                      <MapPin size={12} />
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 600, color: '#334155', display: 'block' }}>GIS Map</span>
                  </div>
                  <div style={{ background: '#ffffff', padding: '8px 2px 6px', borderRadius: 8, textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3px' }}>
                      <Zap size={12} />
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 600, color: '#334155', display: 'block' }}>AI Triage</span>
                  </div>
                  <div style={{ background: '#ffffff', padding: '8px 2px 6px', borderRadius: 8, textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3px' }}>
                      <Shield size={12} />
                    </div>
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
