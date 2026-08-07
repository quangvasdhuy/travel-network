/**
 * Add More Data Script
 * Adds more posts and connections to make data richer
 */

import 'dotenv/config';
import couchbase from 'couchbase';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

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

// More post templates
const morePostTemplates = [
  { text: "Just arrived in {location}! The vibe here is incredible! Can't wait to explore more tomorrow. 🌟", locations: ['paris', 'tokyo', 'bali', 'london', 'new-york'] },
  { text: "Sunset at {location} never gets old. This place holds a special place in my heart. 🌅", locations: ['santorini', 'bali', 'maldives', 'dubai'] },
  { text: "Food hunting in {location}! Every meal is an adventure here. 🍜", locations: ['tokyo', 'bangkok', 'barcelona', 'hanoi'] },
  { text: "Hiking day in {location}! The views are absolutely worth the climb. 🏔️", locations: ['machu-picchu', 'patagonia', 'swiss-alps', 'new-zealand'] },
  { text: "Beach day at {location}! Crystal clear water and perfect weather. ☀️", locations: ['maldives', 'bali', 'phuket', 'santorini'] },
  { text: "Exploring local markets in {location}. So many colors and flavors! 🛍️", locations: ['marrakech', 'bangkok', 'istanbul', 'barcelona'] },
  { text: "Coffee with a view in {location}. Could stay here forever! ☕", locations: ['paris', 'amsterdam', 'prague', 'vienna'] },
  { text: "Night walk through {location}. The city lights are magical! ✨", locations: ['paris', 'tokyo', 'new-york', 'dubai'] },
  { text: "Museum day in {location}! So much history and art to take in. 🎨", locations: ['paris', 'london', 'rome', 'amsterdam'] },
  { text: "Bicycle tour around {location} today. Best way to see the city! 🚴", locations: ['amsterdam', 'copenhagen', 'barcelona'] },
];

// Load Cloudinary URLs if available
let cloudinaryUrls = [];
try {
  const data = fs.readFileSync('./cloudinary_urls.json', 'utf8');
  cloudinaryUrls = JSON.parse(data);
  console.log('✓ Loaded Cloudinary URLs\n');
} catch {
  console.log('⚠ Cloudinary URLs not found, using Lorem Picsum fallback\n');
}

function getRandomImage() {
  if (cloudinaryUrls.length > 0) {
    return cloudinaryUrls[Math.floor(Math.random() * cloudinaryUrls.length)];
  }
  const imageId = Math.floor(Math.random() * 200) + 1;
  return `https://picsum.photos/id/${imageId}/800/600`;
}

async function addMoreData() {
  console.log('🚀 Adding More Data...\n');

  const { cluster, contentBucket, socialBucket, tripsBucket, usersBucket } = await connectToCouchbase();

  // Get all users
  const usersQuery = `SELECT u.id, u.username FROM \`travel_users\` u WHERE u.type = 'user'`;
  const usersResult = await cluster.query(usersQuery);
  const users = usersResult.rows;
  console.log(`Found ${users.length} users\n`);

  // Get destinations
  const destQuery = `SELECT d.id, d.name FROM \`travel_trips\` d WHERE d.type = 'destination'`;
  const destResult = await cluster.query(destQuery);
  const destinations = destResult.rows;
  console.log(`Found ${destinations.length} destinations\n`);

  // Add 200 more posts
  console.log('Creating 200 more posts...');
  const contentCollection = contentBucket.defaultCollection();
  let postsCreated = 0;

  for (let i = 0; i < 200; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const template = morePostTemplates[Math.floor(Math.random() * morePostTemplates.length)];
    const randomDestId = template.locations[Math.floor(Math.random() * template.locations.length)];
    const destination = destinations.find(d => d.id.includes(randomDestId));
    
    let text = template.text;
    if (destination) {
      text = text.replace('{location}', destination.name);
    }

    const numPhotos = Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 0; // 70% chance of photos
    const media = [];
    for (let j = 0; j < numPhotos; j++) {
      media.push({
        type: 'image',
        url: getRandomImage(),
      });
    }

    const postId = uuidv4();
    const post = {
      id: postId,
      type: 'post',
      postType: 'photo',
      authorId: randomUser.id,
      authorUsername: randomUser.username,
      content: {
        text: text,
        media: media,
      },
      destinationId: destination?.id || null,
      destinationName: destination?.name || null,
      visibility: Math.random() > 0.1 ? 'public' : 'connections',
      interactions: {
        likes: [],
        comments: [],
      },
      stats: {
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
      },
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await contentCollection.insert(`post::${postId}`, post);
      postsCreated++;
    } catch (error) {
      console.error(`Error creating post:`, error.message);
    }

    if ((i + 1) % 50 === 0) {
      console.log(`  ✓ Created ${i + 1}/200 posts...`);
    }
  }
  console.log(`✓ Created ${postsCreated} new posts\n`);

  // Add more connections (make users follow 10-25 people each)
  console.log('Adding more connections...');
  const socialCollection = socialBucket.defaultCollection();
  let connectionsCreated = 0;

  for (const user of users) {
    // Check current following count
    const followingQuery = `
      SELECT COUNT(*) as count 
      FROM \`travel_social\` c 
      WHERE c.type = 'connection' AND c.followerId = $userId AND c.status = 'active'
    `;
    const followingResult = await cluster.query(followingQuery, { parameters: { userId: user.id } });
    const currentFollowing = followingResult.rows[0]?.count || 0;

    // Target 15-30 total connections
    const targetConnections = Math.floor(Math.random() * 16) + 15;
    const toCreate = Math.max(0, targetConnections - currentFollowing);

    if (toCreate > 0) {
      const availableUsers = users.filter(u => u.id !== user.id);
      
      for (let i = 0; i < Math.min(toCreate, availableUsers.length); i++) {
        const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
        const connectionId = `${user.id}::${randomUser.id}`;

        const connection = {
          id: connectionId,
          type: 'connection',
          followerId: user.id,
          followerUsername: user.username,
          followingId: randomUser.id,
          followingUsername: randomUser.username,
          status: 'active',
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        };

        try {
          await socialCollection.insert(`connection::${connectionId}`, connection);
          connectionsCreated++;
        } catch (error) {
          // Connection might already exist, skip
        }
      }
    }

    if ((users.indexOf(user) + 1) % 20 === 0) {
      console.log(`  ✓ Processed ${users.indexOf(user) + 1}/${users.length} users...`);
    }
  }
  console.log(`✓ Created ${connectionsCreated} new connections\n`);

  console.log('════════════════════════════════════════════════════');
  console.log('✅ MORE DATA ADDED!');
  console.log('════════════════════════════════════════════════════\n');
  
  console.log('📊 Summary:');
  console.log(`  • ${postsCreated} new posts created`);
  console.log(`  • ${connectionsCreated} new connections created`);
  console.log(`  • Total users: ${users.length}\n`);

  console.log('🔄 Run fixUserStats.js to update all user stats!\n');

  process.exit(0);
}

addMoreData().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
