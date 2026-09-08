import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Layers, MapPinned } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './Badges';

/* Marker colors — priority-driven per government light palette:
   critical = restrained red, high = amber, medium = primary teal,
   low / resolved = success green. */
export const PRIORITY_COLORS = {
  CRITICAL: '#d14343',
  HIGH: '#d08c1e',
  MEDIUM: '#2fa084',
  LOW: '#6fcf97',
};

/* Category identity colors — fixed assignment, shared with the map legend.
   Darkened steps so swatches stay legible on white surfaces. */
export const CATEGORY_COLORS = {
  Flooding: '#2b6cb8',
  'Road Damage': '#b45309',
  Garbage: '#6b7280',
  Streetlight: '#8b5cf6',
  'Water Leak': '#0e7490',
};

const priorityColor = (p) =>
  PRIORITY_COLORS[p] || PRIORITY_COLORS.MEDIUM;

/* Compact operational pin; pulse ring reserved for critical incidents */
function pinIcon(priority) {
  const color = priorityColor(priority);
  const critical = priority === 'CRITICAL';
  return L.divIcon({
    className: 'gov-leaflet-pin',
    html: `<div class="gov-pin ${critical ? 'critical' : ''}" style="color:${color}">
             ${critical ? '<span class="gov-pin-ring"></span>' : ''}
             <span class="gov-pin-core" style="background:${color}"></span>
           </div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

/**
 * Operational GIS panel: light basemap, incident markers, hotspot circles,
 * zone boundaries, layer toggles, and a map legend.
 *
 * incidents: [{ id, title, category, priority, zone, barangay, office?, status, lat, lng }]
 * zones:     [{ name, lat, lng, radius, incidentCount }]
 * hotspots:  [{ label, sub, lat, lng, radius }]
 */
export default function GisMap({
  incidents = [],
  zones = [],
  hotspots = [],
  tall = false,
  showFilters = true,
  showLegend = true,
  title = 'Location Intelligence',
  subtitle,
}) {
  const [category, setCategory] = useState('All');
  const [layers, setLayers] = useState({ incidents: true, hotspots: true, zones: true, heatmap: true });

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(incidents.map((i) => i.category)))],
    [incidents]
  );

  const visible = incidents.filter((i) => category === 'All' || i.category === category);

  const toggle = (key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="gov-card gov-map-card">
      {/* Panel header */}
      {title && (
        <div className="gov-card-head">
          <div>
            <div className="gov-card-title">
              <MapPinned size={16} />
              {title}
            </div>
            {subtitle && <div className="gov-card-sub">{subtitle}</div>}
          </div>
        </div>
      )}

      {/* Toolbar: category filters + layer toggles */}
      {showFilters && (
        <div className="gov-map-toolbar">
          <div className="gov-map-layers">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`gov-layer-chip ${category === cat ? 'on' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat !== 'All' && (
                  <span className="gov-chip-swatch" style={{ background: CATEGORY_COLORS[cat] }} aria-hidden="true" />
                )}
                {cat}
              </button>
            ))}
          </div>
          <div className="gov-map-layers">
            <Layers size={13} color="var(--gov-text-3)" aria-hidden="true" />
            {[
              ['incidents', 'Incidents'],
              ['hotspots', 'Hotspots'],
              ['zones', 'Zone Boundaries'],
              ['heatmap', 'Heatmap'],
            ].map(([key, label]) => (
              <label key={key} className={`gov-layer-chip ${layers[key] ? 'on' : ''}`}>
                <input type="checkbox" checked={layers[key]} onChange={() => toggle(key)} />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Map stage */}
      <div className={`gov-map-stage ${tall ? 'gov-map-stage-tall' : ''}`}>
        <MapContainer
          center={[7.4475, 125.8075]}
          zoom={14}
          scrollWheelZoom
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {/* Zone boundaries */}
          {layers.zones &&
            zones.map((z) => (
              <Circle
                key={z.name}
                center={[z.lat, z.lng]}
                radius={z.radius}
                pathOptions={{ color: '#2fa084', weight: 1, opacity: 0.6, fillOpacity: 0.04, dashArray: '5 6' }}
              >
                <Tooltip direction="center" permanent className="gov-zone-label">
                  {`${z.name.toUpperCase()} · ${z.incidentCount}`}
                </Tooltip>
              </Circle>
            ))}

          {/* Emerging hotspots */}
          {layers.hotspots &&
            hotspots.map((h, i) => (
              <Circle
                key={i}
                center={[h.lat, h.lng]}
                radius={h.radius}
                pathOptions={{ color: '#d14343', weight: 1.5, opacity: 0.8, fillColor: '#d14343', fillOpacity: 0.08, dashArray: '3 5' }}
              />
            ))}

          {/* Incident markers */}
          {layers.incidents &&
            visible.map((inc) => (
              <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={pinIcon(inc.priority)}>
                <Popup>
                  <div className="gov-map-popup">
                    <div className="gov-map-popup-head">
                      <span className="gov-map-popup-title">{inc.title}</span>
                    </div>
                    <div className="gov-row" style={{ gap: 6 }}>
                      <PriorityBadge priority={inc.priority} />
                      <StatusBadge status={inc.status} />
                    </div>
                    <div className="gov-map-popup-meta">
                      <span>{inc.id} · {inc.category}</span>
                      <span>{inc.zone}, {inc.barangay}</span>
                      {inc.office && <span>Assigned: {inc.office}</span>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Legend */}
        {showLegend && (
          <div className="gov-map-legend" aria-hidden="true">
            <span className="gov-map-legend-title">MAP LEGEND</span>
            <span className="gov-map-legend-row">
              <span className="gov-map-legend-mark" style={{ background: PRIORITY_COLORS.CRITICAL }} /> Critical incident
            </span>
            <span className="gov-map-legend-row">
              <span className="gov-map-legend-mark" style={{ background: PRIORITY_COLORS.HIGH }} /> High priority
            </span>
            <span className="gov-map-legend-row">
              <span className="gov-map-legend-mark" style={{ background: PRIORITY_COLORS.MEDIUM }} /> Standard incident
            </span>
            <span className="gov-map-legend-row">
              <span className="gov-map-legend-mark" style={{ background: PRIORITY_COLORS.LOW }} /> Low / resolved
            </span>
            <span className="gov-map-legend-row">
              <span className="gov-map-legend-mark" style={{ background: 'transparent', border: '1.5px dashed #d14343' }} /> Emerging hotspot
            </span>
            <span className="gov-map-legend-row">
              <span className="gov-map-legend-mark" style={{ background: 'transparent', border: '1.5px dashed #2fa084' }} /> Zone boundary
            </span>
          </div>
        )}
      </div>

      {/* Footer strip */}
      <div className="gov-card-head" style={{ borderBottom: 'none', padding: '9px 14px' }}>
        <span className="gov-meta gov-row" style={{ gap: 6 }}>
          <MapPinned size={13} aria-hidden="true" />
          San Isidro Barangay · {visible.length} active markers · GIS coordinates WGS 84
        </span>
        <span className="gov-meta">Last sync 09:42:18</span>
      </div>
    </div>
  );
}
