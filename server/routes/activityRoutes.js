import { Router } from 'express';
import {
  createActivity,
  getActivities,
  clearActivities,
} from '../controllers/activityController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getActivities);
router.post('/', createActivity);
router.delete('/', clearActivities);

export default router;
