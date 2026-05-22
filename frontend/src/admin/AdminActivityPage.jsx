import { useState } from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import { useActivity } from '../hooks/useActivity';
import { useDebounce } from '../hooks/useDebounce';
import PageHeader from '../shared/PageHeader';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import StatCard from '../shared/StatCard';
import DataTable from '../shared/DataTable';
import { TableSkeleton } from '../shared/Skeleton';
import { formatRelativeTime } from '../utils/format';

const ACTION_COLORS = {
  LOGIN: 'success',
  LOGOUT: 'default',
  LOGIN_FAILED: 'danger',
  TASK_CREATED: 'brand',
  TASK_UPDATED: 'warning',
  TASK_DELETED: 'danger',
  USER_SUSPENDED: 'danger',
};

export default function AdminActivityPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 30 });
  const debouncedSearch = useDebounce(filters.search, 400);

  const { logs, meta, stats, isLoading } = useActivity(
    { ...filters, search: debouncedSearch || undefined },
    { poll: true }
  );

  const columns = [
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <Badge variant={ACTION_COLORS[row.action] || 'default'} className="font-mono text-xs">
          {row.action}
        </Badge>
      ),
    },
    { key: 'user', label: 'User', render: (row) => row.user?.name || 'System' },
    { key: 'resource', label: 'Resource', render: (row) => (
      <span className="text-gray-500">{row.resource}{row.resourceId ? ` · ${row.resourceId.slice(-6)}` : ''}</span>
    )},
    { key: 'time', label: 'Time', render: (row) => formatRelativeTime(row.createdAt) },
  ];

  return (
    <div>
      <PageHeader title="Activity Monitoring" subtitle="Real-time audit trail & security events" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Last 24h Events" value={stats?.last24h ?? 0} icon={Activity} color="brand" index={0} />
        <StatCard title="Failed Logins (7d)" value={stats?.failedLogins ?? 0} icon={AlertCircle} color="orange" index={1} />
        <StatCard title="Total Shown" value={meta?.total ?? 0} icon={Activity} color="purple" index={2} />
      </div>

      <Card className="overflow-hidden p-0 mb-4">
        <div className="p-4 flex gap-3">
          <input
            type="text"
            placeholder="Search activity..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
          <select
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
            value={filters.action || ''}
            onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined, page: 1 })}
          >
            <option value="">All actions</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="LOGIN_FAILED">Failed login</option>
            <option value="TASK_CREATED">Task created</option>
            <option value="TASK_UPDATED">Task updated</option>
            <option value="TASK_DELETED">Task deleted</option>
            <option value="USER_SUSPENDED">User suspended</option>
          </select>
        </div>
        {isLoading ? (
          <div className="p-4"><TableSkeleton rows={12} /></div>
        ) : (
          <DataTable columns={columns} data={logs} emptyMessage="No activity recorded" />
        )}
        {meta?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700">
            <span className="text-sm text-gray-500">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={meta.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
