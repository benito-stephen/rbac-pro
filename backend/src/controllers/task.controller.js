import Task from '../models/Task.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { canAccessTask, isAdmin } from '../middleware/roleMiddleware.js';
import { TASK_STATUS } from '../constants/index.js';
import * as taskService from '../services/taskService.js';

const ownTasksFilter = (user) => (isAdmin(user) ? {} : { createdBy: user._id });

export const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.listTasks(req.user, req.query);
  ApiResponse.paginated(res, {
    message: 'Tasks retrieved',
    data: result.tasks,
    page: result.page,
    limit: result.limit,
    total: result.total,
  });
});

export const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await taskService.getTaskStats(req.user);
  ApiResponse.success(res, { data: stats });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('createdBy', 'name avatar email')
    .populate('assignee', 'name avatar')
    .populate('project', 'name key color');
  if (!task) throw ApiError.notFound('Task not found');
  if (!canAccessTask(req.user, task)) throw ApiError.forbidden('You can only access your own tasks');
  ApiResponse.success(res, { data: { task } });
});

export const getTaskHistory = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');
  if (!canAccessTask(req.user, task)) throw ApiError.forbidden('Access denied');
  const history = await taskService.getTaskHistory(req.params.id);
  ApiResponse.success(res, { data: { history } });
});

export const createTask = asyncHandler(async (req, res) => {
  try {
    const task = await taskService.createTask(req.user, req.body, req);
    ApiResponse.created(res, { message: 'Task created', data: { task } });
  } catch (e) {
    if (e.message === 'PROJECT_NOT_FOUND') throw ApiError.notFound('Project not found');
    throw e;
  }
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');
  if (!canAccessTask(req.user, task)) throw ApiError.forbidden('You can only update your own tasks');

  try {
    const updated = await taskService.updateTask(req.user, req.params.id, req.body, req);
    ApiResponse.success(res, { message: 'Task updated', data: { task: updated } });
  } catch (e) {
    if (e.message === 'TASK_NOT_FOUND') throw ApiError.notFound('Task not found');
    throw e;
  }
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');
  if (!isAdmin(req.user) && !canAccessTask(req.user, task)) {
    throw ApiError.forbidden('You can only delete your own tasks');
  }

  await taskService.deleteTask(req.user, req.params.id, req);
  ApiResponse.success(res, { message: 'Task deleted' });
});

export const getBoardTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const filter = { project: projectId, ...ownTasksFilter(req.user) };

  const tasks = await Task.find(filter)
    .populate('assignee', 'name avatar')
    .populate('createdBy', 'name avatar')
    .sort({ order: 1 });

  const board = Object.values(TASK_STATUS).reduce((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status);
    return acc;
  }, {});

  ApiResponse.success(res, { data: { board } });
});
