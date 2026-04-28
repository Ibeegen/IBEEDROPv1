import express from 'express';
import { getBanners, createBanner, deleteBanner } from '../controllers/banner.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', requireAuth as any, getBanners as any);
router.post('/', requireAuth as any, requireAdmin as any, createBanner as any);
router.delete('/:id', requireAuth as any, requireAdmin as any, deleteBanner as any);

export default router;
