/**
 * Clear all data from buckets
 * Use before re-seeding with new data
 */

import couchbase from 'couchbase';
import dotenv from 'dotenv';

dotenv.config();

const {
  COUCHBASE_CONNECTION_STRING = 'couchbase://localhost',
  COUCHBASE_USERNAME = 'Administrator',
  COUCHBASE_PASSWORD = 'password',
} = process.env;

async function clearBucket(bucket, bucketName) {
  console.log(`\n🗑️  Clearing ${bucketName}...`);
  const cluster = bucket.cluster;
  
  try {
    // Get all document IDs
    const query = `SELECT META().id FROM \`${bucketName}\``;
    const result = await cluster.query(query);
    
    const collection = bucket.defaultCollection();
    let count = 0;
    
    for (const row of result.rows) {
      await collection.remove(row.id);
      count++;
      if (count % 50 === 0) {
        console.log(`  ✓ Deleted ${count} documents...`);
      }
    }
    
    console.log(`✓ Cleared ${count} documents from ${bucketName}`);
  } catch (error) {
    console.error(`❌ Error clearing ${bucketName}:`, error.message);
  }
}

async function main() {
  try {
    console.log('════════════════════════════════════════════════════');
    console.log('  Clear All Data');
    console.log('════════════════════════════════════════════════════\n');

    console.log('⚠️  WARNING: This will delete ALL data!');
    console.log('Connecting to Couchbase...\n');

    const cluster = await couchbase.connect(COUCHBASE_CONNECTION_STRING, {
      username: COUCHBASE_USERNAME,
      password: COUCHBASE_PASSWORD,
    });

    const usersBucket = cluster.bucket('travel_users');
    const contentBucket = cluster.bucket('travel_content');
    const socialBucket = cluster.bucket('travel_social');
    const tripsBucket = cluster.bucket('travel_trips');

    // Clear all buckets
    await clearBucket(usersBucket, 'travel_users');
    await clearBucket(contentBucket, 'travel_content');
    await clearBucket(socialBucket, 'travel_social');
    await clearBucket(tripsBucket, 'travel_trips');

    console.log('\n════════════════════════════════════════════════════');
    console.log('✅ ALL DATA CLEARED!');
    console.log('════════════════════════════════════════════════════\n');

    console.log('Next steps:');
    console.log('  1. Run: node src/scripts/seedRealisticData.js');
    console.log('  2. All new data will have working image URLs!\n');

    await cluster.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
