import { cn } from '../utils/format';

export default function DataTable({ columns, data, onRowClick, emptyMessage = 'No data' }) {
  if (!data?.length) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider',
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
          {data.map((row, i) => (
            <tr
              key={row._id || row.id || i}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'transition-colors',
                onRowClick && 'cursor-pointer hover:bg-brand-50/50 dark:hover:bg-brand-950/30'
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn('px-4 py-3.5', col.className)}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
