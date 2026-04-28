import { Router } from 'express';
import { getUsers, getUserStats, getLeaderboard } from '../controllers/user.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', requireAuth as any, requireAdmin as any, getUsers as any);
router.get('/me/stats', requireAuth as any, getUserStats as any);
router.get('/leaderboard', requireAuth as any, getLeaderboard as any);

export default router;
