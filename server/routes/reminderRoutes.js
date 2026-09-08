import { Router } from 'express';
import {
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  toggleReminder,
  snoozeReminder,
} from '../controllers/reminderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getReminders);
router.post('/', createReminder);
router.get('/:id', getReminder);
router.put('/:id', updateReminder);
router.patch('/:id', updateReminder);
router.delete('/:id', deleteReminder);
router.patch('/:id/toggle', toggleReminder);
router.patch('/:id/snooze', snoozeReminder);

export default router;
