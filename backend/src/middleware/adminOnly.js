import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../constants/index.js';

/**
 * Restricts access to admin role only.
 */
export const adminOnly = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }
  if (req.user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Admin access required');
  }
  next();
});
