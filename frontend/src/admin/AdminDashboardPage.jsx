import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  CheckSquare,
  BarChart3,
  Activity,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useAdminOverview } from '../hooks/useAnalytics';
import PageHeader from '../shared/PageHeader';
import StatCard from '../shared/StatCard';
import Card from '../shared/Card';
import ProgressRing from '../shared/ProgressRing';
import { DashboardSkeleton } from '../shared/Skeleton';
import { WeeklyGrowthChart, CompletionTrendChart } from '../analytics/EnterpriseCharts';

const quickLinks = [
  { label: 'User Management', path: '/admin/users', icon: Users, color: 'brand' },
  { label: 'Task Monitoring', path: '/admin/tasks', icon: CheckSquare, color: 'green' },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3, color: 'purple' },
  { label: 'Activity Logs', path: '/admin/activity', icon: Activity, color: 'orange' },
];

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminOverview({ poll: true });

  if (isLoading) return <DashboardSkeleton />;

  const overview = data?.analytics?.overview || {};
  const insights = data?.systemInsights || {};

  return (
    <div>
      <PageHeader
        title="Admin Command Center"
        subtitle="Enterprise control, analytics & system insights"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Users" value={overview.totalUsers ?? 0} icon={Users} color="brand" index={0} to="/admin/users" />
        <StatCard title="Total Tasks" value={overview.totalTasks ?? 0} icon={CheckSquare} color="green" index={1} to="/admin/tasks" />
        <StatCard title="Completed" value={overview.completedTasks ?? 0} icon={TrendingUp} color="purple" index={2} to="/admin/tasks" />
        <StatCard title="Active Sessions" value={overview.activeSessions ?? 0} icon={Activity} color="orange" index={3} to="/admin/activity" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center py-8">
          <ProgressRing value={overview.completionRate ?? 0} size={120} />
          <p className="mt-4 text-sm font-medium text-gray-500">Productivity Score</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{overview.pendingTasks ?? 0} pending</p>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">System Insights</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link to="/admin/tasks" className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 hover:shadow-md transition block">
              <AlertTriangle className="h-5 w-5 text-orange-600 mb-2" />
              <p className="text-2xl font-bold">{insights.tasksOverdue ?? 0}</p>
              <p className="text-xs text-gray-500">Overdue tasks</p>
            </Link>
            <Link to="/admin/users" className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:shadow-md transition block">
              <Users className="h-5 w-5 text-red-600 mb-2" />
              <p className="text-2xl font-bold">{insights.usersInactive ?? 0}</p>
              <p className="text-xs text-gray-500">Suspended users</p>
            </Link>
            <Link to="/admin/activity" className="p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 hover:shadow-md transition block">
              <Activity className="h-5 w-5 text-brand-600 mb-2" />
              <p className="text-2xl font-bold">{data?.activityStats?.last24h ?? 0}</p>
              <p className="text-xs text-gray-500">Events (24h)</p>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <WeeklyGrowthChart
          users={data?.analytics?.weeklyGrowth?.users}
          tasks={data?.analytics?.weeklyGrowth?.tasks}
        />
        <CompletionTrendChart data={data?.analytics?.completionTrends} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link, i) => (
          <motion.div key={link.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={link.path}>
              <Card hover className="h-full group">
                <link.icon className="h-8 w-8 text-brand-600 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{link.label}</h3>
                <span className="inline-flex items-center gap-1 text-sm text-brand-600 mt-2 group-hover:gap-2 transition-all">
                  Open <ArrowRight className="h-4 w-4" />
                </span>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
