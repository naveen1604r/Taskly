import { Router } from 'express';
import {
  createHabit,
  getHabits,
  getHabit,
  updateHabit,
  deleteHabit,
  archiveHabit,
  restoreHabit,
  logProgress,
  getHabitLogs,
  getAllHabitLogs,
} from '../controllers/habitController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getHabits);
router.post('/', createHabit);
router.get('/logs', getAllHabitLogs);
router.get('/:id', getHabit);
router.put('/:id', updateHabit);
router.patch('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.patch('/:id/archive', archiveHabit);
router.patch('/:id/restore', restoreHabit);
router.post('/:id/log', logProgress);
router.get('/:id/logs', getHabitLogs);

export default router;
