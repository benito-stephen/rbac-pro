import Task from '../models/Task.model.js';
import Project from '../models/Project.model.js';
import { TASK_STATUS } from '../constants/index.js';
import { ACTIVITY_ACTIONS, logActivity } from './activityService.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

export const buildTaskQuery = (user, filters = {}) => {
  const query = isAdmin(user) ? {} : { createdBy: user._id };

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.projectId) query.project = filters.projectId;
  if (filters.tags) {
    const tagList = Array.isArray(filters.tags) ? filters.tags : filters.tags.split(',');
    query.tags = { $in: tagList.map((t) => t.trim().toLowerCase()) };
  }
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { tags: { $regex: filters.search, $options: 'i' } },
    ];
  }
  if (filters.dueBefore) query.dueDate = { ...query.dueDate, $lte: new Date(filters.dueBefore) };
  if (filters.dueAfter) query.dueDate = { ...query.dueDate, $gte: new Date(filters.dueAfter) };

  return query;
};

export const getSortOption = (sortBy = 'updatedAt', order = 'desc') => {
  const allowed = ['title', 'dueDate', 'priority', 'status', 'createdAt', 'updatedAt'];
  const field = allowed.includes(sortBy) ? sortBy : 'updatedAt';
  return { [field]: order === 'asc' ? 1 : -1 };
};

export const listTasks = async (user, { page = 1, limit = 20, sortBy, order, ...filters }) => {
  const query = buildTaskQuery(user, filters);
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('createdBy', 'name avatar email')
      .populate('assignee', 'name avatar')
      .populate('project', 'name key color')
      .sort(getSortOption(sortBy, order))
      .skip(skip)
      .limit(parseInt(limit)),
    Task.countDocuments(query),
  ]);

  return { tasks, total, page: parseInt(page), limit: parseInt(limit) };
};

export const getTaskStats = async (user) => {
  const match = isAdmin(user) ? {} : { createdBy: user._id };

  const [byStatus, byPriority, overdue, completedThisWeek] = await Promise.all([
    Task.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $match: match }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Task.countDocuments({
      ...match,
      dueDate: { $lt: new Date() },
      status: { $ne: TASK_STATUS.DONE },
    }),
    Task.countDocuments({
      ...match,
      status: TASK_STATUS.DONE,
      completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  const statusMap = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
  const total = Object.values(statusMap).reduce((a, b) => a + b, 0);
  const completed = statusMap[TASK_STATUS.DONE] || 0;
  const pending = total - completed;

  return {
    total,
    completed,
    pending,
    overdue,
    completedThisWeek,
    byStatus: statusMap,
    byPriority: Object.fromEntries(byPriority.map((p) => [p._id, p.count])),
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

export const createTask = async (user, data, req) => {
  const { title, description, projectId, status, priority, dueDate, tags } = data;

  if (projectId) {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('PROJECT_NOT_FOUND');
  }

  const task = await Task.create({
    title,
    description,
    project: projectId || undefined,
    createdBy: user._id,
    reporter: user._id,
    assignee: user._id,
    status: status || TASK_STATUS.TODO,
    priority,
    dueDate,
    tags: tags?.map((t) => t.toLowerCase().trim()) || [],
  });

  task.addHistory({
    action: 'created',
    user: user._id,
    message: `Task "${title}" created`,
  });
  await task.save();

  if (projectId) {
    await Project.findByIdAndUpdate(projectId, { $inc: { 'stats.totalTasks': 1 } });
  }

  await logActivity({
    user: user._id,
    action: ACTIVITY_ACTIONS.TASK_CREATED,
    resource: 'task',
    resourceId: task._id,
    details: { title, status: task.status },
    req,
  });

  return task.populate(['createdBy', 'assignee', 'project']);
};

export const updateTask = async (user, taskId, data, req) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error('TASK_NOT_FOUND');

  const trackFields = ['title', 'description', 'status', 'priority', 'dueDate', 'tags'];
  const changes = [];

  trackFields.forEach((field) => {
    if (data[field] === undefined) return;
    const oldVal = task[field];
    let newVal = data[field];
    if (field === 'tags') newVal = newVal.map((t) => t.toLowerCase().trim());
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ field, oldVal, newVal });
      task[field] = newVal;
    }
  });

  if (data.projectId !== undefined) task.project = data.projectId || undefined;

  const prevStatus = task.status;
  if (task.status === TASK_STATUS.DONE && !task.completedAt) {
    task.completedAt = new Date();
  } else if (task.status !== TASK_STATUS.DONE) {
    task.completedAt = undefined;
  }

  changes.forEach(({ field, oldVal, newVal }) => {
    task.addHistory({
      action: 'updated',
      field,
      oldValue: oldVal,
      newValue: newVal,
      user: user._id,
      message: `${field} changed`,
    });
  });

  await task.save();

  if (prevStatus !== TASK_STATUS.DONE && task.status === TASK_STATUS.DONE) {
    if (task.project) {
      await Project.findByIdAndUpdate(task.project, { $inc: { 'stats.completedTasks': 1 } });
    }
    await logActivity({
      user: user._id,
      action: ACTIVITY_ACTIONS.TASK_COMPLETED,
      resource: 'task',
      resourceId: task._id,
      details: { title: task.title },
      req,
    });
  }

  await logActivity({
    user: user._id,
    action: ACTIVITY_ACTIONS.TASK_UPDATED,
    resource: 'task',
    resourceId: task._id,
    details: { changes: changes.map((c) => c.field) },
    req,
  });

  return task.populate(['createdBy', 'assignee', 'project']);
};

export const deleteTask = async (user, taskId, req) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error('TASK_NOT_FOUND');

  const title = task.title;
  const projectId = task.project;

  await task.deleteOne();
  if (projectId) {
    await Project.findByIdAndUpdate(projectId, { $inc: { 'stats.totalTasks': -1 } });
  }

  await logActivity({
    user: user._id,
    action: ACTIVITY_ACTIONS.TASK_DELETED,
    resource: 'task',
    resourceId: taskId,
    details: { title },
    req,
  });

  return { deleted: true };
};

export const getTaskHistory = async (taskId) => {
  const task = await Task.findById(taskId)
    .select('history title')
    .populate('history.user', 'name avatar');
  if (!task) throw new Error('TASK_NOT_FOUND');
  return task.history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};
