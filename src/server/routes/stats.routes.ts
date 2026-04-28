import express from 'express';
import { getFinanceStats, getAgentQuickStats, getAgentCustomers, getPointHistory, getSystemPointStats, getGrowthFundStats, getGrowthFundDailyHistory } from '../controllers/stats.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/finance', requireAuth as any, requireAdmin as any, getFinanceStats as any);
router.get('/agent-stats', requireAuth as any, getAgentQuickStats as any);
router.get('/agent-customers', requireAuth as any, getAgentCustomers as any);
router.get('/point-history', requireAuth as any, getPointHistory as any);
router.get('/system-points', requireAuth as any, requireAdmin as any, getSystemPointStats as any);
router.get('/growth-fund', requireAuth as any, getGrowthFundStats as any);
router.get('/growth-fund-daily', requireAuth as any, getGrowthFundDailyHistory as any);

export default router;
