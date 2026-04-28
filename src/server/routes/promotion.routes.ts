import express from 'express';
import { getPromotions, createPromotion } from '../controllers/promotion.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', requireAuth as any, getPromotions as any);
router.post('/', requireAuth as any, requireAdmin as any, createPromotion as any);

export default router;
