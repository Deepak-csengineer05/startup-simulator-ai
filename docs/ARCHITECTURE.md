# System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│  Web Browser (React 19 + Vite)                                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Dashboard Component                                         │   │
│  │  ├─ Left Panel (420px): Inputs                               │   │
│  │  │  └─ Textarea + Dropdowns + Button                         │   │
│  │  └─ Right Panel (Flex): Results                              │   │
│  │     ├─ Tabs (Concept | Brand | Landing)                      │   │
│  │     └─ View Components (Thesis/Brand/Landing)                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  │ HTTP REST API
                                  │ (Axios Client)
                                  │
┌─────────────────────────────────┴───────────────────────────────────┐
│                      APPLICATION LAYER                              │
│  Express.js Server (Node.js)                                        │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Route Handler: /api/sessions (POST)                         │   │
│  │  └─ Creates new session with UUID                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Route Handler: /api/sessions/:id/generate/core (POST)       │   │
│  │  └─ Orchestrates 3 sequential Gemini API calls               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Route Handler: /api/sessions/:id/core_outputs (GET)         │   │
│  │  └─ Returns current session state for polling                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTPS (to Google Cloud)
                                 │
┌────────────────────────────────┴────────────────────────────────────┐
│                      EXTERNAL AI SERVICE                            │
│  Google Gemini API 2.0                                              │
│  Model: gemini-2.0-flash-exp                                        │
│                                                                     │
│  Call 1: generateRefinedConcept()                                   │
│  ├─ Input: idea + domain + tone                                     │
│  └─ Output: JSON { problem, solution, users, features }             │
│                                                                     │
│  Call 2: generateBrandProfile()                                     │
│  ├─ Input: refined_concept                                          │
│  └─ Output: JSON { names, taglines, voice, colors }                 │
│                                                                     │
│  Call 3: generateLandingContent()                                   │
│  ├─ Input: refined_concept + brand_profile                          │
│  └─ Output: JSON { headline, CTA, features, pricing, FAQs }         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Component Architecture

### Frontend Components Hierarchy

```
App.jsx
└── Dashboard.jsx (Main Container)
    ├── LeftPanel (Motion)
    │   ├── IdeaTextarea (Input)
    │   ├── DomainSelect (Input)
    │   ├── ToneSelect (Input)
    │   └── IgniteButton (Action)
    │
    └── RightPanel (Results)
        ├── TabBar (Navigation)
        │   ├── ConceptTab
        │   ├── BrandTab
        │   └── LandingTab
        │
        └── ContentArea (Display)
            ├── ThesisView.jsx (when activeTab === 'refined_concept')
            │   ├── ProblemCard
            │   ├── SolutionCard
            │   ├── UsersCard
            │   └── FeaturesCard
            │
            ├── BrandView.jsx (when activeTab === 'brand_profile')
            │   ├── NamesCard
            │   ├── TaglinesCard
            │   ├── VoiceCard
            │   └── ColorPaletteCard
            │
            └── LandingCopyView.jsx (when activeTab === 'landing_content')
                ├── HeroSection
                ├── FeaturesGrid
                ├── PricingCards
                └── FAQAccordion
```

### Backend Service Architecture

```
server.js (Entry Point)
└── app.js (Express Setup)
    └── routes/api.routes.js
        ├── POST /sessions
        │   └── SessionController.createSession()
        │       └── memoryStore.createSession()
        │
        ├── POST /sessions/:id/generate/core
        │   └── SessionController.generateCore()
        │       ├── memoryStore.getSession()
        │       ├── GeminiService.generateRefinedConcept()
        │       ├── GeminiService.generateBrandProfile()
        │       ├── GeminiService.generateLandingContent()
        │       └── memoryStore.updateSession()
        │
        └── GET /sessions/:id/core_outputs
            └── SessionController.getCoreOutputs()
                └── memoryStore.getSession()
```

---

## 🔄 Data Flow Sequence

### 1. User Submits Idea

```
User Types Idea + Selects Options
    ↓
Clicks "Ignite Startup"
    ↓
handleGenerate() Function Called
    ↓
Validate Input (idea.trim())
    ↓
setStatus('created')
    ↓
API Call: createSession()
    {
      idea_text: "...",
      domain_hint: "...",
      tone_preference: "..."
    }
```

### 2. Backend Creates Session

```
POST /api/sessions
    ↓
SessionController.createSession()
    ↓
Generate UUID: "abc-123-def-456"
    ↓
Create Session Object:
    {
      id: "abc-123-def-456",
      createdAt: "2024-12-06T...",
      idea_text: "...",
      domain_hint: "...",
      tone_preference: "...",
      status: 'created',
      outputs: { 
        refined_concept: null,
        brand_profile: null,
        landing_content: null
      }
    }
    ↓
Store in memoryStore (Map)
    ↓
Return Response:
    {
      session_id: "abc-123-def-456",
      message: "Session created"
    }
```

### 3. Generate Content

```
Frontend: setSessionId(response.session_id)
    ↓
API Call: generateCore(sessionId)
    ↓
Backend: POST /api/sessions/abc-123-def-456/generate/core
    ↓
SessionController.generateCore()
    ↓
Update Status: processing
    ↓
LOOP START: 3 Gemini Calls
    │
    ├─ Call 1: generateRefinedConcept()
    │  ├─ Prompt with idea + domain + tone
    │  ├─ Gemini processes
    │  └─ Returns JSON
    │
    ├─ Call 2: generateBrandProfile()
    │  ├─ Prompt with refined_concept
    │  ├─ Gemini processes
    │  └─ Returns JSON
    │
    └─ Call 3: generateLandingContent()
       ├─ Prompt with both previous outputs
       ├─ Gemini processes
       └─ Returns JSON
    │
    LOOP END
    ↓
Store All Outputs in Session
    ↓
Update Status: completed
    ↓
Return Response:
    {
      status: 'completed',
      data: {
        refined_concept: {...},
        brand_profile: {...},
        landing_content: {...}
      }
    }
```

### 4. Poll for Results

```
Frontend: setStatus('processing')
    ↓
useEffect starts polling interval (every 2 seconds)
    ↓
POLL LOOP:
    │
    └─ GET /api/sessions/abc-123-def-456/core_outputs
       ├─ Backend: Return current session state
       ├─ Check: status === 'completed'?
       │
       ├─ YES: setOutputs(data.outputs)
       │       setStatus('completed')
       │       clearInterval()
       │       BREAK
       │
       ├─ NO: Continue polling
       │
       └─ TIMEOUT (30+ attempts): setStatus('failed')
```

### 5. Display Results

```
Frontend: activeTab === 'refined_concept'
    ↓
Render ThesisView Component
    ├─ outputs.refined_concept.problem_summary
    ├─ outputs.refined_concept.solution_summary
    ├─ outputs.refined_concept.target_users (list)
    └─ outputs.refined_concept.core_features (list)
    ↓
Apply Framer Motion Animations
    ├─ Container staggerChildren
    └─ Each Item: opacity, y transition
    ↓
User Sees Beautiful Animated Results
```

---

## 🧠 AI Prompt Engineering

### Prompt Structure Pattern

Every Gemini call follows this pattern:

```
1. ROLE DEFINITION
   "You are a [expert title]"
   
2. OBJECTIVE STATEMENT
   "Your goal is to [specific outcome]"
   
3. INPUT SPECIFICATION
   - Input 1: [name and description]
   - Input 2: [name and description]
   - Input 3: [name and description]
   
4. INSTRUCTIONS (Step-by-step)
   1. [Action 1]
   2. [Action 2]
   3. [Action 3]
   4. [Action 4]
   5. [Action 5]
   
5. OUTPUT FORMAT (Strict JSON)
   Return ONLY valid JSON with no markdown formatting.
   {
     "field1": "type",
     "field2": ["array", "of", "items"],
     "field3": {
       "nested": "object"
     }
   }
```

### Prompt Chaining

The AI outputs feed into subsequent prompts:

```
Prompt 1 Output: refined_concept
    └─ Contains: problem, solution, users, features
    
    Passed to Prompt 2:
    "CONCEPT: {JSON.stringify(refinedConcept)}"
    └─ Generates: names, taglines, voice, colors
    
    Passed to Prompt 3:
    "Product Concept: {JSON.stringify(refinedConcept)}"
    "Brand Profile: {JSON.stringify(brandProfile)}"
    └─ Generates: headlines, CTAs, features, pricing, FAQs
```

---

## 💾 Session State Machine

```
START
  │
  ├─ POST /sessions
  │  └─ state = 'created'
  │  └─ outputs = { all: null }
  │
  ├─ POST /sessions/:id/generate/core
  │  └─ state = 'processing'
  │  └─ Gemini calls start
  │
  ├─ GET /sessions/:id/core_outputs (polling)
  │  ├─ if Gemini done:
  │  │  └─ state = 'completed'
  │  │  └─ outputs = { refined_concept, brand_profile, landing_content }
  │  │
  │  └─ if Gemini error:
  │     └─ state = 'failed'
  │     └─ error message returned
  │
  └─ Session expires (24h timeout)
     └─ state = 'expired'
     └─ data deleted
```

---

## 📈 Scaling Considerations

### Current Architecture (MVP)

**Bottlenecks**:
- Single node server
- In-memory storage (data lost on restart)
- Sequential API calls (slow)
- No caching

**Capacity**:
- ~50-100 concurrent users
- ~1,000 sessions/day
- Server cost: $20-50/month

### Phase 2: Horizontal Scaling

**Changes Needed**:
1. Database (PostgreSQL)
2. Load balancer (Nginx)
3. Session management (Redis)
4. Parallel API calls
5. Response caching
6. CDN for static assets

**Capacity**:
- ~10,000 concurrent users
- ~100,000 sessions/day
- Server cost: $500-2,000/month

### Phase 3: Enterprise Scale

**Changes Needed**:
1. Microservices (separate AI service)
2. Message queues (for async processing)
3. Distributed caching
4. Vector database (for semantic search)
5. Multiple Gemini model endpoints
6. Geographic redundancy

**Capacity**:
- ~1M concurrent users
- ~10M sessions/day
- Server cost: $10,000+/month

---

## 🔐 Security Architecture

### Current (MVP)

```
Client Browser
    ↓ CORS allowed for localhost
    ↓ Unencrypted HTTP
Backend (localhost:3000)
    ↓ No authentication
    ↓ No rate limiting
    ↓ API key in .env
Google Gemini API
```

### Future (Production)

```
Client Browser
    ↓ HTTPS enforced
    ↓ CORS restricted to domain
    ↓ CSRF protection
    ↓ CSP headers
Backend (AWS/GCP)
    ↓ JWT authentication
    ↓ Rate limiting (100/hour)
    ↓ API key in secrets manager
    ↓ Input validation
    ↓ SQL injection prevention
    ↓ Logging & monitoring
Google Gemini API
    ↓ Only backend can call
    ↓ API key never exposed to client
```

---

## 🧪 Testing Strategy

### Unit Tests (Future)

```javascript
// services/gemini.service.test.js
describe('GeminiService', () => {
  test('generateRefinedConcept returns valid JSON', async () => {
    const result = await GeminiService.generateRefinedConcept(
      'An app for tracking habits',
      'App',
      'Professional'
    );
    
    expect(result).toHaveProperty('problem_summary');
    expect(result.target_users).toHaveLength(3);
    expect(result.core_features).toHaveLength(4);
  });
});

// controllers/session.controller.test.js
describe('SessionController', () => {
  test('createSession creates valid session with UUID', async () => {
    // Mock request/response
    // Call createSession
    // Assert session created with valid UUID format
  });
});
```

### Integration Tests

```javascript
// Full flow test
describe('Full Generation Flow', () => {
  test('Create session → Generate → Poll → Get outputs', async () => {
    // 1. Create session
    const session = await createSession(...);
    
    // 2. Generate content
    await generateCore(session.id);
    
    // 3. Poll for completion
    const results = await pollUntilComplete(session.id);
    
    // 4. Verify all outputs present and valid
    expect(results).toHaveProperty('refined_concept');
    expect(results).toHaveProperty('brand_profile');
    expect(results).toHaveProperty('landing_content');
  });
});
```

### Performance Tests

```bash
# Load test: 100 concurrent sessions
k6 run --vus 100 --duration 60s load-test.js

# Stress test: Gradually increase load until failure
k6 run --stage 1m:50vus --stage 1m:100vus --stage 1m:150vus stress-test.js

# Spike test: Sudden traffic increase
k6 run --stage 5m:10vus --stage 1m:100vus --stage 5m:10vus spike-test.js
```

---

## 📊 Monitoring & Observability

### Metrics to Track

**Backend**:
- API response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Gemini API latency
- Session completion rate
- Concurrent sessions
- Memory usage

**Frontend**:
- Page load time
- Time to interactive
- API call latency from client perspective
- Error tracking (Sentry)
- User engagement (analytics)

### Logging

```javascript
// Backend logging strategy
console.log(`[${timestamp}] Session created: ${sessionId}`);
console.log(`[${timestamp}] Generating concept for session: ${sessionId}`);
console.log(`[${timestamp}] Gemini call duration: ${duration}ms`);
console.log(`[${timestamp}] Error in session ${sessionId}: ${error}`);

// Frontend error logging
Sentry.captureException(error, {
  tags: {
    component: 'Dashboard',
    action: 'generateIdea'
  },
  extra: {
    sessionId,
    status
  }
});
```

---

## 🚀 Deployment Architecture

### Local Development

```
Developer Machine
├── Frontend: Vite dev server (localhost:5173)
├── Backend: Node (localhost:3000)
└── Browser: http://localhost:5173
```

### Staging

```
AWS EC2 + RDS
├── Frontend: Vercel or S3+CloudFront
├── Backend: Node on EC2
├── Database: RDS PostgreSQL
├── Cache: ElastiCache Redis
└── Monitoring: CloudWatch
```

### Production

```
Multi-Region AWS/GCP
├── Frontend: CloudFront + S3 (Global CDN)
├── Backend: Lambda + API Gateway (Serverless)
│   or ECS + ALB (Containerized)
├── Database: RDS with Read Replicas
├── Cache: ElastiCache with Cluster Mode
├── Queue: SQS for async jobs
├── Monitoring: DataDog + PagerDuty
└── Backup: AWS Backup
```

