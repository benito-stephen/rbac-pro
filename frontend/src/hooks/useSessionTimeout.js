import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../context/store/authStore';
import { SESSION_TIMEOUT_MS, SESSION_WARNING_MS } from '../constants';

export const useSessionTimeout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, refreshSession, touchActivity, isSessionExpired } = useAuthStore();
  const warningShown = useRef(false);

  const handleActivity = useCallback(() => {
    touchActivity();
    warningShown.current = false;
  }, [touchActivity]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, handleActivity));

    const interval = setInterval(async () => {
      const expiresAt = useAuthStore.getState().sessionExpiresAt;
      if (!expiresAt) return;

      const remaining = expiresAt - Date.now();

      if (remaining <= 0 || isSessionExpired()) {
        const refreshed = await refreshSession();
        if (!refreshed) {
          await logout();
          toast.error('Session expired due to inactivity');
          navigate('/login');
        }
        return;
      }

      if (remaining <= SESSION_WARNING_MS && !warningShown.current) {
        warningShown.current = true;
        toast('Session expiring soon. Stay active or you will be logged out.', {
          icon: '⏱️',
          duration: 5000,
        });
      }

      if (remaining <= SESSION_TIMEOUT_MS / 2) {
        await refreshSession();
      }
    }, 60000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearInterval(interval);
    };
  }, [isAuthenticated, handleActivity, logout, navigate, refreshSession, isSessionExpired]);

  return { touchActivity: handleActivity };
};
