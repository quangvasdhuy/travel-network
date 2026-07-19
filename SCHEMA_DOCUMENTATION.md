# Database Schema Documentation

## Overview

The Travel Network application uses Couchbase as its primary database, leveraging its flexible document model, N1QL query language, and Full-Text Search capabilities.

## Bucket Strategy

The application uses **four separate buckets** to organize data by domain and optimize performance:

| Bucket Name | Purpose | Document Types | Memory Quota |
|-------------|---------|----------------|--------------|
| `travel_users` | User accounts and profiles | user | 256 MB |
| `travel_content` | User-generated content | post, comment | 512 MB |
| `travel_trips` | Trip plans and destinations | trip, destination | 256 MB |
| `travel_social` | Social connections | connection | 256 MB |

### Why Separate Buckets?

1. **Independent Scaling**: Each bucket can scale independently based on usage patterns
2. **Memory Management**: Allocate more memory to content-heavy buckets
3. **Performance Isolation**: Heavy read/write operations don't impact other domains
4. **Access Control**: Fine-grained security per bucket
5. **Maintenance**: Backup and restore individual buckets

## Document Key Patterns

Consistent key patterns enable predictable lookups and efficient indexing:

| Document Type | Key Pattern | Example |
|---------------|-------------|---------|
| User | `user::{uuid}` | `user::550e8400-e29b-41d4-a716-446655440000` |
| Trip | `trip::{uuid}` | `trip::7c9e6679-7425-40de-944b-e07fc1f90ae7` |
| Post | `post::{uuid}` | `post::3d9c0f5e-5b2a-4f6f-9c7d-2e8a1b3c4d5e` |
| Destination | `destination::{countryCode}::{slug}` | `destination::FR::paris` |
| Connection | `connection::{followerId}::{followingId}` | `connection::user123::user456` |

### Key Pattern Benefits:

- **Direct Lookups**: Know the key without querying
- **Namespace Separation**: Different document types won't collide
- **Debugging**: Easy to identify document types in logs
- **Composite Keys**: Enable relationship modeling (connections)

---

## User Document Schema

**Bucket**: `travel_users`  
**Key**: `user::{uuid}`  
**Type**: `user`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "user",
  "email": "jane.doe@example.com",
  "username": "jane_traveler",
  "passwordHash": "$2a$10$...",
  "profile": {
    "firstName": "Jane",
    "lastName": "Doe",
    "bio": "Adventure seeker and food lover",
    "profilePhoto": "/uploads/profiles/jane.jpg",
    "location": {
      "city": "San Francisco",
      "country": "USA",
      "coordinates": { "lat": 37.7749, "lon": -122.4194 }
    },
    "dateOfBirth": "1990-05-15"
  },
  "interests": ["hiking", "photography", "food", "culture"],
  "preferences": {
    "travelStyle": ["adventure", "cultural", "budget"],
    "languages": ["en", "es"],
    "privacySettings": {
      "profileVisibility": "public",
      "tripVisibility": "public",
      "showEmail": false
    }
  },
  "stats": {
    "tripCount": 12,
    "postCount": 45,
    "followerCount": 234,
    "followingCount": 189
  },
  "verification": {
    "emailVerified": true,
    "verificationToken": null,
    "verificationTokenExpiry": null
  },
  "status": "active",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-02-20T14:22:00.000Z",
  "lastLoginAt": "2024-02-20T14:22:00.000Z"
}
```

### Indexes:

- `idx_users_email`: Fast lookup by email (login)
- `idx_users_username`: Fast lookup by username
- `idx_users_location`: Geographic queries
- `idx_users_created`: Sorting by join date

---

## Trip Document Schema

**Bucket**: `travel_trips`  
**Key**: `trip::{uuid}`  
**Type**: `trip`

```json
{
  "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "type": "trip",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Summer Adventure in Europe",
  "description": "Exploring Paris, Barcelona, and Rome",
  "destinations": [
    {
      "destinationId": "destination::FR::paris",
      "name": "Paris",
      "country": "France",
      "arrivalDate": "2024-06-10",
      "departureDate": "2024-06-15"
    },
    {
      "destinationId": "destination::ES::barcelona",
      "name": "Barcelona",
      "country": "Spain",
      "arrivalDate": "2024-06-16",
      "departureDate": "2024-06-22"
    }
  ],
  "startDate": "2024-06-10",
  "endDate": "2024-06-25",
  "status": "planning",
  "visibility": "public",
  "itinerary": [
    {
      "day": 1,
      "date": "2024-06-10",
      "activities": [
        { "time": "10:00", "activity": "Arrive in Paris", "location": "CDG Airport" },
        { "time": "15:00", "activity": "Visit Eiffel Tower", "location": "Champ de Mars" }
      ],
      "notes": "Check in at hotel near Louvre"
    }
  ],
  "budget": {
    "total": 3500,
    "currency": "USD",
    "breakdown": {
      "accommodation": 1200,
      "transport": 800,
      "food": 900,
      "activities": 600
    }
  },
  "participants": [
    {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "username": "jane_traveler",
      "status": "confirmed"
    }
  ],
  "tags": ["solo", "cultural", "foodie"],
  "stats": {
    "viewCount": 145,
    "likeCount": 23,
    "commentCount": 8,
    "shareCount": 5
  },
  "createdAt": "2024-02-01T09:00:00.000Z",
  "updatedAt": "2024-02-15T16:30:00.000Z"
}
```

### Indexes:

- `idx_trips_user`: Get user's trips
- `idx_trips_status`: Filter by status (planning/active/completed)
- `idx_trips_dates`: Find trips by date range
- `idx_trips_destinations`: Find trips visiting specific destinations

---

## Post Document Schema

**Bucket**: `travel_content`  
**Key**: `post::{uuid}`  
**Type**: `post`

```json
{
  "id": "3d9c0f5e-5b2a-4f6f-9c7d-2e8a1b3c4d5e",
  "type": "post",
  "authorId": "550e8400-e29b-41d4-a716-446655440000",
  "authorUsername": "jane_traveler",
  "authorPhoto": "/uploads/profiles/jane.jpg",
  "postType": "photo",
  "content": {
    "text": "Amazing sunset at the Eiffel Tower! #Paris #Travel",
    "media": [
      {
        "type": "image",
        "url": "/uploads/posts/eiffel-sunset.jpg",
        "caption": "Golden hour in Paris"
      }
    ]
  },
  "tripId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "destinationId": "destination::FR::paris",
  "location": {
    "name": "Eiffel Tower",
    "country": "France",
    "coordinates": { "lat": 48.8584, "lon": 2.2945 }
  },
  "tags": ["paris", "travel", "sunset", "eiffeltower"],
  "mentions": [],
  "visibility": "public",
  "stats": {
    "viewCount": 567,
    "likeCount": 89,
    "commentCount": 12,
    "shareCount": 7
  },
  "interactions": {
    "likes": ["user123", "user456", "user789"],
    "comments": [
      {
        "id": "comment1",
        "userId": "user456",
        "username": "travel_buddy",
        "userPhoto": "/uploads/profiles/buddy.jpg",
        "text": "Wow! Beautiful shot!",
        "createdAt": "2024-06-10T19:30:00.000Z"
      }
    ]
  },
  "createdAt": "2024-06-10T19:00:00.000Z",
  "updatedAt": "2024-06-10T19:30:00.000Z"
}
```

### Indexes:

- `idx_posts_author`: Get user's posts
- `idx_posts_trip`: Get posts for a trip
- `idx_posts_destination`: Get posts about a destination
- `idx_posts_created`: Chronological feed
- `idx_posts_tags`: Filter by tags

---

## Destination Document Schema

**Bucket**: `travel_trips`  
**Key**: `destination::{countryCode}::{slug}`  
**Type**: `destination`

```json
{
  "id": "destination-paris-001",
  "type": "destination",
  "name": "Paris",
  "slug": "paris",
  "country": "France",
  "countryCode": "FR",
  "region": "Île-de-France",
  "coordinates": { "lat": 48.8566, "lon": 2.3522 },
  "description": "The City of Light, known for its art, fashion, gastronomy and culture.",
  "summary": "Iconic city famous for the Eiffel Tower, Louvre Museum, and romantic atmosphere.",
  "images": [
    {
      "url": "/images/destinations/paris-main.jpg",
      "caption": "Eiffel Tower at night",
      "credit": "Photographer Name"
    }
  ],
  "categories": ["city", "cultural", "romantic"],
  "tags": ["romantic", "cultural", "food", "art", "museums"],
  "climate": {
    "type": "temperate",
    "bestMonths": [4, 5, 6, 9, 10]
  },
  "travelInfo": {
    "currency": "EUR",
    "languages": ["French"],
    "timezone": "CET",
    "visaRequired": false
  },
  "stats": {
    "tripCount": 1234,
    "postCount": 5678,
    "viewCount": 98765,
    "rating": 4.7,
    "ratingCount": 892
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-02-20T10:00:00.000Z"
}
```

### Indexes:

- `idx_destinations_slug`: Lookup by country and slug
- `idx_destinations_country`: List destinations by country

---

## Connection Document Schema

**Bucket**: `travel_social`  
**Key**: `connection::{followerId}::{followingId}`  
**Type**: `connection`

```json
{
  "type": "connection",
  "followerId": "550e8400-e29b-41d4-a716-446655440000",
  "followerUsername": "jane_traveler",
  "followingId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "followingUsername": "john_explorer",
  "status": "active",
  "createdAt": "2024-01-20T12:00:00.000Z"
}
```

### Indexes:

- `idx_connections_follower`: Get who a user follows
- `idx_connections_following`: Get user's followers

---

## Data Modeling Patterns

### 1. Denormalization for Performance

We **embed frequently-accessed data** to reduce queries:

- Post documents include `authorUsername` and `authorPhoto`
- Trip documents embed destination details
- Comments are embedded in post documents

**Trade-off**: Slight data redundancy for faster reads

### 2. Array Indexing

Couchbase supports **indexing array elements**:

```sql
-- Index on trip destinations
CREATE INDEX idx_trips_destinations 
ON travel_trips(DISTINCT ARRAY d.destinationId FOR d IN destinations END) 
WHERE type = 'trip'
```

This enables efficient queries like:
```sql
SELECT * FROM travel_trips 
WHERE ANY d IN destinations SATISFIES d.destinationId = 'destination::FR::paris' END
```

### 3. Composite Keys for Relationships

Connections use **composite keys** to model relationships:

```
connection::{followerId}::{followingId}
```

Benefits:
- Direct lookup of relationship status
- No need for separate relationship table
- Efficient bidirectional queries

### 4. Type Field for Multi-Document Buckets

Each document includes a `type` field:

```json
{ "type": "trip" }
{ "type": "destination" }
```

This allows:
- Multiple document types in one bucket
- Efficient filtering with `WHERE type = 'trip'`
- Clear document identification

---

## Query Patterns

### Common Access Patterns:

1. **Find User by Email** (Login)
   ```sql
   SELECT * FROM travel_users WHERE type = 'user' AND email = $email
   ```

2. **Get User's Trips**
   ```sql
   SELECT * FROM travel_trips 
   WHERE type = 'trip' AND userId = $userId 
   ORDER BY startDate DESC
   ```

3. **Get Feed (Posts from Connections)**
   ```sql
   SELECT p.* FROM travel_content p
   WHERE p.type = 'post' AND p.authorId IN (
     SELECT RAW c.followingId FROM travel_social c 
     WHERE c.followerId = $userId
   )
   ORDER BY p.createdAt DESC
   ```

4. **Find Trips to Destination**
   ```sql
   SELECT * FROM travel_trips t
   WHERE t.type = 'trip' 
     AND ANY d IN t.destinations SATISFIES d.destinationId = $destId END
   ```

5. **Search Destinations**
   ```sql
   SELECT * FROM travel_trips d
   WHERE d.type = 'destination' 
     AND (LOWER(d.name) LIKE $query OR LOWER(d.country) LIKE $query)
   ORDER BY d.stats.tripCount DESC
   ```

---

## Performance Considerations

### Index Strategy:

1. **Covering Indexes**: Include all fields needed for common queries
2. **Filtered Indexes**: Use `WHERE type = 'user'` to reduce index size
3. **Composite Indexes**: Combine multiple fields for specific queries
4. **Array Indexes**: Enable efficient array element queries

### Optimization Tips:

1. **Use Document Keys**: Direct key-value lookups are fastest
2. **Limit Results**: Always use `LIMIT` clause for pagination
3. **Denormalize Wisely**: Balance redundancy vs. query efficiency
4. **Monitor Query Performance**: Use Couchbase Query Workbench

---

## Full-Text Search (FTS)

For text search across documents, FTS indexes will be created in **Task 10**.

Planned FTS indexes:
- **Users**: Search by username, name, bio, location
- **Destinations**: Search by name, description, tags
- **Posts**: Search by content text, tags, location

---

## Future Enhancements

1. **Notifications**: Add notification documents to `travel_social`
2. **Messages**: Add direct messaging between users
3. **Reviews**: Add review documents for destinations
4. **Bookmarks**: Allow users to bookmark trips/posts
5. **Media Metadata**: Store image EXIF data and processing status

---

**Next**: Task 3 - Authentication System
