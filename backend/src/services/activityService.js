import AuditLog from '../models/AuditLog.model.js';
import logger from '../configs/logger.js';
import { ACTIVITY_ACTIONS } from '../constants/index.js';

export { ACTIVITY_ACTIONS };

export const logActivity = async ({
  user,
  action,
  resource = 'system',
  resourceId,
  details = {},
  req,
  severity = 'info',
}) => {
  try {
    await AuditLog.create({
      user: user?._id || user || null,
      action,
      resource,
      resourceId: resourceId?.toString(),
      details: { ...details, severity },
      ip: req?.ip || req?.headers?.['x-forwarded-for'],
      userAgent: req?.get?.('user-agent'),
    });
  } catch (error) {
    logger.error(`Activity log failed: ${error.message}`);
  }
};

export const getActivities = async ({
  page = 1,
  limit = 30,
  userId,
  action,
  resource,
  search,
  from,
  to,
}) => {
  const query = {};
  if (userId) query.user = userId;
  if (action) query.action = action;
  if (resource) query.resource = resource;
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  if (search) {
    query.$or = [
      { action: { $regex: search, $options: 'i' } },
      { 'details.message': { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return { logs, total, page, limit };
};

export const getActivityStats = async () => {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [last24h, byAction, failedLogins] = await Promise.all([
    AuditLog.countDocuments({ createdAt: { $gte: since24h } }),
    AuditLog.aggregate([
      { $match: { createdAt: { $gte: since7d } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AuditLog.countDocuments({
      action: ACTIVITY_ACTIONS.LOGIN_FAILED,
      createdAt: { $gte: since7d },
    }),
  ]);

  return {
    last24h,
    byAction: Object.fromEntries(byAction.map((a) => [a._id, a.count])),
    failedLogins,
  };
};
