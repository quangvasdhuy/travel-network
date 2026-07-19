import express from 'express';
import dbConnection from '../config/database.js';
import config from '../config/index.js';

const router = express.Router();

/**
 * Health Check Endpoint
 * Returns the health status of the API and its dependencies
 * 
 * @route GET /health
 * @returns {Object} Health status information
 */
router.get('/', async (req, res) => {
  try {
    const dbHealth = await dbConnection.getHealthStatus();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.env,
      database: dbHealth,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      },
    };

    // If database is not connected, return 503
    if (dbHealth.status !== 'connected') {
      healthStatus.status = 'degraded';
      return res.status(503).json(healthStatus);
    }

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * Ping Endpoint
 * Simple endpoint to check if the API is responding
 * 
 * @route GET /health/ping
 * @returns {Object} Pong response
 */
router.get('/ping', (req, res) => {
  res.status(200).json({
    message: 'pong',
    timestamp: new Date().toISOString(),
  });
});

export default router;
