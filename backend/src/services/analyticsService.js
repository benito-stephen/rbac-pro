import Task from '../models/Task.model.js';
import Project from '../models/Project.model.js';
import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';
import { TASK_STATUS, ROLES, ACTIVITY_ACTIONS } from '../constants/index.js';

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export const getDashboardAnalytics = async (userId, userRole) => {
  const taskFilter = userRole === ROLES.ADMIN ? {} : { createdBy: userId };
  const base = await getCoreMetrics(taskFilter);
  if (userRole !== ROLES.ADMIN) return base;
  return { ...base, ...(await getAdminMetrics()) };
};

export const getCoreMetrics = async (taskFilter = {}) => {
  const [
    totalTasks,
    tasksByStatus,
    tasksByPriority,
    recentTasks,
  ] = await Promise.all([
    Task.countDocuments(taskFilter),
    Task.aggregate([{ $match: taskFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $match: taskFilter }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Task.find(taskFilter)
      .populate('createdBy', 'name avatar')
      .populate('project', 'name key color')
      .sort({ updatedAt: -1 })
      .limit(5),
  ]);

  const statusMap = Object.fromEntries(tasksByStatus.map((s) => [s._id, s.count]));
  const completed = statusMap[TASK_STATUS.DONE] || 0;
  const pending = totalTasks - completed;

  return {
    overview: {
      totalTasks,
      completedTasks: completed,
      pendingTasks: pending,
      completionRate: totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0,
      tasksTodo: statusMap[TASK_STATUS.TODO] || 0,
      tasksInProgress: statusMap[TASK_STATUS.IN_PROGRESS] || 0,
      tasksDone: completed,
    },
    tasksByStatus: statusMap,
    tasksByPriority: Object.fromEntries(tasksByPriority.map((p) => [p._id, p.count])),
    recentTasks,
  };
};

export const getAdminMetrics = async () => {
  const since7d = daysAgo(7);
  const since14d = daysAgo(14);

  const [
    totalUsers,
    activeUsers,
    totalProjects,
    activeSessions,
    weeklyUserGrowth,
    weeklyTaskGrowth,
    completionTrends,
    mostActiveUsers,
    userEngagement,
    activityByDay,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active' }),
    Project.countDocuments({ status: 'active' }),
    User.countDocuments({ lastLogin: { $gte: since7d }, status: 'active' }),
    User.aggregate([
      { $match: { createdAt: { $gte: since7d } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Task.aggregate([
      { $match: { createdAt: { $gte: since7d } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Task.aggregate([
      {
        $match: {
          status: TASK_STATUS.DONE,
          completedAt: { $gte: since14d },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Task.aggregate([
      { $group: { _id: '$createdBy', taskCount: { $sum: 1 } } },
      { $sort: { taskCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          avatar: '$user.avatar',
          taskCount: 1,
        },
      },
    ]),
    AuditLog.aggregate([
      {
        $match: {
          action: { $in: [ACTIVITY_ACTIONS.LOGIN, ACTIVITY_ACTIONS.TASK_CREATED, ACTIVITY_ACTIONS.TASK_UPDATED] },
          createdAt: { $gte: since7d },
        },
      },
      { $group: { _id: '$user', actions: { $sum: 1 } } },
      { $sort: { actions: -1 } },
      { $limit: 10 },
    ]),
    AuditLog.aggregate([
      { $match: { createdAt: { $gte: since7d } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalTasks = await Task.countDocuments();
  const completedTasks = await Task.countDocuments({ status: TASK_STATUS.DONE });

  return {
    overview: {
      totalUsers,
      activeUsers,
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      activeSessions,
      productivityScore: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    },
    weeklyGrowth: {
      users: weeklyUserGrowth.map((d) => ({ date: d._id, count: d.count })),
      tasks: weeklyTaskGrowth.map((d) => ({ date: d._id, count: d.count })),
    },
    completionTrends: completionTrends.map((d) => ({ date: d._id, count: d.count })),
    mostActiveUsers,
    userEngagement: userEngagement.length,
    activityByDay: activityByDay.map((d) => ({ date: d._id, count: d.count })),
  };
};

export const getFullAnalytics = async () => {
  const admin = await getAdminMetrics();
  const tasks = await getCoreMetrics({});
  return { ...tasks, ...admin };
};
