import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/tokenUtils.js';
import User from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { USER_STATUS } from '../constants/index.js';

/**
 * Verifies JWT access token and attaches user to request.
 */
export const verifyToken = asyncHandler(async (req, res, next) => {
  let token =
    req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.accessToken;

  if (!token) {
    throw ApiError.unauthorized('Access token required');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token expired');
    }
    throw ApiError.unauthorized('Invalid access token');
  }

  const user = await User.findById(decoded.id).select('+password');

  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.forbidden('Account is suspended or inactive');
  }

  if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
    throw ApiError.unauthorized('Session invalidated. Please login again.');
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    throw ApiError.unauthorized('Password recently changed. Please login again.');
  }

  req.user = user;
  req.token = token;
  next();
});
