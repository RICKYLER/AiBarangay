'use client';

import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldCheck } from 'lucide-react';
import { usePublicMap } from '@/hooks/usePublicMap';

/**
 * CommunityMapLive — the real public map: anonymized verified incident
 * points and PostGIS-computed hotspots from /api/gis/public-map.
 * No resident names, contacts, or exact descriptions — only
 * category, barangay, priority, and status.
 */

/* DB category name → pin config. Unknown categories get a neutral pin. */
const CAT = {
  flooding:       { color: '#2563eb', glow: 'rgba(37,99,235,0.5)',  emoji: '🌊', label: 'Flooding' },
  roads:          { color: '#d97706', glow: 'rgba(217,119,6,0.5)',  emoji: '🛣️', label: 'Roads' },
  garbage:        { color: '#6b7280', glow: 'rgba(107,114,128,0.5)', emoji: '🗑️', label: 'Garbage' },
  water:          { color: '#0891b2', glow: 'rgba(8,145,178,0.5)',  emoji: '💧', label: 'Water' },
  infrastructure: { color: '#7c3aed', glow: 'rgba(124,58,237,0.5)', emoji: '⚡', label: 'Infrastructure' },
  other:          { color: '#475569', glow: 'rgba(71,85,105,0.5)',  emoji: '📌', label: 'Other' },
};

function catKey(dbName) {
  const n = (dbName || '').toLowerCase();
  if (n.includes('flood')) return 'flooding';
  if (n.includes('road') || n.includes('pothole')) return 'roads';
  if (n.includes('garbage') || n.includes('waste') || n.includes('trash')) return 'garbage';
  if (n.includes('water') || n.includes('leak') || n.includes('drain')) return 'water';
  if (n.includes('street') || n.includes('light') || n.includes('infra') || n.includes('power')) return 'infrastructure';
  return 'other';
}

const STATUS_LABEL = {
  VERIFIED: 'Verified',
  ASSIGNED: 'Assigned',
  FIELD_RESPONSE: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Resolved',
  REOPENED: 'Reopened',
};

const STATUS_COLOR = {
  'Verified': '#3b82f6',
  'Assigned': '#f59e0b',
  'In Progress': '#f59e0b',
  'Resolved': '#10b981',
  'Reopened': '#ef4444',
};

function priorityLevel(p) {
  const s = (p || '').toUpperCase();
  if (s === 'CRITICAL') return 'critical';
  if (s === 'HIGH') return 'high';
  return 'standard';
}

function makePinIcon(catKey_, level, colorOverride) {
  const c = CAT[catKey_] || CAT.other;
  const color = colorOverride || c.color;
  const size = level === 'critical' ? 42 : level === 'high' ? 36 : 30;
  const pulse = level === 'critical'
    ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid ${color};opacity:0.6;animation:livePinPulse 1.6s ease-in-out infinite;"></div>`
    : '';

  const html = `
    <div style="position:relative;width:${size}px;height:${size + 8}px;cursor:pointer;">
      ${pulse}
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        border:3px solid #fff;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 4px 18px ${c.glow}, 0 2px 8px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="transform:rotate(45deg);font-size:${size * 0.42}px;line-height:1;">${c.emoji}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: '',
    html,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 10)],
  });
}

export default function CommunityMapLive() {
  const { incidents, hotspots, loading } = usePublicMap();
  const [filter, setFilter] = useState('all');

  const categories = useMemo(() => {
    const counts = new Map();
    for (const inc of incidents) {
      const k = catKey(inc.category);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, count, ...CAT[key] }));
  }, [incidents]);

  const visible = incidents.filter(
    (m) => filter === 'all' || catKey(m.category) === filter
  );

  const mapCenter = [7.4555, 125.8085]; // Tagum City
  const mapZoom = 13;

  return (
    <div className="rmap-root">
      <style>{`
        @keyframes livePinPulse {
          0%   { transform: scale(0.9); opacity: 0.7; }
          50%  { transform: scale(1.4); opacity: 0.3; }
          100% { transform: scale(0.9); opacity: 0.7; }
        }
        .rmap-root { position: relative; width: 100%; overflow: hidden; }
        .rmap-popup .leaflet-popup-content-wrapper {
          padding: 0 !important; border-radius: 14px !important; overflow: hidden;
          border: none !important; width: 270px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12) !important;
        }
        .rmap-popup .leaflet-popup-content { margin: 0 !important; width: 270px !important; }
        .rmap-popup .leaflet-popup-tip { background: #0f172a; box-shadow: none; }
        .rmap-live-card {
          background: #0f172a; color: #f1f5f9; padding: 14px 16px 16px;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .rmap-live-title { font-size: 0.95rem; font-weight: 800; color: #f8fafc; margin: 6px 0 4px; }
        .rmap-live-loc {
          font-size: 0.73rem; color: #10b981; font-weight: 600; margin-bottom: 8px;
          display: flex; align-items: center; gap: 4px;
        }
        .rmap-live-row {
          display: flex; justify-content: space-between; gap: 10px;
          font-size: 0.74rem; color: #94a3b8; padding: 3px 0;
        }
        .rmap-live-row strong { color: #e2e8f0; font-weight: 700; }
        .rmap-live-privacy {
          font-size: 0.65rem; color: #475569; margin-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px;
        }
        .rmap-live-status {
          font-size: 0.65rem; font-weight: 700; padding: 2px 7px; border-radius: 20px;
          border: 1px solid currentColor;
        }
        .rmap-live-cat {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.65rem; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.06em; padding: 3px 8px; border-radius: 5px; color: #fff;
        }
        .rmap-legend-row {
          display: flex; align-items: center; flex-wrap: wrap; gap: 10px 16px;
          padding: 10px 16px; background: #0b1120;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-size: 0.76rem; color: #94a3b8;
        }
        .rmap-legend-dot {
          width: 11px; height: 11px; border-radius: 50%;
          display: inline-block; margin-right: 5px; flex-shrink: 0;
        }
        .rmap-legend-item { display: flex; align-items: center; white-space: nowrap; }
      `}</style>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={false}
        zoomControl
        style={{ width: '100%', height: '560px' }}
        aria-label="Tagum City street map with anonymized verified incident markers"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* PostGIS-computed hotspots (ST_ClusterDBSCAN) */}
        {hotspots.map((h, i) => (
          <Circle
            key={`hs-${i}`}
            center={[h.latitude, h.longitude]}
            radius={h.radius_meters}
            pathOptions={{
              color: 'rgba(239,68,68,0.55)',
              fillColor: 'rgba(239,68,68,0.18)',
              fillOpacity: 0.5,
              weight: 1.5,
              dashArray: '6 4',
            }}
          >
            <Popup className="rmap-popup">
              <div className="rmap-live-card">
                <span className="rmap-live-cat" style={{ background: '#ef4444' }}>
                  🔥 Emerging hotspot
                </span>
                <div className="rmap-live-title">
                  {h.category ? `${h.category} cluster` : 'Multiple issues'} — {h.barangay}
                </div>
                <div className="rmap-live-row"><span>Incidents (30 days)</span><strong>{h.incident_count}</strong></div>
                {h.severity_score != null && (
                  <div className="rmap-live-row"><span>Severity score</span><strong>{Number(h.severity_score).toFixed(1)}</strong></div>
                )}
                <div className="rmap-live-privacy">🔒 Hotspots are computed from anonymized incident clusters.</div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Anonymized verified incidents */}
        {visible.map((m) => {
          const key = catKey(m.category);
          const cat = CAT[key];
          const level = priorityLevel(m.priority);
          const status = STATUS_LABEL[m.status] || m.status?.replaceAll('_', ' ') || 'Verified';
          const statusColor = STATUS_COLOR[status] || '#64748b';
          return (
            <Marker
              key={m.id}
              position={[m.latitude, m.longitude]}
              icon={makePinIcon(key, level, m.category_color)}
            >
              <Popup className="rmap-popup" maxWidth={270}>
                <div className="rmap-live-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span className="rmap-live-cat" style={{ background: m.category_color || cat.color }}>
                      {cat.emoji} {m.category || cat.label}
                    </span>
                    <span className="rmap-live-status" style={{ color: statusColor, borderColor: statusColor }}>
                      ● {status}
                    </span>
                  </div>

                  <div className="rmap-live-title">{m.incident_number}</div>

                  <div className="rmap-live-loc">
                    📍 {m.barangay || 'Tagum City'}
                  </div>

                  <div className="rmap-live-row"><span>Priority</span><strong>{m.priority || '—'}</strong></div>
                  <div className="rmap-live-row">
                    <span>Verified on</span>
                    <strong>{new Date(m.verified_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                  </div>

                  <div className="rmap-live-privacy">
                    🔒 Anonymized — resident identity protected
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend + filters */}
      <div className="rmap-legend-row">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`pub-filter-chip ${filter === 'all' ? 'on' : ''}`}
          style={{ marginRight: 4 }}
        >
          All ({incidents.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setFilter(c.key)}
            className={`pub-filter-chip ${filter === c.key ? 'on' : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            aria-pressed={filter === c.key}
          >
            <span className="rmap-legend-dot" style={{ background: c.color }} />
            {c.label} ({c.count})
          </button>
        ))}
        {hotspots.length > 0 && (
          <span className="rmap-legend-item" style={{ marginLeft: 'auto' }}>
            <span style={{
              width: 11, height: 11, borderRadius: '50%',
              border: '2px dashed #ef4444', display: 'inline-block', marginRight: 5,
            }} />
            🔥 Hotspot cluster
          </span>
        )}
      </div>

      {loading && (
        <p className="pub-map-count" style={{ padding: '10px 16px', margin: 0 }} aria-live="polite">
          Loading live incident data…
        </p>
      )}
      {!loading && incidents.length === 0 && (
        <p className="pub-map-count" style={{ padding: '10px 16px', margin: 0 }} aria-live="polite">
          <ShieldCheck size={13} style={{ verticalAlign: -2, marginRight: 5 }} aria-hidden="true" />
          No verified incidents to show yet — incidents appear here once barangay
          personnel verify resident reports.
        </p>
      )}
    </div>
  );
}
