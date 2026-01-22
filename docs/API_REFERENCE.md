# API Reference

## 🔌 REST API Documentation

Base URL: `http://localhost:3000/api`

---

## 1. Health Check

### Endpoint
```
GET /health
```

### Purpose
Verify backend is running and operational

### Request
```bash
curl http://localhost:3000/health
```

### Response
```json
{
  "status": "ok"
}
```

### Status Codes
- `200` - Server is healthy
- `500` - Server error

---

## 2. Create Session

### Endpoint
```
POST /api/sessions
```

### Purpose
Initialize a new generation session for a user's startup idea

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "idea_text": "A marketplace connecting freelance designers with small businesses",
  "domain_hint": "E-commerce",
  "tone_preference": "Professional"
}
```

### Request Parameters

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `idea_text` | string | ✅ Yes | Raw startup idea | "Uber for dog walking" |
| `domain_hint` | string | ❌ No | Industry/domain | "SaaS", "Fintech", "Edtech" |
| `tone_preference` | string | ❌ No | Brand tone | "Professional", "Casual", "Bold" |

### Response (201 Created)
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Session created"
}
```

### Response (400 Bad Request)
```json
{
  "error": "idea_text is required"
}
```

### Response (500 Server Error)
```json
{
  "error": "Failed to create session"
}
```

### Example Usage

**cURL**
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "idea_text": "A platform for managing remote teams",
    "domain_hint": "SaaS",
    "tone_preference": "Professional"
  }'
```

**JavaScript/Fetch**
```javascript
const response = await fetch('http://localhost:3000/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    idea_text: "A platform for managing remote teams",
    domain_hint: "SaaS",
    tone_preference: "Professional"
  })
});
const data = await response.json();
console.log(data.session_id);
```

**Python**
```python
import requests

response = requests.post('http://localhost:3000/api/sessions', json={
    'idea_text': 'A platform for managing remote teams',
    'domain_hint': 'SaaS',
    'tone_preference': 'Professional'
})
session_id = response.json()['session_id']
print(session_id)
```

---

## 3. Generate Content

### Endpoint
```
POST /api/sessions/:id/generate/core
```

### Purpose
Trigger AI generation pipeline for concept, brand, and landing copy

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ Yes | Session ID from create session |

### Request Body
```json
{}
```

### Response (200 OK) - Immediate
```json
{
  "status": "completed",
  "message": "Core assets generated successfully",
  "data": {
    "refined_concept": {
      "problem_summary": "Busy professionals struggle to find reliable pet care providers they can trust",
      "solution_summary": "On-demand marketplace connecting verified pet sitters with pet owners",
      "target_users": [
        "Busy urban professionals (25-45)",
        "Pet parents in major cities",
        "Young professionals working 9-5"
      ],
      "core_features": [
        "Verified sitter profiles with background checks",
        "Real-time GPS tracking and notifications",
        "In-app messaging and secure payments",
        "Ratings and review system"
      ]
    },
    "brand_profile": {
      "name_options": [
        "PawConnect",
        "DogDash",
        "FetchPal",
        "CareCompanion",
        "TailsCare"
      ],
      "taglines": [
        "Trustworthy pet care at your fingertips",
        "Your dog's favorite errand runners",
        "Peace of mind for pet parents"
      ],
      "voice_tone": "Professional yet approachable, trustworthy and caring",
      "color_palette": [
        "#2563eb",
        "#8b5cf6",
        "#14b8a6",
        "#ec4899"
      ]
    },
    "landing_content": {
      "hero_headline": "Find Trusted Pet Care in Seconds",
      "hero_subtitle": "Connect with verified, loving pet sitters in your area",
      "primary_cta": "Find a Sitter",
      "feature_blocks": [
        {
          "title": "Verified Sitters",
          "description": "All sitters are background checked and rated by other pet parents"
        },
        {
          "title": "Real-Time Tracking",
          "description": "See exactly where your pet is and get real-time updates"
        },
        {
          "title": "Secure Payments",
          "description": "All payments are handled securely in-app with buyer protection"
        }
      ],
      "pricing_tiers": [
        {
          "name": "Basic",
          "summary": "Daily pet sitting for your furry friend"
        },
        {
          "name": "Premium",
          "summary": "Extended care packages with discounted rates"
        }
      ],
      "faq": [
        {
          "q": "How do you verify sitters?",
          "a": "All sitters go through background checks and reviews from previous customers"
        },
        {
          "q": "What if something goes wrong?",
          "a": "We have 24/7 support and a satisfaction guarantee"
        },
        {
          "q": "How much does it cost?",
          "a": "Pricing starts at $15 per visit and varies by location and services"
        }
      ]
    }
  }
}
```

### Response (404 Not Found)
```json
{
  "error": "Session not found"
}
```

### Response (500 Server Error)
```json
{
  "error": "Generation failed",
  "details": "GEMINI_API_KEY is not set in environment variables"
}
```

### Example Usage

**cURL**
```bash
curl -X POST http://localhost:3000/api/sessions/550e8400-e29b-41d4-a716-446655440000/generate/core
```

**JavaScript**
```javascript
const sessionId = "550e8400-e29b-41d4-a716-446655440000";
const response = await fetch(
  `http://localhost:3000/api/sessions/${sessionId}/generate/core`,
  { method: 'POST' }
);
const data = await response.json();
console.log(data.data.refined_concept);
```

---

## 4. Get Session Outputs

### Endpoint
```
GET /api/sessions/:id/core_outputs
```

### Purpose
Retrieve generated outputs for a session (used for polling)

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ Yes | Session ID |

### Request
```bash
curl http://localhost:3000/api/sessions/550e8400-e29b-41d4-a716-446655440000/core_outputs
```

### Response (200 OK)
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "outputs": {
    "refined_concept": { ... },
    "brand_profile": { ... },
    "landing_content": { ... }
  }
}
```

### Response Status Values

| Status | Meaning | Outputs |
|--------|---------|---------|
| `created` | Session created, waiting for generation | null |
| `processing` | Generation in progress | null |
| `completed` | All outputs ready | ✅ Present |
| `failed` | Generation failed | null |

### Example Usage

**Polling Pattern (Frontend)**
```javascript
let sessionId = "550e8400-e29b-41d4-a716-446655440000";
let attempts = 0;
let maxAttempts = 30; // 60 seconds with 2s interval

const pollInterval = setInterval(async () => {
  attempts++;
  
  try {
    const response = await fetch(
      `http://localhost:3000/api/sessions/${sessionId}/core_outputs`
    );
    const data = await response.json();
    
    if (data.status === 'completed') {
      console.log("Generation complete!", data.outputs);
      clearInterval(pollInterval);
      // Display results
    } else if (data.status === 'failed') {
      console.error("Generation failed");
      clearInterval(pollInterval);
    } else if (attempts >= maxAttempts) {
      console.error("Timeout");
      clearInterval(pollInterval);
    }
  } catch (error) {
    console.error("Polling error", error);
  }
}, 2000); // Poll every 2 seconds
```

---

## 🔄 Complete Workflow

### Step-by-Step Example

```
1. CREATE SESSION
   POST /api/sessions
   Request: { idea_text, domain_hint, tone_preference }
   Response: { session_id }
   
   ↓
   
2. TRIGGER GENERATION
   POST /api/sessions/:id/generate/core
   Request: {} (empty body)
   Response: { status, data } (might be completed immediately)
   
   ↓
   
3. POLL FOR RESULTS (if not immediate)
   GET /api/sessions/:id/core_outputs
   Poll every 2 seconds
   Response: { status, outputs } (wait for status === "completed")
   
   ↓
   
4. DISPLAY OUTPUTS
   Show refined_concept, brand_profile, landing_content
   Allow user to iterate (go back to step 1)
```

---

## 📊 Response Structure

### Refined Concept Object
```json
{
  "problem_summary": "string - The core problem being solved",
  "solution_summary": "string - High-level value proposition",
  "target_users": ["string", "string", "string"],
  "core_features": ["string", "string", "string", "string"]
}
```

### Brand Profile Object
```json
{
  "name_options": ["string", "string", "string", "string", "string"],
  "taglines": ["string", "string", "string"],
  "voice_tone": "string - Description of brand voice and tone",
  "color_palette": ["#hex", "#hex", "#hex", "#hex"]
}
```

### Landing Content Object
```json
{
  "hero_headline": "string - Main headline",
  "hero_subtitle": "string - Supporting subtitle",
  "primary_cta": "string - Call-to-action button text",
  "feature_blocks": [
    { "title": "string", "description": "string" },
    { "title": "string", "description": "string" },
    { "title": "string", "description": "string" }
  ],
  "pricing_tiers": [
    { "name": "string", "summary": "string" },
    { "name": "string", "summary": "string" }
  ],
  "faq": [
    { "q": "string", "a": "string" },
    { "q": "string", "a": "string" },
    { "q": "string", "a": "string" }
  ]
}
```

---

## ⚠️ Error Handling

### Common Errors

| Status Code | Error | Cause | Solution |
|------------|-------|-------|----------|
| 400 | `idea_text is required` | Missing required field | Include idea_text in request |
| 404 | `Session not found` | Invalid session ID | Check session_id format |
| 500 | `GEMINI_API_KEY is not set` | Missing API key | Check .env file |
| 500 | `Generation failed` | API error | Check internet connection, API quota |

### Error Response Format
```json
{
  "error": "User-friendly error message",
  "details": "Technical details (if applicable)"
}
```

---

## 🔐 Security Notes

### Current (MVP)
- ⚠️ No authentication
- ⚠️ No rate limiting
- ⚠️ API key in environment variable
- ⚠️ CORS open for development

### Future Improvements
- 🔒 API keys per user
- 🔒 Rate limiting (100 requests/hour per IP)
- 🔒 JWT authentication
- 🔒 HTTPS enforcement
- 🔒 Input validation & sanitization

---

## 📈 API Quotas & Limits

### Current (Development)
- Requests per second: Unlimited
- Sessions per user: Unlimited
- Characters per idea: 5,000 max
- Response time: 5-15 seconds
- Error rate: < 5%

### Production Recommendations
- Rate limit: 100 requests/hour per API key
- Session timeout: 24 hours
- Data retention: 30 days (then delete)
- API cost: $0.05 per generation (~$30 per 600 users/month)

---

## 🧪 Testing the API

### Using Postman

1. Create new POST request to `http://localhost:3000/api/sessions`
2. Set Body → JSON
3. Paste example request
4. Click Send
5. Copy `session_id` from response
6. Create second request to `/generate/core` with session ID
7. Create third request to `/core_outputs` to poll

### Using REST Client (VS Code)

Create `test.http` file:
```http
@baseUrl = http://localhost:3000/api

### Create Session
POST {{baseUrl}}/sessions
Content-Type: application/json

{
  "idea_text": "Uber for dog walking",
  "domain_hint": "Consumer App",
  "tone_preference": "Friendly"
}

### Generate (replace SESSION_ID)
POST {{baseUrl}}/sessions/SESSION_ID/generate/core

### Get Results (replace SESSION_ID)
GET {{baseUrl}}/sessions/SESSION_ID/core_outputs
```

