/**
 * Resume Builder Backend - Main Entry Point
 * Express.js server for AI-powered Resume Builder API
 */

import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import resumeRoutes from './routes/resumeRoutes';
import jdRoutes from './routes/jdRoutes';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * ============================================
 * MIDDLEWARE CONFIGURATION
 * ============================================
 */

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Logging middleware (basic)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * ============================================
 * STATIC FILES
 * ============================================
 */

// Serve uploaded files directory (if needed)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/**
 * ============================================
 * API ROUTES
 * ============================================
 */

/**
 * Health check endpoint
 * GET /health
 *
 * Response: { status: 'ok' }
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/**
 * API documentation endpoint
 * GET /api
 *
 * Provides an overview of available endpoints
 */
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'JobTailor - Resume ATS Analyzer API',
    version: '1.0.0',
    endpoints: {
      resume: {
        upload: 'POST /resume/upload',
        checkAts: 'POST /resume/check-ats',
        optimize: 'POST /resume/optimize',
      },
      jobDescription: {
        upload: 'POST /jd/upload',
        create: 'POST /jd/create',
        extractKeywords: 'POST /jd/extract-keywords',
      },
      health: 'GET /health',
    },
    documentation: 'See README.md for full API documentation',
  });
});

/**
 * Resume routes
 * Base path: /resume
 */
app.use('/resume', resumeRoutes);

/**
 * Job Description routes
 * Base path: /jd
 */
app.use('/jd', jdRoutes);

/**
 * ============================================
 * ERROR HANDLING
 * ============================================
 */

// 404 Not Found handler (should come after all routes)
app.use(notFoundHandler);

// Global error handler (should come after all other middleware)
app.use(errorHandler);

/**
 * ============================================
 * SERVER INITIALIZATION
 * ============================================
 */

/**
 * Start the Express server
 *
 * TODO: Implement:
 * - Database connection initialization
 * - Cache initialization (Redis, etc.)
 * - Job queue setup (Bull, etc.)
 * - Graceful shutdown handling
 * - Server health monitoring
 */
const server = app.listen(PORT, () => {
  console.log(
    `\n${'='.repeat(50)}`
  );
  console.log(`Resume Builder API Server Started`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API docs: http://localhost:${PORT}/api`);
  console.log(`${'='.repeat(50)}\n`);
});

/**
 * Graceful shutdown handler
 *
 * TODO: Implement:
 * - Close database connections
 * - Wait for pending requests
 * - Clear job queues
 * - Clean up resources
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

/**
 * Unhandled rejection handler
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // TODO: Log to error tracking service
});

/**
 * Uncaught exception handler
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // TODO: Log to error tracking service
  process.exit(1);
});

export default app;
