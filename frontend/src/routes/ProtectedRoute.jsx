import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../context/store/authStore';
import { usePermissions } from '../hooks/usePermissions';
import { DashboardSkeleton } from '../shared/Skeleton';

export function ProtectedRoute({ children, adminOnly, roles, permission }) {
  const { isAuthenticated, isLoading, isSessionExpired, logout } = useAuthStore();
  const { isAdmin, hasRole, can } = usePermissions();
  const location = useLocation();

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

  if (isSessionExpired()) {
    logout();
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

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return children;
}

export function AdminRoute({ children }) {
  return <ProtectedRoute adminOnly>{children}</ProtectedRoute>;
}
