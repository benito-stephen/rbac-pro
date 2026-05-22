import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
import { validate } from '../middleware/validate.js';
import {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
  taskQueryValidator,
} from '../validators/task.validator.js';

const router = Router();

router.use(protectRoute);

router.get('/stats', taskController.getTaskStats);
router.get('/', taskQueryValidator, validate, taskController.getTasks);
router.get('/board/:projectId', taskController.getBoardTasks);
router.get('/:id/history', taskIdValidator, validate, taskController.getTaskHistory);
router.get('/:id', taskIdValidator, validate, taskController.getTaskById);
router.post('/', createTaskValidator, validate, taskController.createTask);
router.patch('/:id', updateTaskValidator, validate, taskController.updateTask);
router.delete('/:id', taskIdValidator, validate, taskController.deleteTask);

export default router;
