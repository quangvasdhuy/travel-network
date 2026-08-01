/**
 * Seed Sample Data for Testing
 * Creates sample users, posts, connections, and trips
 */

import couchbase from 'couchbase';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const {
  COUCHBASE_CONNECTION_STRING = 'couchbase://localhost',
  COUCHBASE_USERNAME = 'Administrator',
  COUCHBASE_PASSWORD = 'password',
} = process.env;

// Sample users data
const sampleUsers = [
  {
    username: 'traveler_sarah',
    email: 'sarah@example.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    bio: 'Adventure seeker | 🌍 Visited 30+ countries | Nature lover 🏔️',
    location: { city: 'San Francisco', country: 'USA' },
    interests: ['hiking', 'photography', 'backpacking', 'wildlife'],
    profilePhoto: 'https://i.pravatar.cc/400?img=47',
  },
  {
    username: 'explorer_mike',
    email: 'mike@example.com',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Chen',
    bio: 'Digital nomad 💻 | Food enthusiast 🍜 | Always looking for the next adventure',
    location: { city: 'Tokyo', country: 'Japan' },
    interests: ['food', 'culture', 'photography', 'urban exploration'],
    profilePhoto: 'https://i.pravatar.cc/400?img=12',
  },
  {
    username: 'wanderlust_emma',
    email: 'emma@example.com',
    password: 'password123',
    firstName: 'Emma',
    lastName: 'Rodriguez',
    bio: 'Solo traveler ✈️ | Beach lover 🏖️ | Yoga instructor 🧘‍♀️',
    location: { city: 'Barcelona', country: 'Spain' },
    interests: ['beaches', 'yoga', 'wellness', 'solo travel'],
    profilePhoto: 'https://i.pravatar.cc/400?img=32',
  },
  {
    username: 'adventure_alex',
    email: 'alex@example.com',
    password: 'password123',
    firstName: 'Alex',
    lastName: 'Kumar',
    bio: 'Mountain climber 🏔️ | Extreme sports junkie | Living life on the edge',
    location: { city: 'Kathmandu', country: 'Nepal' },
    interests: ['climbing', 'trekking', 'extreme sports', 'mountains'],
    profilePhoto: 'https://i.pravatar.cc/400?img=68',
  },
  {
    username: 'cultural_lisa',
    email: 'lisa@example.com',
    password: 'password123',
    firstName: 'Lisa',
    lastName: 'Anderson',
    bio: 'History buff 📚 | Art lover 🎨 | Museum hopper',
    location: { city: 'Rome', country: 'Italy' },
    interests: ['history', 'art', 'museums', 'architecture'],
    profilePhoto: 'https://i.pravatar.cc/400?img=25',
  },
];

// Sample posts
const samplePosts = [
  {
    text: 'Just hiked to Machu Picchu! The sunrise view was absolutely breathtaking. One of the most incredible experiences of my life! 🌄',
    location: { name: 'Machu Picchu, Peru', coordinates: { lat: -13.1631, lon: -72.5450 } },
    mediaUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
  },
  {
    text: 'Best ramen I\'ve ever had! This little shop in Tokyo serves the most amazing tonkotsu ramen 🍜 #foodie #tokyo',
    location: { name: 'Tokyo, Japan', coordinates: { lat: 35.6762, lon: 139.6503 } },
    mediaUrl: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800',
  },
  {
    text: 'Sunset yoga session on the beach in Bali 🧘‍♀️🌅 Pure bliss!',
    location: { name: 'Bali, Indonesia', coordinates: { lat: -8.3405, lon: 115.0920 } },
    mediaUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
  },
  {
    text: 'Reached the summit of Mount Kilimanjaro after 6 days of climbing! Every step was worth it 🏔️',
    location: { name: 'Mount Kilimanjaro, Tanzania', coordinates: { lat: -3.0674, lon: 37.3556 } },
    mediaUrl: 'https://images.unsplash.com/photo-1589553416260-f586c8f1514f?w=800',
  },
  {
    text: 'The Colosseum never gets old! Every visit reveals something new about ancient Rome 🏛️',
    location: { name: 'Rome, Italy', coordinates: { lat: 41.8902, lon: 12.4922 } },
    mediaUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
  },
  {
    text: 'Island hopping in Thailand! Crystal clear waters and the most beautiful beaches 🏝️',
    location: { name: 'Phi Phi Islands, Thailand', coordinates: { lat: 7.7407, lon: 98.7784 } },
    mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  },
  {
    text: 'Coffee with a view in the Colombian mountains ☕️ The best way to start the day!',
    location: { name: 'Salento, Colombia', coordinates: { lat: 4.6378, lon: -75.5706 } },
    mediaUrl: 'https://images.unsplash.com/photo-1485686531765-ba63b07845a7?w=800',
  },
  {
    text: 'Exploring the ancient temples of Angkor Wat. The architecture is mind-blowing! 🛕',
    location: { name: 'Angkor Wat, Cambodia', coordinates: { lat: 13.4125, lon: 103.8670 } },
    mediaUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d71c49?w=800',
  },
];

async function connectToCouchbase() {
  console.log('Connecting to Couchbase...');
  const cluster = await couchbase.connect(COUCHBASE_CONNECTION_STRING, {
    username: COUCHBASE_USERNAME,
    password: COUCHBASE_PASSWORD,
  });

  const usersBucket = cluster.bucket('travel_users');
  const contentBucket = cluster.bucket('travel_content');
  const socialBucket = cluster.bucket('travel_social');
  const tripsBucket = cluster.bucket('travel_trips');

  console.log('✓ Connected to Couchbase\n');

  return { cluster, usersBucket, contentBucket, socialBucket, tripsBucket };
}

async function seedUsers(bucket) {
  console.log('Seeding users...');
  const collection = bucket.defaultCollection();
  const createdUsers = [];

  for (const userData of sampleUsers) {
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const user = {
      id: userId,
      type: 'user',
      email: userData.email,
      username: userData.username,
      passwordHash: passwordHash,  // ← Changed from 'password' to 'passwordHash'
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio,
        profilePhoto: userData.profilePhoto || null,
        location: {
          city: userData.location.city,
          country: userData.location.country,
          coordinates: null,
        },
        dateOfBirth: null,
      },
      interests: userData.interests,
      preferences: {
        travelStyle: [],
        languages: [],
        privacySettings: {
          profileVisibility: 'public',
          tripVisibility: 'public',
          showEmail: false,
        },
      },
      stats: {
        tripCount: 0,
        postCount: 0,
        followerCount: 0,
        followingCount: 0,
      },
      verification: {
        emailVerified: false,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
    };

    await collection.upsert(`user::${userId}`, user);
    createdUsers.push(user);
    console.log(`  ✓ Created user: ${userData.username}`);
  }

  console.log(`✓ Created ${createdUsers.length} users\n`);
  return createdUsers;
}

async function seedConnections(bucket, users) {
  console.log('Seeding connections...');
  const collection = bucket.defaultCollection();
  let connectionCount = 0;

  // Create follow connections (everyone follows everyone else)
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (i !== j) {
        const connection = {
          followerId: users[i].id,
          followingId: users[j].id,
          followerUsername: users[i].username,
          followingUsername: users[j].username,
          createdAt: new Date().toISOString(),
          type: 'connection',
        };

        await collection.upsert(
          `connection::${users[i].id}::${users[j].id}`,
          connection
        );
        connectionCount++;
      }
    }
  }

  console.log(`✓ Created ${connectionCount} connections\n`);
}

async function seedPosts(bucket, users) {
  console.log('Seeding posts...');
  const collection = bucket.defaultCollection();
  const createdPosts = [];

  for (let i = 0; i < samplePosts.length; i++) {
    const postData = samplePosts[i];
    const author = users[i % users.length]; // Distribute posts among users
    const postId = uuidv4();

    const post = {
      id: postId,
      authorId: author.id,
      authorUsername: author.username,
      authorPhoto: author.profile.profilePhoto,
      content: {
        text: postData.text,
        media: postData.mediaUrl
          ? [{ type: 'image', url: postData.mediaUrl, caption: '' }]
          : [],
      },
      location: postData.location,
      likes: [],
      comments: [],
      stats: {
        likeCount: Math.floor(Math.random() * 50) + 5,
        commentCount: Math.floor(Math.random() * 20),
        shareCount: 0,
      },
      visibility: 'public',
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last 7 days
      updatedAt: new Date().toISOString(),
      type: 'post',
    };

    await collection.upsert(`post::${postId}`, post);
    createdPosts.push(post);
    console.log(`  ✓ Created post by ${author.username}`);
  }

  console.log(`✓ Created ${createdPosts.length} posts\n`);
  return createdPosts;
}

async function seedTrips(bucket, users) {
  console.log('Seeding trips...');
  const collection = bucket.defaultCollection();

  const sampleTrips = [
    {
      name: 'European Summer Adventure',
      description: 'Backpacking through Europe visiting 10 countries',
      destinations: ['destination::FR::paris', 'destination::IT::rome', 'destination::ES::barcelona'],
      startDate: new Date('2024-06-01').toISOString(),
      endDate: new Date('2024-07-15').toISOString(),
      status: 'completed',
    },
    {
      name: 'Southeast Asia Exploration',
      description: 'Island hopping and temple tours',
      destinations: ['destination::TH::bangkok', 'destination::VN::hanoi'],
      startDate: new Date('2024-08-10').toISOString(),
      endDate: new Date('2024-09-05').toISOString(),
      status: 'upcoming',
    },
    {
      name: 'Patagonia Hiking Trip',
      description: 'Trekking through the mountains of Patagonia',
      destinations: ['destination::AR::patagonia'],
      startDate: new Date('2024-11-01').toISOString(),
      endDate: new Date('2024-11-20').toISOString(),
      status: 'planning',
    },
  ];

  let tripCount = 0;
  for (let i = 0; i < sampleTrips.length; i++) {
    const tripData = sampleTrips[i];
    const user = users[i % users.length];
    const tripId = uuidv4();

    const trip = {
      id: tripId,
      userId: user.id,
      name: tripData.name,
      description: tripData.description,
      destinations: tripData.destinations,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      status: tripData.status,
      budget: {
        currency: 'USD',
        estimated: Math.floor(Math.random() * 5000) + 1000,
      },
      travelers: [user.id],
      visibility: 'public',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'trip',
    };

    await collection.upsert(`trip::${tripId}`, trip);
    tripCount++;
    console.log(`  ✓ Created trip: ${tripData.name}`);
  }

  console.log(`✓ Created ${tripCount} trips\n`);
}

async function main() {
  try {
    console.log('═══════════════════════════════════════');
    console.log('  Travel Network - Data Seeding Script');
    console.log('═══════════════════════════════════════\n');

    const { cluster, usersBucket, contentBucket, socialBucket, tripsBucket } = 
      await connectToCouchbase();

    // Seed data
    const users = await seedUsers(usersBucket);
    await seedConnections(socialBucket, users);
    await seedPosts(contentBucket, users);
    await seedTrips(tripsBucket, users);

    console.log('═══════════════════════════════════════');
    console.log('✓ Data seeding completed successfully!');
    console.log('═══════════════════════════════════════\n');

    console.log('Sample accounts created:');
    sampleUsers.forEach(user => {
      console.log(`  • ${user.username} / ${user.email} / password123`);
    });

    console.log('\nYou can now:');
    console.log('1. Login with any of the above accounts');
    console.log('2. See posts from other users in your feed');
    console.log('3. View followers/following lists');
    console.log('4. Test all Task 13 features\n');

    await cluster.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

main();
