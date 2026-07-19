import dotenv from 'dotenv';

dotenv.config();

/**
 * Application Configuration
 * Centralized configuration for all environment variables
 */
const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    env: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV !== 'production',
    isProduction: process.env.NODE_ENV === 'production',
  },

  // Couchbase Configuration
  couchbase: {
    connectionString: process.env.COUCHBASE_CONNECTION_STRING || 'couchbase://localhost',
    username: process.env.COUCHBASE_USERNAME || 'Administrator',
    password: process.env.COUCHBASE_PASSWORD || 'password',
    buckets: {
      users: process.env.BUCKET_USERS || 'travel_users',
      content: process.env.BUCKET_CONTENT || 'travel_content',
      trips: process.env.BUCKET_TRIPS || 'travel_trips',
      social: process.env.BUCKET_SOCIAL || 'travel_social',
    },
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
};

// Validate required configuration in production
if (config.server.isProduction) {
  const requiredEnvVars = [
    'JWT_SECRET',
    'COUCHBASE_CONNECTION_STRING',
    'COUCHBASE_USERNAME',
    'COUCHBASE_PASSWORD',
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }

  if (config.jwt.secret === 'your-secret-key-change-this-in-production') {
    console.error('JWT_SECRET must be changed in production!');
    process.exit(1);
  }
}

export default config;
