import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Real GPS markers with actual problem photos ──────────────────────────────
const REAL_GEO_MARKERS = [
  {
    id: 'm01',
    category: 'flooding',
    level: 'critical',
    lat: 7.4475,
    lng: 125.8055,
    title: 'Severe Urban Flooding',
    location: 'Pioneer Avenue Junction',
    barangay: 'Barangay Magugpo Poblacion',
    description: 'Flash flood accumulation near Tagum Public Market. Stormwater culvert blocked by debris.',
    image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    status: 'In Progress',
    upvotes: 54,
    reported: '2 hours ago',
  },
  {
    id: 'm02',
    category: 'flooding',
    level: 'high',
    lat: 7.4710,
    lng: 125.7950,
    title: 'Canal Overflow & Stagnant Water',
    location: 'La Filipina Bypass Road',
    barangay: 'Barangay La Filipina',
    description: 'Clogged open canal causing dengue risk. Overgrown weeds and soil collapse.',
    image: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=600&q=80',
    status: 'Pending',
    upvotes: 35,
    reported: '5 hours ago',
  },
  {
    id: 'm03',
    category: 'roads',
    level: 'high',
    lat: 7.4460,
    lng: 125.8030,
    title: 'Deep Pothole & Road Depression',
    location: 'Osmeña St / Bonifacio St Corner',
    barangay: 'Barangay Magugpo Poblacion',
    description: 'Deep road depression spanning 1.4m. High hazard for tricycles at night.',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    status: 'Pending',
    upvotes: 41,
    reported: '4 hours ago',
  },
  {
    id: 'm04',
    category: 'roads',
    level: 'high',
    lat: 7.4580,
    lng: 125.8010,
    title: 'Multiple Potholes on Access Road',
    location: 'JV Ayala Ave / New City Hall',
    barangay: 'Barangay Mankilam',
    description: 'Multiple pothole clusters along City Hall entrance. Risk for government vehicles.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    status: 'Pending',
    upvotes: 39,
    reported: '6 hours ago',
  },
  {
    id: 'm05',
    category: 'roads',
    level: 'critical',
    lat: 7.4680,
    lng: 125.8350,
    title: 'Highway Mud & Soil Erosion',
    location: 'Tagum-Mabini Provincial Road',
    barangay: 'Barangay Canocotan',
    description: 'Topsoil erosion after heavy rains. Motorcyclists reporting lost traction.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    status: 'In Progress',
    upvotes: 49,
    reported: '3 hours ago',
  },
  {
    id: 'm06',
    category: 'garbage',
    level: 'high',
    lat: 7.4425,
    lng: 125.8020,
    title: 'Uncollected Commercial Waste',
    location: 'Sobrecarey St / UM College',
    barangay: 'Barangay Magugpo South',
    description: 'Accumulated waste along sidewalk. Foul odor and health hazard for students.',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80',
    status: 'Resolved',
    upvotes: 33,
    reported: 'Yesterday',
  },
  {
    id: 'm07',
    category: 'garbage',
    level: 'standard',
    lat: 7.4395,
    lng: 125.8152,
    title: 'Illegal Commercial Waste Dumping',
    location: 'Sobrecarey St / Gaisano Mall',
    barangay: 'Barangay Visayan Village',
    description: 'Illegal dumping of plastic crates along mall access road. CENRO violation.',
    image: 'https://images.unsplash.com/photo-1611284446314-60a55ac7de9f?auto=format&fit=crop&w=600&q=80',
    status: 'In Progress',
    upvotes: 45,
    reported: 'Yesterday',
  },
  {
    id: 'm08',
    category: 'water',
    level: 'critical',
    lat: 7.4465,
    lng: 125.8060,
    title: 'Burst Main Water Pipe',
    location: 'Quezon St / Pioneer Corridor',
    barangay: 'Barangay Magugpo North',
    description: 'High-pressure pipe fracture gushing onto street. Water pressure drop across zone.',
    image: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
    status: 'In Progress',
    upvotes: 72,
    reported: '1 hour ago',
  },
  {
    id: 'm09',
    category: 'infrastructure',
    level: 'high',
    lat: 7.4440,
    lng: 125.8115,
    title: 'Damaged Solar Streetlamps',
    location: 'Apokon Road / Tagum Flyover',
    barangay: 'Barangay Apokon',
    description: 'Four LED streetlights out. Creates blind spots on ambulance route to DRMC.',
    image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80',
    status: 'In Progress',
    upvotes: 28,
    reported: '8 hours ago',
  },
  {
    id: 'm10',
    category: 'infrastructure',
    level: 'critical',
    lat: 7.4435,
    lng: 125.8040,
    title: 'Fallen Tree on Power Wires',
    location: 'Lapu-Lapu St / Osmeña Ext',
    barangay: 'Barangay Magugpo West',
    description: 'Large branch resting on distribution wires. Sparking observed. Fire risk.',
    image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80',
    status: 'In Progress',
    upvotes: 61,
    reported: '30 mins ago',
  },
];

// ─── Category config ──────────────────────────────────────────────────────────
const CAT = {
  flooding:       { color: '#2563eb', glow: 'rgba(37,99,235,0.5)',  emoji: '🌊', label: 'Flooding' },
  roads:          { color: '#d97706', glow: 'rgba(217,119,6,0.5)',  emoji: '🛣️', label: 'Roads' },
  garbage:        { color: '#6b7280', glow: 'rgba(107,114,128,0.5)', emoji: '🗑️', label: 'Garbage' },
  water:          { color: '#0891b2', glow: 'rgba(8,145,178,0.5)',  emoji: '💧', label: 'Water' },
  infrastructure: { color: '#7c3aed', glow: 'rgba(124,58,237,0.5)', emoji: '⚡', label: 'Infrastructure' },
};

const STATUS_COLOR = {
  'In Progress': '#f59e0b',
  'Pending':     '#ef4444',
  'Resolved':    '#10b981',
};

// ─── Build custom drop-pin div icon ──────────────────────────────────────────
function makePinIcon(cat, level) {
  const c = CAT[cat];
  const size = level === 'critical' ? 42 : level === 'high' ? 36 : 30;
  const pulse = level === 'critical'
    ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid ${c.color};opacity:0.6;animation:pinPulse 1.6s ease-in-out infinite;"></div>`
    : '';

  const html = `
    <div style="position:relative;width:${size}px;height:${size + 8}px;cursor:pointer;">
      ${pulse}
      <div style="
        width:${size}px;height:${size}px;
        background:${c.color};
        border:3px solid #fff;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 4px 18px ${c.glow}, 0 2px 8px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        transition:transform 0.2s;
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

// ─── Map recenter helper ──────────────────────────────────────────────────────
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView(center, zoom); }, [center, zoom, map]);
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MapMockup({ filter = 'all', legend = true, labeled = false, expanded = false }) {
  const [upvotes, setUpvotes] = useState(() =>
    Object.fromEntries(REAL_GEO_MARKERS.map(m => [m.id, m.upvotes]))
  );

  const visibleMarkers = REAL_GEO_MARKERS.filter(
    m => filter === 'all' || m.category === filter
  );

  const mapCenter = [7.4555, 125.8085]; // slightly wider center for Tagum City
  const mapZoom = 14;
  const mapHeight = expanded ? '560px' : '440px';

  const handleUpvote = (id) => {
    setUpvotes(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  return (
    <div className="rmap-root">
      {/* ── Inject CSS + Leaflet pulse keyframes ── */}
      <style>{`
        @keyframes pinPulse {
          0%   { transform: scale(0.9); opacity: 0.7; }
          50%  { transform: scale(1.4); opacity: 0.3; }
          100% { transform: scale(0.9); opacity: 0.7; }
        }

        .rmap-root {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 0;
        }

        /* ── Rich popup card styles ── */
        .rmap-popup .leaflet-popup-content-wrapper {
          padding: 0 !important;
          border-radius: 14px !important;
          overflow: hidden;
          border: none !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12) !important;
          width: 270px !important;
        }

        .rmap-popup .leaflet-popup-content {
          margin: 0 !important;
          width: 270px !important;
        }

        .rmap-popup .leaflet-popup-tip-container {
          width: 30px;
          height: 15px;
        }

        .rmap-popup .leaflet-popup-tip {
          background: #0f172a;
          box-shadow: none;
        }

        .rmap-popup .leaflet-popup-close-button {
          color: #fff !important;
          font-size: 18px !important;
          top: 8px !important;
          right: 8px !important;
          background: rgba(0,0,0,0.3) !important;
          border-radius: 50% !important;
          width: 24px !important;
          height: 24px !important;
          line-height: 24px !important;
          text-align: center !important;
          z-index: 10 !important;
        }

        .rmap-card {
          display: flex;
          flex-direction: column;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .rmap-card-img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          display: block;
        }

        .rmap-card-body {
          background: #0f172a;
          color: #f1f5f9;
          padding: 12px 14px 14px;
        }

        .rmap-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .rmap-cat-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 3px 8px;
          border-radius: 5px;
          color: #fff;
        }

        .rmap-status-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 20px;
          border: 1px solid currentColor;
        }

        .rmap-card-title {
          font-size: 0.92rem;
          font-weight: 800;
          color: #f8fafc;
          margin-bottom: 4px;
          line-height: 1.25;
        }

        .rmap-card-loc {
          font-size: 0.73rem;
          color: #10b981;
          font-weight: 600;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .rmap-card-desc {
          font-size: 0.76rem;
          color: #94a3b8;
          line-height: 1.4;
          margin-bottom: 10px;
        }

        .rmap-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 8px;
        }

        .rmap-upvote-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.3);
          color: #10b981;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .rmap-upvote-btn:hover {
          background: rgba(16,185,129,0.25);
        }

        .rmap-time {
          font-size: 0.68rem;
          color: #64748b;
        }

        .rmap-privacy-row {
          font-size: 0.65rem;
          color: #475569;
          margin-top: 6px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Legend row */
        .rmap-legend-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px 16px;
          padding: 10px 16px;
          background: #0b1120;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-size: 0.76rem;
          color: #94a3b8;
        }

        .rmap-legend-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 5px;
          flex-shrink: 0;
        }

        .rmap-legend-item {
          display: flex;
          align-items: center;
          white-space: nowrap;
        }

        .rmap-legend-critical {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-left: auto;
          font-size: 0.72rem;
          color: #f59e0b;
          font-weight: 600;
        }
      `}</style>

      {/* ── Leaflet Map ── */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={false}
        zoomControl={true}
        style={{ width: '100%', height: mapHeight }}
        aria-label="Real Tagum City street map with anonymized problem report markers"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        <MapRecenter center={mapCenter} zoom={mapZoom} />

        {visibleMarkers.map(m => {
          const cat = CAT[m.category];
          const statusColor = STATUS_COLOR[m.status] || '#64748b';
          const votes = upvotes[m.id] ?? m.upvotes;

          return (
            <Marker
              key={m.id}
              position={[m.lat, m.lng]}
              icon={makePinIcon(m.category, m.level)}
            >
              <Popup className="rmap-popup" maxWidth={270}>
                <div className="rmap-card">

                  {/* Problem Photo */}
                  <div style={{ position: 'relative' }}>
                    <img
                      src={m.image}
                      alt={`Anonymized ${cat.label} report near ${m.location}`}
                      className="rmap-card-img"
                    />
                    {/* Severity ribbon */}
                    {m.level === 'critical' && (
                      <div style={{
                        position: 'absolute', top: 10, left: 10,
                        background: '#ef4444', color: '#fff',
                        fontSize: '0.62rem', fontWeight: '800',
                        padding: '2px 8px', borderRadius: '4px',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 8px rgba(239,68,68,0.5)',
                      }}>
                        ⚠ CRITICAL
                      </div>
                    )}
                    {/* Upvote count on image */}
                    <div style={{
                      position: 'absolute', bottom: 10, right: 10,
                      background: 'rgba(0,0,0,0.65)', color: '#fff',
                      fontSize: '0.72rem', fontWeight: '700',
                      padding: '3px 9px', borderRadius: '20px',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      👍 {votes} upvotes
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="rmap-card-body">
                    <div className="rmap-card-top">
                      <span
                        className="rmap-cat-badge"
                        style={{ background: cat.color }}
                      >
                        {cat.emoji} {cat.label}
                      </span>
                      <span
                        className="rmap-status-badge"
                        style={{ color: statusColor, borderColor: statusColor }}
                      >
                        ● {m.status}
                      </span>
                    </div>

                    <div className="rmap-card-title">{m.title}</div>

                    <div className="rmap-card-loc">
                      📍 {m.location}
                      <span style={{ color: '#475569', fontWeight: 400 }}>— {m.barangay}</span>
                    </div>

                    <div className="rmap-card-desc">{m.description}</div>

                    <div className="rmap-card-footer">
                      <button
                        className="rmap-upvote-btn"
                        onClick={() => handleUpvote(m.id)}
                      >
                        👍 Upvote ({votes})
                      </button>
                      <span className="rmap-time">🕐 {m.reported}</span>
                    </div>

                    <div className="rmap-privacy-row">
                      🔒 Anonymized — resident identity protected
                    </div>
                  </div>

                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* ── Legend row ── */}
      {legend && (
        <div className="rmap-legend-row">
          {Object.entries(CAT).map(([key, c]) => (
            <span key={key} className="rmap-legend-item">
              <span className="rmap-legend-dot" style={{ background: c.color }} />
              {c.label}
            </span>
          ))}
          <span className="rmap-legend-critical">
            <span style={{
              width: 11, height: 11, borderRadius: '50%',
              border: '2px solid #ef4444', display: 'inline-block',
            }} />
            ● Critical / Pulsing Pin
          </span>
        </div>
      )}
    </div>
  );
}
