# Task 5 Testing Guide - Destination Management

## Prerequisites

- Tasks 1-4 completed
- Server running: `npm run dev`
- Database initialized: `npm run db:init` (creates 10 sample destinations)
- Optional: User registered with access token for admin operations

## Sample Destinations Created

The initialization script created 10 destinations:
1. Paris, France (FR::paris)
2. Tokyo, Japan (JP::tokyo)
3. New York, USA (US::new-york)
4. Bali, Indonesia (ID::bali)
5. Barcelona, Spain (ES::barcelona)
6. Dubai, UAE (AE::dubai)
7. Santorini, Greece (GR::santorini)
8. Machu Picchu, Peru (PE::machu-picchu)
9. Iceland (IS::iceland)
10. Cape Town, South Africa (ZA::cape-town)

## API Endpoints to Test

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/destinations` | GET | No | List all destinations with filters |
| `/api/destinations/popular` | GET | No | Get popular destinations |
| `/api/destinations/search` | GET | No | Search destinations |
| `/api/destinations` | POST | Yes | Create destination (admin) |
| `/api/destinations/:countryCode/:slug` | GET | No | Get destination details |
| `/api/destinations/:countryCode/:slug` | PATCH | Yes | Update destination (admin) |
| `/api/destinations/:countryCode/:slug` | DELETE | Yes | Delete destination (admin) |
| `/api/destinations/country/:country` | GET | No | Get destinations by country |
| `/api/destinations/category/:category` | GET | No | Get destinations by category |

---

## Test 1: Get All Destinations

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations" `
    -Method GET | Select-Object -Expand Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "destinations": [
      {
        "id": "destination-paris-001",
        "type": "destination",
        "name": "Bali",
        "slug": "bali",
        "country": "Indonesia",
        "countryCode": "ID",
        "coordinates": { "lat": -8.3405, "lon": 115.092 },
        "description": "Tropical paradise...",
        "summary": "Island paradise with beaches...",
        "categories": ["beach", "island", "spiritual"],
        "tags": ["beach", "tropical", "spiritual"],
        "stats": {
          "tripCount": 0,
          "postCount": 0,
          "viewCount": 0,
          "rating": 0
        },
        ...
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "count": 10
    },
    "filters": {
      "country": null,
      "category": null,
      "tag": null
    }
  }
}
```

---

## Test 2: Get Destination by Country Code and Slug

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations/FR/paris" `
    -Method GET | Select-Object -Expand Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "destination": {
      "id": "destination-paris-001",
      "type": "destination",
      "name": "Paris",
      "slug": "paris",
      "country": "France",
      "countryCode": "FR",
      "region": "Île-de-France",
      "coordinates": { "lat": 48.8566, "lon": 2.3522 },
      "description": "The City of Light, known for its art, fashion...",
      "summary": "Iconic city famous for the Eiffel Tower...",
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
        "tripCount": 0,
        "postCount": 0,
        "viewCount": 1,  // Incremented on view!
        "rating": 0,
        "ratingCount": 0
      },
      "createdAt": "2024-...",
      "updatedAt": "2024-..."
    }
  }
}
```

**Note**: View count is automatically incremented!

---

## Test 3: Get Popular Destinations

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations/popular?limit=5" `
    -Method GET | Select-Object -Expand Content
```

**Expected Response (200):** Top 5 destinations sorted by tripCount (currently all 0)

---

## Test 4: Search Destinations

```powershell
# Search by name
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations/search?q=paris" `
    -Method GET | Select-Object -Expand Content

# Search by country
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations/search?q=france" `
    -Method GET | Select-Object -Expand Content

# Search for island destinations
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations/search?q=island" `
    -Method GET | Select-Object -Expand Content
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "destinations": [
      {
        "id": "destination-paris-001",
        "name": "Paris",
        "country": "France",
        "countryCode": "FR",
        "slug": "paris",
        "summary": "Iconic city famous for...",
        "images": [],
        "stats": {...}
      }
    ],
    "query": "paris",
    "count": 1
  }
}
```

---

## Test 5: Filter by Country

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations?country=France" `
    -Method GET | Select-Object -Expand Content

# Using country path
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations/country/France" `
    -Method GET | Select-Object -Expand Content
```

**Expected Response (200):** Only destinations in France (Paris)

---

## Test 6: Filter by Category

```powershell
# Get beach destinations
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations?category=beach" `
    -Method GET | Select-Object -Expand Content

# Get city destinations
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations?category=city" `
    -Method GET | Select-Object -Expand Content

# Using category path
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations/category/beach" `
    -Method GET | Select-Object -Expand Content
```

**Expected Response (200):** Only destinations matching the category

---

## Test 7: Filter by Tag

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations?tag=romantic" `
    -Method GET | Select-Object -Expand Content
```

**Expected Response (200):** Destinations with "romantic" tag (Paris, Santorini)

---

## Test 8: Sort Destinations

```powershell
# Sort by popularity (most trips)
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations?sortBy=popularity&order=desc" `
    -Method GET | Select-Object -Expand Content

# Sort by name ascending (default)
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations?sortBy=name&order=asc" `
    -Method GET | Select-Object -Expand Content
```

---

## Test 9: Pagination

```powershell
# First 5 destinations
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations?limit=5&offset=0" `
    -Method GET | Select-Object -Expand Content

# Next 5 destinations
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations?limit=5&offset=5" `
    -Method GET | Select-Object -Expand Content
```

---

## Test 10: Create New Destination (Admin)

```powershell
$token = "YOUR_ACCESS_TOKEN"

$newDestination = @{
    name = "Sydney"
    country = "Australia"
    countryCode = "AU"
    coordinates = @{
        lat = -33.8688
        lon = 151.2093
    }
    description = "Harbor city known for its Opera House, beaches, and laid-back lifestyle."
    summary = "Iconic Australian city with stunning harbor, beaches, and landmarks."
    categories = @("city", "beach", "modern")
    tags = @("beach", "urban", "surfing", "landmarks")
    climate = @{
        type = "temperate"
        bestMonths = @(9, 10, 11, 12, 1, 2, 3)
    }
    travelInfo = @{
        currency = "AUD"
        languages = @("English")
        timezone = "AEDT"
        visaRequired = $true
    }
} | ConvertTo-Json -Depth 10

Invoke-WebRequest -Uri "http://localhost:3000/api/destinations" `
    -Method POST `
    -Body $newDestination `
    -Headers @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    } | Select-Object -Expand Content
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "destination": {
      "id": "uuid-generated",
      "type": "destination",
      "name": "Sydney",
      "slug": "sydney",
      "country": "Australia",
      "countryCode": "AU",
      ...
    }
  },
  "message": "Destination created successfully"
}
```

---

## Test 11: Update Destination (Admin)

```powershell
$token = "YOUR_ACCESS_TOKEN"

$updates = @{
    description = "Updated description: Harbor city with world-famous landmarks."
    tags = @("beach", "urban", "surfing", "landmarks", "food")
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/destinations/FR/paris" `
    -Method PATCH `
    -Body $updates `
    -Headers @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    } | Select-Object -Expand Content
```

**Expected Response (200):** Updated destination with new values

---

## Test 12: Delete Destination (Admin)

```powershell
$token = "YOUR_ACCESS_TOKEN"

Invoke-WebRequest -Uri "http://localhost:3000/api/destinations/AU/sydney" `
    -Method DELETE `
    -Headers @{Authorization = "Bearer $token"} | Select-Object -Expand Content
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Destination deleted successfully"
}
```

---

## Error Tests

### Test 13: Search with Short Query

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations/search?q=p" `
    -Method GET
```

**Expected Response (400):** Validation error - query too short

### Test 14: Get Non-Existent Destination

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/destinations/XX/nonexistent" `
    -Method GET
```

**Expected Response (404):** Destination not found

### Test 15: Create Duplicate Destination

```powershell
$token = "YOUR_ACCESS_TOKEN"

$duplicate = @{
    name = "Paris"
    country = "France"
    countryCode = "FR"
    coordinates = @{ lat = 48.8566; lon = 2.3522 }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/destinations" `
    -Method POST `
    -Body $duplicate `
    -Headers @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }
```

**Expected Response (409):** Destination already exists

### Test 16: Create Destination Without Auth

```powershell
$newDest = @{
    name = "Test City"
    country = "Test"
    countryCode = "TC"
    coordinates = @{ lat = 0; lon = 0 }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/destinations" `
    -Method POST `
    -Body $newDest `
    -ContentType "application/json"
```

**Expected Response (401):** No token provided

---

## Database Verification

### View All Destinations

```sql
SELECT d.name, d.country, d.countryCode, d.slug, d.stats
FROM travel_trips d
WHERE d.type = 'destination'
ORDER BY d.name
```

### Check View Count Increment

```sql
SELECT d.name, d.stats.viewCount
FROM travel_trips d
WHERE d.type = 'destination' AND d.countryCode = 'FR' AND d.slug = 'paris'
```

After viewing Paris several times, viewCount should increment!

### Find Destinations by Category

```sql
SELECT d.name, d.country, d.categories
FROM travel_trips d
WHERE d.type = 'destination'
  AND 'beach' IN d.categories
```

### Search in Description

```sql
SELECT d.name, d.country, d.summary
FROM travel_trips d
WHERE d.type = 'destination'
  AND (LOWER(d.name) LIKE '%island%' OR LOWER(d.description) LIKE '%island%')
```

---

## Success Criteria

✅ **Task 5 is complete when:**

1. **Browse Destinations**:
   - List all destinations ✓
   - Get destination by ID ✓
   - Get destination by country/slug ✓
   - Pagination works ✓

2. **Filtering**:
   - Filter by country ✓
   - Filter by category ✓
   - Filter by tag ✓
   - Multiple filters combined ✓

3. **Search**:
   - Search by name ✓
   - Search by country ✓
   - Search in description ✓
   - Results ranked by relevance ✓

4. **Popular Destinations**:
   - Get top destinations by trip count ✓
   - Sorted correctly ✓

5. **CRUD Operations (Admin)**:
   - Create destination ✓
   - Update destination ✓
   - Delete destination ✓
   - Validation works ✓
   - Duplicate checking ✓

6. **Statistics**:
   - View count increments on view ✓
   - Trip/post counts (will be updated by other features) ✓

7. **Sorting**:
   - Sort by name ✓
   - Sort by popularity ✓
   - Ascending/descending ✓

## Files Created/Modified

```
src/
├── routes/
│   └── destinations.js ✓    # Destination endpoints
├── services/
│   └── destinationService.js ✓  # Destination business logic
└── server.js (updated) ✓    # Destination routes registered
```

---

**Status**: Ready for Task 6 - Trip Planning Core

**Next**: Users will be able to create trips with these destinations!
