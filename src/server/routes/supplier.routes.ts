import { Router } from 'express';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getSupplier } from '../controllers/supplier.controller.js';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', requireAuth as any, getSuppliers as any);
router.get('/:id', requireAuth as any, getSupplier as any);
router.post('/', requireAuth as any, requireAdmin as any, createSupplier as any);
router.put('/:id', requireAuth as any, requireAdmin as any, updateSupplier as any);
router.delete('/:id', requireAuth as any, requireAdmin as any, deleteSupplier as any);

export default router;
