import crypto from 'crypto';
import User from '../models/User.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
  verifyRefreshToken,
  buildTokenPayload,
} from '../utils/tokenUtils.js';
import { logActivity, ACTIVITY_ACTIONS } from '../services/activityService.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js';
import { ROLES, USER_STATUS } from '../constants/index.js';
import { getPermissionsForRole } from '../constants/index.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 30 * 60 * 1000;

const issueTokens = async (user, res) => {
  const payload = buildTokenPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshToken = refreshToken;
  user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);
  return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.findOne({ email })) {
    throw ApiError.conflict('Email already registered');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: ROLES.USER,
    status: USER_STATUS.ACTIVE,
  });

  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  try {
    await sendWelcomeEmail(user, verificationToken);
  } catch {
    // Registration should succeed even if email delivery fails
  }

  const { accessToken } = await issueTokens(user, res);

  await logActivity({ user: user._id, action: ACTIVITY_ACTIONS.REGISTER, resource: 'user', resourceId: user._id, req });

  ApiResponse.created(res, {
    message: 'Registration successful',
    data: { user: formatUser(user), accessToken },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken +lockUntil +failedLoginAttempts');

  if (!user) {
    await logActivity({
      action: ACTIVITY_ACTIONS.LOGIN_FAILED,
      resource: 'auth',
      details: { email, reason: 'user_not_found' },
      req,
      severity: 'warning',
    });
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (user.isLocked) {
    throw ApiError.forbidden('Account temporarily locked. Try again later.');
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw ApiError.forbidden('Account is suspended. Contact administrator.');
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
    }
    await user.save({ validateBeforeSave: false });
    await logActivity({
      user: user._id,
      action: ACTIVITY_ACTIONS.LOGIN_FAILED,
      resource: 'auth',
      details: { email, attempts: user.failedLoginAttempts },
      req,
      severity: 'warning',
    });
    throw ApiError.unauthorized('Invalid email or password');
  }

  user.lastLogin = new Date();
  const { accessToken } = await issueTokens(user, res);

  await logActivity({ user: user._id, action: ACTIVITY_ACTIONS.LOGIN, resource: 'user', resourceId: user._id, req });

  ApiResponse.success(res, {
    message: 'Login successful',
    data: { user: formatUser(user), accessToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id).select('+refreshToken');
      if (user) {
        user.refreshToken = undefined;
        user.refreshTokenExpires = undefined;
        user.tokenVersion += 1;
        await user.save({ validateBeforeSave: false });
        await logActivity({
          user: user._id,
          action: ACTIVITY_ACTIONS.LOGOUT,
          resource: 'user',
          resourceId: user._id,
          req,
        });
      }
    } catch {
      // Still clear cookies even if token is invalid or expired
    }
  }

  clearTokenCookies(res);
  ApiResponse.success(res, { message: 'Logged out successfully' });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) throw ApiError.unauthorized('Refresh token required');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken +refreshTokenExpires');

  if (
    !user ||
    user.refreshToken !== token ||
    user.status !== USER_STATUS.ACTIVE ||
    decoded.tokenVersion !== user.tokenVersion
  ) {
    throw ApiError.unauthorized('Session expired. Please login again.');
  }

  if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
    throw ApiError.unauthorized('Refresh token expired');
  }

  const { accessToken } = await issueTokens(user, res);

  ApiResponse.success(res, {
    message: 'Token refreshed',
    data: { accessToken, user: formatUser(user) },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(user, resetToken);
    await logActivity({ user: user._id, action: 'PASSWORD_RESET', resource: 'user', resourceId: user._id, details: { step: 'requested' }, req });
  }

  ApiResponse.success(res, {
    message: 'If an account exists with that email, a reset link has been sent.',
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, email, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    email,
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.tokenVersion += 1;
  user.refreshToken = undefined;
  await user.save();

  await logActivity({ user: user._id, action: ACTIVITY_ACTIONS.PASSWORD_RESET, resource: 'user', resourceId: user._id, req });

  ApiResponse.success(res, { message: 'Password reset successful. Please login.' });
});

export const getMe = asyncHandler(async (req, res) => {
  ApiResponse.success(res, { data: { user: formatUser(req.user) } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar, preferences } = req.body;
  if (name) req.user.name = name;
  if (avatar !== undefined) req.user.avatar = avatar;
  if (preferences) req.user.preferences = { ...req.user.preferences, ...preferences };
  await req.user.save();
  ApiResponse.success(res, { message: 'Profile updated', data: { user: formatUser(req.user) } });
});

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  status: user.status,
  permissions: getPermissionsForRole(user.role),
  emailVerified: user.emailVerified,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
