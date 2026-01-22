# Phase 4 Quick Start Guide

## Setup Instructions

### 1. Backend Configuration

**Update `.env` file in `backend/` directory:**
```env
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
JWT_SECRET=change-this-to-a-random-secret-key-in-production
NODE_ENV=development
PORT=3000
```

**Get Google Client ID:**
1. Go to https://console.cloud.google.com/
2. Create new project or use existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Authorized redirect URIs: `http://localhost:3000`, `http://localhost:5173`
6. Copy Client ID from credentials

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Update Frontend Configuration

**Replace in `frontend/src/components/GoogleLoginButton.jsx` (appears 3 times):**
```javascript
// Find: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
// Replace with: 'your-actual-google-client-id.apps.googleusercontent.com'
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```
Server will run on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### 5. Testing the Application

**Test Flow:**
1. Open `http://localhost:5173` in browser
2. Click "Sign in with Google" button
3. Complete Google authentication
4. Enter your startup idea
5. Click "Generate Core"
6. Wait for generation to complete
7. Click "My Projects" to see saved project
8. Explore tabs and features
9. Click "Live Preview" in Code tab
10. Click "Export ZIP" to download files

## Feature Overview

### Authentication
- **Sign In**: Google OAuth 2.0 integration
- **Project Isolation**: Only see your own projects
- **Guest Mode**: Can use without signing in (history not saved)
- **Auto-Login**: Token persists across sessions

### Project History
- **My Projects Button**: Top-right nav when logged in
- **Project List**: Shows all saved startups with dates and status
- **Load Project**: Click to restore previous work
- **Auto-Save**: New projects saved automatically

### Live Preview
- **Code Tab**: Shows generated LandingPage.jsx
- **Live Preview Button**: Opens interactive preview in new tab
- **Responsive**: Works on desktop and mobile

### Enterprise Features
- **Professional Nav Bar**: Clean, minimal design
- **Status Indicators**: Visual feedback on generation progress
- **Empty States**: Helpful prompts when content not generated
- **Tooltips**: Hover hints on buttons
- **Color System**: Consistent, modern color palette

## API Endpoints - Phase 4 Additions

### Authentication
```
POST /api/auth/google
  Body: { idToken: string }
  Returns: { userId, email, name, token, picture }

GET /api/auth/verify
  Returns: { userId, email, name, user }
```

### Projects
```
GET /api/projects
  Returns: { projects: [{sessionId, title, createdAt, lastUpdatedAt, status}] }

GET /api/projects/:sessionId
  Returns: Full project with all outputs
```

### Preview
```
POST /api/sessions/:id/preview-html
  Returns: { html: "<!DOCTYPE html>..." }
```

## Browser Requirements
- Google Chrome / Edge / Safari (ES2020+ support)
- Modern JS engine (React 19 compatible)
- Cookies/LocalStorage enabled
- Pop-ups allowed (for preview feature)

## Troubleshooting

### Google Login Not Working
- Verify GOOGLE_CLIENT_ID in .env matches credentials
- Check browser console for OAuth errors
- Ensure correct redirect URIs in Google Console
- Try incognito mode (can help with auth issues)

### Projects Not Saving
- Check that you're logged in (should see user info in top-right)
- Verify backend is running on port 3000
- Check browser Network tab for POST /api/projects errors

### Live Preview Blank
- Ensure code tab has generated landing content first
- Generate Core assets before previewing
- Check browser console for HTML rendering errors
- Try in private/incognito window

### Build Issues
```bash
# Clear cache and rebuild
cd frontend
rm -r node_modules
npm install
npm run build
```

## Performance Notes
- First load: ~400KB JS (127KB gzipped) - typical modern SPA
- Generation: 30-60 seconds depending on AI model availability
- Preview rendering: <1 second
- Project list loading: <500ms

## Production Deployment Checklist
- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Update GOOGLE_CLIENT_ID with production value
- [ ] Enable HTTPS only
- [ ] Set up database for persistence
- [ ] Configure rate limiting
- [ ] Enable CORS for production domain only
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure backup strategy
- [ ] Test end-to-end flow

## Support Resources
- Google OAuth: https://developers.google.com/identity
- Gemini API: https://ai.google.dev/
- React Documentation: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/

## What's Next (Phase 5 Ideas)
- Database persistence (PostgreSQL/MongoDB)
- Email/password authentication
- User profile management
- Project sharing and collaboration
- Team workspaces
- Analytics dashboard
- Rate limiting per user
- Email notifications
- SSO integration (GitHub, Microsoft, etc.)
