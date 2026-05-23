import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../../services/authService';
import { SESSION_TIMEOUT_MS } from '../../constants';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      lastActivity: Date.now(),
      sessionExpiresAt: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          sessionExpiresAt: Date.now() + SESSION_TIMEOUT_MS,
        }),

      setAccessToken: (accessToken) => set({ accessToken }),

      touchActivity: () => {
        const { isAuthenticated } = get();
        if (isAuthenticated) {
          set({
            lastActivity: Date.now(),
            sessionExpiresAt: Date.now() + SESSION_TIMEOUT_MS,
          });
        }
      },

      clearSession: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          sessionExpiresAt: null,
          isLoading: false,
        });
      },

      resetAuth: () => {
        get().clearSession();
        useAuthStore.persist.clearStorage();
      },

      login: async (credentials) => {
        const { data } = await authService.login(credentials);
        set({
          user: data.data.user,
          accessToken: data.data.accessToken,
          isAuthenticated: true,
          isLoading: false,
          lastActivity: Date.now(),
          sessionExpiresAt: Date.now() + SESSION_TIMEOUT_MS,
        });
        return data;
      },

      register: async (userData) => {
        const { data } = await authService.register(userData);
        set({
          user: data.data.user,
          accessToken: data.data.accessToken,
          isAuthenticated: true,
          isLoading: false,
          lastActivity: Date.now(),
          sessionExpiresAt: Date.now() + SESSION_TIMEOUT_MS,
        });
        return data;
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          get().resetAuth();
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        const token = get().accessToken;

        const applyUser = (user, accessToken = get().accessToken) => {
          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: Date.now(),
            sessionExpiresAt: Date.now() + SESSION_TIMEOUT_MS,
          });
        };

        try {
          if (token) {
            const { data } = await authService.getMe();
            applyUser(data.data.user);
            return;
          }

          const refreshed = await get().refreshSession();
          if (!refreshed) {
            get().clearSession();
            set({ isLoading: false });
          }
        } catch {
          const refreshed = await get().refreshSession();
          if (refreshed) return;
          get().clearSession();
          set({ isLoading: false });
        }
      },

      refreshSession: async () => {
        try {
          const { data } = await authService.refreshToken();
          set({
            accessToken: data.data.accessToken,
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
            lastActivity: Date.now(),
            sessionExpiresAt: Date.now() + SESSION_TIMEOUT_MS,
          });
          return true;
        } catch {
          return false;
        }
      },

      updateUser: (user) => set({ user }),

      isSessionExpired: () => {
        const { sessionExpiresAt, isAuthenticated } = get();
        if (!isAuthenticated) return false;
        return sessionExpiresAt != null && Date.now() > sessionExpiresAt;
      },
    }),
    {
      name: 'rbac-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        lastActivity: state.lastActivity,
        sessionExpiresAt: state.sessionExpiresAt,
      }),
    }
  )
);
