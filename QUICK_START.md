# Quick Start Guide

## TL;DR - Get Running in 5 Minutes

### 1. Install Prerequisites (if not already installed)
- **Node.js**: https://nodejs.org/ (v18+)
- **Couchbase Server**: https://www.couchbase.com/downloads

### 2. Setup Couchbase
```powershell
# Start Couchbase Server
# Access Web Console: http://localhost:8091
# Create buckets: travel_users, travel_content, travel_trips, travel_social
# (256-512 MB each, 0 replicas for development)
```

### 3. Install & Configure
```powershell
cd c:\Workspace\caohoc\travelnetwork

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env with your Couchbase password
```

### 4. Run
```powershell
npm run dev
```

### 5. Test
```powershell
# Open browser or use PowerShell:
Invoke-WebRequest -Uri http://localhost:3000/health
```

## Expected Output

When server starts successfully:
```
=================================
Travel Network API Starting...
=================================
Environment: development
Port: 3000
=================================
Connecting to Couchbase cluster...
✓ Connected to Couchbase cluster
✓ Bucket 'travel_users' ready
✓ Bucket 'travel_content' ready
✓ Bucket 'travel_trips' ready
✓ Bucket 'travel_social' ready
✓ Database connection ready
=================================
✓ Server running on port 3000
✓ Health check: http://localhost:3000/health
=================================
```

## Troubleshooting

**Can't connect to Couchbase?**
- Check Couchbase is running (Services > Couchbase Server)
- Verify credentials in `.env` match your Couchbase admin password

**Buckets not found?**
- Create them in Couchbase Web Console: http://localhost:8091

**Port 3000 in use?**
- Change `PORT=3001` in `.env` file

## What's Next?

- ✅ **Task 1 Complete** - Server and database connection working
- ⏭️ **Task 2** - Create database schema and indexes
- ⏭️ **Task 3** - Add authentication (register/login)
- ⏭️ **Task 4+** - Build features (profiles, trips, social, etc.)

## API Endpoints (Task 1)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API information |
| `/health` | GET | Full health check with DB status |
| `/health/ping` | GET | Simple ping/pong |

---

For detailed setup instructions, see `SETUP_INSTRUCTIONS.md`

For testing checklist, see `TEST_TASK1.md`
