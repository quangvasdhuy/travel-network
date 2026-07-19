# Setup Instructions - Travel Network

## Prerequisites Installation

### 1. Install Node.js

**Windows:**
1. Visit [Node.js official website](https://nodejs.org/)
2. Download the LTS version (recommended: v18 or higher)
3. Run the installer and follow the wizard
4. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### 2. Install Couchbase Server

**Windows:**
1. Visit [Couchbase Downloads](https://www.couchbase.com/downloads)
2. Download Couchbase Server Community or Enterprise Edition
3. Run the installer
4. Follow the setup wizard:
   - Choose "Setup New Cluster"
   - Set Administrator username and password
   - Configure memory quotas (minimum 256MB for Data Service)
   - Enable Data, Query, and Index services
5. Access Web Console at http://localhost:8091

## Project Setup

### Step 1: Install Dependencies

```powershell
cd c:\Workspace\caohoc\travelnetwork
npm install
```

### Step 2: Configure Environment

1. Copy `.env.example` to `.env`:
   ```powershell
   copy .env.example .env
   ```

2. Edit `.env` with your Couchbase credentials:
   ```env
   COUCHBASE_USERNAME=Administrator
   COUCHBASE_PASSWORD=your_password
   JWT_SECRET=generate-a-random-secret-here
   ```

### Step 3: Create Couchbase Buckets

Open Couchbase Web Console (http://localhost:8091) and create these buckets:

1. **travel_users**
   - Memory Quota: 256 MB
   - Replicas: 0 (for development)
   - Bucket Type: Couchbase

2. **travel_content**
   - Memory Quota: 512 MB
   - Replicas: 0
   - Bucket Type: Couchbase

3. **travel_trips**
   - Memory Quota: 256 MB
   - Replicas: 0
   - Bucket Type: Couchbase

4. **travel_social**
   - Memory Quota: 256 MB
   - Replicas: 0
   - Bucket Type: Couchbase

**Or use the Couchbase CLI:**

```powershell
# Navigate to Couchbase bin directory (adjust path as needed)
cd "C:\Program Files\Couchbase\Server\bin"

# Create buckets
.\couchbase-cli bucket-create -c localhost:8091 `
  -u Administrator -p password `
  --bucket travel_users --bucket-type couchbase `
  --bucket-ramsize 256

.\couchbase-cli bucket-create -c localhost:8091 `
  -u Administrator -p password `
  --bucket travel_content --bucket-type couchbase `
  --bucket-ramsize 512

.\couchbase-cli bucket-create -c localhost:8091 `
  -u Administrator -p password `
  --bucket travel_trips --bucket-type couchbase `
  --bucket-ramsize 256

.\couchbase-cli bucket-create -c localhost:8091 `
  -u Administrator -p password `
  --bucket travel_social --bucket-type couchbase `
  --bucket-ramsize 256
```

### Step 4: Start the Server

```powershell
npm run dev
```

The server should start on http://localhost:3000

### Step 5: Verify Installation

Test the health endpoint:

```powershell
# Using curl (if installed)
curl http://localhost:3000/health

# Or using PowerShell
Invoke-WebRequest -Uri http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "buckets": {
      "users": { "connected": true },
      "content": { "connected": true },
      "trips": { "connected": true },
      "social": { "connected": true }
    }
  }
}
```

## Troubleshooting

### Issue: "npm is not recognized"
- Restart your terminal after installing Node.js
- Verify Node.js installation: `node --version`

### Issue: Cannot connect to Couchbase
- Verify Couchbase Server is running (check Services or Task Manager)
- Check Couchbase Web Console is accessible at http://localhost:8091
- Verify credentials in `.env` file match Couchbase admin credentials

### Issue: Buckets not found
- Create buckets manually through Couchbase Web Console
- Wait a few seconds after bucket creation before starting the server
- Verify bucket names in `.env` match the created bucket names

### Issue: Port 3000 already in use
- Change PORT in `.env` file to a different port (e.g., 3001)
- Or stop the process using port 3000

## Next Steps

Once the server is running successfully:

1. **Task 2**: Database schema and indexes will be created
2. **Task 3**: Authentication endpoints will be implemented
3. **Task 4+**: Additional features will be added

## Development Commands

```powershell
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests (when available)
npm test
```

## Additional Resources

- [Couchbase Node.js SDK](https://docs.couchbase.com/nodejs-sdk/current/hello-world/start-using-sdk.html)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Documentation](https://nodejs.org/docs/)
