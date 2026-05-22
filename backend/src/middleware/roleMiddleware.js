import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPermissionsForRole } from '../constants/index.js';

/**
 * Role-based middleware — checks user role against allowed roles.
 */
export const roleMiddleware =
  (...allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(`Access restricted to: ${allowedRoles.join(', ')}`);
    }
    next();
  });

/**
 * Permission-based middleware — uses role permission map.
 */
export const requirePermission =
  (...permissions) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    const userPermissions = getPermissionsForRole(req.user.role);
    const hasPermission = permissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      throw ApiError.forbidden('Insufficient permissions for this action');
    }
    next();
  });

export const isAdmin = (user) => user?.role === 'admin';

export const canAccessTask = (user, task) => {
  if (isAdmin(user)) return true;
  const ownerId = (task.createdBy || task.reporter)?.toString();
  return ownerId === user._id.toString();
};
