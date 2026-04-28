import { Router } from 'express';
import { 
  getConversations, 
  getOrCreateConversation, 
  getMessagesByConversation, 
  sendMessage, 
  markAsRead,
  getContacts
} from '../controllers/message.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/conversations', requireAuth as any, getConversations as any);
router.post('/conversations', requireAuth as any, getOrCreateConversation as any);
router.get('/contacts', requireAuth as any, getContacts as any);
router.get('/:conversationId', requireAuth as any, getMessagesByConversation as any);
router.post('/', requireAuth as any, sendMessage as any);
router.put('/read/:conversationId', requireAuth as any, markAsRead as any);

export default router;
