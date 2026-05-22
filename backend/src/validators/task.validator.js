import { body, param, query } from 'express-validator';
import { TASK_STATUS, TASK_PRIORITY } from '../constants/index.js';

export const createTaskValidator = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('projectId').optional().isMongoId(),
  body('description').optional().trim(),
  body('status').optional().isIn(Object.values(TASK_STATUS)),
  body('priority').optional().isIn(Object.values(TASK_PRIORITY)),
  body('dueDate').optional().isISO8601(),
  body('tags').optional().isArray(),
];

export const updateTaskValidator = [
  param('id').isMongoId(),
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('status').optional().isIn(Object.values(TASK_STATUS)),
  body('priority').optional().isIn(Object.values(TASK_PRIORITY)),
  body('dueDate').optional().isISO8601(),
  body('tags').optional().isArray(),
  body('projectId').optional({ nullable: true }).isMongoId(),
];

export const taskIdValidator = [param('id').isMongoId()];

export const taskQueryValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(Object.values(TASK_STATUS)),
  query('priority').optional().isIn(Object.values(TASK_PRIORITY)),
  query('sortBy').optional().isIn(['title', 'dueDate', 'priority', 'status', 'createdAt', 'updatedAt']),
  query('order').optional().isIn(['asc', 'desc']),
  query('search').optional().trim(),
  query('tags').optional().trim(),
];
