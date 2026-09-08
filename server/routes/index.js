import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import { getReadiness } from '../controllers/healthController.js';
import authRoutes from './authRoutes.js';
import taskRoutes from './taskRoutes.js';
import projectRoutes from './projectRoutes.js';
import goalRoutes from './goalRoutes.js';
import noteRoutes from './noteRoutes.js';
import focusRoutes from './focusRoutes.js';
import habitRoutes from './habitRoutes.js';
import recurringTaskRoutes from './recurringTaskRoutes.js';
import reminderRoutes from './reminderRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import activityRoutes from './activityRoutes.js';
import inboxRoutes from './inboxRoutes.js';
import settingsRoutes from './settingsRoutes.js';

const router = Router();

// 1. Health & Readiness check routes
router.use('/health', healthRoutes);
router.get('/ready', getReadiness);

// 2. Authentication routes (Step 26)
router.use('/auth', authRoutes);

// 3. Task routes (Step 27)
router.use('/tasks', taskRoutes);

// 4. Projects, Goals, Notes (Step 28)
router.use('/projects', projectRoutes);
router.use('/goals', goalRoutes);
router.use('/notes', noteRoutes);

// 5. Productivity Systems (Step 29)
router.use('/focus', focusRoutes);
router.use('/habits', habitRoutes);
router.use('/recurring-tasks', recurringTaskRoutes);
router.use('/recurring', recurringTaskRoutes); // Alias for convenience
router.use('/reminders', reminderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/activity', activityRoutes);
router.use('/inbox', inboxRoutes);

// User Settings route
router.use('/settings', settingsRoutes);

// 6. Future route architecture (Step 30+ preparation)
const plannedRoutes = [
  { path: '/users', name: 'User Management' },
  { path: '/calendar', name: 'Calendar Schedule Engine' },
  { path: '/planner', name: 'Daily Productivity Planner' },
];

plannedRoutes.forEach(({ path, name }) => {
  router.all(`${path}*`, (req, res) => {
    res.status(501).json({
      success: false,
      message: `${name} API (${path}) is established and scheduled for implementation in upcoming steps.`,
      status: 'planned_future_route',
    });
  });
});

export default router;
