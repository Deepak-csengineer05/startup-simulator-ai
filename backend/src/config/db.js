import mongoose from 'mongoose';
import config from './index.js';
import { logger } from '../utils/observability/index.js';

const connectDB = async (retries = 5, delay = 5000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const conn = await mongoose.connect(config.mongodbUri, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            });

            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

            // Handle connection events
            mongoose.connection.on('error', (err) => {
                logger.error('MongoDB connection error:', err);
                console.error('❌ MongoDB connection error:', err.message);
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB disconnected. Attempting to reconnect...');
                console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
            });

            mongoose.connection.on('reconnected', () => {
                logger.info('MongoDB reconnected');
                console.log('✅ MongoDB reconnected');
            });

            // Verify indexes on startup
            await verifyIndexes();

            return conn;
        } catch (error) {
            logger.error(`MongoDB connection attempt ${attempt}/${retries} failed:`, error);
            console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, error.message);
            
            if (attempt === retries) {
                console.error('\n💥 Failed to connect to MongoDB after multiple attempts.');
                console.error('   Please ensure MongoDB is running and the connection string is correct.');
                console.error(`   Connection string: ${config.mongodbUri.replace(/\/\/.*:.*@/, '//***:***@')}\n`);
                throw error;
            }

            console.log(`   Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Verify database indexes are created
const verifyIndexes = async () => {
    try {
        const db = mongoose.connection.db;
        
        // Check User indexes
        const userIndexes = await db.collection('users').indexes();
        
        // Check Session indexes
        const sessionIndexes = await db.collection('sessions').indexes();
        
        console.log(`✅ Database indexes verified (Users: ${userIndexes.length}, Sessions: ${sessionIndexes.length})`);
    } catch (error) {
        logger.warn('Failed to verify indexes:', error);
        console.warn('⚠️  Could not verify database indexes:', error.message);
    }
};

export default connectDB;
