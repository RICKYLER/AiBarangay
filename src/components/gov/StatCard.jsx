import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

/**
 * Compact institutional KPI card.
 * variant: 'neutral' | 'info' | 'good' | 'attention' | 'critical'
 * trend:  { direction: 'up' | 'down' | 'alert', label: string }
 */
export default function StatCard({ label, value, icon: Icon, variant = 'neutral', trend, note }) {
  const cls = variant === 'neutral' ? '' : `is-${variant}`;
  const TrendIcon = trend?.direction === 'up' ? TrendingUp
    : trend?.direction === 'down' ? TrendingDown
    : AlertCircle;
  const trendCls = trend?.direction === 'up' ? 'up' : trend?.direction === 'down' ? 'warn' : 'alert';

  return (
    <div className={`gov-stat ${cls}`}>
      <div className="gov-stat-top">
        <span className="gov-stat-label">{label}</span>
        {Icon && <span className="gov-stat-icon"><Icon size={16} /></span>}
      </div>
      <div className="gov-stat-value">{value}</div>
      <div className="gov-stat-foot">
        {trend && (
          <span className={`gov-trend ${trendCls}`}>
            <TrendIcon size={12} />
            {trend.label}
          </span>
        )}
        {trend && note && <span>·</span>}
        {note && <span>{note}</span>}
      </div>
    </div>
  );
}
