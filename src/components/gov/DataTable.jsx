import React, { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

/**
 * Enterprise data table: sticky header, sortable columns, hover states,
 * pagination, and automatic stacked-card layout on small screens.
 *
 * columns: [{ key, label, sortable?, align?, width?, render?(row) }]
 * rows:    array of records (a stable `id` field is used as key when present)
 * mobileRender?: (row) => JSX — custom compact card; falls back to first 4 columns
 */
export default function DataTable({
  columns,
  rows,
  pageSize = 8,
  emptyTitle = 'No records found',
  emptySub = 'Adjust your filters or search terms to widen the query.',
  mobileRender,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    const get = col?.sortValue || ((r) => r[sortKey]);
    return [...rows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (col) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  const rowKey = (row, i) => row.id ?? row.logId ?? `row-${i}`;

  const rangeStart = sorted.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, sorted.length);

  if (sorted.length === 0) {
    return (
      <div className="gov-empty">
        <Inbox size={30} strokeWidth={1.5} />
        <div className="gov-empty-title">{emptyTitle}</div>
        <div className="gov-empty-sub">{emptySub}</div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="gov-table-wrap">
        <table className="gov-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.sortable ? 'gov-sortable' : ''}
                  style={{ textAlign: col.align || 'left', width: col.width }}
                  onClick={() => toggleSort(col)}
                  aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {col.label}
                  {col.sortable && (
                    <span className="gov-sort-ind">
                      {sortKey === col.key
                        ? (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
                        : <ChevronDown size={11} style={{ opacity: 0.35 }} />}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={rowKey(row, i)}>
                {columns.map((col) => (
                  <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="gov-mobile-cards">
        {pageRows.map((row, i) =>
          mobileRender ? (
            <div key={rowKey(row, i)} className="gov-mobile-card">{mobileRender(row)}</div>
          ) : (
            <div key={rowKey(row, i)} className="gov-mobile-card">
              {columns.slice(0, 5).map((col) => (
                <div key={col.key} className="gov-mc-row">
                  <span className="gov-mc-label">{col.label}</span>
                  <span>{col.render ? col.render(row) : row[col.key]}</span>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Pagination */}
      <div className="gov-pagination">
        <span className="gov-pagination-info">
          Showing {rangeStart}–{rangeEnd} of {sorted.length} records
        </span>
        <div className="gov-pagination-controls">
          <button className="gov-page-btn" onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page">
            <ChevronLeft size={13} />
          </button>
          {Array.from({ length: totalPages }, (_, idx) => idx + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && p - arr[idx - 1] > 1 && <span className="gov-meta" style={{ padding: '0 2px' }}>…</span>}
                <button className={`gov-page-btn ${p === currentPage ? 'current' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              </React.Fragment>
            ))}
          <button className="gov-page-btn" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Next page">
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </>
  );
}
