const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // MongoDB
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/startup-simulator',

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    jwtExpiresIn: '7d',

    // Google OAuth
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
    },

    // Gemini AI
    geminiApiKey: process.env.GEMINI_API_KEY,

    // Frontend
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};

// Validate critical environment variables
const validateConfig = () => {
    const errors = [];

    if (!config.geminiApiKey) {
        errors.push('❌ GEMINI_API_KEY is required but not set in environment variables');
        errors.push('   Get your API key from: https://aistudio.google.com/app/apikey');
    }

    /*if (!config.mongodbUri || config.mongodbUri === 'mongodb://localhost:27017/startup-simulator') {
        console.warn('⚠️  Using default MongoDB URI. Set MONGODB_URI in .env for production.');
    }*/

    if (config.jwtSecret === 'fallback-secret-change-in-production') {
        console.warn('⚠️  Using default JWT_SECRET. Set a strong secret in .env for production.');
    }

    if (errors.length > 0) {
        console.error('\n' + errors.join('\n') + '\n');
        throw new Error('Configuration validation failed. Please check your .env file.');
    }
};

// Run validation
validateConfig();

export default config;
