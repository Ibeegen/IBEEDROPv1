import { Router } from 'express';
import { getOrders, createOrder, updateOrderStatus } from '../controllers/order.controller.js';
import { requireAuth, requireAdmin, requireAgent } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', requireAuth as any, getOrders as any);
router.post('/', requireAuth as any, requireAgent as any, createOrder as any);
router.put('/:id/status', requireAuth as any, requireAdmin as any, updateOrderStatus as any);

export default router;
