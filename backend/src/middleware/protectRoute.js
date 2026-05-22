import { verifyToken } from './verifyToken.js';

/**
 * Protects routes — requires valid authenticated session.
 */
export const protectRoute = verifyToken;
