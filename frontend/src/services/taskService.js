import api from './api';

export const taskService = {
  getAll: (params) => api.get('/tasks', { params }),
  getStats: () => api.get('/tasks/stats'),
  getById: (id) => api.get(`/tasks/${id}`),
  getHistory: (id) => api.get(`/tasks/${id}/history`),
  getBoard: (projectId) => api.get(`/tasks/board/${projectId}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};
