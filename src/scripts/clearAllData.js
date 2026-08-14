/**
 * CLEAR ALL DATA SCRIPT
 * 
 * Xóa tất cả data để start fresh
 * ⚠️ WARNING: This will DELETE ALL DATA!
 */

import 'dotenv/config';
import couchbase from 'couchbase';
import readline from 'readline';

const COUCHBASE_CONNECTION_STRING = process.env.COUCHBASE_CONNECTION_STRING || 'couchbase://localhost';
const COUCHBASE_USERNAME = process.env.COUCHBASE_USERNAME || 'Administrator';
const COUCHBASE_PASSWORD = process.env.COUCHBASE_PASSWORD || 'password';

async function connectToCouchbase() {
  console.log('Connecting to Couchbase...');
  const cluster = await couchbase.connect(COUCHBASE_CONNECTION_STRING, {
    username: COUCHBASE_USERNAME,
    password: COUCHBASE_PASSWORD,
  });

  const contentBucket = cluster.bucket('travel_content');
  const socialBucket = cluster.bucket('travel_social');
  const tripsBucket = cluster.bucket('travel_trips');
  const usersBucket = cluster.bucket('travel_users');

  console.log('✓ Connected to Couchbase\n');
  
  return { cluster, contentBucket, socialBucket, tripsBucket, usersBucket };
}

async function confirmDeletion() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('⚠️  WARNING: This will DELETE ALL DATA! Type "DELETE" to confirm: ', (answer) => {
      rl.close();
      resolve(answer === 'DELETE');
    });
  });
}

async function clearBucket(cluster, bucketName) {
  console.log(`\n🗑️  Clearing ${bucketName}...`);
  
  try {
    // Count documents first
    const countQuery = `SELECT COUNT(*) as count FROM \`${bucketName}\``;
    const countResult = await cluster.query(countQuery);
    const totalDocs = countResult.rows[0]?.count || 0;
    
    console.log(`   Found ${totalDocs.toLocaleString()} documents`);
    
    if (totalDocs === 0) {
      console.log(`   ✓ ${bucketName} is already empty`);
      return;
    }
    
    // Delete all documents
    const deleteQuery = `DELETE FROM \`${bucketName}\``;
    await cluster.query(deleteQuery);
    
    console.log(`   ✓ Deleted ${totalDocs.toLocaleString()} documents from ${bucketName}`);
  } catch (error) {
    console.error(`   ❌ Error clearing ${bucketName}:`, error.message);
  }
}

async function main() {
  console.log(`
════════════════════════════════════════════════════
  🗑️  CLEAR ALL DATA
════════════════════════════════════════════════════

This will DELETE:
  • All users
  • All posts
  • All trips
  • All connections
  • All engagement data

════════════════════════════════════════════════════
`);

  const confirmed = await confirmDeletion();
  
  if (!confirmed) {
    console.log('\n❌ Deletion cancelled\n');
    process.exit(0);
  }

  console.log('\n✅ Confirmed. Starting deletion...\n');

  const { cluster } = await connectToCouchbase();
  
  await clearBucket(cluster, 'travel_users');
  await clearBucket(cluster, 'travel_content');
  await clearBucket(cluster, 'travel_trips');
  await clearBucket(cluster, 'travel_social');
  
  console.log(`
════════════════════════════════════════════════════
✅ ALL DATA CLEARED!
════════════════════════════════════════════════════

You can now run seed scripts to create fresh data:
  • node src/scripts/seedRealisticData.js
  • node src/scripts/seedMassiveData.js

`);
  
  process.exit(0);
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

