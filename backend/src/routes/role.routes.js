import { Router } from 'express';
import * as roleController from '../controllers/role.controller.js';
import { protect, requirePermission } from '../middleware/auth.js';
import { PERMISSIONS } from '../constants/index.js';

const router = Router();

router.use(protect);

router.get('/', requirePermission(PERMISSIONS.ROLES_READ), roleController.getRoles);
router.get('/:id', requirePermission(PERMISSIONS.ROLES_READ), roleController.getRoleById);
router.post('/', requirePermission(PERMISSIONS.ROLES_WRITE), roleController.createRole);
router.patch('/:id', requirePermission(PERMISSIONS.ROLES_WRITE), roleController.updateRole);
router.delete('/:id', requirePermission(PERMISSIONS.ROLES_DELETE), roleController.deleteRole);

export default router;
