import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import PageHeader from '../shared/PageHeader';
import { DashboardSkeleton } from '../shared/Skeleton';
import TaskStatusChart from '../dashboard/TaskStatusChart';
import { PriorityBarChart, ProjectProgressChart } from '../analytics/AnalyticsCharts';

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => analyticsService.getDashboard().then((r) => r.data.data),
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Insights and performance metrics"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskStatusChart data={data?.tasksByStatus} />
        <PriorityBarChart data={data?.tasksByPriority} />
      </div>

      <div className="mt-6">
        <ProjectProgressChart projects={data?.projectStats} />
      </div>
    </div>
  );
}
