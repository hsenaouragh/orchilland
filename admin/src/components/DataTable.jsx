import { useMemo, useState } from 'react'
import { Magnifier } from '@gravity-ui/icons'

// ─────────────────────────────────────────────────────────────────────────────
// Generic, configuration-driven table.
//
//   columns: [{ key, header, render?(row), className?, align? }]
//   rows:    array of records
//   searchKeys: fields used by the built-in search box
//   getRowId: row => id
// ─────────────────────────────────────────────────────────────────────────────

const DataTable = ({
  columns,
  rows,
  searchKeys = [],
  searchPlaceholder = 'Search…',
  getRowId = (r) => r.id,
  onRowClick,
  empty = 'Nothing here yet.',
  toolbar,
}) => {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim() || searchKeys.length === 0) return rows
    const q = query.toLowerCase()
    return rows.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q)),
    )
  }, [rows, query, searchKeys])

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      {(searchKeys.length > 0 || toolbar) && (
        <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          {searchKeys.length > 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 sm:w-72">
              <Magnifier className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-faint)]"
              />
            </div>
          ) : <span />}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      )}

      <div className="admin-scroll overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-panel)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)]">
                  {empty}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={getRowId(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-[var(--color-border)] last:border-0 transition ${
                    onRowClick ? 'cursor-pointer hover:bg-[var(--color-accent-faint)]' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 align-middle text-[var(--color-text-body)] ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''
                      } ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
