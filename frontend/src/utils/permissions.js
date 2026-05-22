import { ROLE_PERMISSIONS, ROLES } from '../constants';

export const getUserPermissions = (user) => {
  if (!user) return [];
  if (user.permissions?.length) return user.permissions;
  return ROLE_PERMISSIONS[user.role] || [];
};

export const hasPermission = (user, permission) => {
  return getUserPermissions(user).includes(permission);
};

export const hasAnyPermission = (user, perms) => perms.some((p) => hasPermission(user, p));

export const hasRole = (user, ...roles) => roles.includes(user?.role);

export const isAdmin = (user) => user?.role === ROLES.ADMIN;

export const isUser = (user) => user?.role === ROLES.USER;
