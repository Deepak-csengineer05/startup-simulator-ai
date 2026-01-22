import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import config from './src/config/index.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    app.listen(config.port, () => {
      console.log(`🚀  Startup Simulator AI Backend
Server:http://localhost:${config.port}
Environment: ${config.nodeEnv.padEnd(10)}
Status:Ready to generate startups! ✨            
`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
