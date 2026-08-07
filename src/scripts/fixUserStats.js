/**
 * Fix User Stats Script
 * Recalculates postCount, followerCount, followingCount, tripCount for all users
 */

import 'dotenv/config';
import couchbase from 'couchbase';

const COUCHBASE_CONNECTION_STRING = process.env.COUCHBASE_CONNECTION_STRING || 'couchbase://localhost';
const COUCHBASE_USERNAME = process.env.COUCHBASE_USERNAME || 'Administrator';
const COUCHBASE_PASSWORD = process.env.COUCHBASE_PASSWORD || 'password';

async function connectToCouchbase() {
  console.log('Connecting to Couchbase...');
  const cluster = await couchbase.connect(COUCHBASE_CONNECTION_STRING, {
    username: COUCHBASE_USERNAME,
    password: COUCHBASE_PASSWORD,
  });

  const usersBucket = cluster.bucket('travel_users');

  console.log('✓ Connected to Couchbase\n');
  
  return { cluster, usersBucket };
}

async function fixUserStats() {
  console.log('🔧 Fixing User Stats...\n');

  const { cluster, usersBucket } = await connectToCouchbase();
  
  // Get all users
  const usersQuery = `SELECT META().id as docId, u.id FROM \`${process.env.BUCKET_USERS || 'travel_users'}\` u WHERE u.type = 'user'`;
  const usersResult = await cluster.query(usersQuery);
  const users = usersResult.rows;

  console.log(`Found ${users.length} users\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      // Count posts
      const postsQuery = `
        SELECT COUNT(*) as count 
        FROM \`${process.env.BUCKET_CONTENT || 'travel_content'}\` p 
        WHERE p.type = 'post' AND p.authorId = $userId
      `;
      const postsResult = await cluster.query(postsQuery, { parameters: { userId: user.id } });
      const postCount = postsResult.rows[0]?.count || 0;

      // Count followers
      const followersQuery = `
        SELECT COUNT(*) as count 
        FROM \`${process.env.BUCKET_SOCIAL || 'travel_social'}\` c 
        WHERE c.type = 'connection' AND c.followingId = $userId AND c.status = 'active'
      `;
      const followersResult = await cluster.query(followersQuery, { parameters: { userId: user.id } });
      const followerCount = followersResult.rows[0]?.count || 0;

      // Count following
      const followingQuery = `
        SELECT COUNT(*) as count 
        FROM \`${process.env.BUCKET_SOCIAL || 'travel_social'}\` c 
        WHERE c.type = 'connection' AND c.followerId = $userId AND c.status = 'active'
      `;
      const followingResult = await cluster.query(followingQuery, { parameters: { userId: user.id } });
      const followingCount = followingResult.rows[0]?.count || 0;

      // Count trips
      const tripsQuery = `
        SELECT COUNT(*) as count 
        FROM \`${process.env.BUCKET_TRIPS || 'travel_trips'}\` t 
        WHERE t.type = 'trip' AND $userId IN t.travelers
      `;
      const tripsResult = await cluster.query(tripsQuery, { parameters: { userId: user.id } });
      const tripCount = tripsResult.rows[0]?.count || 0;

      // Update user stats using MutateInSpec API
      const collection = usersBucket.defaultCollection();
      await collection.mutateIn(user.docId, [
        couchbase.MutateInSpec.upsert('stats.postCount', postCount),
        couchbase.MutateInSpec.upsert('stats.followerCount', followerCount),
        couchbase.MutateInSpec.upsert('stats.followingCount', followingCount),
        couchbase.MutateInSpec.upsert('stats.tripCount', tripCount),
      ]);

      successCount++;
      if (successCount % 50 === 0) {
        console.log(`  ✓ Updated ${successCount}/${users.length} users...`);
      }
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Error updating user ${user.id}:`, error.message);
    }
  }

  console.log(`\n✅ Stats Update Complete!`);
  console.log(`  ✓ Success: ${successCount} users`);
  console.log(`  ❌ Errors: ${errorCount} users`);

  process.exit(0);
}

fixUserStats().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
