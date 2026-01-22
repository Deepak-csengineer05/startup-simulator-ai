# Implementation Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0+ ([Download](https://nodejs.org/))
- npm 9.0+ (comes with Node)
- A Google Gemini API key ([Get one free](https://aistudio.google.com/app/apikey))
- Text editor or IDE (VS Code recommended)
- Terminal/Command Line
- Git (optional, for version control)

### Project Location
```
e:\new projects\Startup Simulator AI\
```

---

## 📥 Installation

### Step 1: Clone/Open Project
```bash
# Navigate to project directory
cd "e:\new projects\Startup Simulator AI"

# Verify structure
dir
# Should show: backend/ frontend/ docs/
```

### Step 2: Set Up Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install
# Downloads all packages from package.json

# Check installation
npm list
# Verify all packages installed correctly
```

### Step 3: Configure Environment

```bash
# Open .env file with editor
# (Already exists with API key)

# Verify content:
# PORT=3000
# GEMINI_API_KEY=AIzaSyBktXJm-yKkGPOaXIym9gYcnLjsC41wczs

# If missing, create from .env.example
copy .env.example .env
```

### Step 4: Set Up Frontend

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install
# Downloads all packages from package.json
```

---

## 🏃 Running the Application

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
# Output should show:
# Server running on port 3000
# Environment: Node v18.x.x
# Gemini Model: gemini-2.0-flash-exp
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
# Output should show:
# VITE v7.2.6 ready in xxx ms
# ➜ Local: http://localhost:5173
# ➜ press h to show help
```

### Access Application

Open browser and navigate to:
```
http://localhost:5173
```

You should see:
- Header with "Startup Simulator AI" and status
- Left panel with input fields
- Right panel with "Your Empire Awaits" message

---

## 🧪 Testing the Application

### Test 1: Basic Idea Generation

1. **Enter an idea** in the textarea:
   ```
   A marketplace connecting freelance designers with small businesses
   ```

2. **Select domain**: E-commerce

3. **Select tone**: Professional

4. **Click "Ignite Startup"**

5. **Wait** for processing (10-15 seconds)

6. **View results**:
   - Tab 1 (Concept): Problem statement, solution, users, features
   - Tab 2 (Brand): Names, taglines, voice, colors
   - Tab 3 (Landing): Headlines, CTAs, features, pricing, FAQs

### Test 2: Different Domain

Repeat with different inputs:
- **Domain**: SaaS
- **Tone**: Bold
- **Idea**: "An AI tool that generates project proposals from client briefs"

### Test 3: Rapid Iteration

1. Generate first idea
2. Modify inputs
3. Generate again
4. Compare outputs
5. See how different domains/tones change the output

---

## 🛠️ Troubleshooting

### Issue: "Port 3000 already in use"

```bash
# Windows - Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Or use different port
set PORT=3001  # Windows
npm run dev
```

### Issue: "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: "GEMINI_API_KEY is not set"

```bash
# Verify .env file exists
type .env  # Windows
cat .env   # Mac/Linux

# Check content:
# PORT=3000
# GEMINI_API_KEY=AIzaSy...

# If empty, add your API key:
# Get from: https://aistudio.google.com/app/apikey
```

### Issue: "API request failed" or timeout

```bash
# Check if backend is running
curl http://localhost:3000/health
# Should return: {"status":"ok"}

# Check frontend logs in browser console (F12)
# Look for network errors

# Verify API key is valid
# Test with: node backend/verify_api.js
```

### Issue: "Cannot resolve @tailwindcss/postcss"

```bash
# This is a v4 Tailwind issue, should be fixed
cd frontend
npm install @tailwindcss/postcss@latest
npm run build
```

---

## 📝 Key Files to Understand

### Frontend

**Main Entry**
- `src/main.jsx` - React entry point
- `src/App.jsx` - Root component that renders Dashboard
- `src/components/Dashboard.jsx` - Main UI container (420px input + results)

**Components**
- `src/components/Results/ThesisView.jsx` - Displays refined concept
- `src/components/Results/BrandView.jsx` - Displays brand identity
- `src/components/Results/LandingCopyView.jsx` - Displays landing page content

**Services**
- `src/services/api.js` - HTTP calls to backend

**Styling**
- `src/index.css` - Global styles + Tailwind theme variables
- Tailwind config in `postcss.config.js` and `index.css`

### Backend

**Entry**
- `server.js` - Starts Express server
- `src/app.js` - Express configuration

**Request Handlers**
- `src/controllers/session.controller.js` - POST/GET endpoints

**AI Integration**
- `src/services/gemini.service.js` - Gemini API calls with prompts

**Data Storage**
- `src/models/memoryStore.js` - In-memory session storage

**Configuration**
- `src/config/index.js` - Environment variables
- `.env` - Secrets (API key, port)

---

## 🔧 Common Customizations

### Change Port

**Backend** (`backend/.env`):
```
PORT=3001
```

**Frontend** (`frontend/vite.config.js`):
```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

### Modify Domain Options

**Frontend** (`src/components/Dashboard.jsx`, line ~150):
```jsx
<select value={domain} onChange={(e) => setDomain(e.target.value)}>
  <option>SaaS</option>
  <option>Fintech</option>
  <option>Edtech</option>
  <option>E-commerce</option>
  <option>Consumer App</option>
  <option>AI Tool</option>
  {/* Add new option here */}
  <option>Healthcare</option>
</select>
```

### Modify Tone Options

**Frontend** (`src/components/Dashboard.jsx`, line ~165):
```jsx
<select value={tone} onChange={(e) => setTone(e.target.value)}>
  <option>Professional</option>
  <option>Casual</option>
  <option>Playful</option>
  <option>Bold</option>
  <option>Luxury</option>
  {/* Add new option here */}
  <option>Minimalist</option>
</select>
```

### Change AI Model

**Backend** (`src/config/index.js`):
```javascript
module.exports = {
    PORT: process.env.PORT || 3000,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: "gemini-2.5-flash"  // Change model here
};
```

### Customize UI Colors

**Frontend** (`src/index.css`, lines 5-28):
```css
@theme {
  /* Brand Colors - Change these hex values */
  --color-brand-50: #eff6ff;
  --color-brand-100: #dbeafe;
  --color-brand-600: #2563eb;  /* Main brand color */
  
  /* Add your custom colors */
}
```

### Adjust Polling Interval

**Frontend** (`src/components/Dashboard.jsx`, useEffect):
```jsx
pollInterval = setInterval(async () => {
  // Poll every 2 seconds (2000ms)
  // Change this to 1000 for 1 second, 5000 for 5 seconds
}, 2000);
```

---

## 🧪 API Testing

### Test Backend Health

```bash
curl http://localhost:3000/health
# Expected: {"status":"ok"}
```

### Create Session

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"idea_text":"My startup idea","domain_hint":"SaaS","tone_preference":"Professional"}'

# Response: {"session_id":"abc-123-def-456","message":"Session created"}
```

### Trigger Generation

```bash
# Replace abc-123-def-456 with actual session_id
curl -X POST http://localhost:3000/api/sessions/abc-123-def-456/generate/core

# Response: {"status":"completed","message":"Core assets generated successfully","data":{...}}
```

### Get Results

```bash
curl http://localhost:3000/api/sessions/abc-123-def-456/core_outputs

# Response: {"session_id":"abc-123-def-456","status":"completed","outputs":{...}}
```

---

## 📦 Building for Production

### Frontend Build

```bash
cd frontend
npm run build
# Creates: dist/ folder with optimized files

# Preview production build locally
npm run preview
# Visit: http://localhost:4173
```

### Backend Production

```bash
# Option 1: Node.js on server
node server.js

# Option 2: Docker (future)
docker build -t startup-simulator-api .
docker run -p 3000:3000 startup-simulator-api

# Option 3: PM2 (process manager)
npm install -g pm2
pm2 start server.js
pm2 save
pm2 startup
```

---

## 📊 Performance Monitoring

### Frontend Performance

```javascript
// Open DevTools (F12) → Performance tab
// Record → Generate idea → Stop
// Analyze:
// - React rendering time
// - Network requests
// - Animation frame rate
```

### Backend Performance

```bash
# Monitor resource usage
node --inspect server.js
# Open chrome://inspect in Chrome DevTools

# Or use simple logging
# Check console output for Gemini API response times
```

---

## 🚢 Deployment Checklist

- [ ] Dependencies installed and locked (`package-lock.json`)
- [ ] Environment variables configured (`.env`)
- [ ] API key valid and not expired
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Backend starts without errors (`npm run dev`)
- [ ] CORS configured for production domain
- [ ] Database migration planned for future
- [ ] Rate limiting implemented
- [ ] Error handling comprehensive
- [ ] Logging configured
- [ ] Tests written and passing
- [ ] Security audit completed
- [ ] Performance baseline established

---

## 📚 Next Steps

1. **Explore the Code**: Open files in `src/` and `backend/src/`
2. **Modify Prompts**: Try different prompts in `gemini.service.js`
3. **Customize UI**: Adjust Tailwind classes and animations
4. **Add Features**: Implement export, team collaboration, etc.
5. **Deploy**: Use Vercel for frontend, Railway for backend
6. **Optimize**: Profile and optimize based on usage patterns

---

## 💬 Support

### If Something Breaks

1. Check error message in terminal
2. Search errors in this doc
3. Review GitHub issues (if applicable)
4. Check browser console (F12) for frontend errors
5. Check terminal output for backend errors

### Useful Commands

```bash
# Check Node version
node --version

# List all running processes on port
netstat -ano | findstr :3000  # Windows
lsof -i :3000  # Mac/Linux

# Clear npm cache
npm cache clean --force

# Update npm
npm install -g npm@latest

# Check for security vulnerabilities
npm audit
npm audit fix
```

