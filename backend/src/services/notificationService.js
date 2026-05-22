import Notification from '../models/Notification.model.js';

export const createNotification = async ({ userId, type, title, message, link, metadata }) => {
  return Notification.create({
    user: userId,
    type,
    title,
    message,
    link,
    metadata,
  });
};

export const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const query = { user: userId };
  if (unreadOnly) query.isRead = false;

  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(query),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return { notifications, total, unreadCount, page, limit };
};

export const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  return Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
};
