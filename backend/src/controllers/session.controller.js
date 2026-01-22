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
 * Generate all 8 outputs for a session
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
      //logger.info("Generation started", { sessionId: id });
      uiLog("Generation started", id, "🚀");

      // 1. Refined Concept
     // logger.info("Generating refined concept", { sessionId: id });
      uiLog("Generating refined concept", id, "🧠");
      const refinedConcept = await geminiService.generateRefinedConcept(
        session.ideaText,
        session.domainHint,
        session.tonePreference
      );
      session.outputs.refined_concept = refinedConcept;
      await session.save();

      // 2. Brand Profile
      //logger.info("Generating brand profile", { sessionId: id });
      uiLog("Generating brand profile", id, "🎨");
      const brandProfile = await geminiService.generateBrandProfile(
        refinedConcept,
        session.tonePreference
      );
      session.outputs.brand_profile = brandProfile;
      await session.save();

      // 3. Landing Content
      //logger.info("Generating landing content", { sessionId: id });
      uiLog("Generating landing page content", id, "🖥️");
      const landingContent = await geminiService.generateLandingContent(
        refinedConcept,
        brandProfile
      );
      session.outputs.landing_content = landingContent;
      await session.save();

      // 4. Market Analysis
      //logger.info("Generating market analysis", { sessionId: id });
      uiLog("Analyzing market", id, "📊");
      const marketAnalysis = await geminiService.generateMarketAnalysis(
        refinedConcept,
        session.domainHint
      );
      session.outputs.market_analysis = marketAnalysis;
      await session.save();

      // 5. Pitch Deck
      //logger.info("Generating pitch deck", { sessionId: id });
      uiLog("Creating pitch deck", id, "📽️");
      const pitchDeck = await geminiService.generatePitchDeck(
        refinedConcept,
        brandProfile,
        marketAnalysis
      );
      session.outputs.pitch_deck = pitchDeck;
      await session.save();

      // 6. Business Model
      //logger.info("Generating business model", { sessionId: id });
      uiLog("Designing business model", id, "💰");
      const businessModel = await geminiService.generateBusinessModel(
        refinedConcept,
        session.domainHint
      );
      session.outputs.business_model = businessModel;
      await session.save();

      // 7. Risk Analysis
      //logger.info("Generating risk analysis", { sessionId: id });
      uiLog("Assessing risks", id, "⚠️");
      const riskAnalysis = await geminiService.generateRiskAnalysis(
        refinedConcept,
        marketAnalysis
      );
      session.outputs.risk_analysis = riskAnalysis;
      await session.save();

      // 8. Code Preview
      //logger.info("Generating code preview", { sessionId: id });
      uiLog("Generating technical blueprint", id, "💻");
      const codePreview = await geminiService.generateCodePreview(
        refinedConcept,
        session.domainHint
      );
      session.outputs.code_preview = codePreview;

      session.status = "completed";
      session.completedAt = new Date();
      await session.save();

     // logger.info("Generation completed", { sessionId: id });
      uiLog("All assets generated successfully 🎉", id, "✅");

      res.json({
        status: "completed",
        message: "All assets generated successfully",
        data: session.outputs
      });

    } catch (genError) {
      logger.error("Generation failed", {
        sessionId: id,
        error: genError.message,
        stack: genError.stack
      });

      uiLog(`Generation failed: ${genError.message}`, id, "❌");

      session.status = "failed";
      session.error = genError.message;
      await session.save();
      throw genError;
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

        if (!concept) {
            return res.status(400).json({ error: 'Refined concept missing. Cannot regenerate modules without context.' });
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
