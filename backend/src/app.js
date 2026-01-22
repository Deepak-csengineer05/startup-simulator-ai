import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import client from "prom-client";
import config from './config/index.js';
import './config/passport.js';
import authRoutes from './routes/auth.routes.js';
import apiRoutes from './routes/api.routes.js';
import { metricsMiddleware, register } from './utils/observability/index.js';


const app = express();

// CORS configuration
app.use(cors({
    origin: config.frontendUrl,
    credentials: true
}));

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Metrics middleware (HTTP request metrics)
app.use(metricsMiddleware);

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});


// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 🔥 Prometheus metrics (KEEP HERE)
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// 404 handler (ALWAYS LAST)
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler (LAST LAST)
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

export default app;
