import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  completeProject,
  archiveProject,
  restoreProject,
} from '../controllers/projectController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All project routes require JWT authentication
router.use(requireAuth);

router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);
router.patch('/:id/complete', completeProject);
router.patch('/:id/archive', archiveProject);
router.patch('/:id/restore', restoreProject);

export default router;
