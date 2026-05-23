import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../context/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];

const isAuthRequest = (url = '') => AUTH_PATHS.some((path) => url.includes(path));

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  // Render free tier can take 60s+ to wake from sleep
  timeout: import.meta.env.PROD ? 120000 : 30000,
});

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((cb) => cb(error, token));
  refreshQueue = [];
};

const PUBLIC_AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/'];

const forceLogout = () => {
  useAuthStore.getState().clearSession();
  const path = window.location.pathname;
  const isPublic = PUBLIC_AUTH_PATHS.includes(path);
  if (!isPublic) {
    toast.error('Session expired. Please sign in again.');
    window.location.href = '/login';
  }
};

api.interceptors.request.use((config) => {
  if (!isAuthRequest(config.url)) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    useAuthStore.getState().touchActivity();
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};

    if (error.response?.status === 401 && !original._retry) {
      if (isAuthRequest(original.url)) {
        return Promise.reject(error);
      }

      const hasToken = useAuthStore.getState().accessToken;
      if (!hasToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((err, token) => {
            if (err) reject(err);
            else {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(api(original));
            }
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        useAuthStore.getState().setUser(data.data.user);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
