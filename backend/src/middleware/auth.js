/**
 * Centralized auth middleware exports (backward compatible).
 */
export { verifyToken } from './verifyToken.js';
export { protectRoute, protectRoute as protect } from './protectRoute.js';
export { adminOnly } from './adminOnly.js';
export { roleMiddleware, requirePermission, isAdmin, canAccessTask } from './roleMiddleware.js';
