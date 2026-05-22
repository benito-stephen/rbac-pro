import { useAuthStore } from '../context/store/authStore';
import { hasPermission, hasAnyPermission, hasRole, isAdmin, isUser } from '../utils/permissions';

export const usePermissions = () => {
  const user = useAuthStore((s) => s.user);

  return {
    user,
    can: (permission) => hasPermission(user, permission),
    canAny: (permissions) => hasAnyPermission(user, permissions),
    hasRole: (...roles) => hasRole(user, ...roles),
    isAdmin: () => isAdmin(user),
    isUser: () => isUser(user),
  };
};
