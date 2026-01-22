import { Router } from 'express';
import * as sessionController from '../controllers/session.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { apiLimiter, generationLimiter } from '../middleware/rate-limiter.js';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Session routes
router.post('/sessions', apiLimiter, sessionController.createSession);
router.get('/sessions', apiLimiter, sessionController.getUserSessions);
router.get('/sessions/:id', apiLimiter, sessionController.getSession);
router.post('/sessions/:id/generate', generationLimiter, sessionController.generateCore);
router.post('/sessions/:id/regenerate/:moduleName', generationLimiter, sessionController.regenerateModule);
router.get('/sessions/:id/core_outputs', apiLimiter, sessionController.getCoreOutputs);
router.delete('/sessions/:id', apiLimiter, sessionController.deleteSession);

export default router;
