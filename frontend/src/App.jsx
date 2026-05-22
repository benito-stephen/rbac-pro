import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { useThemeStore } from './context/store/themeStore';
import { useAuthStore } from './context/store/authStore';

const PUBLIC_AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

function App() {
  const { theme, initTheme } = useThemeStore();
  const { checkAuth, clearSession } = useAuthStore();
  const location = useLocation();
  const isPublicAuth = PUBLIC_AUTH_ROUTES.includes(location.pathname);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (isPublicAuth) {
      clearSession();
      useAuthStore.setState({ isLoading: false });
    } else {
      checkAuth();
    }
  }, [isPublicAuth, checkAuth, clearSession, location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [theme]);

  return <AppRoutes />;
}

export default App;
