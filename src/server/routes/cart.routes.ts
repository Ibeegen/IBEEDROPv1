import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cart.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', requireAuth as any, getCart as any);
router.post('/add', requireAuth as any, addToCart as any);
router.put('/update', requireAuth as any, updateCartItem as any);
router.delete('/remove/:productId', requireAuth as any, removeFromCart as any);
router.delete('/clear', requireAuth as any, clearCart as any);

export default router;
