import User from '../models/User.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logActivity, ACTIVITY_ACTIONS } from '../services/activityService.js';
import { sendAccountSuspendedEmail } from '../services/emailService.js';
import { getPermissionsForRole } from '../constants/index.js';
import { ROLES, USER_STATUS } from '../constants/index.js';

export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, status } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).select('-password -refreshToken').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  ApiResponse.paginated(res, { message: 'Users retrieved', data: users.map(formatUser), page, limit, total });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');
  if (!user) throw ApiError.notFound('User not found');
  ApiResponse.success(res, { data: { user: formatUser(user) } });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (await User.findOne({ email })) throw ApiError.conflict('Email already exists');

  const user = await User.create({
    name,
    email,
    password,
    role: role || ROLES.USER,
    status: USER_STATUS.ACTIVE,
  });

  await logActivity({
    user: req.user._id,
    action: ACTIVITY_ACTIONS.USER_CREATED,
    resource: 'user',
    resourceId: user._id,
    details: { email },
    req,
  });

  ApiResponse.created(res, { message: 'User created', data: { user: formatUser(user) } });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const { name, role, status } = req.body;
  if (name) user.name = name;
  if (role && [ROLES.ADMIN, ROLES.USER].includes(role)) user.role = role;
  if (status && Object.values(USER_STATUS).includes(status)) {
    const wasActive = user.status === USER_STATUS.ACTIVE;
    user.status = status;
    if (wasActive && status === USER_STATUS.INACTIVE) {
      user.tokenVersion += 1;
      user.refreshToken = undefined;
      await sendAccountSuspendedEmail(user);
    }
  }

  await user.save();

  await logActivity({
    user: req.user._id,
    action: ACTIVITY_ACTIONS.USER_UPDATED,
    resource: 'user',
    resourceId: user._id,
    details: { status, role },
    req,
  });

  ApiResponse.success(res, { message: 'User updated', data: { user: formatUser(user) } });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (user._id.toString() === req.user._id.toString()) {
    throw ApiError.badRequest('Cannot change your own status');
  }

  const { status } = req.body;
  if (!Object.values(USER_STATUS).includes(status)) {
    throw ApiError.badRequest('Invalid status');
  }

  user.status = status;
  if (status === USER_STATUS.INACTIVE) {
    user.tokenVersion += 1;
    user.refreshToken = undefined;
    await sendAccountSuspendedEmail(user);
  }

  await user.save();

  await logActivity({
    user: req.user._id,
    action: status === USER_STATUS.INACTIVE ? ACTIVITY_ACTIONS.USER_SUSPENDED : ACTIVITY_ACTIONS.USER_ACTIVATED,
    resource: 'user',
    resourceId: user._id,
    req,
  });

  ApiResponse.success(res, {
    message: `User ${status === USER_STATUS.ACTIVE ? 'activated' : 'suspended'}`,
    data: { user: formatUser(user) },
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (user._id.toString() === req.user._id.toString()) {
    throw ApiError.badRequest('Cannot deactivate your own account');
  }

  user.status = USER_STATUS.INACTIVE;
  user.tokenVersion += 1;
  user.refreshToken = undefined;
  await user.save();

  await logActivity({
    user: req.user._id,
    action: ACTIVITY_ACTIONS.USER_DELETED,
    resource: 'user',
    resourceId: user._id,
    req,
  });

  ApiResponse.success(res, { message: 'User suspended' });
});

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  status: user.status,
  permissions: getPermissionsForRole(user.role),
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
