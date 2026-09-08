import React, { useRef, useState } from 'react';

/**
 * Analytics chart primitives for the Barangay Operations console.
 * Plain SVG / CSS — no chart library, no decoration that does not
 * carry information. Every chart exposes an aria-label summary;
 * tabular equivalents live in the page's monthly overview table.
 */

/* Round an axis maximum up to a clean half-step (10 → 10, 48 → 50, 180 → 200) */
function niceMax(v) {
  if (v <= 10) return 10;
  const step = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / (step / 2)) * (step / 2);
}

const VB_W = 820;

/**
 * TrendChart — multi-series line chart with an optional soft area for
 * the first series, subtle horizontal grid, sparse date ticks, and a
 * shared hover tooltip with a vertical guide.
 *
 * points: [{ label, longLabel, values: { [seriesKey]: number } }]
 * series: [{ key, label, color, area? }]
 */
export function TrendChart({ points, series, height = 280, ariaLabel }) {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null);

  const n = points.length;
  const padL = 46;
  const padR = 14;
  const padT = 16;
  const padB = 30;
  const h = height;
  const max = niceMax(Math.max(1, ...points.flatMap((p) => series.map((s) => p.values[s.key] || 0))));
  const x = (i) => padL + (i / (n - 1)) * (VB_W - padL - padR);
  const y = (v) => padT + (1 - v / max) * (h - padT - padB);
  const linePath = (key) => points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.values[key] || 0).toFixed(1)}`).join(' ');
  const areaPath = (key) => {
    const base = h - padB;
    return `${linePath(key)} L${x(n - 1).toFixed(1)},${base} L${x(0).toFixed(1)},${base} Z`;
  };

  const tickCount = Math.min(n, 6);
  const tickIdx = Array.from({ length: tickCount }, (_, i) => Math.round((i * (n - 1)) / (tickCount - 1)));
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  const onMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * VB_W;
    const t = (px - padL) / (VB_W - padL - padR);
    const idx = Math.round(t * (n - 1));
    setHover(idx >= 0 && idx < n ? idx : null);
  };

  const hoverPoint = hover !== null ? points[hover] : null;

  return (
    <div
      ref={wrapRef}
      className="gov-an-chart"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg
        viewBox={`0 0 ${VB_W} ${h}`}
        width="100%"
        role="img"
        aria-label={ariaLabel}
      >
        {/* Subtle horizontal grid */}
        {gridVals.map((v) => (
          <g key={v}>
            <line x1={padL} x2={VB_W - padR} y1={y(v)} y2={y(v)} className="gov-an-grid" />
            <text x={padL - 8} y={y(v) + 4} className="gov-an-axis" textAnchor="end">{v}</text>
          </g>
        ))}

        {/* Sparse date ticks */}
        {tickIdx.map((i) => (
          <text key={i} x={x(i)} y={h - 8} className="gov-an-axis gov-an-tick" textAnchor="middle">
            {points[i].label}
          </text>
        ))}

        {/* Area (first series only, when enabled) then lines */}
        {series.filter((s) => s.area).map((s) => (
          <path key={`a-${s.key}`} d={areaPath(s.key)} fill={s.color} fillOpacity="0.08" stroke="none" />
        ))}
        {series.map((s) => (
          <path key={`l-${s.key}`} d={linePath(s.key)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        ))}

        {/* Hover guide + point markers */}
        {hoverPoint && (
          <g>
            <line
              x1={x(hover)} x2={x(hover)} y1={padT} y2={h - padB}
              stroke="rgba(31, 111, 95, 0.30)" strokeWidth="1" strokeDasharray="3 3"
            />
            {series.map((s) => (
              <circle
                key={`d-${s.key}`}
                cx={x(hover)}
                cy={y(hoverPoint.values[s.key] || 0)}
                r="4"
                fill="#ffffff"
                stroke={s.color}
                strokeWidth="2"
              />
            ))}
          </g>
        )}
      </svg>

      {/* Shared hover tooltip */}
      {hoverPoint && (
        <div
          className="gov-an-tip"
          style={{ left: `${(x(hover) / VB_W) * 100}%` }}
        >
          <span className="gov-an-tip-date">{hoverPoint.longLabel}</span>
          {series.map((s) => (
            <span key={s.key} className="gov-an-tip-row">
              <span className="gov-an-tip-swatch" style={{ background: s.color }} aria-hidden="true" />
              {s.label}: <strong className="gov-num">{hoverPoint.values[s.key]}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * HBars — ranked horizontal bar list (magnitude by one hue).
 * items: [{ label, value, display?, dim? }]
 */
export function HBars({ items, color = '#2fa084', unit = '', ariaLabel }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="gov-an-hbars" role="img" aria-label={ariaLabel}>
      {items.map((it) => (
        <div key={it.label} className={`gov-an-hbar ${it.dim ? 'dim' : ''}`}>
          <span className="gov-an-hbar-label">{it.label}</span>
          <span className="gov-an-hbar-track">
            <span
              className="gov-an-hbar-fill"
              style={{ width: `${(it.value / max) * 100}%`, background: color }}
            />
          </span>
          <span className="gov-an-hbar-value gov-num">{it.display ?? it.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * VBars — vertical bar chart anchored to a baseline.
 * items: [{ label, value, display? }]
 */
export function VBars({ items, color = '#2fa084', unit = '', ariaLabel }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="gov-an-vbars" role="img" aria-label={ariaLabel}>
      {items.map((it) => (
        <div key={it.label} className="gov-an-vbar" title={`${it.label}: ${it.display ?? it.value}${unit}`}>
          <span className="gov-an-vbar-val gov-num">{it.display ?? it.value}</span>
          <span className="gov-an-vbar-track">
            <span
              className="gov-an-vbar-fill"
              style={{ height: `${(it.value / max) * 100}%`, background: color }}
            />
          </span>
          <span className="gov-an-vbar-lbl">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Donut — compact proportion ring with a centered total.
 * segments: [{ key, label, value, color }]
 */
export function Donut({ segments, size = 148, thickness = 18, centerLabel, centerSub, ariaLabel }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={ariaLabel}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((seg) => {
          const len = (seg.value / total) * c;
          const el = (
            <circle
              key={seg.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-acc}
            />
          );
          acc += len;
          return el;
        })}
      </g>
      <text x={size / 2} y={size / 2 - 2} textAnchor="middle" className="gov-an-donut-num gov-num">{centerLabel}</text>
      <text x={size / 2} y={size / 2 + 16} textAnchor="middle" className="gov-an-donut-sub">{centerSub}</text>
    </svg>
  );
}
