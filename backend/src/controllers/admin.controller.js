import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getFullAnalytics } from '../services/analyticsService.js';
import { getActivityStats } from '../services/activityService.js';
import * as taskService from '../services/taskService.js';
import User from '../models/User.model.js';
import Task from '../models/Task.model.js';
import { TASK_STATUS } from '../constants/index.js';

export const getAdminOverview = asyncHandler(async (req, res) => {
  const [analytics, activityStats, taskStats, recentUsers] = await Promise.all([
    getFullAnalytics(),
    getActivityStats(),
    taskService.getTaskStats(req.user),
    User.find().select('name email role status lastLogin createdAt').sort({ createdAt: -1 }).limit(5),
  ]);

  ApiResponse.success(res, {
    data: {
      analytics,
      activityStats,
      taskStats,
      recentUsers,
      systemInsights: {
        tasksOverdue: await Task.countDocuments({
          dueDate: { $lt: new Date() },
          status: { $ne: TASK_STATUS.DONE },
        }),
        usersInactive: await User.countDocuments({ status: 'inactive' }),
        avgCompletionRate: analytics.overview?.completionRate || 0,
      },
    },
  });
});

export const getAdminTasks = asyncHandler(async (req, res) => {
  const result = await taskService.listTasks(req.user, { ...req.query, limit: req.query.limit || 50 });
  ApiResponse.paginated(res, {
    message: 'All tasks retrieved',
    data: result.tasks,
    page: result.page,
    limit: result.limit,
    total: result.total,
  });
});
