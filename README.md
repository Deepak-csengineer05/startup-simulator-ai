# Startup Simulator AI

> Transform your startup idea into a complete business package under a minute using AI.

![Node](https://img.shields.io/badge/node-18%2B-green.svg)
![React](https://img.shields.io/badge/react-19-blue.svg)

## 🚀 Features

- **🎯 Thesis Generation** - Refined problem, solution, target users, and MVP features
- **🎨 Brand Identity** - Name options, taglines, voice & tone, color palette
- **📄 Landing Copy** - Headlines, CTAs, features, pricing, FAQs
- **📊 Market Analysis** - TAM/SAM/SOM, competitors, SWOT, go-to-market
- **🎬 Pitch Deck** - 10-slide investor-ready presentation outline
- **💻 Code Preview** - Tech stack, architecture, sample code, timeline

### Additional Features
- 🌓 **Dual Themes** - Light and dark mode with system preference detection
- 🔄 **Model Fallback** - Auto-switches between Gemini models on rate limits
- 🔐 **Google OAuth** - Secure authentication with session persistence
- 💾 **MongoDB** - Full data persistence for users and sessions

## 📋 Prerequisites

- **Node.js** 18+ 
- **MongoDB** (local or Atlas)
- **Google Cloud** OAuth credentials
- **Gemini API** key

## 🛠️ Quick Start

### 1. Clone and Install

```bash
# Backend
cd backend
npm install
cp .env.example .env

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/startup-simulator
JWT_SECRET=your-super-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:5173
```

### 3. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Open Browser

Visit `http://localhost:5173` and sign in with Google!

## 🗂️ Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # DB, passport, env config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Gemini AI service
│   │   └── app.js           # Express app
│   └── server.js            # Entry point
│
└── frontend/
    └── src/
        ├── components/      # React components
        │   └── Results/     # 6 output views
        ├── context/         # Auth & Theme providers
        ├── services/        # API client
        └── App.jsx          # Main app with routing
```

## 🔑 Getting API Keys

### Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create an API key
3. Add to `backend/.env` as `GEMINI_API_KEY`

### Google OAuth
1. Visit [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect: `http://localhost:3000/auth/google/callback`
4. Add to `backend/.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

## 🚀 Deployment

### Backend (Railway/Render)
1. Deploy from GitHub
2. Set all environment variables
3. Update `GOOGLE_CALLBACK_URL` to production URL

### Frontend (Vercel/Netlify)
1. Deploy from GitHub
2. Set `VITE_API_URL` to production backend URL
3. Build command: `npm run build`
4. Output: `dist`

### MongoDB Atlas
1. Create free M0 cluster
2. Get connection string
3. Update `MONGODB_URI` in backend

## 📚 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/auth/google` | Initiate Google OAuth |
| GET | `/auth/me` | Get current user |
| POST | `/api/sessions` | Create session |
| POST | `/api/sessions/:id/generate` | Generate all outputs |
| GET | `/api/sessions/:id` | Get session |

## 🎨 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion
- **Backend**: Node.js, Express 5, Passport.js
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini 2.0 Flash
- **Auth**: Google OAuth 2.0 + JWT

## 📄 License

MIT License - feel free to use for your own projects!

---

Built with ❤️ by Deepak Saravanakumar

