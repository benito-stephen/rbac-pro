import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

router.use(protectRoute, adminOnly);

router.get('/overview', adminController.getAdminOverview);
router.get('/tasks', adminController.getAdminTasks);

export default router;
