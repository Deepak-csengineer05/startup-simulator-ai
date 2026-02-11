import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';
import Session from '../models/Session.js';
import { logger } from '../utils/observability/index.js';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

/**
 * SUS AI - Smart context-aware assistant for Startup Simulator
 * 
 * This AI is specialized for:
 * 1. Helping users understand the platform
 * 2. Analyzing their generated startup content
 * 3. Answering questions about Indian startup ecosystem (in context)
 * 
 * CRITICAL: Rejects off-topic questions
 */

// Base knowledge about the platform
const PROJECT_KNOWLEDGE = `You are SUS AI (Startup Simulator AI Assistant), an intelligent assistant built specifically for the Startup Simulator platform.

PLATFORM OVERVIEW:
- Startup Simulator AI helps Indian entrepreneurs transform raw startup ideas into comprehensive business packages
- Uses AI to generate 8 modules: Refined Concept, Brand Identity, Market Analysis, MVP Code Preview, Business Model, Risk Analysis, Pitch Deck, and Landing Page
- Specifically optimized for the Indian market with Indian pricing (₹), UPI payments, tier 1/2/3 cities consideration
- Generation takes approximately 1 minute for core modules
- All content is tailored for Indian users, investors, and market conditions

YOUR MODULES EXPLAINED:
1. **Refined Concept**: Problem statement, solution, target users (Indian demographics), MVP features
2. **Brand Identity**: 5 name options, 3 taglines, voice & tone, color palette (culturally appropriate for India)
3. **Market Analysis**: TAM/SAM/SOM in ₹ Crores, Indian competitors, SWOT, go-to-market strategy
4. **MVP Code Preview**: Tech stack recommendations, architecture, sample code, timeline (considers Indian dev ecosystem)
5. **Business Model**: Revenue streams with ₹ pricing, cost structure, partnerships (UPI, Razorpay, WhatsApp Business)
6. **Risk Analysis**: Critical failure modes for Indian market, success probability score, mitigation strategies
7. **Pitch Deck**: 10-slide investor deck tailored for Indian VCs (Sequoia India, Accel, Blume)
8. **Landing Page**: Hero section, features, pricing in ₹, FAQs with Indian trust signals

PLATFORM FEATURES:
- Users can regenerate individual modules if they don't like results
- On-demand generation for advanced modules (Pitch Deck, Business Model, Risk, Code)
- Stop/resume generation capability
- Session history saved for logged-in users
- Mobile-first responsive design
- Dark/light theme support

INDIAN MARKET FOCUS:
- All outputs consider Indian market dynamics, regulations (RBI, SEBI, GST)
- Pricing is in Indian Rupees (₹)
- References Indian startup success stories (CRED, Zepto, Razorpay, Meesho, etc.)
- Considers tier 1, 2, and 3 city dynamics
- Payment integrations: UPI, Razorpay, PhonePe, Paytm
- Regional language considerations
- Trust and privacy concerns specific to Indian users

YOUR CAPABILITIES:
✅ Answer questions about how to use the platform
✅ Explain what each module generates
✅ Help users understand their generated results
✅ Provide insights about their startup idea (when they share a session)
✅ Explain Indian market considerations
✅ Suggest improvements to their concept
✅ Interpret risk scores, market sizes, business models

YOUR LIMITATIONS (CRITICAL - YOU MUST ENFORCE):
❌ NEVER answer general knowledge questions unrelated to startups/platform
❌ NEVER write code, poems, stories, or content unrelated to startup validation
❌ NEVER provide medical, legal, or financial advice outside startup context
❌ NEVER engage in political, religious, or controversial discussions
❌ DO NOT help with homework, general programming, or other platforms

RESPONSE RULES:
1. Always be helpful, friendly, and encouraging about their startup journey
2. Use Indian context naturally (mention ₹, lakhs, crores when relevant)
3. Reference successful Indian startups as examples when appropriate
4. If question is off-topic, politely redirect: "I'm SUS AI, specialized for Startup Simulator. I can help with questions about this platform or analyzing your startup idea. What would you like to know?"
5. Be concise but thorough - users appreciate clear, actionable answers
6. If user asks about their specific session data, use the context provided
7. When uncertain, acknowledge it honestly and suggest what you CAN help with`;

/**
 * Check if a question is within scope (basic filter before AI call)
 */
function isQuestionInScope(message) {
  const lowerMessage = message.toLowerCase();
  
  // Obviously out of scope patterns
  const offTopicPatterns = [
    /write.*poem/i,
    /tell.*joke/i,
    /what.*weather/i,
    /who.*president/i,
    /solve.*math/i,
    /translate.*to/i,
    /recipe.*for/i,
    /how.*old.*are.*you/i,
  ];
  
  if (offTopicPatterns.some(pattern => pattern.test(message))) {
    return false;
  }
  
  // In-scope keywords (very broad to avoid false negatives)
  const inScopeKeywords = [
    'startup', 'idea', 'business', 'brand', 'market', 'pitch', 'investor',
    'revenue', 'customer', 'user', 'product', 'mvp', 'feature', 'risk',
    'competition', 'pricing', 'how', 'what', 'why', 'explain', 'generate',
    'module', 'session', 'dashboard', 'platform', 'india', 'sus ai',
    'tam', 'sam', 'som', 'swot', 'deck', 'landing', 'code', 'tech',
  ];
  
  const hasInScopeKeyword = inScopeKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // If no in-scope keywords and message is longer than 5 words, might be off-topic
  const wordCount = message.trim().split(/\s+/).length;
  if (!hasInScopeKeyword && wordCount > 5) {
    return false;
  }
  
  return true; // Default to allowing (AI will reject if truly off-topic)
}

/**
 * Build session context string from session data
 */
function buildSessionContext(session) {
  if (!session) return '';
  
  const outputs = session.outputs || {};
  
  let context = `\n\nACTIVE SESSION CONTEXT:\n`;
  context += `User's Startup Idea: "${session.ideaText}"\n`;
  context += `Domain: ${session.domainHint}\n`;
  context += `Brand Tone: ${session.tonePreference}\n`;
  context += `Generation Status: ${session.status}\n\n`;
  
  // Add refined concept if available
  if (outputs.refined_concept) {
    context += `REFINED CONCEPT:\n`;
    context += `Problem: ${outputs.refined_concept.problem_summary}\n`;
    context += `Solution: ${outputs.refined_concept.solution_summary}\n`;
    context += `Target Users: ${outputs.refined_concept.target_users?.join(', ')}\n`;
    context += `Key Features: ${outputs.refined_concept.core_features?.slice(0, 3).join(', ')}\n\n`;
  }
  
  // Add brand profile if available
  if (outputs.brand_profile) {
    context += `BRAND IDENTITY:\n`;
    context += `Name Options: ${outputs.brand_profile.name_options?.slice(0, 3).join(', ')}\n`;
    context += `Taglines: ${outputs.brand_profile.taglines?.[0]}\n\n`;
  }
  
  // Add market analysis if available
  if (outputs.market_analysis) {
    context += `MARKET ANALYSIS:\n`;
    context += `TAM: ${outputs.market_analysis.market_size?.tam?.value || 'N/A'}\n`;
    context += `Top Competitors: ${outputs.market_analysis.competitors?.slice(0, 2).map(c => c.name).join(', ')}\n\n`;
  }
  
  // Add risk analysis if available
  if (outputs.risk_analysis) {
    context += `RISK ASSESSMENT:\n`;
    context += `Success Score: ${outputs.risk_analysis.risk_score?.score}/100\n`;
    context += `Rating: ${outputs.risk_analysis.risk_score?.rating}\n\n`;
  }
  
  context += `You now have full context about this user's startup. Answer their questions specifically about THEIR generated content.`;
  
  return context;
}

/**
 * Main chat function - handles conversation with context awareness
 */
export async function chat(message, sessionId = null, conversationHistory = []) {
  try {
    // Basic scope check
    if (!isQuestionInScope(message)) {
      return {
        reply: "I'm SUS AI, specialized for Startup Simulator AI. I can help you with:\n\n• Understanding how this platform works\n• Explaining the 8 startup modules we generate\n• Analyzing your generated startup content\n• Answering questions about Indian startup ecosystem\n\nWhat would you like to know about your startup idea or this platform?",
        context: 'none',
        inScope: false
      };
    }
    
    // Fetch session data if sessionId provided
    let session = null;
    if (sessionId) {
      try {
        session = await Session.findById(sessionId);
      } catch (err) {
        logger.warn('Session not found for chat', { sessionId });
      }
    }
    
    // Build full context prompt
    let fullPrompt = PROJECT_KNOWLEDGE;
    
    if (session) {
      fullPrompt += buildSessionContext(session);
    } else {
      fullPrompt += `\n\nNO ACTIVE SESSION: User hasn't generated a startup yet or isn't viewing a specific session. Answer general platform questions.`;
    }
    
    // Add conversation history (last 4 messages for context)
    if (conversationHistory.length > 0) {
      fullPrompt += `\n\nCONVERSATION HISTORY:\n`;
      const recentHistory = conversationHistory.slice(-4);
      recentHistory.forEach(msg => {
        fullPrompt += `${msg.role === 'user' ? 'User' : 'SUS AI'}: ${msg.content}\n`;
      });
    }
    
    // Add current question
    fullPrompt += `\n\nCURRENT USER QUESTION: ${message}\n\n`;
    fullPrompt += `YOUR RESPONSE (stay in scope, be helpful and concise):`;
    
    // Call Gemini
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    });
    
    const result = await model.generateContent(fullPrompt);
    const reply = result.response.text().trim();
    
    logger.info('Chat response generated', {
      sessionId,
      hasContext: !!session,
      messageLength: message.length,
      replyLength: reply.length
    });
    
    return {
      reply,
      context: session ? 'session' : 'general',
      inScope: true,
      sessionData: session ? {
        ideaText: session.ideaText,
        domain: session.domainHint,
        status: session.status
      } : null
    };
    
  } catch (error) {
    logger.error('Chat service error', {
      error: error.message,
      sessionId
    });
    
    throw new Error('Failed to generate response. Please try again.');
  }
}

export default {
  chat
};
