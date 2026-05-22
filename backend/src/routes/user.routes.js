import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { validate } from '../middleware/validate.js';
import {
  createUserValidator,
  updateUserValidator,
  updateStatusValidator,
  userIdValidator,
} from '../validators/user.validator.js';

const router = Router();

router.use(protectRoute, adminOnly);

router.get('/', userController.getUsers);
router.get('/:id', userIdValidator, validate, userController.getUserById);
router.post('/', createUserValidator, validate, userController.createUser);
router.patch('/:id', updateUserValidator, validate, userController.updateUser);
router.patch('/:id/status', updateStatusValidator, validate, userController.updateUserStatus);
router.delete('/:id', userIdValidator, validate, userController.deleteUser);

export default router;
