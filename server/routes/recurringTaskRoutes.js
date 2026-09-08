import { Router } from 'express';
import {
  createRecurringTask,
  getRecurringTasks,
  getRecurringTask,
  updateRecurringTask,
  deleteRecurringTask,
  pauseRecurringTask,
  resumeRecurringTask,
  generateOccurrences,
} from '../controllers/recurringTaskController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getRecurringTasks);
router.post('/', createRecurringTask);
router.post('/generate', generateOccurrences);
router.get('/:id', getRecurringTask);
router.put('/:id', updateRecurringTask);
router.patch('/:id', updateRecurringTask);
router.delete('/:id', deleteRecurringTask);
router.patch('/:id/pause', pauseRecurringTask);
router.patch('/:id/resume', resumeRecurringTask);

export default router;
