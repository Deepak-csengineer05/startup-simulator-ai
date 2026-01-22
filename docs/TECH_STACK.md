# Technology Stack & Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  React 19 + Vite + Tailwind CSS + Framer Motion             │
│  ├─ Dashboard (Main UI)                                     │
│  ├─ Input Panel (Idea + Options)                            │
│  ├─ Results Panel (Tabbed Views)                            │
│  └─ Components (Thesis/Brand/Landing Views)                 │
└───────────────────────────┬─────────────────────────────────┘
                            │ (HTTP REST API)
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                      BACKEND                                │
│  Node.js + Express                                          │
│  ├─ Session Controller (Session Management)                 │
│  ├─ Gemini Service (AI Integration)                         │
│  ├─ Memory Store (In-Memory Storage)                        │
│  └─ Error Handling                                          │
└───────────────────────────┬─────────────────────────────────┘
                            │ (API Calls)
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                 EXTERNAL SERVICES                           │
│  Google Gemini API 2.0                                      │
│  └─ gemini-2.0-flash-exp (Latest Model)                     │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.0 | UI framework, component management |
| **Vite** | 7.2.4 | Build tool, dev server, HMR |
| **Tailwind CSS** | 4.1.17 | Utility-first CSS framework |
| **@tailwindcss/postcss** | 4.1.17 | PostCSS plugin for Tailwind v4 |
| **Framer Motion** | 12.23.25 | Animation & motion library |
| **Lucide React** | 0.556.0 | Icon components |
| **Axios** | 1.13.2 | HTTP client |
| **PostCSS** | 8.5.6 | CSS processing |
| **Autoprefixer** | 10.4.22 | Browser prefix handling |

### Backend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | Latest | JavaScript runtime |
| **Express** | 5.2.1 | Web framework, routing |
| **@google/generative-ai** | 0.24.1 | Gemini API client |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **dotenv** | 17.2.3 | Environment variables |
| **uuid** | 13.0.0 | Unique session IDs |
| **archiver** | 7.0.1 | ZIP file creation (future export) |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 9.39.1 | Code quality & linting |
| **TypeScript** | Latest | Type safety (optional) |
| **Vite Plugins** | Latest | React HMR optimization |

---

## 📁 Project Structure

```
Startup Simulator AI/
├── frontend/                          # React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx          # Main container
│   │   │   ├── IdeaInput.jsx          # Unused (Dashboard is main UI)
│   │   │   └── Results/
│   │   │       ├── ThesisView.jsx     # Concept display
│   │   │       ├── BrandView.jsx      # Brand display
│   │   │       ├── LandingCopyView.jsx# Landing copy display
│   │   │       ├── MarketView.jsx     # (Future)
│   │   │       ├── PitchDeckView.jsx  # (Future)
│   │   │       └── CodePreview.jsx    # (Future)
│   │   ├── services/
│   │   │   └── api.js                 # API client functions
│   │   ├── App.jsx                    # Root component
│   │   ├── main.jsx                   # Entry point
│   │   ├── index.css                  # Global styles + Tailwind config
│   │   └── App.css                    # Component styles
│   ├── index.html                     # HTML template
│   ├── package.json                   # Dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── eslint.config.js               # Linting rules
│   ├── postcss.config.js              # PostCSS plugins
│   └── dist/                          # Build output
│
├── backend/                           # Node/Express app
│   ├── src/
│   │   ├── app.js                     # Express app setup
│   │   ├── config/
│   │   │   └── index.js               # Configuration management
│   │   ├── controllers/
│   │   │   └── session.controller.js  # Request handlers
│   │   ├── services/
│   │   │   └── gemini.service.js      # AI integration
│   │   ├── models/
│   │   │   └── memoryStore.js         # Data storage
│   │   └── routes/
│   │       └── api.routes.js          # API endpoints
│   ├── server.js                      # Entry point
│   ├── package.json                   # Dependencies
│   ├── .env                           # Environment variables (SECRET)
│   ├── .env.example                   # Environment template
│   ├── verify_api.js                  # API testing script
│   └── list_models.js                 # Model listing utility
│
└── docs/                              # Documentation
    ├── OVERVIEW.md                    # Project overview
    ├── PROBLEM_STATEMENT.md           # Problem & solution
    ├── TECH_STACK.md                  # (This file)
    ├── ARCHITECTURE.md                # Detailed architecture
    ├── IMPLEMENTATION.md              # How-to build
    ├── API_REFERENCE.md               # API endpoints
    └── USERS.md                       # User personas
```

---

## 🔌 API Endpoints

### Session Management

```
POST /api/sessions
Create a new session
Body: { idea_text, domain_hint, tone_preference }
Response: { session_id, message }

POST /api/sessions/:id/generate/core
Start content generation
Response: { status, message, data: { refined_concept, brand_profile, landing_content } }

GET /api/sessions/:id/core_outputs
Poll for results
Response: { session_id, status, outputs }
```

---

## 🔄 Data Flow

### 1. User Input
```javascript
User enters:
- idea_text: "Uber for dog walking"
- domain_hint: "Consumer App"
- tone_preference: "Friendly and trustworthy"
```

### 2. Session Creation
```javascript
Backend creates session with UUID
Store in memory with:
{
  id: "abc-123-def",
  createdAt: timestamp,
  idea_text: "...",
  domain_hint: "...",
  tone_preference: "...",
  status: "created",
  outputs: { refined_concept, brand_profile, landing_content }
}
```

### 3. Content Generation (Sequential)
```
User clicks "Ignite Startup"
  ↓
Frontend: POST /api/sessions/:id/generate/core
  ↓
Backend executes 3 Gemini API calls in sequence:
  ├─ Step 1: generateRefinedConcept()
  │  └─ Gemini returns JSON with problem, solution, users, features
  │
  ├─ Step 2: generateBrandProfile()
  │  └─ Gemini returns JSON with names, taglines, voice, colors
  │
  └─ Step 3: generateLandingContent()
     └─ Gemini returns JSON with headline, subtitle, CTA, features, pricing, FAQs
  ↓
Backend stores all outputs in session
  ↓
Frontend polls GET /api/sessions/:id/core_outputs every 2 seconds
  ↓
When status === "completed", render results
```

### 4. Display
```
Frontend renders:
- Concept Tab: Problem/Solution + Users + Features
- Brand Tab: Names + Taglines + Voice + Color Palette
- Landing Tab: Hero + Features + Pricing + FAQs
```

---

## 🧠 AI Integration

### Gemini API Configuration

```javascript
Model: gemini-2.0-flash-exp
Provider: Google
API Version: @google/generative-ai v0.24.1
Response Format: Forced JSON (responseMimeType: "application/json")
```

### Prompt Structure

Each prompt is engineered to return structured JSON:

```javascript
const prompt = `
You are a [ROLE].
Your goal is [OBJECTIVE].

INPUTS:
- Input 1: [description]
- Input 2: [description]

INSTRUCTIONS:
1. [Step 1]
2. [Step 2]
3. [Step 3]

OUTPUT FORMAT:
Return ONLY valid JSON with no markdown formatting.
{
  "field1": "type",
  "field2": ["array", "of", "items"]
}
`;
```

### Error Handling

```javascript
try {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
} catch (error) {
  console.error("Gemini error:", error);
  // Return user-friendly error message
  throw new Error("Content generation failed");
}
```

---

## 💾 Storage Architecture

### Current (MVP)

**In-Memory Map**:
```javascript
sessions = Map {
  "session-id-1" => {
    id: "session-id-1",
    createdAt: "2024-12-06T...",
    idea_text: "...",
    status: "completed",
    outputs: {
      refined_concept: {...},
      brand_profile: {...},
      landing_content: {...}
    }
  }
}
```

**Limitations**:
- Data lost on server restart
- No persistence
- Single server only
- Memory grows with sessions

### Future (Phase 2)

**Database Migration**:
```javascript
Database: PostgreSQL
Tables:
  - sessions (id, created_at, status)
  - user_ideas (id, session_id, idea_text, domain_hint, tone_preference)
  - outputs (id, session_id, concept, brand, landing)
  - users (id, email, created_at) // For saved sessions
```

---

## 🚀 Performance Considerations

### Current Metrics
- **API Response Time**: 
  - Concept: ~2-3 seconds
  - Brand: ~2-3 seconds
  - Landing: ~2-3 seconds
  - **Total**: ~6-9 seconds

- **Frontend Performance**:
  - Build time: ~5 seconds
  - Bundle size: ~368KB (gzipped: ~120KB)
  - Page load: <1 second

### Optimization Opportunities
1. **Parallel Requests**: Generate concept + brand simultaneously (currently sequential)
2. **Caching**: Cache similar ideas' outputs
3. **Streaming**: Stream Gemini responses instead of waiting for completion
4. **CDN**: Serve static assets from global CDN
5. **Database Indexing**: Optimize queries on future DB layer

---

## 🔐 Security & Deployment

### Current Security
- ✅ CORS enabled for local development
- ✅ Environment variables for API keys
- ✅ No authentication (MVP)
- ⚠️ API key visible in .env

### Future Security
- 🔒 API key rotation
- 🔒 Rate limiting per session
- 🔒 Input validation & sanitization
- 🔒 User authentication
- 🔒 SQL injection prevention
- 🔒 HTTPS enforcement
- 🔒 GDPR compliance

### Deployment
- **Current**: Localhost only
- **Next**: AWS/Vercel/Railway
- **Production**: Docker containers, managed database, CDN

---

## 📊 Tech Decision Rationale

### Why React + Vite?
- ✅ Fast refresh for rapid iteration
- ✅ Modern component architecture
- ✅ Large ecosystem (Framer Motion, Lucide)
- ✅ Easy to scale

### Why Express?
- ✅ Lightweight & flexible
- ✅ Great for API servers
- ✅ Large middleware ecosystem
- ✅ Good async/await support

### Why Gemini API?
- ✅ State-of-the-art model quality
- ✅ Structured output support (JSON)
- ✅ Cost-effective
- ✅ Fast inference
- ✅ Good documentation

### Why Tailwind CSS?
- ✅ Utility-first approach
- ✅ Rapid UI development
- ✅ Consistent design system
- ✅ Easy customization

### Why In-Memory Storage (MVP)?
- ✅ Instant prototyping
- ✅ No database setup needed
- ✅ Sufficient for MVP (sessions don't need persistence)
- ⚠️ Limited to short-term use

---

## 🔄 Development Workflow

### Local Setup
```bash
# Frontend
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173

# Backend
cd backend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Build & Deploy
```bash
# Frontend
npm run build
# Output: dist/

# Backend
node server.js
# Node modules loaded, server starts
```

---

## 📞 Tech Support Checklist

- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] Gemini API key obtained
- [ ] .env file configured
- [ ] Port 3000 & 5173 available
- [ ] CORS enabled

