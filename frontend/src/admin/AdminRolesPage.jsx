import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { roleService } from '../services/roleService';
import PageHeader from '../shared/PageHeader';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import { TableSkeleton } from '../shared/Skeleton';

export default function AdminRolesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getAll().then((r) => r.data.data.roles),
  });

  return (
    <div>
      <PageHeader title="Role Management" subtitle="Configure roles and permissions" />

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="grid gap-4">
          {(data || []).map((role) => (
            <Card key={role._id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/30">
                    <Shield className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{role.displayName}</h3>
                    <p className="text-sm text-gray-500">{role.name}</p>
                  </div>
                </div>
                {role.isSystem && <Badge variant="warning">System</Badge>}
              </div>
              <p className="text-sm text-gray-500 mt-3">{role.description || 'No description'}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {(role.permissions || []).map((perm) => (
                  <Badge key={perm} variant="default" className="text-xs">{perm}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
