# Task 1 Testing Guide

## Manual Testing Checklist

### Prerequisites
- [ ] Node.js is installed (`node --version`)
- [ ] npm is installed (`npm --version`)
- [ ] Couchbase Server is installed and running
- [ ] Buckets are created (travel_users, travel_content, travel_trips, travel_social)

### Installation Test
```powershell
# 1. Navigate to project directory
cd c:\Workspace\caohoc\travelnetwork

# 2. Install dependencies
npm install

# 3. Verify package.json dependencies are installed
# Check that node_modules folder exists
```

### Configuration Test
```powershell
# 1. Copy .env.example to .env
copy .env.example .env

# 2. Edit .env with your Couchbase credentials
# Update COUCHBASE_USERNAME and COUCHBASE_PASSWORD

# 3. Verify .env file contains all required variables
```

### Server Start Test
```powershell
# 1. Start the development server
npm run dev

# Expected output:
# =================================
# Travel Network API Starting...
# =================================
# Environment: development
# Port: 3000
# =================================
# Connecting to Couchbase cluster...
# ✓ Connected to Couchbase cluster
# ✓ Bucket 'travel_users' ready
# ✓ Bucket 'travel_content' ready
# ✓ Bucket 'travel_trips' ready
# ✓ Bucket 'travel_social' ready
# ✓ Database connection ready
# =================================
# ✓ Server running on port 3000
# ✓ Health check: http://localhost:3000/health
# =================================
```

### Health Endpoint Test

#### Test 1: Full Health Check
```powershell
# Using Invoke-WebRequest (PowerShell)
Invoke-WebRequest -Uri http://localhost:3000/health | Select-Object -Expand Content

# Expected response (status 200):
# {
#   "status": "healthy",
#   "timestamp": "2024-01-15T10:30:00.000Z",
#   "uptime": 123.456,
#   "environment": "development",
#   "database": {
#     "status": "connected",
#     "cluster": "couchbase://localhost",
#     "buckets": {
#       "users": { "name": "travel_users", "connected": true },
#       "content": { "name": "travel_content", "connected": true },
#       "trips": { "name": "travel_trips", "connected": true },
#       "social": { "name": "travel_social", "connected": true }
#     }
#   },
#   "memory": { "used": "45 MB", "total": "128 MB" }
# }
```

#### Test 2: Ping Endpoint
```powershell
Invoke-WebRequest -Uri http://localhost:3000/health/ping | Select-Object -Expand Content

# Expected response (status 200):
# {
#   "message": "pong",
#   "timestamp": "2024-01-15T10:30:00.000Z"
# }
```

#### Test 3: Root Endpoint
```powershell
Invoke-WebRequest -Uri http://localhost:3000 | Select-Object -Expand Content

# Expected response (status 200):
# {
#   "message": "Travel Network API",
#   "version": "1.0.0",
#   "documentation": "/api-docs",
#   "health": "/health"
# }
```

#### Test 4: 404 Handling
```powershell
Invoke-WebRequest -Uri http://localhost:3000/nonexistent

# Expected response (status 404):
# {
#   "success": false,
#   "error": {
#     "message": "Route not found",
#     "statusCode": 404,
#     "path": "/nonexistent"
#   }
# }
```

### Connection Pool Test

#### Test 5: Database Connection Manager
```powershell
# This test verifies the connection manager works
# The health endpoint internally tests:
# - cluster.ping()
# - bucket connections
# - connection status

# Restart the server and verify it reconnects successfully
# Press Ctrl+C to stop, then npm run dev again
```

### Error Handling Test

#### Test 6: Database Disconnection
```powershell
# 1. Start the server
npm run dev

# 2. Stop Couchbase Server
# (via Services or Couchbase Web Console)

# 3. Hit the health endpoint
Invoke-WebRequest -Uri http://localhost:3000/health

# Expected: Status 503 with degraded/error status
```

#### Test 7: Graceful Shutdown
```powershell
# 1. Start the server
npm run dev

# 2. Press Ctrl+C

# Expected output:
# SIGINT received. Starting graceful shutdown...
# HTTP server closed
# ✓ Disconnected from Couchbase cluster
# Database connections closed
```

## Success Criteria

✅ **Task 1 is complete when:**

1. Node.js project is initialized with package.json
2. All dependencies are installable via `npm install`
3. Couchbase connection module is created with connection pooling
4. Environment configuration loads correctly from .env
5. Express server starts successfully
6. Health check endpoint returns 200 with database status
7. Ping endpoint returns 200
8. Server connects to all four Couchbase buckets
9. Server handles graceful shutdown
10. Error handling middleware catches and logs errors
11. Request logging works in development mode
12. Documentation is complete (README.md, SETUP_INSTRUCTIONS.md)

## Expected File Structure

```
travelnetwork/
├── src/
│   ├── config/
│   │   ├── database.js ✓
│   │   └── index.js ✓
│   ├── middleware/
│   │   ├── errorHandler.js ✓
│   │   └── requestLogger.js ✓
│   ├── routes/
│   │   └── health.js ✓
│   └── server.js ✓
├── uploads/
│   └── .gitkeep ✓
├── .env.example ✓
├── .gitignore ✓
├── package.json ✓
├── README.md ✓
├── SETUP_INSTRUCTIONS.md ✓
└── TEST_TASK1.md ✓
```

## Notes

- The server uses singleton pattern for database connection
- Connection pooling is handled by Couchbase SDK automatically
- Health endpoint is useful for monitoring and load balancers
- CORS is configured for frontend at localhost:5173
- JWT configuration is ready for Task 3

---

**Status**: Ready for Task 2 - Database Schema Design and Bucket Setup
