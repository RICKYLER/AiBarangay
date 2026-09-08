import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Download, FileSpreadsheet, FileText, Printer, ChevronDown,
  TrendingUp, TrendingDown, Sparkles, MapPinned, SlidersHorizontal, RotateCcw,
  ArrowRight, Activity, Layers, ClipboardList,
} from 'lucide-react';
import {
  PageHeader, Card, FilterSelect, EmptyState, GisMap,
  PRIORITY_COLORS, TrendChart, HBars, VBars, Donut,
} from '../../components/gov';
import {
  ORG, INCIDENTS, ZONES, HOTSPOTS,
  ANALYTICS_DAILY, ANALYTICS_RANGES, ANALYTICS_KPI, ANALYTICS_CATEGORIES,
  ANALYTICS_RESOLUTION, ANALYTICS_PRIORITY, ANALYTICS_HOTSPOTS, ANALYTICS_TREND,
  ANALYTICS_AI_INSIGHTS, ANALYTICS_RESPONSE, ANALYTICS_MONTHLY, ANALYTICS_FILTERS,
} from '../../data/adminData';

/* Line identity colors — fixed assignment, consistent with the map legend */
const TREND_COLORS = {
  Flooding: '#2b6cb8',
  'Road Damage': '#b45309',
  Garbage: '#6b7280',
  Drainage: '#0e7490',
};

const RANGE_LABELS = {
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days',
  '1y': 'Year 2026',
};

const DEFAULT_FILTERS = {
  range: '30d',
  barangay: 'San Isidro Barangay',
  zone: 'All Zones',
  category: 'All Categories',
  priority: 'All Priorities',
  status: 'All Reports',
};

const PRIORITY_TOTAL = ANALYTICS_PRIORITY.reduce((sum, p) => sum + p.count, 0);

/* ---------------- small presentational pieces ---------------- */

function KpiCard({ kpi }) {
  const down = kpi.delta.startsWith('−') || kpi.delta.startsWith('-');
  const TrendIcon = down ? TrendingDown : TrendingUp;
  return (
    <div className="gov-an-kpi">
      <span className="gov-an-kpi-label">{kpi.label}</span>
      <span className="gov-an-kpi-value gov-num">{kpi.value}</span>
      <span className="gov-an-kpi-foot">
        <span className="gov-an-delta good">
          <TrendIcon size={12} aria-hidden="true" />
          {kpi.delta}
        </span>
        <span className="gov-an-kpi-note">{kpi.note}</span>
      </span>
    </div>
  );
}

function Skeleton({ height = 200, className = '' }) {
  return <div className={`gov-an-skel ${className}`} style={{ height }} aria-hidden="true" />;
}

function RangeChips({ value, onChange, options }) {
  return (
    <div className="gov-an-chips" role="group" aria-label="Date range">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className={`gov-an-chip ${value === opt.key ? 'on' : ''}`}
          aria-pressed={value === opt.key}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ChartLegend({ items }) {
  return (
    <div className="gov-an-legend">
      {items.map((it) => (
        <span key={it.key} className="gov-an-legend-item">
          <span className="gov-an-legend-swatch" style={{ background: it.color }} aria-hidden="true" />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ---------------- page ---------------- */

export default function BarangayAnalytics() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [trendRange, setTrendRange] = useState('1y');
  const exportRef = useRef(null);

  /* Skeleton pass on first load and whenever filters are applied */
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, [filters]);

  /* Close the export menu on outside click */
  useEffect(() => {
    if (!exportOpen) return undefined;
    const onDown = (e) => {
      if (!exportRef.current?.contains(e.target)) setExportOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [exportOpen]);

  const setFilter = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const applyFilters = () => setFilters(draft);
  const resetFilters = () => {
    setDraft(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  };

  const exportCsv = () => {
    const rows = [
      ['AI Barangay Problem Mapper — Analytics Export'],
      ['Organization', ORG.barangay],
      ['Generated', 'September 6, 2026 (demonstration data)'],
      [],
      ['Month', 'Reports', 'Verified', 'Resolved', 'Avg. Resolution', 'Critical'],
      ...ANALYTICS_MONTHLY.map((m) => [m.month, m.reports, m.verified, m.resolved, m.avg, m.critical]),
    ];
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'san-isidro-analytics-2026.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const printReport = () => {
    setExportOpen(false);
    window.print();
  };

  /* ---- derived datasets (respect the applied filters) ---- */

  const rangeDays = ANALYTICS_RANGES.find((r) => r.key === filters.range)?.days ?? 30;

  const heroPoints = useMemo(
    () => ANALYTICS_DAILY.slice(-rangeDays).map((d) => ({
      label: d.short,
      longLabel: d.long,
      values: { submitted: d.submitted, verified: d.verified },
    })),
    [rangeDays],
  );

  const heroSeries = [
    { key: 'submitted', label: 'Reports', color: '#2fa084', area: true },
    { key: 'verified', label: 'Verified', color: '#1f6f5f' },
  ].filter((s) => (
    filters.status === 'All Reports'
    || (filters.status === 'Submitted Only' && s.key === 'submitted')
    || (filters.status === 'Verified Only' && s.key === 'verified')
  ));

  const categoryItems = ANALYTICS_CATEGORIES.map((c) => ({
    label: c.name,
    value: c.count,
    dim: filters.category !== 'All Categories' && filters.category !== c.name,
  }));

  const hotspots = ANALYTICS_HOTSPOTS.filter(
    (h) => filters.zone === 'All Zones' || h.zone === filters.zone,
  );
  const topHotspot = hotspots[0];

  /* Problem-trends chart: applied category filter narrows the lines */
  const trendCategories = Object.keys(ANALYTICS_TREND.categories)
    .filter((c) => filters.category === 'All Categories' || filters.category === c);
  const trendMonths = trendRange === '6m' ? 6 : 12;
  const trendPoints = useMemo(() => {
    const months = ANALYTICS_TREND.months.slice(-trendMonths);
    return months.map((m, i) => {
      const idx = ANALYTICS_TREND.months.length - trendMonths + i;
      const values = {};
      trendCategories.forEach((c) => {
        values[c] = ANALYTICS_TREND.categories[c][idx];
      });
      return { label: m, longLabel: `${m} 2026`, values };
    });
  }, [trendMonths, trendCategories]);

  const prioritySegments = ANALYTICS_PRIORITY.map((p) => ({
    ...p,
    color: PRIORITY_COLORS[p.key.toUpperCase()],
  }));

  return (
    <div className="gov-page gov-an">

      <PageHeader
        title="Analytics"
        subtitle="Community and operational intelligence — analyze community reports, incident patterns, response performance, geographic hotspots, and recurring barangay problems."
        actions={
          <>
            <FilterSelect
              label="Date Range"
              value={RANGE_LABELS[filters.range]}
              onChange={(v) => setFilter('range', Object.keys(RANGE_LABELS).find((k) => RANGE_LABELS[k] === v) || '30d')}
              options={Object.values(RANGE_LABELS)}
              hideLabel
            />
            <FilterSelect
              label="Barangay"
              value={filters.barangay}
              onChange={(v) => setFilter('barangay', v)}
              options={ANALYTICS_FILTERS.barangays}
              hideLabel
            />
            <FilterSelect
              label="Zone"
              value={filters.zone}
              onChange={(v) => setFilter('zone', v)}
              options={['All Zones', ...ANALYTICS_FILTERS.zones]}
              hideLabel
            />
            <div className="gov-an-export" ref={exportRef}>
              <button
                type="button"
                className="gov-btn gov-btn-secondary"
                onClick={() => setExportOpen((o) => !o)}
                aria-expanded={exportOpen}
                aria-haspopup="menu"
              >
                <Download size={14} /> Export Report <ChevronDown size={13} />
              </button>
              {exportOpen && (
                <div className="gov-an-export-menu" role="menu">
                  <button type="button" role="menuitem" className="gov-dropdown-item" onClick={printReport}>
                    <FileText size={14} /> PDF Report
                  </button>
                  <button type="button" role="menuitem" className="gov-dropdown-item" onClick={exportCsv}>
                    <FileSpreadsheet size={14} /> Excel / CSV
                  </button>
                  <button type="button" role="menuitem" className="gov-dropdown-item" onClick={printReport}>
                    <Printer size={14} /> Print Report
                  </button>
                </div>
              )}
            </div>
          </>
        }
      />

      {/* ---------------- sticky filter bar ---------------- */}
      <div className="gov-an-filterbar" role="search" aria-label="Analytics filters">
        <SlidersHorizontal size={14} aria-hidden="true" />
        <FilterSelect
          label="Date Range"
          value={RANGE_LABELS[draft.range]}
          onChange={(v) => setDraft((d) => ({ ...d, range: Object.keys(RANGE_LABELS).find((k) => RANGE_LABELS[k] === v) || '30d' }))}
          options={Object.values(RANGE_LABELS)}
          hideLabel
        />
        <FilterSelect label="Barangay" value={draft.barangay} onChange={(v) => setDraft((d) => ({ ...d, barangay: v }))} options={ANALYTICS_FILTERS.barangays} hideLabel />
        <FilterSelect label="Zone" value={draft.zone} onChange={(v) => setDraft((d) => ({ ...d, zone: v }))} options={['All Zones', ...ANALYTICS_FILTERS.zones]} hideLabel />
        <FilterSelect label="Category" value={draft.category} onChange={(v) => setDraft((d) => ({ ...d, category: v }))} options={['All Categories', ...ANALYTICS_FILTERS.categories]} hideLabel />
        <FilterSelect label="Priority" value={draft.priority} onChange={(v) => setDraft((d) => ({ ...d, priority: v }))} options={['All Priorities', ...ANALYTICS_FILTERS.priorities]} hideLabel />
        <FilterSelect label="Status" value={draft.status} onChange={(v) => setDraft((d) => ({ ...d, status: v }))} options={ANALYTICS_FILTERS.statuses} hideLabel />
        <div className="gov-spacer" />
        <button type="button" className="gov-btn gov-btn-primary gov-btn-sm" onClick={applyFilters}>Apply Filters</button>
        <button type="button" className="gov-btn gov-btn-secondary gov-btn-sm" onClick={resetFilters}>
          <RotateCcw size={13} /> Reset
        </button>
      </div>

      <span className="gov-an-demo">Sample / Demonstration Data · {ORG.barangay}</span>

      {loading ? (
        /* ---------------- loading skeletons ---------------- */
        <div className="gov-an-body">
          <div className="gov-an-kpis">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={104} />)}
          </div>
          <Skeleton height={330} />
          <div className="gov-grid-2">
            <Skeleton height={280} />
            <Skeleton height={280} />
          </div>
          <Skeleton height={380} />
          <div className="gov-grid-2">
            <Skeleton height={300} />
            <Skeleton height={300} />
          </div>
        </div>
      ) : (
        <div className="gov-an-body">

          {/* ---------------- key metrics ---------------- */}
          <div className="gov-an-kpis">
            {ANALYTICS_KPI.map((kpi) => <KpiCard key={kpi.key} kpi={kpi} />)}
          </div>

          {/* ---------------- hero: community reports trend ---------------- */}
          <Card
            title="Community Reports Trend"
            subtitle="Number of submitted and verified reports over time."
            icon={Activity}
            actions={
              <>
                <ChartLegend items={heroSeries.map((s) => ({ key: s.key, label: s.label, color: s.color }))} />
                <RangeChips value={filters.range} onChange={(k) => setFilter('range', k)} options={ANALYTICS_RANGES} />
              </>
            }
          >
            {heroSeries.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No analytics available for the selected filters."
                sub="Adjust the status filter to display the community reports trend."
              />
            ) : (
              <TrendChart
                points={heroPoints}
                series={heroSeries}
                height={280}
                ariaLabel={`Community reports trend, ${RANGE_LABELS[filters.range]}: submitted and verified reports per day.`}
              />
            )}
          </Card>

          {/* ---------------- secondary analytics ---------------- */}
          <div className="gov-grid-2">
            <Card
              title="Issues by Category"
              subtitle="Verified incident volume by problem category, highest to lowest."
              icon={Layers}
            >
              <HBars
                items={categoryItems}
                ariaLabel="Incident volume by category, from flooding at 342 down to other at 27."
              />
            </Card>

            <Card
              title="Resolution Performance"
              subtitle="Average resolution time by category, in days."
              icon={BarChart3}
            >
              <VBars
                items={ANALYTICS_RESOLUTION.map((r) => ({ label: r.name, value: r.days, display: `${r.days.toFixed(1)}` }))}
                unit=" days"
                ariaLabel="Average resolution time in days: flooding 3.8, road damage 3.1, drainage 2.6, streetlight 2.2, garbage 1.9."
              />
            </Card>
          </div>

          {/* ---------------- location intelligence ---------------- */}
          <div className="gov-an-loc">
            <GisMap
              incidents={INCIDENTS}
              zones={ZONES}
              hotspots={HOTSPOTS}
              tall
              title="Location Intelligence"
              subtitle="Where community problems are concentrated."
            />
            <Card title="Geographic Summary" icon={MapPinned}>
              {topHotspot ? (
                <div className="gov-an-hotspot">
                  <span className="gov-an-kpi-label">TOP HOTSPOT</span>
                  <span className="gov-an-hotspot-zone">{topHotspot.zone}</span>
                  <span className="gov-an-hotspot-count gov-num">
                    {topHotspot.count} incidents
                  </span>
                  <div className="gov-an-hotspot-rows">
                    <div className="gov-an-hotspot-row">
                      <span>Main issue</span>
                      <strong>{topHotspot.category}</strong>
                    </div>
                    <div className="gov-an-hotspot-row">
                      <span>Trend</span>
                      <strong className={topHotspot.trend.startsWith('−') ? 'gov-an-trend-down' : 'gov-an-trend-up'}>
                        {topHotspot.trend}
                      </strong>
                    </div>
                    <div className="gov-an-hotspot-row">
                      <span>Areas tracked</span>
                      <strong>{hotspots.length} of {ANALYTICS_HOTSPOTS.length}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="gov-btn gov-btn-primary gov-btn-sm gov-an-open-map"
                    onClick={() => navigate('/admin/live-map')}
                  >
                    Open Live Map <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <EmptyState
                  icon={MapPinned}
                  title="No analytics available for the selected filters."
                  sub="No tracked problem area matches this zone."
                />
              )}
            </Card>
          </div>

          {/* ---------------- priority + problem trends ---------------- */}
          <div className="gov-an-pri-trend">
            <Card
              title="Incident Priority"
              subtitle="Distribution of verified incidents by priority level."
              icon={ClipboardList}
            >
              <div className="gov-an-priority">
                <Donut
                  segments={prioritySegments}
                  centerLabel={String(PRIORITY_TOTAL)}
                  centerSub="incidents"
                  ariaLabel={`Priority distribution of ${PRIORITY_TOTAL} incidents: critical 12, high 87, medium 472, low 713.`}
                />
                <div className="gov-an-priority-rows">
                  {prioritySegments.map((p) => (
                    <div
                      key={p.key}
                      className={`gov-an-priority-row ${filters.priority !== 'All Priorities' && filters.priority !== p.label ? 'dim' : ''}`}
                    >
                      <span className="gov-an-legend-swatch" style={{ background: p.color }} aria-hidden="true" />
                      <span className="gov-an-priority-label">{p.label}</span>
                      <span className="gov-an-priority-count gov-num">{p.count}</span>
                      <span className="gov-an-priority-pct gov-num">
                        {Math.round((p.count / PRIORITY_TOTAL) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card
              title="Problem Trends"
              subtitle="Recurring issues over time, by category."
              icon={BarChart3}
              actions={<RangeChips value={trendRange} onChange={setTrendRange} options={[{ key: '6m', label: '6M' }, { key: '1y', label: '1Y' }]} />}
            >
              {trendCategories.length === 0 ? (
                <EmptyState
                  icon={BarChart3}
                  title="No analytics available for the selected filters."
                  sub={`No recurring-trend series is tracked for ${filters.category}.`}
                />
              ) : (
                <>
                  <div className="gov-an-trend-controls">
                    {Object.keys(ANALYTICS_TREND.categories).map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`gov-an-chip ${trendCategories.includes(c) ? 'on' : ''}`}
                        aria-pressed={trendCategories.includes(c)}
                        onClick={() => setFilter('category', trendCategories.includes(c) && trendCategories.length === 1 ? 'All Categories' : c)}
                        disabled={!trendCategories.includes(c) && trendCategories.length >= 4}
                      >
                        <span className="gov-an-legend-swatch" style={{ background: TREND_COLORS[c] }} aria-hidden="true" />
                        {c}
                      </button>
                    ))}
                  </div>
                  <TrendChart
                    points={trendPoints}
                    series={trendCategories.map((c) => ({ key: c, label: c, color: TREND_COLORS[c] }))}
                    height={250}
                    ariaLabel="Recurring problem trends by category, monthly incident counts."
                  />
                </>
              )}
            </Card>
          </div>

          {/* ---------------- AI insights ---------------- */}
          <section className="gov-an-ai">
            <div className="gov-an-ai-head">
              <div>
                <h2 className="gov-an-section-title">
                  <Sparkles size={16} aria-hidden="true" /> AI Community Insights
                </h2>
                <p className="gov-an-section-sub">Detected patterns across community reports.</p>
              </div>
              <span className="gov-an-badge">DECISION SUPPORT</span>
            </div>
            <div className="gov-an-ai-grid">
              {ANALYTICS_AI_INSIGHTS.map((ins) => (
                <article key={ins.id} className="gov-an-ai-card">
                  <span className="gov-an-ai-id">{ins.id}</span>
                  <h3 className="gov-an-ai-headline">{ins.headline}</h3>
                  <p className="gov-an-ai-text">{ins.summary}</p>
                  <span className="gov-an-ai-confidence">
                    <span className="gov-meter">
                      <span className="gov-meter-fill" style={{ width: `${ins.confidence}%`, background: 'var(--gov-teal)' }} />
                    </span>
                    {ins.confidence}% model confidence
                  </span>
                  <div className="gov-an-ai-meta">
                    <div><span>Supporting incidents</span><strong>{ins.incidents}</strong></div>
                    <div><span>Affected zone</span><strong>{ins.zone}</strong></div>
                    <div><span>Date range</span><strong>{ins.range}</strong></div>
                  </div>
                  <button
                    type="button"
                    className="gov-btn gov-btn-secondary gov-btn-sm"
                    onClick={() => navigate('/admin/ai-intel')}
                  >
                    Review Insight <ArrowRight size={13} />
                  </button>
                </article>
              ))}
            </div>
            <div className="gov-ai-disclaimer gov-an-ai-note">
              <Sparkles size={15} aria-hidden="true" />
              <span>
                AI-generated insights require human verification before operational
                decisions are made.
              </span>
            </div>
          </section>

          {/* ---------------- response performance ---------------- */}
          <Card
            title="Barangay Response Performance"
            subtitle="Operational response metrics compared against the previous period."
            icon={Activity}
            actions={
              <ChartLegend items={[
                { key: 'cur', label: 'Current', color: '#2fa084' },
                { key: 'prev', label: 'Previous', color: '#cbd5d1' },
              ]} />
            }
          >
            <div className="gov-an-response">
              {ANALYTICS_RESPONSE.map((row) => {
                const num = parseFloat(row.value);
                const prevNum = parseFloat(row.prev);
                const max = Math.max(num, prevNum) || 1;
                return (
                  <div key={row.label} className="gov-an-resp-row">
                    <div className="gov-an-resp-head">
                      <span className="gov-an-resp-label">{row.label}</span>
                      <span className="gov-an-resp-vals">
                        <strong className="gov-num">{row.value}</strong>
                        <span className="gov-an-delta good">{row.delta}</span>
                      </span>
                    </div>
                    <div className="gov-an-resp-bars">
                      <span className="gov-an-resp-bar" style={{ width: `${(num / max) * 100}%`, background: '#2fa084' }} />
                      <span className="gov-an-resp-bar prev" style={{ width: `${(prevNum / max) * 100}%` }} />
                    </div>
                    <span className="gov-an-resp-prev">Previous: {row.prev}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ---------------- monthly overview + top problem areas ---------------- */}
          <div className="gov-an-monthly">
            <Card
              title="Monthly Performance"
              subtitle="Operational overview by month, 2026."
              icon={BarChart3}
              flush
            >
              <div className="gov-table-wrap">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th className="gov-num-cell">Reports</th>
                      <th className="gov-num-cell">Verified</th>
                      <th className="gov-num-cell">Resolved</th>
                      <th className="gov-num-cell">Avg. Resolution</th>
                      <th className="gov-num-cell">Critical</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ANALYTICS_MONTHLY.map((m) => (
                      <tr key={m.month}>
                        <td><strong>{m.month}</strong></td>
                        <td className="gov-num-cell gov-num">{m.reports}</td>
                        <td className="gov-num-cell gov-num">{m.verified}</td>
                        <td className="gov-num-cell gov-num">{m.resolved}</td>
                        <td className="gov-num-cell gov-num">{m.avg}</td>
                        <td className="gov-num-cell gov-num">{m.critical}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card
              title="Top Problem Areas"
              subtitle="Ranked by verified incident concentration."
              icon={MapPinned}
            >
              {hotspots.length === 0 ? (
                <EmptyState
                  icon={MapPinned}
                  title="No analytics available for the selected filters."
                  sub="No tracked problem area matches this zone."
                />
              ) : (
                <ol className="gov-an-areas">
                  {hotspots.map((h) => (
                    <li key={h.zone} className="gov-an-area">
                      <span className="gov-an-area-rank gov-num">{String(h.rank).padStart(2, '0')}</span>
                      <span className="gov-an-area-body">
                        <strong>{h.zone}</strong>
                        <span>{h.category}</span>
                      </span>
                      <span className="gov-an-area-right">
                        <strong className="gov-num">{h.count} incidents</strong>
                        <span className={h.trend.startsWith('−') ? 'gov-an-trend-down' : 'gov-an-trend-up'}>{h.trend}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          </div>

        </div>
      )}
    </div>
  );
}
