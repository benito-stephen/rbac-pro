import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import { adminService } from '../services/adminService';
import { usePermissions } from './usePermissions';

export const useAnalytics = (options = {}) => {
  const { isAdmin } = usePermissions();

  return useQuery({
    queryKey: ['analytics', isAdmin() ? 'full' : 'dashboard'],
    queryFn: () =>
      isAdmin()
        ? analyticsService.getFull().then((r) => r.data.data)
        : analyticsService.getDashboard().then((r) => r.data.data),
    refetchInterval: options.poll ? 30000 : false,
    ...options,
  });
};

export const useAdminOverview = (options = {}) =>
  useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => adminService.getOverview().then((r) => r.data.data),
    refetchInterval: options.poll ? 30000 : false,
    ...options,
  });
