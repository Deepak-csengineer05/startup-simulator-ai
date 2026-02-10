import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startup-simulator';

async function fixGoogleIdIndex() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Drop the old googleId index
        try {
            await usersCollection.dropIndex('googleId_1');
            console.log('✓ Dropped old googleId_1 index');
        } catch (error) {
            if (error.code === 27) {
                console.log('Index does not exist, skipping...');
            } else {
                throw error;
            }
        }

        // Create new sparse unique index
        await usersCollection.createIndex(
            { googleId: 1 }, 
            { unique: true, sparse: true }
        );
        console.log('✓ Created new sparse googleId index');

        console.log('\n✅ Index fixed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing index:', error);
        process.exit(1);
    }
}

fixGoogleIdIndex();
