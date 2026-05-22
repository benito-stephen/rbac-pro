import { useAnalytics } from '../hooks/useAnalytics';
import PageHeader from '../shared/PageHeader';
import StatCard from '../shared/StatCard';
import { DashboardSkeleton } from '../shared/Skeleton';
import TaskStatusChart from '../dashboard/TaskStatusChart';
import { PriorityBarChart } from '../analytics/AnalyticsCharts';
import {
  WeeklyGrowthChart,
  CompletionTrendChart,
  ActivityHeatChart,
  MostActiveUsersTable,
} from '../analytics/EnterpriseCharts';
import { Users, CheckSquare, TrendingUp, Activity } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAnalytics({ poll: true });

  if (isLoading) return <DashboardSkeleton />;

  const overview = data?.overview || {};

  return (
    <div>
      <PageHeader title="Analytics Dashboard" subtitle="Productivity reports & enterprise insights" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={overview.totalUsers ?? 0} icon={Users} color="brand" index={0} to="/admin/users" />
        <StatCard title="Total Tasks" value={overview.totalTasks ?? 0} icon={CheckSquare} color="green" index={1} to="/admin/tasks" />
        <StatCard title="Productivity" value={`${overview.productivityScore ?? overview.completionRate ?? 0}%`} icon={TrendingUp} color="purple" index={2} to="/admin/tasks" />
        <StatCard title="Engagement" value={data?.userEngagement ?? 0} icon={Activity} color="orange" index={3} to="/admin/activity" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <WeeklyGrowthChart users={data?.weeklyGrowth?.users} tasks={data?.weeklyGrowth?.tasks} />
        <CompletionTrendChart data={data?.completionTrends} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <TaskStatusChart data={data?.tasksByStatus} />
        <PriorityBarChart data={data?.tasksByPriority} />
        <ActivityHeatChart data={data?.activityByDay} />
      </div>

      <MostActiveUsersTable users={data?.mostActiveUsers} />
    </div>
  );
}
