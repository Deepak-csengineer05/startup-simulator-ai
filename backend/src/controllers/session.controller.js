import Session from '../models/Session.js';
import geminiService from '../services/gemini.service.js';
import { logger } from '../utils/observability/index.js';
import { uiLog } from "../utils/logger-ui.js";

/**
 * Create a new session
 */
export const createSession = async (req, res, next) => {
  try {
    const { idea_text, domain_hint, tone_preference } = req.body;

    // Validate idea_text
    if (!idea_text || !idea_text.trim()) {
      return res.status(400).json({ error: 'idea_text is required' });
    }

    if (idea_text.trim().length < 10) {
      return res.status(400).json({ error: 'idea_text must be at least 10 characters' });
    }

    if (idea_text.trim().length > 5000) {
      return res.status(400).json({ error: 'idea_text exceeds maximum length of 5000 characters' });
    }

    // Validate domain_hint
    const validDomains = ['SaaS', 'Fintech', 'Edtech', 'Healthtech', 'E-commerce', 'Marketplace', 'Consumer App', 'B2B', 'AI/ML', 'General'];
    const sanitizedDomain = domain_hint?.trim() || 'General';
    if (!validDomains.includes(sanitizedDomain)) {
      return res.status(400).json({ error: `Invalid domain_hint. Must be one of: ${validDomains.join(', ')}` });
    }

    // Validate tone_preference
    const validTones = ['Professional', 'Casual', 'Playful', 'Bold', 'Luxury', 'Friendly', 'Technical', 'Minimalist'];
    const sanitizedTone = tone_preference?.trim() || 'Professional';
    if (!validTones.includes(sanitizedTone)) {
      return res.status(400).json({ error: `Invalid tone_preference. Must be one of: ${validTones.join(', ')}` });
    }

    const session = await Session.create({
      userId: req.user._id,
      ideaText: idea_text.trim(),
      domainHint: sanitizedDomain,
      tonePreference: sanitizedTone,
      status: 'created'
    });

    res.status(201).json({
      session_id: session._id,
      message: 'Session created'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate ONLY the 3 core essential outputs for a session
 * Other modules (pitch_deck, business_model, risk_analysis, code_preview, landing_content)
 * will be generated on-demand when user clicks on them
 */
export const generateCore = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await Session.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    session.status = "processing";
    await session.save();

    try {
      uiLog("Generation started - Fast mode (3 core modules)", id, "🚀");

      // 1. Refined Concept (ESSENTIAL)
      uiLog("Generating refined concept", id, "🧠");
      const refinedConcept = await geminiService.generateRefinedConcept(
        session.ideaText,
        session.domainHint,
        session.tonePreference
      );
      
      // DEBUG: Log what we got from AI
      console.log('=== REFINED CONCEPT FROM AI ===');
      console.log(JSON.stringify(refinedConcept, null, 2));
      console.log('=== core_features ===');
      console.log(refinedConcept.core_features);
      
      // Validate refined concept has required fields
      if (!refinedConcept.core_features || !Array.isArray(refinedConcept.core_features) || refinedConcept.core_features.length === 0) {
        logger.warn("Refined concept missing core_features, adding placeholder", { sessionId: id });
        refinedConcept.core_features = [
          "User authentication and profile management",
          "Core product functionality dashboard",
          "Data visualization and analytics",
          "Export and sharing capabilities"
        ];
      }
      
      if (!refinedConcept.target_users || !Array.isArray(refinedConcept.target_users) || refinedConcept.target_users.length === 0) {
        logger.warn("Refined concept missing target_users, adding placeholder", { sessionId: id });
        refinedConcept.target_users = [
          "Early adopters seeking innovative solutions",
          "Small to medium businesses in the target market",
          "Individual users with specific pain points"
        ];
      }
      
      console.log('=== FINAL REFINED CONCEPT (after validation) ===');
      console.log(JSON.stringify(refinedConcept, null, 2));
      
      session.outputs.refined_concept = refinedConcept;
      await session.save();
      
      console.log('=== SAVED TO DB ===');
      console.log('Session outputs:', JSON.stringify(session.outputs.refined_concept, null, 2));

      // 2. Brand Profile (ESSENTIAL)
      uiLog("Generating brand profile", id, "🎨");
      const brandProfile = await geminiService.generateBrandProfile(
        refinedConcept,
        session.tonePreference
      );
      session.outputs.brand_profile = brandProfile;
      await session.save();

      // 3. Market Analysis (ESSENTIAL)
      uiLog("Analyzing market", id, "📊");
      const marketAnalysis = await geminiService.generateMarketAnalysis(
        refinedConcept,
        session.domainHint
      );
      session.outputs.market_analysis = marketAnalysis;
      await session.save();

      // Mark as completed after core modules
      session.status = "completed";
      session.completedAt = new Date();
      await session.save();

      uiLog("Core modules generated successfully 🎉 (Others available on-demand)", id, "✅");

      res.json({
        status: "completed",
        message: "Core modules generated successfully. Other modules available on-demand.",
        data: session.outputs
      });

    } catch (genError) {
      logger.error("Generation failed", {
        sessionId: id,
        error: genError.message,
        stack: genError.stack
      });

      uiLog(`Generation interrupted: ${genError.message}`, id, "⚠️");

      // IMPORTANT: Return partial results even on error
      // This way user gets whatever was generated before stopping
      session.status = "partial";
      session.error = genError.message;
      await session.save();

      // Return what we have so far instead of throwing error
      res.json({
        status: "partial",
        message: "Generation stopped. Here's what was completed:",
        data: session.outputs,
        error: genError.message
      });
    }

  } catch (error) {
    next(error);
  }
};

/**
 * Regenerate a specific module
 */
export const regenerateModule = async (req, res, next) => {
  try {
    const { id, moduleName } = req.params;

    logger.info('Regenerating module', { sessionId: id, moduleName });

    const session = await Session.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // We need existing context data (concept, brand, market)
    const concept = session.outputs.refined_concept;
    const brand = session.outputs.brand_profile;
    const market = session.outputs.market_analysis;
    const domain = session.domainHint;
    const tone = session.tonePreference;

    // refined_concept doesn't need context - it generates from scratch
    // All other modules need refined_concept as context
    if (!concept && moduleName !== 'refined_concept') {
      return res.status(400).json({ error: 'Refined concept missing. Please generate refined concept first before generating other modules.' });
    }

    // Module regeneration mapping
    const regenerators = {
      refined_concept: () => geminiService.generateRefinedConcept(session.ideaText, domain, tone),
      brand_profile: () => geminiService.generateBrandProfile(concept, tone),
      landing_content: () => geminiService.generateLandingContent(concept, brand || {}),
      market_analysis: () => geminiService.generateMarketAnalysis(concept, domain),
      pitch_deck: () => geminiService.generatePitchDeck(concept, brand || {}, market || {}),
      business_model: () => geminiService.generateBusinessModel(concept, domain),
      risk_analysis: () => geminiService.generateRiskAnalysis(concept, market || {}),
      code_preview: () => geminiService.generateCodePreview(concept, domain)
    };

    if (!regenerators[moduleName]) {
      return res.status(400).json({ error: 'Invalid module name' });
    }

    try {
      const newOutput = await regenerators[moduleName]();

      // Update session
      session.outputs[moduleName] = newOutput;
      await session.save();

      res.json({
        module: moduleName,
        data: newOutput,
        message: 'Module regenerated successfully'
      });

    } catch (error) {
      logger.error('Regeneration error', { sessionId: id, moduleName, error: error.message });
      res.status(500).json({ error: 'Failed to regenerate content' });
    }

  } catch (error) {
    next(error);
  }
};

/**
 * Get session outputs (for polling)
 */
export const getCoreOutputs = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await Session.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // DEBUG: Log what we're sending to frontend
    console.log('=== SENDING TO FRONTEND - getCoreOutputs ===');
    console.log('Session ID:', session._id);
    console.log('Status:', session.status);
    if (session.outputs.refined_concept) {
      console.log('refined_concept.core_features:', session.outputs.refined_concept.core_features);
      console.log('refined_concept.target_users:', session.outputs.refined_concept.target_users);
    }

    res.json({
      session_id: session._id,
      status: session.status,
      outputs: session.outputs,
      error: session.error
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's sessions history
 */
export const getUserSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .select('ideaText domainHint status createdAt completedAt')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ sessions });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single session
 */
export const getSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await Session.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a session
 */
export const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await Session.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
};

export default {
  createSession,
  generateCore,
  getCoreOutputs,
  getUserSessions,
  getSession,
  deleteSession,
  regenerateModule
};
