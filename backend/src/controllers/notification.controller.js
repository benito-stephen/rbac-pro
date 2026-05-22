import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from '../services/notificationService.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const result = await getUserNotifications(req.user._id, {
    page: parseInt(page),
    limit: parseInt(limit),
    unreadOnly: unreadOnly === 'true',
  });
  ApiResponse.paginated(res, {
    message: 'Notifications retrieved',
    data: result.notifications,
    page: result.page,
    limit: result.limit,
    total: result.total,
    meta: { unreadCount: result.unreadCount },
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await markAsRead(req.params.id, req.user._id);
  if (!notification) throw ApiError.notFound('Notification not found');
  ApiResponse.success(res, { message: 'Notification marked as read', data: { notification } });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await markAllAsRead(req.user._id);
  ApiResponse.success(res, { message: 'All notifications marked as read' });
});
