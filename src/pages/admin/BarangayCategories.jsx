import React from 'react';
import { Tags } from 'lucide-react';
import {
  DataTable, PageHeader, Card, CategoryChip, CATEGORY_COLORS, SystemBadge,
} from '../../components/gov';
import { CATEGORIES } from '../../data/adminData';

const SLA_VARIANT = {
  'Critical ≤ 4 hrs': 'critical',
  'High ≤ 24 hrs': 'warning',
  'Medium ≤ 48 hrs': 'info',
  'Medium ≤ 72 hrs': 'neutral',
};

export default function BarangayCategories() {
  const columns = [
    {
      key: 'name',
      label: 'CATEGORY',
      sortable: true,
      render: (c) => <CategoryChip category={c.name} swatch={CATEGORY_COLORS[c.name] || '#6e7b76'} />,
    },
    { key: 'code', label: 'CODE', sortable: true, render: (c) => <span className="gov-id">{c.code}</span> },
    { key: 'volume', label: 'REPORT VOLUME', sortable: true, render: (c) => <span className="gov-num gov-cell-main">{c.volume}</span> },
    {
      key: 'share',
      label: 'SHARE',
      sortable: true,
      render: (c) => (
        <span className="gov-ai-confidence" style={{ fontSize: 12 }}>
          <span className="gov-meter"><span className="gov-meter-fill" style={{ width: `${c.share * 2.5}%`, background: 'var(--gov-teal)' }} /></span>
          {c.share}%
        </span>
      ),
    },
    { key: 'sla', label: 'RESPONSE SLA', sortable: true, render: (c) => <SystemBadge variant={SLA_VARIANT[c.sla] || 'neutral'}>{c.sla}</SystemBadge> },
    { key: 'trend', label: '30-DAY TREND', sortable: true, render: (c) => <span className="gov-meta gov-num">{c.trend}</span> },
    {
      key: 'actions',
      label: 'ACTIONS',
      render: () => (
        <div className="gov-cell-actions">
          <button className="gov-row-action">Edit</button>
        </div>
      ),
    },
  ];

  return (
    <div className="gov-page">

      <PageHeader
        title="Incident Categories"
        subtitle="Official classification registry with response-time service levels."
      />

      <Card
        title="Category Registry"
        subtitle={`${CATEGORIES.length} active categories used for report classification and dispatch routing`}
        icon={Tags}
        flush
      >
        <div className="gov-card-body gov-flush">
          <DataTable
            columns={columns}
            rows={CATEGORIES}
            pageSize={8}
            mobileRender={(c) => (
              <>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">CATEGORY</span>
                  <CategoryChip category={c.name} swatch={CATEGORY_COLORS[c.name] || '#6e7b76'} />
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">VOLUME</span>
                  <span className="gov-num gov-cell-main">{c.volume}</span>
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">SLA</span>
                  <SystemBadge variant={SLA_VARIANT[c.sla] || 'neutral'}>{c.sla}</SystemBadge>
                </div>
                <div className="gov-mc-row">
                  <span className="gov-mc-label">TREND</span>
                  <span className="gov-meta gov-num">{c.trend}</span>
                </div>
              </>
            )}
          />
        </div>
      </Card>

    </div>
  );
}
