import React from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Circle, Tooltip, useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  COMMUNITY_MAP_MARKERS,
  COMMUNITY_MAP_HOTSPOTS,
  COMMUNITY_MAP_CATEGORIES,
  TAGUM_CENTER,
} from '@/lib/data/residentData';

/**
 * ResMap — real street map of Tagum City, Davao del Norte.
 * Free OpenStreetMap data via the light CARTO basemap tiles (the same
 * free service the operations portal uses). No API key, no paid service.
 *
 * Anonymized: markers carry only a category description, never personal
 * information. Tooltips describe each marker for every user.
 *
 * Props:
 *   filter  — category key, or 'all'
 *   pin     — optional { lat, lng } selection pin (location picker)
 *   onPick  — optional (lat, lng) => void, click-to-place handler
 *   picking — highlight the map while "Select Location on Map" is armed
 */

/* Click-to-place bridge (must be a child of MapContainer) */
function MapClickPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6))
      );
    },
  });
  return null;
}

export default function ResMap({ filter = 'all', pin = null, onPick, picking = false }) {
  const visible = COMMUNITY_MAP_MARKERS.filter(
    (m) => filter === 'all' || m.category === filter
  );

  return (
    <div
      className={`res-loc-map ${onPick ? 'crosshair' : ''} ${picking ? 'picking' : ''}`.trim()}
      role="region"
      aria-label="Street map of Tagum City, Davao del Norte, showing anonymized community problem reports"
    >
      <MapContainer
        center={TAGUM_CENTER}
        zoom={13}
        scrollWheelZoom={false}
        className="res-leaflet-container"
        attributionControl
      >
        {/* Free OpenStreetMap-based light basemap (CARTO) — no API key */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Emerging hotspot */}
        {COMMUNITY_MAP_HOTSPOTS.map((h) => (
          <Circle
            key={h.label}
            center={[h.lat, h.lng]}
            radius={h.radius}
            pathOptions={{
              color: '#d14343',
              weight: 1.5,
              dashArray: '5 4',
              fillColor: '#d14343',
              fillOpacity: 0.07,
            }}
          >
            <Tooltip>{h.label}</Tooltip>
          </Circle>
        ))}

        {/* Anonymized problem markers */}
        {visible.map((m) => {
          const cat = COMMUNITY_MAP_CATEGORIES[m.category];
          const critical = m.level === 'critical';
          return (
            <CircleMarker
              key={m.id}
              center={[m.lat, m.lng]}
              radius={critical ? 10 : 7}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: critical ? '#d14343' : cat.color,
                fillOpacity: 0.92,
              }}
            >
              <Tooltip>
                Anonymized {cat.label} report{critical ? ' — critical area' : ''}
              </Tooltip>
            </CircleMarker>
          );
        })}

        {/* Selection pin (location picker) */}
        {pin && (
          <>
            <Circle
              center={[pin.lat, pin.lng]}
              radius={60}
              pathOptions={{
                color: '#2fa084',
                weight: 1.5,
                fillColor: '#2fa084',
                fillOpacity: 0.15,
              }}
            />
            <CircleMarker
              center={[pin.lat, pin.lng]}
              radius={9}
              pathOptions={{
                color: '#ffffff',
                weight: 3,
                fillColor: '#2fa084',
                fillOpacity: 1,
              }}
            >
              <Tooltip>Selected report location</Tooltip>
            </CircleMarker>
          </>
        )}

        {onPick && <MapClickPicker onPick={onPick} />}
      </MapContainer>
    </div>
  );
}
