import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dbConnection from './config/database.js';
import config from './config/index.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import destinationRoutes from './routes/destinations.js';
import tripRoutes from './routes/trips.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (in development)
if (config.server.isDevelopment) {
  app.use(requestLogger);
}

// Routes
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/trips', tripRoutes);

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Travel Network API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
  });
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);

/**
 * Start the server
 */
async function startServer() {
  try {
    console.log('=================================');
    console.log('Travel Network API Starting...');
    console.log('=================================');
    console.log(`Environment: ${config.server.env}`);
    console.log(`Port: ${config.server.port}`);
    console.log('=================================');

    // Connect to Couchbase
    await dbConnection.connect();

    // Start Express server
    const server = app.listen(config.server.port, () => {
      console.log('=================================');
      console.log(`✓ Server running on port ${config.server.port}`);
      console.log(`✓ Health check: http://localhost:${config.server.port}/health`);
      console.log('=================================');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        try {
          await dbConnection.disconnect();
          console.log('Database connections closed');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
