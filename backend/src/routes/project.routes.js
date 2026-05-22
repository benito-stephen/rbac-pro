import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
import { validate } from '../middleware/validate.js';
import {
  createProjectValidator,
  updateProjectValidator,
  projectIdValidator,
} from '../validators/project.validator.js';

const router = Router();

router.use(protectRoute);

router.get('/', projectController.getProjects);
router.get('/:id', projectIdValidator, validate, projectController.getProjectById);
router.post('/', createProjectValidator, validate, projectController.createProject);
router.patch('/:id', updateProjectValidator, validate, projectController.updateProject);
router.delete('/:id', projectIdValidator, validate, projectController.deleteProject);

export default router;
