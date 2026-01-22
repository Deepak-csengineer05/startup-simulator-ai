import jwt from 'jsonwebtoken';
import passport from 'passport';
import config from '../config/index.js';
import User from '../models/User.js';
import { logger } from '../utils/observability/index.js';

/**
 * Generate JWT token and set cookie
 */
const setTokenCookie = (res, user) => {
    const token = jwt.sign(
        { userId: user._id },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return token;
};

/**
 * Register new user with email/password
 */
export const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new user
        const user = await User.create({
            email,
            password,
            name,
            authProvider: 'local'
        });

        // Generate token and set cookie
        setTokenCookie(res, user);

        res.status(201).json({
            message: 'Registration successful',
            user: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login with email/password
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user with password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if user has a password (not Google-only user)
        if (!user.password) {
            return res.status(401).json({ error: 'Please use Google to sign in' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token and set cookie
        setTokenCookie(res, user);

        res.json({
            message: 'Login successful',
            user: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Initiate Google OAuth login
 */
export const googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
});

/**
 * Handle Google OAuth callback
 */
export const googleCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
        if (err) {
            logger.error('Google auth error', { error: err.message, stack: err.stack });
            return res.redirect(`${config.frontendUrl}/login?error=auth_failed`);
        }

        if (!user) {
            return res.redirect(`${config.frontendUrl}/login?error=no_user`);
        }

        // Generate token and set cookie
        setTokenCookie(res, user);

        // Redirect to frontend
        res.redirect(`${config.frontendUrl}/dashboard`);
    })(req, res, next);
};

/**
 * Logout user
 */
export const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: config.nodeEnv === 'production' ? 'none' : 'lax'
    });

    res.json({ message: 'Logged out successfully' });
};

/**
 * Get current user
 */
export const getMe = (req, res) => {
    res.json({ user: req.user });
};

export default {
    register,
    login,
    googleAuth,
    googleCallback,
    logout,
    getMe
};
