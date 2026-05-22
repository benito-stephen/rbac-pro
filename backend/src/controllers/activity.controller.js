import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getActivities, getActivityStats } from '../services/activityService.js';

export const getActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, userId, action, resource, search, from, to } = req.query;
  const result = await getActivities({
    page: parseInt(page),
    limit: parseInt(limit),
    userId,
    action,
    resource,
    search,
    from,
    to,
  });
  ApiResponse.paginated(res, {
    message: 'Activity logs retrieved',
    data: result.logs,
    page: result.page,
    limit: result.limit,
    total: result.total,
  });
});

export const getActivityOverview = asyncHandler(async (req, res) => {
  const stats = await getActivityStats();
  ApiResponse.success(res, { data: stats });
});
