import Role from '../models/Role.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find({ isActive: true }).sort({ name: 1 });
  ApiResponse.success(res, { data: { roles } });
});

export const getRoleById = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw ApiError.notFound('Role not found');
  ApiResponse.success(res, { data: { role } });
});

export const createRole = asyncHandler(async (req, res) => {
  const { name, displayName, description, permissions } = req.body;

  if (await Role.findOne({ name: name.toLowerCase() })) {
    throw ApiError.conflict('Role already exists');
  }

  const role = await Role.create({
    name: name.toLowerCase(),
    displayName,
    description,
    permissions: permissions || [],
  });

  ApiResponse.created(res, { message: 'Role created', data: { role } });
});

export const updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw ApiError.notFound('Role not found');
  if (role.isSystem && req.body.name) {
    throw ApiError.badRequest('Cannot rename system roles');
  }

  const { displayName, description, permissions, isActive } = req.body;
  if (displayName) role.displayName = displayName;
  if (description !== undefined) role.description = description;
  if (permissions) role.permissions = permissions;
  if (isActive !== undefined) role.isActive = isActive;

  await role.save();
  ApiResponse.success(res, { message: 'Role updated', data: { role } });
});

export const deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw ApiError.notFound('Role not found');
  if (role.isSystem) throw ApiError.badRequest('Cannot delete system roles');

  role.isActive = false;
  await role.save();
  ApiResponse.success(res, { message: 'Role deactivated' });
});
