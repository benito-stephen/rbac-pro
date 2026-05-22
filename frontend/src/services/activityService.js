import api from './api';

export const activityService = {
  getLogs: (params) => api.get('/activity', { params }),
  getStats: () => api.get('/activity/stats'),
};
