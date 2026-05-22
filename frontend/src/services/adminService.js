import api from './api';

export const adminService = {
  getOverview: () => api.get('/admin/overview'),
  getAllTasks: (params) => api.get('/admin/tasks', { params }),
};
