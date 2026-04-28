import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, getTopSellingProducts, getProduct } from '../controllers/product.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', requireAuth as any, getProducts as any);
router.get('/top-selling', requireAuth as any, getTopSellingProducts as any);
router.get('/:id', requireAuth as any, getProduct as any);
router.post('/', requireAuth as any, requireAdmin as any, createProduct as any);
router.put('/:id', requireAuth as any, requireAdmin as any, updateProduct as any);
router.delete('/:id', requireAuth as any, requireAdmin as any, deleteProduct as any);

export default router;
