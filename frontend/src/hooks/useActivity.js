import { useQuery } from '@tanstack/react-query';
import { activityService } from '../services/activityService';

export const useActivity = (params = {}, options = {}) => {
  const logsQuery = useQuery({
    queryKey: ['activity-logs', params],
    queryFn: () => activityService.getLogs(params).then((r) => r.data),
    refetchInterval: options.poll ? 20000 : false,
  });

  const statsQuery = useQuery({
    queryKey: ['activity-stats'],
    queryFn: () => activityService.getStats().then((r) => r.data.data),
    refetchInterval: options.poll ? 30000 : false,
  });

  return {
    logs: logsQuery.data?.data || [],
    meta: logsQuery.data?.meta,
    stats: statsQuery.data,
    isLoading: logsQuery.isLoading,
    refetch: logsQuery.refetch,
  };
};
