import Project from '../models/Project.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logActivity, ACTIVITY_ACTIONS } from '../services/activityService.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

export const getProjects = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const query = isAdmin(req.user)
    ? {}
    : { $or: [{ owner: req.user._id }, { members: req.user._id }] };

  if (status) query.status = status;
  if (search) query.name = { $regex: search, $options: 'i' };

  const skip = (page - 1) * limit;
  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate('owner', 'name avatar')
      .populate('members', 'name avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Project.countDocuments(query),
  ]);

  ApiResponse.paginated(res, { message: 'Projects retrieved', data: projects, page, limit, total });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar');
  if (!project) throw ApiError.notFound('Project not found');
  ApiResponse.success(res, { data: { project } });
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, description, key, color, settings } = req.body;

  if (await Project.findOne({ key: key.toUpperCase() })) {
    throw ApiError.conflict('Project key already exists');
  }

  const project = await Project.create({
    name,
    description,
    key: key.toUpperCase(),
    color,
    owner: req.user._id,
    members: [req.user._id],
    settings,
  });

  const populated = await Project.findById(project._id).populate('owner', 'name avatar');

  await logActivity({
    user: req.user._id,
    action: 'CREATE_PROJECT',
    resource: 'project',
    resourceId: project._id,
    req,
  });

  ApiResponse.created(res, { message: 'Project created', data: { project: populated } });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound('Project not found');

  const { name, description, status, color, settings, members } = req.body;
  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (status) project.status = status;
  if (color) project.color = color;
  if (settings) project.settings = { ...project.settings, ...settings };
  if (members && isAdmin(req.user)) project.members = members;

  await project.save();
  ApiResponse.success(res, { message: 'Project updated', data: { project } });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw ApiError.notFound('Project not found');

  project.status = 'archived';
  await project.save();

  await logActivity({
    user: req.user._id,
    action: 'ARCHIVE_PROJECT',
    resource: 'project',
    resourceId: project._id,
    req,
  });

  ApiResponse.success(res, { message: 'Project archived' });
});
