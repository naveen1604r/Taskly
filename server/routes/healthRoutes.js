import { Router } from 'express';
import { getHealth, getReadiness } from '../controllers/healthController.js';

const router = Router();

// GET /api/health (Liveness)
router.get('/', getHealth);

// GET /api/health/ready (Readiness)
router.get('/ready', getReadiness);

export default router;
