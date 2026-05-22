import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

router.use(protectRoute);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/full', adminOnly, analyticsController.getFullDashboard);
router.get('/audit', adminOnly, analyticsController.getAuditTrail);

export default router;
