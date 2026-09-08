import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  completeTask,
  updateStatus,
  getSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
} from '../controllers/taskController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// All task routes require JWT authentication
router.use(requireAuth);

// Core Task Routes
router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/complete', completeTask);
router.patch('/:id/status', updateStatus);

// Subtask Routes
router.get('/:taskId/subtasks', getSubtasks);
router.post('/:taskId/subtasks', createSubtask);
router.put('/:taskId/subtasks/:subtaskId', updateSubtask);
router.patch('/:taskId/subtasks/:subtaskId', updateSubtask);
router.delete('/:taskId/subtasks/:subtaskId', deleteSubtask);

export default router;
