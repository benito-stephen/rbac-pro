import { body, param } from 'express-validator';

export const createProjectValidator = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('key')
    .trim()
    .notEmpty()
    .isLength({ min: 2, max: 6 })
    .withMessage('Project key must be 2-6 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Project key must be uppercase alphanumeric'),
  body('description').optional().trim(),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
];

export const updateProjectValidator = [
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('status').optional().isIn(['active', 'archived', 'on_hold']),
];

export const projectIdValidator = [param('id').isMongoId()];
