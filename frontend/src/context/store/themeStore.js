import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system',

      setTheme: (theme) => set({ theme }),

      toggleTheme: () => {
        const current = get().theme;
        if (current === 'light') set({ theme: 'dark' });
        else if (current === 'dark') set({ theme: 'light' });
        else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          set({ theme: prefersDark ? 'light' : 'dark' });
        }
      },

      initTheme: () => {
        const { theme } = get();
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else if (theme === 'light') root.classList.remove('dark');
      },
    }),
    { name: 'rbac-theme' }
  )
);
