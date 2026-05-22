import api from './api';

export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getFull: () => api.get('/analytics/full'),
  getAuditLogs: (params) => api.get('/analytics/audit', { params }),
};
