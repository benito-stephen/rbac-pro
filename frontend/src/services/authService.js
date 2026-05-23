import api from './api';

const withNormalizedEmail = (data) => ({
  ...data,
  email: typeof data.email === 'string' ? data.email.trim().toLowerCase() : data.email,
});

export const authService = {
  register: (data) => api.post('/auth/register', withNormalizedEmail(data)),
  login: (data) => api.post('/auth/login', withNormalizedEmail(data)),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};
