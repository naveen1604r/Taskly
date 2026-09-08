import { Router } from 'express';
import {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  pinNote,
  unpinNote,
  archiveNote,
  restoreNote,
} from '../controllers/noteController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All note routes require JWT authentication
router.use(requireAuth);

router.get('/', getNotes);
router.post('/', createNote);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.patch('/:id', updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/pin', pinNote);
router.patch('/:id/unpin', unpinNote);
router.patch('/:id/archive', archiveNote);
router.patch('/:id/restore', restoreNote);

export default router;
