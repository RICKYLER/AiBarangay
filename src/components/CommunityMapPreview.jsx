import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Layers, Cpu, ThumbsUp, AlertTriangle, Navigation, Eye, Globe, Crosshair, ArrowRight } from 'lucide-react';

// Custom SVG map marker icon builder with glowing radar pulse
const createCustomMarkerIcon = (category, severity) => {
  let color = '#10b981'; // default emerald
  if (category === 'Flooding') color = '#3b82f6';
  else if (category === 'Road Damage') color = '#f59e0b';
  else if (category === 'Garbage') color = '#10b981';
  else if (category === 'Streetlights') color = '#eab308';
  else if (category === 'Water') color = '#06b6d4';

  const svgIcon = `
    <div style="position: relative; width: 36px; height: 46px;">
      <div style="
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        border-radius: 50%;
        background: ${color};
        opacity: 0.3;
        animation: pulseGlow 1.8s infinite;
      "></div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="36" height="46" style="position: relative; z-index: 2;">
        <path fill="${color}" stroke="#0f172a" stroke-width="2" d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12zm0 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
        <circle cx="12" cy="12" r="4.5" fill="#ffffff"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker-wrapper',
    html: svgIcon,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -40],
  });
};

// Component to handle smooth map flight and open popup automatically
function MapFlyTo({ targetCoords, zoom = 16 }) {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, zoom, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [targetCoords, zoom, map]);
  return null;
}

export default function CommunityMapPreview({ problems, activeProblem, onSelectProblem, onUpvote }) {
  const [mapCategory, setMapCategory] = useState('All');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapTileStyle, setMapTileStyle] = useState('streets'); // 'streets' | 'satellite'
  const [selectedCoords, setSelectedCoords] = useState([7.4475, 125.8055]); // Tagum City Magugpo Poblacion
  const [activePinId, setActivePinId] = useState(null);
  const markerRefs = useRef({});

  useEffect(() => {
    if (activeProblem) {
      setSelectedCoords([activeProblem.lat, activeProblem.lng]);
      setActivePinId(activeProblem.id);
      
      // Auto open popup after flight
      setTimeout(() => {
        if (markerRefs.current[activeProblem.id]) {
          markerRefs.current[activeProblem.id].openPopup();
        }
      }, 800);
    }
  }, [activeProblem]);

  const handleJumpToProblem = (prob) => {
    onSelectProblem(prob);
    setSelectedCoords([prob.lat, prob.lng]);
    setActivePinId(prob.id);
    
    if (markerRefs.current[prob.id]) {
      markerRefs.current[prob.id].openPopup();
    }
  };

  const mapFilteredProblems = mapCategory === 'All'
    ? problems
    : problems.filter(p => p.category === mapCategory);

  // Map Tile Configuration (No Watermarks, 100% Free Open Source)
  const tileLayers = {
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    }
  };

  return (
    <section id="community-map" className="section community-map-section">
      <div className="container">
        
        {/* Header */}
        <div className="section-header text-center">
          <div className="badge badge-azure margin-auto">
            <MapPin size={14} /> Tagum City Spatial GIS Platform
          </div>
          <h2 className="section-title">Tagum City Community <span className="text-gradient-emerald">Geo-Map</span></h2>
          <p className="section-subtitle">
            Explore live hazard pins mapped directly on Tagum City streets (*Pioneer Ave*, *Apokon Road*, *Osmeña St*, *Sobrecarey St*, *JV Ayala Ave*). Click any marker or quick jump chip to inspect AI damage diagnostics.
          </p>
        </div>

        {/* Quick Jump Hazard Chips */}
        <div className="quick-jump-bar glass-card">
          <span className="quick-jump-label flex-center">
            <Crosshair size={14} className="text-emerald animate-pulse" />
            <span>Quick Fly-to Tagum Hazard Pins:</span>
          </span>
          <div className="quick-jump-chips">
            {problems.slice(0, 6).map((prob) => (
              <button
                key={prob.id}
                className={`quick-chip ${activePinId === prob.id ? 'active-chip' : ''}`}
                onClick={() => handleJumpToProblem(prob)}
              >
                <MapPin size={12} className="chip-pin-icon" />
                <span>{prob.locationName.split(' near ')[0]}</span>
                <span className="chip-cat">{prob.category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map Container Wrapper */}
        <div className="glass-card map-wrapper-card">
          
          {/* Map Controls Header */}
          <div className="map-toolbar flex-between">
            <div className="map-category-tabs">
              {['All', 'Flooding', 'Road Damage', 'Garbage', 'Streetlights', 'Water'].map((cat) => (
                <button
                  key={cat}
                  className={`map-tab-btn ${mapCategory === cat ? 'active' : ''}`}
                  onClick={() => setMapCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="map-toolbar-actions">
              {/* Map Tile Style Switcher */}
              <div className="tile-switcher-group flex-center">
                <button
                  className={`map-tab-btn tile-btn ${mapTileStyle === 'streets' ? 'active' : ''}`}
                  onClick={() => setMapTileStyle('streets')}
                >
                  <MapPin size={13} /> Street View
                </button>
                <button
                  className={`map-tab-btn tile-btn ${mapTileStyle === 'satellite' ? 'active' : ''}`}
                  onClick={() => setMapTileStyle('satellite')}
                >
                  <Globe size={13} /> Satellite
                </button>
              </div>

              <button
                className={`btn btn-secondary map-toggle-btn ${showHeatmap ? 'active-toggle' : ''}`}
                onClick={() => setShowHeatmap(!showHeatmap)}
              >
                <Layers size={16} />
                <span>{showHeatmap ? 'Heatmap: ON' : 'GIS Heatmap'}</span>
              </button>

              <div className="map-live-badge flex-center">
                <span className="pulse-dot"></span>
                <span>{mapFilteredProblems.length} Active Tagum Pins</span>
              </div>
            </div>
          </div>

          {/* Leaflet Map Display */}
          <div className="leaflet-container-wrapper">
            <MapContainer
              center={selectedCoords}
              zoom={15}
              scrollWheelZoom={false}
              style={{ width: '100%', height: '580px' }}
            >
              {/* TileLayer without any watermarks */}
              <TileLayer
                attribution={tileLayers[mapTileStyle].attribution}
                url={tileLayers[mapTileStyle].url}
              />

              <MapFlyTo targetCoords={selectedCoords} zoom={16} />

              {mapFilteredProblems.map((prob) => (
                <Marker
                  key={prob.id}
                  position={[prob.lat, prob.lng]}
                  icon={createCustomMarkerIcon(prob.category, prob.severity)}
                  ref={(el) => (markerRefs.current[prob.id] = el)}
                  eventHandlers={{
                    click: () => {
                      onSelectProblem(prob);
                      setActivePinId(prob.id);
                    }
                  }}
                >
                  <Popup>
                    <div className="map-popup-card">
                      <img src={prob.image} alt={prob.title} className="popup-thumbnail" />
                      
                      <div className="popup-body">
                        <div className="popup-top flex-between">
                          <span className="badge badge-emerald">{prob.category}</span>
                          <span className="popup-ai"><Cpu size={12} /> {prob.aiConfidence}% AI Conf.</span>
                        </div>

                        <h4 className="popup-title">{prob.title}</h4>
                        <div className="popup-location">
                          <MapPin size={12} className="text-emerald" /> {prob.barangay}
                        </div>
                        <div className="popup-street">
                          📍 {prob.locationName}
                        </div>

                        <p className="popup-desc">{prob.description.slice(0, 85)}...</p>

                        <div className="popup-actions flex-between">
                          <button
                            onClick={() => onUpvote(prob.id)}
                            className="popup-upvote"
                          >
                            <ThumbsUp size={14} /> {prob.upvotes} Upvotes
                          </button>

                          <span className="popup-status-text">{prob.status}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Heatmap Overlay Simulation */}
            {showHeatmap && (
              <div className="heatmap-overlay-sim">
                <div className="heatmap-blob blob-1"></div>
                <div className="heatmap-blob blob-2"></div>
                <div className="heatmap-blob blob-3"></div>
                <div className="heatmap-legend">
                  <span className="legend-label">Tagum Hazard Density:</span>
                  <span className="legend-gradient"></span>
                  <span className="legend-text">High Risk Area</span>
                </div>
              </div>
            )}
          </div>

          {/* Map Footer Info */}
          <div className="map-footer-info flex-between">
            <div className="legend-items flex-center">
              <span className="legend-dot dot-blue"></span> Flooding
              <span className="legend-dot dot-amber"></span> Road Damage
              <span className="legend-dot dot-green"></span> Waste & Sanitation
              <span className="legend-dot dot-yellow"></span> Lighting
              <span className="legend-dot dot-cyan"></span> Water Burst
            </div>

            <div className="map-coords-indicator">
              <Navigation size={14} /> Tagum City, Davao del Norte / GIS GPS Coordinates Locked
            </div>
          </div>

        </div>

      </div>

      <style>{`
        .community-map-section {
          padding-bottom: 6rem;
        }

        .quick-jump-bar {
          padding: 0.85rem 1.25rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          background: rgba(15, 23, 42, 0.85);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .quick-jump-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
          gap: 0.4rem;
          white-space: nowrap;
        }

        .quick-jump-chips {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          flex: 1;
        }

        .quick-chip {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          color: var(--text-muted);
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: all var(--transition-fast);
        }

        .quick-chip:hover {
          color: var(--text-main);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .quick-chip.active-chip {
          background: rgba(16, 185, 129, 0.18);
          border-color: var(--accent-emerald);
          color: var(--accent-emerald);
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
        }

        .chip-cat {
          font-size: 0.68rem;
          background: rgba(255, 255, 255, 0.08);
          padding: 1px 5px;
          border-radius: 4px;
          color: var(--text-subtle);
        }

        .map-wrapper-card {
          padding: 1rem;
          border-radius: var(--radius-xl);
          position: relative;
          overflow: hidden;
        }

        .map-toolbar {
          padding: 0.5rem 0.5rem 1rem 0.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .map-category-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .map-tab-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          color: var(--text-muted);
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .map-tab-btn:hover {
          color: var(--text-main);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .map-tab-btn.active {
          background: var(--accent-azure);
          color: #fff;
          border-color: transparent;
        }

        .tile-switcher-group {
          background: rgba(11, 17, 32, 0.8);
          padding: 3px;
          border-radius: 10px;
          border: 1px solid var(--border-glass);
          gap: 3px;
        }

        .tile-btn {
          border-radius: 7px;
          padding: 0.3rem 0.65rem;
          font-size: 0.78rem;
          border: none;
        }

        .map-toolbar-actions {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .map-toggle-btn {
          padding: 0.4rem 0.85rem;
          font-size: 0.82rem;
        }

        .map-toggle-btn.active-toggle {
          background: rgba(16, 185, 129, 0.2);
          border-color: var(--accent-emerald);
          color: var(--accent-emerald);
        }

        .map-live-badge {
          background: rgba(11, 17, 32, 0.8);
          border: 1px solid var(--border-glass);
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          gap: 0.5rem;
        }

        .leaflet-container-wrapper {
          position: relative;
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border-glass-bright);
        }

        .map-popup-card {
          width: 250px;
          display: flex;
          flex-direction: column;
        }

        .popup-thumbnail {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 8px 8px 0 0;
        }

        .popup-body {
          padding: 0.75rem 0.5rem 0.25rem 0.5rem;
        }

        .popup-top {
          margin-bottom: 0.4rem;
        }

        .popup-ai {
          font-size: 0.72rem;
          color: var(--accent-azure);
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }

        .popup-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.25rem;
          line-height: 1.25;
        }

        .popup-location {
          font-size: 0.78rem;
          color: var(--accent-emerald);
          font-weight: 700;
          margin-bottom: 0.15rem;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }

        .popup-street {
          font-size: 0.74rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .popup-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          line-height: 1.35;
        }

        .popup-upvote {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: var(--accent-emerald);
          padding: 0.3rem 0.68rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          cursor: pointer;
        }

        .popup-status-text {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--accent-amber);
        }

        .heatmap-overlay-sim {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 400;
        }

        .heatmap-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.5;
        }

        .blob-1 {
          top: 30%;
          left: 40%;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, #ef4444 0%, #f59e0b 50%, transparent 80%);
        }

        .blob-2 {
          top: 55%;
          left: 65%;
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, #3b82f6 0%, #06b6d4 50%, transparent 80%);
        }

        .blob-3 {
          top: 25%;
          left: 70%;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, #10b981 0%, transparent 70%);
        }

        .heatmap-legend {
          position: absolute;
          bottom: 1.5rem;
          right: 1.5rem;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid var(--border-glass-bright);
          padding: 0.6rem 1rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.78rem;
        }

        .legend-gradient {
          width: 90px;
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(to right, #3b82f6, #10b981, #f59e0b, #ef4444);
        }

        .map-footer-info {
          padding: 0.85rem 0.5rem 0.25rem 0.5rem;
          font-size: 0.82rem;
          color: var(--text-muted);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .legend-items {
          gap: 1rem;
          flex-wrap: wrap;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 0.3rem;
        }

        .dot-blue { background: #3b82f6; }
        .dot-amber { background: #f59e0b; }
        .dot-green { background: #10b981; }
        .dot-yellow { background: #eab308; }
        .dot-cyan { background: #06b6d4; }

        .map-coords-indicator {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.78rem;
          color: var(--text-subtle);
        }

        @media (max-width: 768px) {
          .map-toolbar { flex-direction: column; align-items: stretch; }
          .map-footer-info { flex-direction: column; }
          .quick-jump-bar { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </section>
  );
}
