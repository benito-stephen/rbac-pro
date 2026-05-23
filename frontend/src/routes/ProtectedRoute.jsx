import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../context/store/authStore';
import { usePermissions } from '../hooks/usePermissions';
import { DashboardSkeleton } from '../shared/Skeleton';

export function ProtectedRoute({ children, adminOnly, roles, permission }) {
  const { isAuthenticated, isLoading, isSessionExpired, logout } = useAuthStore();
  const { isAdmin, hasRole, can } = usePermissions();
  const location = useLocation();
  const sessionExpired = isSessionExpired();

  useEffect(() => {
    if (sessionExpired && isAuthenticated) {
      logout();
    }
  }, [sessionExpired, isAuthenticated, logout]);

  if (isLoading) {
    return (
      <div className="p-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (sessionExpired) {
    return <Navigate to="/login" state={{ from: location, reason: 'session_expired' }} replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (roles && !hasRole(...roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (permission && !can(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
}

export function AdminRoute({ children }) {
  return <ProtectedRoute adminOnly>{children}</ProtectedRoute>;
}
