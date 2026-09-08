import React from 'react';
import { Search } from 'lucide-react';

export function SearchInput({ placeholder = 'Search…', value, onChange, width = 240 }) {
  return (
    <div className="gov-search" style={{ maxWidth: width }}>
      <Search size={14} className="gov-search-icon" aria-hidden="true" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
    </div>
  );
}

export function FilterSelect({ label, value, onChange, options, hideLabel = false }) {
  return (
    <select
      className="gov-filter-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      title={label}
    >
      {!hideLabel && <option value="All">{`All ${label}`}</option>}
      {options.map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  );
}

/**
 * Standard operations filter bar: search + dimension filters + date range.
 * children are appended at the end of the row.
 */
export function FilterBar({ children, end }) {
  return (
    <div className="gov-filterbar">
      {children}
      <div className="gov-spacer" />
      {end}
    </div>
  );
}
