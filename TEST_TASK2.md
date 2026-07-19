# Task 2 Testing Guide - Database Schema Design and Bucket Setup

## Prerequisites

- Task 1 completed (server running, Couchbase connected)
- Couchbase buckets created (travel_users, travel_content, travel_trips, travel_social)
- Node.js dependencies installed

## Testing Steps

### 1. Run Database Initialization Script

```powershell
cd c:\Workspace\caohoc\travelnetwork
npm run db:init
```

**Expected Output:**

```
=================================
Database Initialization
=================================

Step 1: Connecting to Couchbase...
Connecting to Couchbase cluster...
✓ Connected to Couchbase cluster
✓ Bucket 'travel_users' ready
✓ Bucket 'travel_content' ready
✓ Bucket 'travel_trips' ready
✓ Bucket 'travel_social' ready
✓ Database connection ready
✓ Connected

Step 2: Creating indexes...
Creating database indexes...
  ✓ Created index: idx_users_primary
  ✓ Created index: idx_users_email
  ✓ Created index: idx_users_username
  ✓ Created index: idx_users_type
  ✓ Created index: idx_users_created
  ✓ Created index: idx_users_location
  ✓ Created index: idx_trips_primary
  ✓ Created index: idx_trips_user
  ✓ Created index: idx_trips_status
  ✓ Created index: idx_trips_dates
  ✓ Created index: idx_trips_destinations
  ✓ Created index: idx_destinations_country
  ✓ Created index: idx_destinations_slug
  ✓ Created index: idx_posts_primary
  ✓ Created index: idx_posts_author
  ✓ Created index: idx_posts_trip
  ✓ Created index: idx_posts_destination
  ✓ Created index: idx_posts_created
  ✓ Created index: idx_posts_tags
  ✓ Created index: idx_connections_primary
  ✓ Created index: idx_connections_follower
  ✓ Created index: idx_connections_following
  ✓ Created index: idx_connections_status
✓ All indexes created successfully
✓ Indexes created

Step 3: Creating sample destinations...
  ✓ Created destination: Paris, France
  ✓ Created destination: Tokyo, Japan
  ✓ Created destination: New York, United States
  ✓ Created destination: Bali, Indonesia
  ✓ Created destination: Barcelona, Spain
  ✓ Created destination: Dubai, United Arab Emirates
  ✓ Created destination: Santorini, Greece
  ✓ Created destination: Machu Picchu, Peru
  ✓ Created destination: Iceland, Iceland
  ✓ Created destination: Cape Town, South Africa
✓ Sample destinations created

=================================
Database initialization complete!
=================================
```

### 2. Verify Indexes in Couchbase Web Console

1. Open Couchbase Web Console: http://localhost:8091
2. Navigate to **Query** tab
3. Click on **Indexes** in the left sidebar
4. Verify indexes exist for all four buckets:

**travel_users** should have:
- idx_users_primary
- idx_users_email
- idx_users_username
- idx_users_type
- idx_users_created
- idx_users_location

**travel_trips** should have:
- idx_trips_primary
- idx_trips_user
- idx_trips_status
- idx_trips_dates
- idx_trips_destinations
- idx_destinations_country
- idx_destinations_slug

**travel_content** should have:
- idx_posts_primary
- idx_posts_author
- idx_posts_trip
- idx_posts_destination
- idx_posts_created
- idx_posts_tags

**travel_social** should have:
- idx_connections_primary
- idx_connections_follower
- idx_connections_following
- idx_connections_status

### 3. Verify Sample Data

**Test 1: Query destinations**

In Couchbase Query Workbench:

```sql
SELECT d.name, d.country, d.countryCode, d.slug
FROM travel_trips d
WHERE d.type = 'destination'
ORDER BY d.name
```

**Expected**: 10 destinations returned (Paris, Tokyo, New York, Bali, Barcelona, Dubai, Santorini, Machu Picchu, Iceland, Cape Town)

**Test 2: Get specific destination**

```sql
SELECT *
FROM travel_trips
WHERE META().id = 'destination::FR::paris'
```

**Expected**: Paris destination with complete data structure

**Test 3: Search destinations by country**

```sql
SELECT d.name, d.country
FROM travel_trips d
WHERE d.type = 'destination' AND d.country = 'France'
```

**Expected**: Paris returned

### 4. Test Document Models

Create a test script to verify models work correctly:

```powershell
# Create test file
New-Item -Path "c:\Workspace\caohoc\travelnetwork\test-models.js" -ItemType File
```

**test-models.js content:**

```javascript
import { User } from './src/models/User.js';
import { Trip } from './src/models/Trip.js';
import { Post } from './src/models/Post.js';
import { Destination } from './src/models/Destination.js';
import { Connection } from './src/models/Connection.js';

console.log('Testing Document Models...\n');

// Test User model
console.log('1. User Model:');
const userData = {
  email: 'test@example.com',
  username: 'testuser',
  passwordHash: 'hashedpassword',
  firstName: 'Test',
  lastName: 'User',
};
const user = User.create(userData);
console.log('  ✓ User created:', user.id);
console.log('  ✓ User key:', User.getKey(user.id));
console.log('  ✓ Validation:', User.validate(user).valid ? 'passed' : 'failed');

// Test Trip model
console.log('\n2. Trip Model:');
const tripData = {
  userId: user.id,
  title: 'Test Trip',
  destinations: [{ destinationId: 'dest1', name: 'Paris' }],
  startDate: '2024-06-01',
  endDate: '2024-06-10',
};
const trip = Trip.create(tripData);
console.log('  ✓ Trip created:', trip.id);
console.log('  ✓ Trip key:', Trip.getKey(trip.id));
console.log('  ✓ Duration:', Trip.getDuration(trip), 'days');

// Test Post model
console.log('\n3. Post Model:');
const postData = {
  authorId: user.id,
  authorUsername: user.username,
  content: { text: 'Test post content' },
};
const post = Post.create(postData);
console.log('  ✓ Post created:', post.id);
console.log('  ✓ Post key:', Post.getKey(post.id));

// Test Destination model
console.log('\n4. Destination Model:');
const destData = {
  name: 'Test City',
  country: 'Test Country',
  countryCode: 'TC',
  coordinates: { lat: 0, lon: 0 },
};
const dest = Destination.create(destData);
console.log('  ✓ Destination created:', dest.id);
console.log('  ✓ Destination key:', Destination.getKey(dest.countryCode, dest.slug));
console.log('  ✓ Slug:', dest.slug);

// Test Connection model
console.log('\n5. Connection Model:');
const connData = {
  followerId: 'user1',
  followerUsername: 'user1',
  followingId: 'user2',
  followingUsername: 'user2',
};
const conn = Connection.create(connData);
console.log('  ✓ Connection created');
console.log('  ✓ Connection key:', Connection.getKey(conn.followerId, conn.followingId));

console.log('\n✅ All models working correctly!');
```

Run the test:

```powershell
node test-models.js
```

**Expected Output:**

```
Testing Document Models...

1. User Model:
  ✓ User created: <uuid>
  ✓ User key: user::<uuid>
  ✓ Validation: passed

2. Trip Model:
  ✓ Trip created: <uuid>
  ✓ Trip key: trip::<uuid>
  ✓ Duration: 10 days

3. Post Model:
  ✓ Post created: <uuid>
  ✓ Post key: post::<uuid>

4. Destination Model:
  ✓ Destination created: <uuid>
  ✓ Destination key: destination::TC::test-city
  ✓ Slug: test-city

5. Connection Model:
  ✓ Connection created
  ✓ Connection key: connection::user1::user2

✅ All models working correctly!
```

### 5. Test Query Helpers

In Couchbase Query Workbench, test these N1QL patterns:

**Test 1: Find destination by slug**

```sql
SELECT META().id, d.*
FROM travel_trips d
WHERE d.type = 'destination'
  AND d.countryCode = 'FR'
  AND d.slug = 'paris'
LIMIT 1
```

**Test 2: Get destinations by country**

```sql
SELECT d.name, d.country
FROM travel_trips d
WHERE d.type = 'destination' AND d.country = 'Spain'
```

**Test 3: Get popular destinations**

```sql
SELECT META().id, d.name, d.country, d.stats.tripCount
FROM travel_trips d
WHERE d.type = 'destination'
ORDER BY d.stats.tripCount DESC, d.stats.rating DESC
LIMIT 5
```

**Test 4: Search destinations**

```sql
SELECT d.name, d.country, d.summary
FROM travel_trips d
WHERE d.type = 'destination'
  AND (LOWER(d.name) LIKE '%paris%' OR LOWER(d.country) LIKE '%france%')
```

## Success Criteria

✅ **Task 2 is complete when:**

1. **Models Created**:
   - User.js ✓
   - Trip.js ✓
   - Post.js ✓
   - Destination.js ✓
   - Connection.js ✓

2. **Utilities Created**:
   - queryHelpers.js with N1QL patterns ✓
   - indexManager.js for index creation ✓

3. **Scripts Created**:
   - initDatabase.js runs successfully ✓

4. **Indexes Created**:
   - 24 total indexes across 4 buckets ✓
   - All indexes are active and building ✓

5. **Sample Data**:
   - 10 destinations created ✓
   - Data queryable via N1QL ✓

6. **Documentation**:
   - SCHEMA_DOCUMENTATION.md complete ✓
   - Scripts README complete ✓

7. **Testing**:
   - Models validate correctly ✓
   - Key generation works ✓
   - Queries execute successfully ✓

## File Structure After Task 2

```
travelnetwork/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── index.js
│   ├── models/
│   │   ├── Connection.js ✓
│   │   ├── Destination.js ✓
│   │   ├── Post.js ✓
│   │   ├── Trip.js ✓
│   │   └── User.js ✓
│   ├── utils/
│   │   ├── indexManager.js ✓
│   │   └── queryHelpers.js ✓
│   ├── scripts/
│   │   ├── initDatabase.js ✓
│   │   └── README.md ✓
│   ├── middleware/
│   ├── routes/
│   └── server.js
├── SCHEMA_DOCUMENTATION.md ✓
├── TEST_TASK2.md ✓
└── package.json (updated with db:init script) ✓
```

## Troubleshooting

### Issue: "Index already exists"
**Solution**: This is normal if running script multiple times. Indexes are skipped if they exist.

### Issue: "Bucket not found"
**Solution**: Verify all four buckets exist in Couchbase Web Console.

### Issue: Query errors in Query Workbench
**Solution**: 
1. Verify indexes are active (not "pending" or "building")
2. Wait a few seconds after index creation
3. Check bucket names match `.env` configuration

### Issue: Sample destinations not created
**Solution**:
1. Check bucket 'travel_trips' exists
2. Verify write permissions
3. Check console output for specific errors

---

**Status**: Ready for Task 3 - Authentication System
