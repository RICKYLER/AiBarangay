'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TAGUM_CENTER = [7.4475, 125.8075];

const INCIDENTS = [
  { id: 'INC-101', title: 'Severe Flooding', cat: 'Flooding', priority: 'CRITICAL', color: '#d14343', lat: 7.4485, lng: 125.8065, loc: 'Pioneer Avenue, San Isidro' },
  { id: 'INC-102', title: 'Deep Pothole', cat: 'Road Damage', priority: 'HIGH', color: '#d97706', lat: 7.4460, lng: 125.8095, loc: 'Magugpo Highway' },
  { id: 'INC-103', title: 'Broken Streetlight', cat: 'Streetlights', priority: 'MEDIUM', color: '#ca8a04', lat: 7.4492, lng: 125.8040, loc: 'Zone 2, San Isidro' },
  { id: 'INC-104', title: 'Drainage Clearance', cat: 'Garbage', priority: 'LOW', color: '#059669', lat: 7.4450, lng: 125.8055, loc: 'Purok 3, San Isidro' },
];

const HOTSPOTS = [
  { lat: 7.4482, lng: 125.8070, radius: 280 },
];

export default function DownloadPhoneMap({ activeFilter = 'All' }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing map instance to prevent "Map container is already initialized"
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    if (containerRef.current._leaflet_id) {
      containerRef.current._leaflet_id = null;
    }

    // Initialize Leaflet Map (Static non-interactive picture mode)
    const map = L.map(containerRef.current, {
      center: TAGUM_CENTER,
      zoom: 14,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      attributionControl: false,
    });

    mapRef.current = map;

    // Real OpenStreetMap street basemap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Hotspot circle
    HOTSPOTS.forEach((h) => {
      L.circle([h.lat, h.lng], {
        radius: h.radius,
        color: '#d14343',
        weight: 1.5,
        opacity: 0.8,
        fillColor: '#d14343',
        fillOpacity: 0.12,
        dashArray: '4 4',
      }).addTo(map);
    });

    // Filter incidents
    const filtered = INCIDENTS.filter(
      (i) => activeFilter === 'All' || i.cat === activeFilter
    );

    // Add incident circle markers
    filtered.forEach((inc) => {
      const circle = L.circleMarker([inc.lat, inc.lng], {
        radius: inc.priority === 'CRITICAL' ? 8 : 6,
        color: '#ffffff',
        weight: 2,
        fillColor: inc.color,
        fillOpacity: 1,
      }).addTo(map);

      // Tooltip label
      circle.bindTooltip(
        `<span style="font-size: 9px; font-weight: 700; color: ${inc.color};">${inc.title}</span>`,
        { permanent: true, direction: 'top', offset: [0, -6], className: 'gov-zone-label' }
      );
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeFilter]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', pointerEvents: 'none', userSelect: 'none' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', background: '#e5efe7', pointerEvents: 'none' }}
      />

      {/* Floating Resident Map Status Badge */}
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: 8,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(6px)',
        color: '#ffffff',
        padding: '3px 8px',
        borderRadius: 20,
        fontSize: '8.5px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
        STREET MAP · TAGUM CITY
      </div>
    </div>
  );
}
