import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import PageHeader from '../shared/PageHeader';
import Card from '../shared/Card';
import { TableSkeleton } from '../shared/Skeleton';
import { formatDate, formatRelativeTime } from '../utils/format';

export default function AdminAuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => analyticsService.getAuditLogs({ limit: 50 }).then((r) => r.data),
  });

  const logs = data?.data || [];

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="System activity and security events" />

      {isLoading ? (
        <TableSkeleton rows={10} />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/50">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Action</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Resource</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">User</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-6 py-4 font-mono text-xs font-medium">{log.action}</td>
                    <td className="px-6 py-4 text-gray-500">{log.resource} {log.resourceId && `#${log.resourceId.slice(-6)}`}</td>
                    <td className="px-6 py-4">
                      {log.user ? log.user.name : 'System'}
                    </td>
                    <td className="px-6 py-4 text-gray-500" title={formatDate(log.createdAt)}>
                      {formatRelativeTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
