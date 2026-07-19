# Database Scripts

This directory contains utility scripts for managing the database.

## initDatabase.js

Initializes the database with required indexes and sample data.

### What it does:

1. **Creates Indexes**: Sets up all primary and secondary indexes for optimal query performance
2. **Sample Destinations**: Populates 10 popular travel destinations worldwide

### Usage:

```powershell
# From the project root directory
node src/scripts/initDatabase.js
```

### Prerequisites:

- Couchbase Server must be running
- Buckets must be created (travel_users, travel_content, travel_trips, travel_social)
- `.env` file must be configured with correct credentials

### Expected Output:

```
=================================
Database Initialization
=================================

Step 1: Connecting to Couchbase...
✓ Connected

Step 2: Creating indexes...
Creating database indexes...
  ✓ Created index: idx_users_primary
  ✓ Created index: idx_users_email
  ✓ Created index: idx_users_username
  ... (more indexes)
✓ Indexes created

Step 3: Creating sample destinations...
  ✓ Created destination: Paris, France
  ✓ Created destination: Tokyo, Japan
  ... (more destinations)
✓ Sample destinations created

=================================
Database initialization complete!
=================================
```

### Sample Destinations Created:

1. **Paris, France** - The City of Light
2. **Tokyo, Japan** - Modern metropolis with ancient culture
3. **New York, USA** - The city that never sleeps
4. **Bali, Indonesia** - Tropical island paradise
5. **Barcelona, Spain** - Mediterranean city with stunning architecture
6. **Dubai, UAE** - Luxury and modern architecture
7. **Santorini, Greece** - Picturesque island with sunsets
8. **Machu Picchu, Peru** - Ancient Incan citadel
9. **Iceland** - Land of fire and ice
10. **Cape Town, South Africa** - Mountains, beaches, and culture

## Troubleshooting:

### Error: "Bucket not found"
- Ensure all four buckets are created in Couchbase:
  - travel_users
  - travel_content
  - travel_trips
  - travel_social

### Error: "Index already exists"
- This is normal if you run the script multiple times
- The script will skip existing indexes

### Error: "Connection refused"
- Verify Couchbase Server is running
- Check connection string in `.env` file

## Index Structure:

### Users Bucket:
- Primary index
- Email index (unique lookups)
- Username index (unique lookups)
- Type index (filtering by document type)
- Created date index (sorting)
- Location index (geographic queries)

### Trips Bucket:
- Primary index
- User index (get user's trips)
- Status index (filter by trip status)
- Date range index (find trips by dates)
- Destinations array index (find trips by destination)
- Destination country/slug indexes (destination lookups)

### Content Bucket:
- Primary index
- Author index (get user's posts)
- Trip index (get posts for a trip)
- Destination index (get posts about a destination)
- Created date index (chronological ordering)
- Tags array index (filter by tags)

### Social Bucket:
- Primary index
- Follower index (get user's followers)
- Following index (get who user follows)
- Status index (filter active connections)

## Notes:

- Indexes are created asynchronously; large datasets may take time to build
- Sample destinations include realistic data with coordinates, tags, and travel info
- Script is idempotent - safe to run multiple times
