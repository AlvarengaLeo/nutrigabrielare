import React from 'react';

export default function DataTable({
  columns = [],
  data = [],
  onRowClick,
  emptyMessage = 'No hay datos',
}) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-primary/5 bg-white">
      <table className="w-full text-left text-sm font-body">
        {/* Head */}
        <thead>
          <tr className="border-b border-primary/5">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 font-semibold text-primary/50 whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-primary/40 font-body"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id ?? rowIndex}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-primary/5 last:border-0 transition-colors
                  hover:bg-primary/[0.02]
                  ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-primary/80 whitespace-nowrap">
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
