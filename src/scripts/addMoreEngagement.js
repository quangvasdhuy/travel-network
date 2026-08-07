/**
 * Add More Engagement Script
 * Adds more posts, comments, likes to make data more realistic
 */

import 'dotenv/config';
import couchbase from 'couchbase';
import { v4 as uuidv4 } from 'uuid';

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
  const usersBucket = cluster.bucket('travel_users');

  console.log('✓ Connected to Couchbase\n');
  
  return { cluster, contentBucket, usersBucket };
}

// Realistic comment templates
const commentTemplates = [
  "This is absolutely stunning! 😍",
  "I've been there! Such an amazing place!",
  "Added to my bucket list! Thanks for sharing!",
  "Great photo! What camera did you use?",
  "This looks incredible! How long did you stay there?",
  "Wow! I need to visit this place!",
  "Beautiful capture! 📸",
  "This is on my travel list for next year!",
  "Looks amazing! Any tips for first-time visitors?",
  "Gorgeous view! 🌅",
  "I'm so jealous! This looks perfect!",
  "What an adventure! Love your photos!",
  "This made my day! Thank you for sharing!",
  "Breathtaking! How was the weather?",
  "Can't wait to go here someday!",
  "This is goals! 🎯",
  "Such a beautiful place! Thanks for the inspiration!",
  "Your travel photos are always amazing!",
  "Looks like an unforgettable experience!",
  "What a view! How did you find this spot?",
  "This is pure magic! ✨",
  "I've always wanted to go there!",
  "Incredible shot! The colors are perfect!",
  "This is exactly what I needed to see today!",
  "Adding this to my travel plans! 🗺️",
];

async function addEngagementData() {
  console.log('🎯 Adding More Engagement Data...\n');

  const { cluster, contentBucket, usersBucket } = await connectToCouchbase();

  // Get all users
  const usersQuery = `SELECT u.id, u.username FROM \`travel_users\` u WHERE u.type = 'user' LIMIT 100`;
  const usersResult = await cluster.query(usersQuery);
  const users = usersResult.rows;
  console.log(`Found ${users.length} users\n`);

  // Get all posts
  const postsQuery = `SELECT META(p).id as docId, p.id, p.authorId FROM \`travel_content\` p WHERE p.type = 'post' LIMIT 500`;
  const postsResult = await cluster.query(postsQuery);
  const posts = postsResult.rows;
  console.log(`Found ${posts.length} posts\n`);

  console.log('Adding likes to posts...');
  let likesAdded = 0;
  const collection = contentBucket.defaultCollection();

  // Add 3-15 likes per post
  for (const post of posts) {
    const numLikes = Math.floor(Math.random() * 13) + 3; // 3-15 likes
    const likedBy = [];
    const availableUsers = users.filter(u => u.id !== post.authorId);
    
    for (let i = 0; i < Math.min(numLikes, availableUsers.length); i++) {
      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      if (!likedBy.includes(randomUser.id)) {
        likedBy.push(randomUser.id);
      }
    }

    try {
      await collection.mutateIn(post.docId, [
        couchbase.MutateInSpec.upsert('interactions.likes', likedBy),
        couchbase.MutateInSpec.upsert('stats.likeCount', likedBy.length),
      ]);
      likesAdded += likedBy.length;
    } catch (error) {
      console.error(`Error adding likes to post ${post.id}:`, error.message);
    }

    if ((posts.indexOf(post) + 1) % 100 === 0) {
      console.log(`  ✓ Processed ${posts.indexOf(post) + 1}/${posts.length} posts...`);
    }
  }
  console.log(`✓ Added ${likesAdded} likes\n`);

  console.log('Adding comments to posts...');
  let commentsAdded = 0;

  // Add 2-8 comments per post
  for (const post of posts) {
    const numComments = Math.floor(Math.random() * 7) + 2; // 2-8 comments
    const comments = [];
    
    for (let i = 0; i < numComments; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const commentText = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
      
      const comment = {
        id: uuidv4(),
        userId: randomUser.id,
        username: randomUser.username,
        text: commentText,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      comments.push(comment);
    }

    try {
      await collection.mutateIn(post.docId, [
        couchbase.MutateInSpec.upsert('interactions.comments', comments),
        couchbase.MutateInSpec.upsert('stats.commentCount', comments.length),
      ]);
      commentsAdded += comments.length;
    } catch (error) {
      console.error(`Error adding comments to post ${post.id}:`, error.message);
    }

    if ((posts.indexOf(post) + 1) % 100 === 0) {
      console.log(`  ✓ Processed ${posts.indexOf(post) + 1}/${posts.length} posts...`);
    }
  }
  console.log(`✓ Added ${commentsAdded} comments\n`);

  console.log('════════════════════════════════════════════════════');
  console.log('✅ ENGAGEMENT DATA ADDED!');
  console.log('════════════════════════════════════════════════════\n');
  
  console.log('📊 Summary:');
  console.log(`  • ${likesAdded} likes added`);
  console.log(`  • ${commentsAdded} comments added`);
  console.log(`  • ${posts.length} posts updated\n`);

  process.exit(0);
}

addEngagementData().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
