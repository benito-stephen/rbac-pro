import { body, param } from 'express-validator';
import { ROLES, USER_STATUS } from '../constants/index.js';

export const createUserValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(Object.values(ROLES)),
];

export const updateUserValidator = [
  param('id').isMongoId().withMessage('Valid user ID is required'),
  body('name').optional().trim().notEmpty(),
  body('role').optional().isIn(Object.values(ROLES)),
  body('status').optional().isIn(Object.values(USER_STATUS)),
];

export const updateStatusValidator = [
  param('id').isMongoId(),
  body('status').isIn(Object.values(USER_STATUS)).withMessage('Valid status required'),
];

export const userIdValidator = [param('id').isMongoId().withMessage('Valid user ID is required')];
