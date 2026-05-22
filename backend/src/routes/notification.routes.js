import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = Router();

router.use(protectRoute);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllNotificationsRead);
router.patch('/:id/read', notificationController.markNotificationRead);

export default router;
