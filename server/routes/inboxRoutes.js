import { Router } from 'express';
import {
  createInboxItem,
  getInboxItems,
  getInboxItem,
  updateInboxItem,
  deleteInboxItem,
  processInboxItem,
} from '../controllers/inboxController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getInboxItems);
router.post('/', createInboxItem);
router.get('/:id', getInboxItem);
router.put('/:id', updateInboxItem);
router.patch('/:id', updateInboxItem);
router.delete('/:id', deleteInboxItem);
router.post('/:id/process', processInboxItem);

export default router;
