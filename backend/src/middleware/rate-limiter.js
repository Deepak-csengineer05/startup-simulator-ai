import rateLimit from 'express-rate-limit';
import { logger } from '../utils/observability/index.js';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', { 
            ip: req.ip, 
            path: req.path,
            method: req.method 
        });
        res.status(429).json({
            error: 'Too many requests from this IP, please try again later.'
        });
    }
});

// Strict rate limiter for expensive AI generation endpoints
export const generationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 10 generation requests per hour
    message: 'You have exceeded the generation limit. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    handler: (req, res) => {
        logger.warn('Generation rate limit exceeded', { 
            ip: req.ip, 
            userId: req.user?._id,
            path: req.path 
        });
        res.status(429).json({
            error: 'You have exceeded the generation limit. Please try again in an hour.'
        });
    }
});

// Auth rate limiter (prevent brute force)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: (req, res) => {
        logger.warn('Auth rate limit exceeded', { 
            ip: req.ip, 
            path: req.path 
        });
        res.status(429).json({
            error: 'Too many login attempts. Please try again in 15 minutes.'
        });
    }
});

export default { apiLimiter, generationLimiter, authLimiter };
