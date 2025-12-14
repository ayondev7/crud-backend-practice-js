/**
 * SERVER.JS - Entry Point for Backend Application
 * 
 * This file is responsible for:
 * 1. Loading environment variables
 * 2. Connecting to databases (PostgreSQL via Prisma & MongoDB via Mongoose)
 * 3. Starting the Express server
 * 4. Handling graceful shutdown
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Import the Express app configuration
import app from './app.js';

// Import database connections
import { connectPrisma, disconnectPrisma } from './config/prisma.js';
import { connectMongoDB, disconnectMongoDB } from './config/mongoose.js';

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Variable to store server instance
let server;

/**
 * Initialize Database Connections
 * This function attempts to connect to both PostgreSQL (via Prisma) and MongoDB (via Mongoose)
 */
async function initializeDatabases() {
  try {
    console.log('🔄 Connecting to databases...');
    
    // Connect to PostgreSQL via Prisma
    await connectPrisma();
    console.log('✅ PostgreSQL connected via Prisma');
    
    // Connect to MongoDB via Mongoose
    await connectMongoDB();
    console.log('✅ MongoDB connected via Mongoose');
    
    console.log('✅ All databases connected successfully\n');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('⚠️  Server will continue but database operations may fail\n');
  }
}

/**
 * Start the Express Server
 */
async function startServer() {
  try {
    // Initialize database connections
    await initializeDatabases();
    
    // Start listening on the specified port
    server = app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 Listening on port ${PORT}`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('📝 Available API endpoints:');
      console.log('   - Prisma/PostgreSQL: /api/prisma/*');
      console.log('   - Mongoose/MongoDB: /api/mongoose/*');
      console.log('   - Health Check: /api/health');
      console.log('\n💡 Press Ctrl+C to stop the server\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful Shutdown Handler
 * Properly closes database connections and server before exiting
 */
async function gracefulShutdown(signal) {
  console.log(`\n\n🛑 ${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close server to stop accepting new connections
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          console.log('✅ Server closed');
          resolve();
        });
      });
    }
    
    // Disconnect from databases
    await disconnectPrisma();
    console.log('✅ Prisma disconnected');
    
    await disconnectMongoDB();
    console.log('✅ Mongoose disconnected');
    
    console.log('✅ Graceful shutdown completed\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle different termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(error.name, error.message);
  console.error(error.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(error.name, error.message);
  gracefulShutdown('UNHANDLED REJECTION');
});

// Start the server
startServer();
