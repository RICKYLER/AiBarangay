import React from 'react';
import { Building2 } from 'lucide-react';
import { PageHeader, Card, KVGrid, GisMap } from '../../components/gov';
import { ZONES, HOTSPOTS, INCIDENTS } from '../../data/adminData';

export default function BarangayZones() {
  const totalIncidents = ZONES.reduce((sum, z) => sum + z.incidentCount, 0);

  return (
    <div className="gov-page">

      <PageHeader
        title="Barangays & Zones"
        subtitle="Administrative zone registry, boundaries, and current incident distribution."
      />

      <div className="gov-grid-sidebar">

        <Card
          title="Zone Registry"
          subtitle={`${ZONES.length} zones · ${totalIncidents} active incident markers`}
          icon={Building2}
        >
          <div className="gov-stack" style={{ gap: 12 }}>
            {ZONES.map((z) => (
              <div key={z.name} className="gov-priority" style={{ gap: 8 }}>
                <div className="gov-row-between">
                  <span className="gov-cell-main">{z.name}</span>
                  <span className="gov-badge info">{z.incidentCount} incidents nearby</span>
                </div>
                <div className="gov-meter">
                  <div
                    className="gov-meter-fill"
                    style={{ width: `${Math.round((z.incidentCount / 45) * 100)}%`, background: 'var(--gov-blue)' }}
                  />
                </div>
                <KVGrid
                  items={[
                    { label: 'COORDINATES', value: <span className="gov-num">{z.lat}, {z.lng}</span> },
                    { label: 'RADIUS', value: <span className="gov-num">{z.radius} m</span> },
                  ]}
                />
              </div>
            ))}
          </div>
        </Card>

        <GisMap
          incidents={INCIDENTS}
          zones={ZONES}
          hotspots={HOTSPOTS}
          title="Zone Boundaries"
          subtitle="GIS view of the barangay operational area"
        />

      </div>

    </div>
  );
}
