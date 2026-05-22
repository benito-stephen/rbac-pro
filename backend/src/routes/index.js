import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import projectRoutes from './project.routes.js';
import taskRoutes from './task.routes.js';
import analyticsRoutes from './analytics.routes.js';
import notificationRoutes from './notification.routes.js';
import activityRoutes from './activity.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/activity', activityRoutes);
router.use('/admin', adminRoutes);

export default router;
