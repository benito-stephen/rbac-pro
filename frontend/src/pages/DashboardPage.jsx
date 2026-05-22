import { useQuery } from '@tanstack/react-query';
import { Users, FolderKanban, CheckSquare, TrendingUp, Plus } from 'lucide-react';
import { useAuthStore } from '../context/store/authStore';
import { usePermissions } from '../hooks/usePermissions';
import { analyticsService } from '../services/analyticsService';
import { taskService } from '../services/taskService';
import PageHeader from '../shared/PageHeader';
import StatCard from '../shared/StatCard';
import Button from '../shared/Button';
import { DashboardSkeleton } from '../shared/Skeleton';
import TaskStatusChart from '../dashboard/TaskStatusChart';
import RecentTasksList from '../dashboard/RecentTasksList';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { isAdmin } = usePermissions();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => analyticsService.getDashboard().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  const { data: userTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['my-tasks-dashboard'],
    queryFn: () => taskService.getAll({ limit: 10 }).then((r) => r.data),
    enabled: !isAdmin(),
    refetchInterval: 30000,
  });

  if (isLoading || (!isAdmin() && tasksLoading)) return <DashboardSkeleton />;

  const overview = isAdmin()
    ? data?.overview || {}
    : {
        ...(data?.overview || {}),
        totalTasks: data?.overview?.totalTasks ?? userTasks?.meta?.total ?? 0,
      };

  const recentTasks = data?.recentTasks || userTasks?.data?.slice(0, 5) || [];
  const tasksByStatus = data?.tasksByStatus || {};

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}`}
        subtitle={isAdmin() ? 'Enterprise workspace overview' : 'Your personal task workspace'}
        action={
          <div className="flex gap-2">
            <Button to="/tasks" variant="secondary" icon={CheckSquare}>
              View Tasks
            </Button>
            <Button to="/tasks?create=1" icon={Plus}>
              New Task
            </Button>
            {isAdmin() && (
              <Button to="/admin" variant="outline">
                Admin Center
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isAdmin() && (
          <>
            <StatCard title="Total Users" value={overview.totalUsers ?? 0} icon={Users} color="brand" index={0} to="/admin/users" />
            <StatCard title="Active Projects" value={overview.totalProjects ?? 0} icon={FolderKanban} color="purple" index={1} to="/projects" />
          </>
        )}
        {!isAdmin() && (
          <StatCard title="My Projects" value={overview.totalProjects ?? 0} icon={FolderKanban} color="purple" index={0} to="/projects" />
        )}
        <StatCard
          title={isAdmin() ? 'Total Tasks' : 'My Tasks'}
          value={overview.totalTasks ?? 0}
          icon={CheckSquare}
          color="green"
          index={2}
          to="/tasks"
        />
        <StatCard
          title="Completion Rate"
          value={`${overview.completionRate ?? 0}%`}
          icon={TrendingUp}
          color="orange"
          index={3}
          to={isAdmin() ? '/admin/analytics' : '/tasks'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(isAdmin() || Object.keys(tasksByStatus).length > 0) && <TaskStatusChart data={tasksByStatus} />}
        <RecentTasksList tasks={recentTasks} />
      </div>
    </div>
  );
}
