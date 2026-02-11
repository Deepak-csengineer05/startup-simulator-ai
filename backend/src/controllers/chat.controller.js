import chatService from '../services/chat.service.js';
import { logger } from '../utils/observability/index.js';

/**
 * Handle chat message from user
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId, conversationHistory } = req.body;
    
    // Validate message
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    if (message.trim().length > 1000) {
      return res.status(400).json({ error: 'Message too long (max 1000 characters)' });
    }
    
    // Optional: Validate conversationHistory format
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return res.status(400).json({ error: 'conversationHistory must be an array' });
    }
    
    logger.info('Chat message received', {
      userId: req.user._id,
      sessionId,
      messageLength: message.length,
      hasHistory: !!conversationHistory?.length
    });
    
    // Generate response
    const response = await chatService.chat(
      message.trim(),
      sessionId,
      conversationHistory || []
    );
    
    res.json({
      reply: response.reply,
      context: response.context,
      inScope: response.inScope,
      sessionData: response.sessionData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Chat controller error', {
      error: error.message,
      userId: req.user._id
    });
    
    next(error);
  }
};

export default {
  sendMessage
};
