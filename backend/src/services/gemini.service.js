import { GoogleGenerativeAI } from '@google/generative-ai';
import dns from 'dns';
import config from '../config/index.js';
import { logger, observability } from '../utils/observability/index.js';

// Force IPv4 to avoid Windows Node.js IPv6 issues
dns.setDefaultAutoSelectFamily?.(false);

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-pro'
];

const MAX_JSON_RETRIES = 2;
const MAX_NETWORK_RETRIES = 3;

/* ---------------------------------------
   Utilities
--------------------------------------- */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ---------------------------------------
   Core generator with fallback + backoff
--------------------------------------- */
async function generateWithFallback(
  promptText,
  schemaDescription,
  modelIndex = 0,
  jsonRetryCount = 0,
  networkRetryCount = 0
) {
  if (modelIndex >= MODELS.length) {
    throw new Error('Content Generation quota exhausted. Please try again later.');
  }

  const modelName = MODELS[modelIndex];
  const startTime = Date.now();

  const fullPrompt = `${promptText}

CRITICAL: You MUST respond with ONLY valid JSON matching this exact schema:
${schemaDescription}

Do not include markdown, explanations, or extra text.
Return ONLY raw JSON.`;

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192
      }
    });

    const result = await model.generateContent(fullPrompt);
    const rawText = result.response.text().trim();

    let jsonText = rawText;
    if (rawText.startsWith('```')) {
      jsonText = rawText.replace(/```json|```/g, '').trim();
    }

    const parsed = JSON.parse(jsonText);

    const duration = (Date.now() - startTime) / 1000;
    observability.logRequest(modelName, 'generateContent', duration, true);

    return parsed;
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;

    /* ---------- JSON parse retry ---------- */
    if (error instanceof SyntaxError && jsonRetryCount < MAX_JSON_RETRIES) {
      logger.warn('Invalid JSON, retrying same model', {
        model: modelName,
        retry: jsonRetryCount + 1
      });

      return generateWithFallback(
        promptText,
        schemaDescription,
        modelIndex,
        jsonRetryCount + 1
      );
    }

    /* ---------- QUOTA / RATE LIMIT ---------- */
    if (error.status === 429) {
      const retryDelay =
        error?.details?.find(d => d.retryDelay)?.retryDelay ||
        error.retryDelay ||
        '20s';

      const retrySeconds = parseInt(retryDelay.toString().replace('s', ''), 10) || 20;

      logger.warn('Gemini quota hit', {
        model: modelName,
        retryAfterSeconds: retrySeconds
      });

      await sleep(retrySeconds * 1000);

      return generateWithFallback(promptText, schemaDescription, modelIndex + 1, 0);
    }

    /* ---------- MODEL NOT FOUND / UNAVAILABLE ---------- */
    if (
      error.status === 404 ||
      error.message?.includes('not found')
    ) {
      logger.warn('Model unavailable, falling back', { model: modelName });
      return generateWithFallback(promptText, schemaDescription, modelIndex + 1, 0, 0);
    }

    /* ---------- NETWORK ERRORS (fetch failed, ECONNREFUSED, etc.) ---------- */
    const isNetworkError = 
      error.message?.includes('fetch failed') ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('ENOTFOUND') ||
      error.message?.includes('ETIMEDOUT') ||
      error.code === 'ECONNRESET' ||
      error.code === 'ECONNREFUSED';

    if (isNetworkError && networkRetryCount < MAX_NETWORK_RETRIES) {
      const retryDelay = Math.pow(2, networkRetryCount) * 2000; // Exponential backoff: 2s, 4s, 8s
      
      logger.warn('Network error, retrying...', {
        model: modelName,
        retry: networkRetryCount + 1,
        retryAfterMs: retryDelay,
        error: error.message
      });

      await sleep(retryDelay);

      return generateWithFallback(
        promptText,
        schemaDescription,
        modelIndex,
        0,
        networkRetryCount + 1
      );
    }

    /* ---------- REAL FAILURE ---------- */
    logger.error('Gemini API failure', {
      model: modelName,
      error: error.message
    });

    observability.logError(modelName, 'generateContent', error);
    throw error;
  }
}


export async function generateRefinedConcept(ideaText, domain, tone) {
  const prompt = `You are an expert startup strategist and product consultant with 20 years of experience.

Refine this raw startup idea into a clear, structured concept.

Raw Idea: "${ideaText}"
Industry Domain: "${domain}"
Brand Tone: "${tone}"

REQUIREMENTS:
1. Extract the core problem being solved (1-2 sentences)
2. Define a clear value proposition/solution (1-2 sentences)
3. Identify 3 specific target user personas with demographics
4. Define exactly 4-6 concrete MVP features essential for launch

CRITICAL: The "core_features" array MUST contain 4-6 specific, actionable features. Do not leave it empty.

Example core_features format:
["User authentication with email/password", "Dashboard with key metrics", "Payment integration with Stripe", "Real-time notifications"]`;

  const schema = `{
  "problem_summary": "string (1-2 sentences)",
  "solution_summary": "string (1-2 sentences)",
  "target_users": ["string", "string", "string"] (exactly 3 items),
  "core_features": ["string", "string", "string", "string"] (4-6 items, REQUIRED)
}`;

  return generateWithFallback(prompt, schema);
}

export async function generateBrandProfile(concept, tone) {
  const prompt = `You are a world-class brand strategist and naming expert.

Create a complete brand identity package for a startup.

Context: ${JSON.stringify(concept, null, 2)}
Brand Tone: "${tone}"

Create 5 unique, memorable startup name options, write 3 catchy taglines that communicate value, define the brand voice and tone in detail, and create a cohesive 4-color palette with hex codes.`;

  const schema = `{
  "name_options": ["string"],
  "taglines": ["string"],
  "voice_tone": "string",
  "color_palette": [
    {
      "hex": "string",
      "name": "string",
      "usage": "string"
    }
  ]
}`;

  return generateWithFallback(prompt, schema);
}

export async function generateLandingContent(concept, brand) {
  const prompt = `You are an expert conversion copywriter and UX designer.

Create high-converting landing page content for a startup.

Product Concept: ${JSON.stringify(concept, null, 2)}
Brand Profile: ${JSON.stringify(brand, null, 2)}

Create compelling landing page content with these sections:
1. HERO: Main headline, subheadline, and CTA text
2. FEATURES: 3-4 key product features with icons (use icons: rocket, shield, zap, users, chart, or check)
3. PRICING: 2 pricing tiers with features
4. FAQ: 3 common questions with answers
5. CTA: Final call-to-action section

Use persuasive, benefit-focused copy that matches the brand tone.`;

  const schema = `{
  "hero": {
    "headline": "string",
    "subheadline": "string",
    "cta_text": "string"
  },
  "hero_headline": "string",
  "hero_subtitle": "string",
  "primary_cta": "string",
  "feature_blocks": [
    {
      "icon": "string",
      "title": "string",
      "description": "string"
    }
  ],
  "features": [
    {
      "icon": "string",
      "title": "string",
      "description": "string"
    }
  ],
  "pricing_tiers": [
    {
      "name": "string",
      "price": "string",
      "period": "string",
      "features": ["string"],
      "cta": "string",
      "highlighted": true
    }
  ],
  "pricing": {
    "tiers": [
      {
        "name": "string",
        "price": "string",
        "period": "string",
        "features": ["string"],
        "cta": "string",
        "highlighted": true
      }
    ]
  },
  "faq": [
    {
      "question": "string",
      "answer": "string"
    }
  ],
  "final_cta": {
    "headline": "string",
    "subtext": "string",
    "button_text": "string"
  }
}`;

  return generateWithFallback(prompt, schema);
}

export async function generateMarketAnalysis(concept, domain) {
  const prompt = `You are a senior market research analyst and business strategist.

Create a comprehensive market analysis for a startup.

Product Concept: ${JSON.stringify(concept, null, 2)}
Industry Domain: "${domain}"

Estimate market size (TAM, SAM, SOM) with reasoning, identify 3 main competitors with brief analysis, create a SWOT analysis, and outline a go-to-market strategy.`;

  const schema = `{
  "market_size": {
    "tam": {
      "value": "string",
      "description": "string"
    },
    "sam": {
      "value": "string",
      "description": "string"
    },
    "som": {
      "value": "string",
      "description": "string"
    }
  },
  "competitors": [
    {
      "name": "string",
      "description": "string",
      "strengths": "string",
      "weaknesses": "string"
    }
  ],
  "swot": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "opportunities": ["string"],
    "threats": ["string"]
  },
  "go_to_market": {
    "phase1": {
      "name": "string",
      "duration": "string",
      "activities": ["string"]
    },
    "phase2": {
      "name": "string",
      "duration": "string",
      "activities": ["string"]
    },
    "phase3": {
      "name": "string",
      "duration": "string",
      "activities": ["string"]
    }
  }
}`;

  return generateWithFallback(prompt, schema);
}

export async function generatePitchDeck(concept, brand, market) {
  const prompt = `You are a pitch deck expert who has helped raise $500M+ for startups.

Create a compelling 10-slide pitch deck outline.

Product Concept: ${JSON.stringify(concept, null, 2)}
Brand Profile: ${JSON.stringify(brand, null, 2)}
Market Analysis: ${JSON.stringify(market, null, 2)}

Create content for a 10-slide pitch deck following the classic structure:
1. Title/Hook
2. Problem
3. Solution
4. Market Opportunity
5. Product/Demo
6. Business Model
7. Traction/Milestones
8. Competition
9. Team
10. Ask/Call to Action

Each slide MUST have a "content" array with 3-5 bullet points, and include speaker notes.
Create all 10 slides with compelling, investor-ready content.`;

  const schema = `{
  "slides": [
    {
      "number": 1,
      "title": "string",
      "type": "string",
      "headline": "string",
      "content": ["string"],
      "bullets": ["string"],
      "speaker_notes": "string"
    }
  ]
}`;

  return generateWithFallback(prompt, schema);
}

export async function generateCodePreview(concept, domain) {
  const prompt = `You are a senior software architect with 20 years of experience.

Create a technical implementation plan for a startup MVP.

Product Concept: ${JSON.stringify(concept, null, 2)}
Industry Domain: "${domain}"

Recommend the optimal tech stack, design the high-level system architecture, write sample code snippets for key components, and estimate development timeline.`;

  const schema = `{
  "tech_stack": {
    "frontend": {
      "framework": "string",
      "reasoning": "string"
    },
    "backend": {
      "framework": "string",
      "reasoning": "string"
    },
    "database": {
      "type": "string",
      "reasoning": "string"
    },
    "hosting": {
      "platform": "string",
      "reasoning": "string"
    },
    "additional": ["string"]
  },
  "architecture": {
    "description": "string",
    "components": [
      {
        "name": "string",
        "purpose": "string",
        "tech": "string"
      }
    ],
    "diagram_description": "string"
  },
  "code_samples": [
    {
      "title": "string",
      "language": "string",
      "description": "string",
      "code": "string"
    }
  ],
  "timeline": {
    "total_weeks": 12,
    "phases": [
      {
        "phase": "string",
        "weeks": "string",
        "deliverables": ["string"]
      }
    ]
  }
}`;

  return generateWithFallback(prompt, schema);
}

export async function generateBusinessModel(concept, domain) {
  const prompt = `You are a startup business architect and financial strategist.

Define a robust business model for a new startup.

Product Concept: ${JSON.stringify(concept, null, 2)}
Industry Domain: "${domain}"

Identify 3 primary revenue streams, estimate the cost structure (fixed vs variable), identify key resources and partners needed, and define the sales/distribution channels.`;

  const schema = `{
  "revenue_streams": [
    {
      "name": "string",
      "description": "string",
      "pricing_model": "string"
    }
  ],
  "cost_structure": [
    {
      "name": "string",
      "type": "string",
      "description": "string"
    }
  ],
  "key_partnerships": [
    {
      "partner": "string",
      "rationale": "string"
    }
  ],
  "channels": [
    {
      "channel": "string",
      "description": "string"
    }
  ]
}`;

  return generateWithFallback(prompt, schema);
}

export async function generateRiskAnalysis(concept, market) {
  const prompt = `You are a ruthless venture capital analyst.

Brutally analyze the risks of this startup concept.

Product Concept: ${JSON.stringify(concept, null, 2)}
Market Analysis: ${JSON.stringify(market, null, 2)}

Identify 3 critical failure modes (why this will die), calculate a "Success Probability Score" (0-100%) with justification, provide mitigation strategies for each risk, and analyze the "Why Now?" factor.`;

  const schema = `{
  "risk_score": {
    "score": 75,
    "rating": "string",
    "justification": "string"
  },
  "critical_risks": [
    {
      "risk": "string",
      "severity": "string",
      "impact": "string",
      "mitigation": "string"
    }
  ],
  "market_timing": {
    "verdict": "string",
    "reasoning": "string"
  }
}`;

  return generateWithFallback(prompt, schema);
}

export default {
  generateRefinedConcept,
  generateBrandProfile,
  generateLandingContent,
  generateMarketAnalysis,
  generatePitchDeck,
  generateCodePreview,
  generateBusinessModel,
  generateRiskAnalysis
};
