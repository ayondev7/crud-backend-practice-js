/**
 * APP.JS - Express Application Configuration
 * 
 * This file is responsible for:
 * 1. Setting up Express middleware
 * 2. Configuring security and logging
 * 3. Defining routes
 * 4. Error handling
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Create Express application
const app = express();

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE SETUP
// ═══════════════════════════════════════════════════════════════

/**
 * Helmet - Sets various HTTP headers for security
 * Helps protect against well-known web vulnerabilities
 */
app.use(helmet());

/**
 * CORS - Cross-Origin Resource Sharing
 * Allows frontend applications from different origins to access this API
 */
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * Morgan - HTTP Request Logger
 * Logs all incoming requests (useful for debugging)
 * Uses 'dev' format in development, 'combined' in production
 */
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/**
 * Body Parsers
 * - express.json() - Parses incoming JSON payloads
 * - express.urlencoded() - Parses URL-encoded form data
 */
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Custom Request Logger Middleware (Optional)
 * Logs timestamp and basic request info
 */
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(`[${req.requestTime}] ${req.method} ${req.url}`);
  next();
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * Health Check Route
 * Quick endpoint to verify server is running
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Root Route
 * Welcome message for API
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to CRUD Practice API',
    documentation: {
      prisma: '/api/prisma/*',
      mongoose: '/api/mongoose/*',
      health: '/api/health'
    }
  });
});

/**
 * Import and use route modules
 */

// Prisma (PostgreSQL) Routes
const prismaUserRoutes = require('./routes/prisma/userRoutes');
const prismaPostRoutes = require('./routes/prisma/postRoutes');
const prismaProductRoutes = require('./routes/prisma/productRoutes');

app.use('/api/prisma/users', prismaUserRoutes);
app.use('/api/prisma/posts', prismaPostRoutes);
app.use('/api/prisma/products', prismaProductRoutes);

// Mongoose (MongoDB) Routes
const mongooseUserRoutes = require('./routes/mongoose/userRoutes');
const mongoosePostRoutes = require('./routes/mongoose/postRoutes');
const mongooseProductRoutes = require('./routes/mongoose/productRoutes');

app.use('/api/mongoose/users', mongooseUserRoutes);
app.use('/api/mongoose/posts', mongoosePostRoutes);
app.use('/api/mongoose/products', mongooseProductRoutes);

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

/**
 * 404 Handler - Route Not Found
 * Catches all requests to undefined routes
 */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: {
      root: '/',
      health: '/api/health',
      prisma: {
        users: '/api/prisma/users',
        posts: '/api/prisma/posts',
        products: '/api/prisma/products'
      },
      mongoose: {
        users: '/api/mongoose/users',
        posts: '/api/mongoose/posts',
        products: '/api/mongoose/products'
      }
    }
  });
});

/**
 * Global Error Handler
 * Catches all errors passed via next(error)
 */
app.use((error, req, res, next) => {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ ERROR CAUGHT:');
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Default status code
  const statusCode = error.statusCode || 500;
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? {
      stack: error.stack,
      details: error
    } : undefined
  });
});

// Export the app for use in server.js
module.exports = app;
