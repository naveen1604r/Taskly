import { Router } from 'express';
import {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  completeGoal,
  archiveGoal,
  restoreGoal,
  updateProgress,
} from '../controllers/goalController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All goal routes require JWT authentication
router.use(requireAuth);

router.get('/', getGoals);
router.post('/', createGoal);
router.get('/:id', getGoal);
router.put('/:id', updateGoal);
router.patch('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.patch('/:id/complete', completeGoal);
router.patch('/:id/archive', archiveGoal);
router.patch('/:id/restore', restoreGoal);
router.patch('/:id/progress', updateProgress);

export default router;
