import { Router } from 'express';
import { login, register, getCollaborators, getAgentInfo, getMe, updateProfile } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.get('/me', requireAuth as any, getMe as any);
router.put('/update-profile', requireAuth as any, updateProfile as any);
router.get('/agent/:id', getAgentInfo as any);
router.get('/collaborators', requireAuth as any, getCollaborators as any);

export default router;
