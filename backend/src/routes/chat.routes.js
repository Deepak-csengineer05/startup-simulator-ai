import express from 'express';
import chatController from '../controllers/chat.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { apiLimiter } from '../middleware/rate-limiter.js';

const router = express.Router();

// POST /api/chat - Send message to SUS AI (requires authentication)
router.post('/chat', verifyToken, apiLimiter, chatController.sendMessage);

export default router;
