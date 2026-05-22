import AuditLog from '../models/AuditLog.model.js';
import logger from '../configs/logger.js';

export const logAudit = async ({ user, action, resource, resourceId, details, req }) => {
  try {
    await AuditLog.create({
      user: user?._id || user,
      action,
      resource,
      resourceId: resourceId?.toString(),
      details,
      ip: req?.ip,
      userAgent: req?.get('user-agent'),
    });
  } catch (error) {
    logger.error(`Audit log failed: ${error.message}`);
  }
};

export const getAuditLogs = async ({ page = 1, limit = 20, userId, action }) => {
  const query = {};
  if (userId) query.user = userId;
  if (action) query.action = action;

  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(query),
  ]);

  return { logs, total, page, limit };
};
