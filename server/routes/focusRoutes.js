import { Router } from 'express';
import {
  createSession,
  getSessions,
  getStats,
  getSettings,
  updateSettings,
} from '../controllers/focusController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.get('/stats', getStats);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.patch('/settings', updateSettings);

export default router;
