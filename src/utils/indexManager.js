/**
 * Index Manager
 * Creates and manages Couchbase indexes for optimal query performance
 */

import dbConnection from '../config/database.js';

/**
 * Create all required indexes for the application
 */
export async function createAllIndexes() {
  console.log('Creating database indexes...');

  try {
    const cluster = dbConnection.getCluster();

    // Create indexes for each bucket
    await createUserIndexes(cluster);
    await createTripIndexes(cluster);
    await createPostIndexes(cluster);
    await createConnectionIndexes(cluster);

    console.log('✓ All indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}

/**
 * Create indexes for travel_users bucket
 */
async function createUserIndexes(cluster) {
  const bucketName = process.env.BUCKET_USERS || 'travel_users';

  const indexes = [
    {
      name: 'idx_users_primary',
      statement: `CREATE PRIMARY INDEX idx_users_primary ON ${bucketName}`,
      isPrimary: true,
    },
    {
      name: 'idx_users_email',
      statement: `CREATE INDEX idx_users_email ON ${bucketName}(email) WHERE type = 'user'`,
    },
    {
      name: 'idx_users_username',
      statement: `CREATE INDEX idx_users_username ON ${bucketName}(username) WHERE type = 'user'`,
    },
    {
      name: 'idx_users_type',
      statement: `CREATE INDEX idx_users_type ON ${bucketName}(type)`,
    },
    {
      name: 'idx_users_created',
      statement: `CREATE INDEX idx_users_created ON ${bucketName}(createdAt DESC) WHERE type = 'user'`,
    },
    {
      name: 'idx_users_location',
      statement: `CREATE INDEX idx_users_location ON ${bucketName}(profile.location.country, profile.location.city) WHERE type = 'user'`,
    },
  ];

  await createIndexes(cluster, indexes);
}

/**
 * Create indexes for travel_trips bucket
 */
async function createTripIndexes(cluster) {
  const bucketName = process.env.BUCKET_TRIPS || 'travel_trips';

  const indexes = [
    {
      name: 'idx_trips_primary',
      statement: `CREATE PRIMARY INDEX idx_trips_primary ON ${bucketName}`,
      isPrimary: true,
    },
    {
      name: 'idx_trips_user',
      statement: `CREATE INDEX idx_trips_user ON ${bucketName}(userId, startDate DESC) WHERE type = 'trip'`,
    },
    {
      name: 'idx_trips_status',
      statement: `CREATE INDEX idx_trips_status ON ${bucketName}(status, startDate) WHERE type = 'trip'`,
    },
    {
      name: 'idx_trips_dates',
      statement: `CREATE INDEX idx_trips_dates ON ${bucketName}(startDate, endDate) WHERE type = 'trip'`,
    },
    {
      name: 'idx_trips_destinations',
      statement: `CREATE INDEX idx_trips_destinations ON ${bucketName}(DISTINCT ARRAY d.destinationId FOR d IN destinations END) WHERE type = 'trip'`,
    },
    {
      name: 'idx_destinations_country',
      statement: `CREATE INDEX idx_destinations_country ON ${bucketName}(country, name) WHERE type = 'destination'`,
    },
    {
      name: 'idx_destinations_slug',
      statement: `CREATE INDEX idx_destinations_slug ON ${bucketName}(countryCode, slug) WHERE type = 'destination'`,
    },
  ];

  await createIndexes(cluster, indexes);
}

/**
 * Create indexes for travel_content bucket
 */
async function createPostIndexes(cluster) {
  const bucketName = process.env.BUCKET_CONTENT || 'travel_content';

  const indexes = [
    {
      name: 'idx_posts_primary',
      statement: `CREATE PRIMARY INDEX idx_posts_primary ON ${bucketName}`,
      isPrimary: true,
    },
    {
      name: 'idx_posts_author',
      statement: `CREATE INDEX idx_posts_author ON ${bucketName}(authorId, createdAt DESC) WHERE type = 'post'`,
    },
    {
      name: 'idx_posts_trip',
      statement: `CREATE INDEX idx_posts_trip ON ${bucketName}(tripId, createdAt DESC) WHERE type = 'post'`,
    },
    {
      name: 'idx_posts_destination',
      statement: `CREATE INDEX idx_posts_destination ON ${bucketName}(destinationId, createdAt DESC) WHERE type = 'post'`,
    },
    {
      name: 'idx_posts_created',
      statement: `CREATE INDEX idx_posts_created ON ${bucketName}(createdAt DESC, visibility) WHERE type = 'post'`,
    },
    {
      name: 'idx_posts_tags',
      statement: `CREATE INDEX idx_posts_tags ON ${bucketName}(DISTINCT ARRAY t FOR t IN tags END) WHERE type = 'post'`,
    },
  ];

  await createIndexes(cluster, indexes);
}

/**
 * Create indexes for travel_social bucket
 */
async function createConnectionIndexes(cluster) {
  const bucketName = process.env.BUCKET_SOCIAL || 'travel_social';

  const indexes = [
    {
      name: 'idx_connections_primary',
      statement: `CREATE PRIMARY INDEX idx_connections_primary ON ${bucketName}`,
      isPrimary: true,
    },
    {
      name: 'idx_connections_follower',
      statement: `CREATE INDEX idx_connections_follower ON ${bucketName}(followerId, createdAt DESC) WHERE type = 'connection'`,
    },
    {
      name: 'idx_connections_following',
      statement: `CREATE INDEX idx_connections_following ON ${bucketName}(followingId, createdAt DESC) WHERE type = 'connection'`,
    },
    {
      name: 'idx_connections_status',
      statement: `CREATE INDEX idx_connections_status ON ${bucketName}(status) WHERE type = 'connection'`,
    },
  ];

  await createIndexes(cluster, indexes);
}

/**
 * Helper function to create indexes
 */
async function createIndexes(cluster, indexes) {
  for (const index of indexes) {
    try {
      await cluster.query(index.statement);
      console.log(`  ✓ Created index: ${index.name}`);
    } catch (error) {
      // Index might already exist
      if (error.message.includes('already exists') || error.code === 4300) {
        console.log(`  ℹ Index already exists: ${index.name}`);
      } else {
        console.error(`  ✗ Failed to create index ${index.name}:`, error.message);
      }
    }
  }
}

/**
 * Drop all indexes (useful for testing/reset)
 */
export async function dropAllIndexes() {
  console.log('Dropping all indexes...');

  try {
    const cluster = dbConnection.getCluster();
    const buckets = [
      process.env.BUCKET_USERS || 'travel_users',
      process.env.BUCKET_CONTENT || 'travel_content',
      process.env.BUCKET_TRIPS || 'travel_trips',
      process.env.BUCKET_SOCIAL || 'travel_social',
    ];

    for (const bucket of buckets) {
      try {
        // Get all indexes for this bucket
        const result = await cluster.query(
          `SELECT name FROM system:indexes WHERE keyspace_id = '${bucket}'`
        );

        for (const row of result.rows) {
          const indexName = row.name;
          try {
            await cluster.query(`DROP INDEX ${bucket}.${indexName}`);
            console.log(`  ✓ Dropped index: ${indexName}`);
          } catch (error) {
            console.error(`  ✗ Failed to drop index ${indexName}:`, error.message);
          }
        }
      } catch (error) {
        console.error(`Error processing bucket ${bucket}:`, error.message);
      }
    }

    console.log('✓ Finished dropping indexes');
  } catch (error) {
    console.error('Error dropping indexes:', error);
    throw error;
  }
}

export default { createAllIndexes, dropAllIndexes };
