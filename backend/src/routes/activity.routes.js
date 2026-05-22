import { Router } from 'express';
import * as activityController from '../controllers/activity.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

router.use(protectRoute, adminOnly);

router.get('/stats', activityController.getActivityOverview);
router.get('/', activityController.getActivityLogs);

export default router;
