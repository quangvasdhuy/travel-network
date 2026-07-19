import couchbase from 'couchbase';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Couchbase Database Connection Manager
 * Handles connection pooling and provides access to buckets, scopes, and collections
 */
class DatabaseConnection {
  constructor() {
    this.cluster = null;
    this.buckets = {};
    this.isConnected = false;
  }

  /**
   * Initialize connection to Couchbase cluster
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      console.log('Connecting to Couchbase cluster...');
      
      const connectionString = process.env.COUCHBASE_CONNECTION_STRING || 'couchbase://localhost';
      const username = process.env.COUCHBASE_USERNAME || 'Administrator';
      const password = process.env.COUCHBASE_PASSWORD || 'password';

      // Create cluster connection with options
      this.cluster = await couchbase.connect(connectionString, {
        username: username,
        password: password,
        timeouts: {
          kvTimeout: 10000, // 10 seconds
          queryTimeout: 75000, // 75 seconds
        },
        // Connection pool configuration
        configProfile: 'wanDevelopment', // Optimized for development
      });

      console.log('✓ Connected to Couchbase cluster');

      // Initialize bucket connections
      await this.initializeBuckets();
      
      this.isConnected = true;
      console.log('✓ Database connection ready');
    } catch (error) {
      console.error('Failed to connect to Couchbase:', error);
      throw error;
    }
  }

  /**
   * Initialize connections to all application buckets
   * @private
   */
  async initializeBuckets() {
    const bucketNames = {
      users: process.env.BUCKET_USERS || 'travel_users',
      content: process.env.BUCKET_CONTENT || 'travel_content',
      trips: process.env.BUCKET_TRIPS || 'travel_trips',
      social: process.env.BUCKET_SOCIAL || 'travel_social',
    };

    for (const [key, bucketName] of Object.entries(bucketNames)) {
      try {
        const bucket = this.cluster.bucket(bucketName);
        
        // Wait for bucket to be ready
        await bucket.waitUntilReady(5000);
        
        this.buckets[key] = {
          bucket: bucket,
          defaultCollection: bucket.defaultCollection(),
          scope: bucket.defaultScope(),
        };
        
        console.log(`✓ Bucket '${bucketName}' ready`);
      } catch (error) {
        console.warn(`Warning: Bucket '${bucketName}' not available:`, error.message);
        // Store null to indicate bucket is not available
        this.buckets[key] = null;
      }
    }
  }

  /**
   * Get a bucket connection
   * @param {string} bucketKey - Bucket key (users, content, trips, social)
   * @returns {Object} Bucket object with bucket, defaultCollection, and scope
   */
  getBucket(bucketKey) {
    if (!this.buckets[bucketKey]) {
      throw new Error(`Bucket '${bucketKey}' is not available`);
    }
    return this.buckets[bucketKey];
  }

  /**
   * Get the cluster connection for N1QL queries
   * @returns {Object} Couchbase cluster instance
   */
  getCluster() {
    if (!this.cluster) {
      throw new Error('Database cluster is not connected');
    }
    return this.cluster;
  }

  /**
   * Get connection health status
   * @returns {Object} Health status information
   */
  async getHealthStatus() {
    try {
      if (!this.isConnected) {
        return {
          status: 'disconnected',
          buckets: {},
        };
      }

      // Test cluster connection with a simple query
      await this.cluster.ping();

      const bucketStatus = {};
      for (const [key, bucketObj] of Object.entries(this.buckets)) {
        if (bucketObj) {
          bucketStatus[key] = {
            name: bucketObj.bucket.name,
            connected: true,
          };
        } else {
          bucketStatus[key] = {
            connected: false,
          };
        }
      }

      return {
        status: 'connected',
        cluster: process.env.COUCHBASE_CONNECTION_STRING,
        buckets: bucketStatus,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
  }

  /**
   * Close all connections gracefully
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.cluster) {
        await this.cluster.close();
        this.isConnected = false;
        this.buckets = {};
        console.log('✓ Disconnected from Couchbase cluster');
      }
    } catch (error) {
      console.error('Error disconnecting from Couchbase:', error);
      throw error;
    }
  }
}

// Create singleton instance
const dbConnection = new DatabaseConnection();

export default dbConnection;
