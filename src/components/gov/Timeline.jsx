import React from 'react';

/** steps: [{ key, label, count? }] */
export function Tabs({ steps, active, onChange }) {
  return (
    <div className="gov-tabs" role="tablist">
      {steps.map((s) => (
        <button
          key={s.key}
          role="tab"
          aria-selected={active === s.key}
          className={`gov-tab ${active === s.key ? 'active' : ''}`}
          onClick={() => onChange(s.key)}
        >
          {s.label}
          {s.count !== undefined && <span className="gov-tab-count">{s.count}</span>}
        </button>
      ))}
    </div>
  );
}

/**
 * Operational timeline.
 * items: [{ title, time, note?, status: 'done' | 'active' | 'pending' }]
 */
export function Timeline({ items }) {
  return (
    <div className="gov-timeline">
      {items.map((item, i) => (
        <div key={i} className={`gov-timeline-item ${item.status}`}>
          <span className="gov-timeline-node" aria-hidden="true" />
          <div className="gov-timeline-body">
            <div className="gov-timeline-title">{item.title}</div>
            <div className="gov-timeline-meta">{item.time}</div>
            {item.note && <div className="gov-timeline-note">{item.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, sub, action }) {
  return (
    <div className="gov-empty">
      {Icon && <Icon size={30} strokeWidth={1.5} />}
      <div className="gov-empty-title">{title}</div>
      {sub && <div className="gov-empty-sub">{sub}</div>}
      {action}
    </div>
  );
}

export function KVGrid({ items }) {
  return (
    <div className="gov-kv">
      {items.map((item) => (
        <div key={item.label} className="gov-kv-item">
          <div className="gov-kv-label">{item.label}</div>
          <div className="gov-kv-value">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
