import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
import { validate } from '../middleware/validate.js';
import { authRateLimit, passwordResetRateLimit } from '../middleware/authRateLimit.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authRateLimit, registerValidator, validate, authController.register);
router.post('/login', authRateLimit, loginValidator, validate, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', protectRoute, authController.logout);
router.post('/forgot-password', passwordResetRateLimit, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', passwordResetRateLimit, resetPasswordValidator, validate, authController.resetPassword);
router.get('/me', protectRoute, authController.getMe);
router.patch('/profile', protectRoute, updateProfileValidator, validate, authController.updateProfile);

export default router;
