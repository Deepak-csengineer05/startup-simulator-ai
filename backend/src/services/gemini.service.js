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
  const prompt = `You are an expert startup strategist and product consultant with deep experience in the Indian market and ecosystem.

Refine this raw startup idea into a clear, structured concept specifically for the INDIAN MARKET.

Raw Idea: "${ideaText}"
Industry Domain: "${domain}"
Brand Tone: "${tone}"

INDIAN MARKET CONTEXT:
- Target Indian users across tier 1, 2, and 3 cities
- Consider diverse income groups, language preferences, and digital literacy levels
- Think about India-specific behaviors: price sensitivity, trust barriers, mobile-first usage
- Reference successful Indian startups like CRED, Zepto, PhonePe, Razorpay, Meesho, etc.

REQUIREMENTS:
1. Extract the core problem being solved IN INDIA (1-2 sentences)
2. Define a clear value proposition/solution for INDIAN USERS (1-2 sentences)
3. Identify 3 specific target user personas with Indian demographics (urban/semi-urban, income levels, behavior patterns)
4. Define exactly 4-6 concrete MVP features essential for launch in India

CRITICAL: The "core_features" array MUST contain 4-6 specific, actionable features. Consider vernacular support, UPI payments, mobile-first design where relevant.

Example core_features format:
["Mobile OTP-based authentication", "Hindi & English language support", "UPI payment integration", "WhatsApp notifications", "Offline mode for low connectivity"]`;

  const schema = `{
  "problem_summary": "string (1-2 sentences)",
  "solution_summary": "string (1-2 sentences)",
  "target_users": ["string", "string", "string"] (exactly 3 items),
  "core_features": ["string", "string", "string", "string"] (4-6 items, REQUIRED)
}`;

  return generateWithFallback(prompt, schema);
}

export async function generateBrandProfile(concept, tone) {
  const prompt = `You are a world-class brand strategist and naming expert with deep understanding of Indian culture and market preferences.

Create a complete brand identity package for a startup targeting INDIAN USERS.

Context: ${JSON.stringify(concept, null, 2)}
Brand Tone: "${tone}"

INDIAN MARKET CONSIDERATIONS:
- Names should be easy to pronounce in both Hindi and English
- Avoid complex spellings; consider phonetic clarity
- Be culturally sensitive and avoid offensive connotations
- Think of successful Indian brands: Paytm, Dunzo, Swiggy, Urban Company, Nykaa
- Taglines should resonate with Indian aspirations and values
- Color palette should work well with Indian aesthetic preferences (vibrant but trustworthy)

Create 5 unique, memorable startup name options that work for Indian audience, write 3 catchy taglines that communicate value to Indian users, define the brand voice and tone culturally appropriate for India, and create a cohesive 4-color palette with hex codes that appeals to Indian sensibilities.`;

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
  const prompt = `You are an expert conversion copywriter and UX designer specializing in the Indian market.

Create high-converting landing page content for a startup targeting INDIAN USERS.

Product Concept: ${JSON.stringify(concept, null, 2)}
Brand Profile: ${JSON.stringify(brand, null, 2)}

INDIAN USER PSYCHOLOGY:
- Indians value trust signals, testimonials, and social proof heavily
- Price sensitivity is high; emphasize value and savings
- CTAs should be clear, action-oriented, and build urgency
- Use ₹ (Rupees) for all pricing, not dollars
- Reference Indian context where relevant ("Trusted by 1 lakh+ users", "Made in India")
- Consider mentioning UPI, popular payment methods

Create compelling landing page content with these sections:
1. HERO: Main headline, subheadline, and CTA text (should resonate with Indian aspirations)
2. FEATURES: 3-4 key product features with icons (use icons: rocket, shield, zap, users, chart, or check)
3. PRICING: 2 pricing tiers with features (use ₹ currency, price in hundreds/thousands of rupees, consider Indian purchasing power)
4. FAQ: 3 common questions with answers (address trust, privacy, payment security concerns)
5. CTA: Final call-to-action section (emphasize risk-free trial, money-back guarantee if applicable)

Use persuasive, benefit-focused copy that matches the brand tone and Indian cultural context.`;

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
  const prompt = `You are a senior market research analyst and business strategist with expertise in the Indian startup ecosystem.

Create a comprehensive market analysis for a startup launching in INDIA.

Product Concept: ${JSON.stringify(concept, null, 2)}
Industry Domain: "${domain}"

INDIAN MARKET CONTEXT:
- Population: 1.4 billion with 700M+ internet users
- Focus on urban + semi-urban markets (tier 1, 2, 3 cities)
- Consider regional variations, language barriers, infrastructure challenges
- Reference Indian competitors and success stories in this domain
- Market sizes should be in ₹ Crores (1 Crore = 10 Million)
- Think about India Stack, UPI ecosystem, Aadhaar integration opportunities

Estimate market size (TAM, SAM, SOM) IN ₹ CRORES with reasoning for INDIAN MARKET, identify 3 main INDIAN competitors (or international competitors in India) with brief analysis, create a SWOT analysis considering Indian market dynamics, and outline a go-to-market strategy for tier 1 & 2 Indian cities.`;

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
  const prompt = `You are a pitch deck expert who has helped Indian startups raise ₹1000+ Crores from VCs like Sequoia India, Accel, Blume Ventures, and Matrix Partners India.

Create a compelling 10-slide pitch deck outline for INDIAN INVESTORS.

Product Concept: ${JSON.stringify(concept, null, 2)}
Brand Profile: ${JSON.stringify(brand, null, 2)}
Market Analysis: ${JSON.stringify(market, null, 2)}

INDIAN INVESTOR EXPECTATIONS:
- Emphasize market size in India (use ₹ Crores)
- Reference successful Indian startups as comparables
- Highlight India-specific advantages (Digital India, JAM Trinity, UPI ecosystem)
- Address regulatory compliance (RBI, SEBI, DPIIT startup recognition)
- Show understanding of tier 2/3 city expansion potential
- Unit economics and path to profitability matter more in Indian context

Create content for a 10-slide pitch deck following the classic structure:
1. Title/Hook (Make India-relevant)
2. Problem (Frame in Indian context)
3. Solution
4. Market Opportunity (Indian market in ₹ Crores)
5. Product/Demo
6. Business Model (mention UPI, Indian payment methods)
7. Traction/Milestones
8. Competition (Indian and international players)
9. Team (mention relevant Indian experience)
10. Ask/Call to Action (funding amount in ₹ Crores or Lakhs)

Each slide MUST have a "content" array with 3-5 bullet points, and include speaker notes.
Create all 10 slides with compelling, investor-ready content for Indian VCs.`;

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
  const prompt = `You are a senior software architect with deep experience building scalable products for the Indian market.

Create a technical implementation plan for a startup MVP launching in INDIA.

Product Concept: ${JSON.stringify(concept, null, 2)}
Industry Domain: "${domain}"

INDIAN TECHNICAL CONSIDERATIONS:
- Mobile-first approach (80%+ traffic from mobile in India)
- Handle low bandwidth, intermittent connectivity gracefully
- Support for vernacular languages (Hindi, Tamil, Telugu, Bengali, etc.)
- UPI payment integration (Razorpay, PhonePe, Paytm gateways)
- Consider AWS Mumbai, Google Cloud India, or Azure India regions for hosting
- WhatsApp Business API for notifications (very popular in India)
- Aadhaar/OTP-based authentication patterns
- Progressive Web Apps (PWA) for better reach without app store friction

Recommend the optimal tech stack (prioritize technologies popular in Indian startups), design the high-level system architecture (considering Indian infrastructure), write sample code snippets for key components (include UPI payment example if relevant), and estimate development timeline with Indian developer availability in mind.`;

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
  const prompt = `You are a startup business architect and financial strategist with expertise in Indian market dynamics.

Define a robust business model for a new startup launching in INDIA.

Product Concept: ${JSON.stringify(concept, null, 2)}
Industry Domain: "${domain}"

INDIAN BUSINESS CONSIDERATIONS:
- Pricing in ₹ (Rupees) - consider Indian purchasing power parity
- Payment methods: UPI (dominant), Credit/Debit cards, PayTM, PhonePe, Razorpay
- Regulatory compliance: GST, RBI guidelines, DPIIT startup recognition benefits
- Lower CAC in tier 2/3 cities but may require vernacular support
- WhatsApp, Instagram as key marketing channels in India
- Partnerships with Indian platforms (Swiggy, Zomato, Amazon India, Flipkart, etc.)
- Considerfreemium models with low entry barriers (Indians are price-sensitive)

Identify 3 primary revenue streams (with ₹ pricing estimates for Indian market), estimate the cost structure (fixed vs variable, mention Indian operational costs), identify key resources and partners needed (Indian payment gateways, local vendors, WhatsApp Business API), and define the sales/distribution channels (social media marketing, WhatsApp, regional partnerships work well in India).`;

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
  const prompt = `You are a ruthless venture capital analyst focused on Indian startups, having seen hundreds of failures and exits.

Brutally analyze the risks of this startup concept in the INDIAN MARKET.

Product Concept: ${JSON.stringify(concept, null, 2)}
Market Analysis: ${JSON.stringify(market, null, 2)}

INDIAN MARKET RISKS TO CONSIDER:
- Regulatory uncertainty (RBI, SEBI, government policy changes)
- Intense competition from well-funded Indian unicorns
- Price sensitivity and low willingness to pay
- Trust and privacy concerns (data localization, user verification)
- Infrastructure challenges (payment failures, connectivity issues)
- Regional fragmentation (language, culture, purchasing power variations)
- Difficulty in scaling from tier 1 to tier 2/3 cities
- Funding winter concerns in Indian VC ecosystem

Identify 3 critical failure modes specific to INDIAN MARKET (why this will die in India), calculate a "Success Probability Score" (0-100%) with justification considering Indian market maturity, provide mitigation strategies for each risk (India-specific solutions), and analyze the "Why Now?" factor (why this timing is right for India - Digital India push, UPI adoption, smartphone penetration, etc.).`;

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
