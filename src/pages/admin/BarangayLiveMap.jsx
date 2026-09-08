import React from 'react';
import { PageHeader, GisMap } from '../../components/gov';
import { INCIDENTS, ZONES, HOTSPOTS } from '../../data/adminData';

export default function BarangayLiveMap() {
  return (
    <div className="gov-page">

      <PageHeader
        title="Live Incident Map"
        subtitle="Operational GIS view of incident distribution, zone boundaries, and emerging hotspots."
      />

      <GisMap
        incidents={INCIDENTS}
        zones={ZONES}
        hotspots={HOTSPOTS}
        tall
        title="Geographic Operations View"
        subtitle="Toggle layers and category filters to isolate operational signals."
      />

    </div>
  );
}
