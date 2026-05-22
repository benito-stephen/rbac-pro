import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getDashboardAnalytics, getFullAnalytics } from '../services/analyticsService.js';
import { getActivities } from '../services/activityService.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const analytics = await getDashboardAnalytics(req.user._id, req.user.role);
  ApiResponse.success(res, { data: analytics });
});

export const getFullDashboard = asyncHandler(async (req, res) => {
  const analytics = await getFullAnalytics();
  ApiResponse.success(res, { data: analytics });
});

export const getAuditTrail = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, userId, action } = req.query;
  const result = await getActivities({
    page: parseInt(page),
    limit: parseInt(limit),
    userId,
    action,
  });
  ApiResponse.paginated(res, {
    message: 'Audit logs retrieved',
    data: result.logs,
    page: result.page,
    limit: result.limit,
    total: result.total,
  });
});
