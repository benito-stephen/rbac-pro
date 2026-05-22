import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { taskService } from '../services/taskService';

export const useTasks = (params = {}, options = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskService.getAll(params).then((r) => r.data),
    refetchInterval: options.poll ? 30000 : false,
    ...options,
  });

  const statsQuery = useQuery({
    queryKey: ['task-stats'],
    queryFn: () => taskService.getStats().then((r) => r.data.data),
    refetchInterval: options.poll ? 30000 : false,
  });

  const createMutation = useMutation({
    mutationFn: taskService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      toast.success('Task created');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create task'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => taskService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      toast.success('Task updated');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update task'),
  });

  const deleteMutation = useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-analytics'] });
      toast.success('Task deleted');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete task'),
  });

  return {
    ...query,
    tasks: query.data?.data || [],
    meta: query.data?.meta,
    stats: statsQuery.data,
    statsLoading: statsQuery.isLoading,
    createTask: createMutation.mutateAsync,
    updateTask: updateMutation.mutateAsync,
    deleteTask: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useTaskHistory = (taskId, enabled = true) =>
  useQuery({
    queryKey: ['task-history', taskId],
    queryFn: () => taskService.getHistory(taskId).then((r) => r.data.data.history),
    enabled: !!taskId && enabled,
  });
