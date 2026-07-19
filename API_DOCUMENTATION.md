# Travel Network API Documentation

**Base URL**: `http://localhost:3000`

**Version**: 1.0.0

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

### Token Lifecycle

- **Access Token**: Valid for 24 hours (configurable)
- **Refresh Token**: Valid for 7 days (configurable)
- Use the refresh token to obtain a new access token before it expires

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "details": [] // Optional additional details
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Database or service down |

---

## Endpoints

### Health Check

#### Get API Health Status

```
GET /health
```

**Description**: Returns health status of API and database connections

**Authentication**: Not required

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "database": {
    "status": "connected",
    "cluster": "couchbase://localhost",
    "buckets": {
      "users": { "name": "travel_users", "connected": true },
      "content": { "name": "travel_content", "connected": true },
      "trips": { "name": "travel_trips", "connected": true },
      "social": { "name": "travel_social", "connected": true }
    }
  },
  "memory": {
    "used": "45 MB",
    "total": "128 MB"
  }
}
```

#### Simple Ping

```
GET /health/ping
```

**Response**:
```json
{
  "message": "pong",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Authentication

### Register User

```
POST /api/auth/register
```

**Description**: Create a new user account

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "alice@example.com",
  "username": "alice_traveler",
  "password": "SecurePass123",
  "firstName": "Alice",
  "lastName": "Johnson"
}
```

**Validation Rules**:
- `email`: Required, must be valid email format
- `username`: Required, 3-30 alphanumeric characters
- `password`: Required, minimum 8 characters
- `firstName`: Optional, 1-50 characters
- `lastName`: Optional, 1-50 characters

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "alice_traveler",
      "profile": {
        "firstName": "Alice",
        "lastName": "Johnson",
        "bio": "",
        "profilePhoto": null,
        "location": {
          "city": "",
          "country": "",
          "coordinates": null
        }
      },
      "interests": [],
      "preferences": {
        "travelStyle": []
      },
      "stats": {
        "tripCount": 0,
        "postCount": 0,
        "followerCount": 0,
        "followingCount": 0
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "24h"
    }
  },
  "message": "User registered successfully"
}
```

**Errors**:
- `400`: Validation failed
- `409`: Email or username already exists

---

### Login

```
POST /api/auth/login
```

**Description**: Authenticate user and receive tokens

**Authentication**: Not required

**Request Body**:
```json
{
  "emailOrUsername": "alice_traveler",
  "password": "SecurePass123"
}
```

**Response (200)**: Same as registration response

**Errors**:
- `400`: Missing credentials
- `401`: Invalid credentials
- `403`: Account not active

---

### Refresh Token

```
POST /api/auth/refresh
```

**Description**: Get new access token using refresh token

**Authentication**: Not required

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "new_access_token...",
      "refreshToken": "new_refresh_token...",
      "expiresIn": "24h"
    }
  },
  "message": "Token refreshed successfully"
}
```

**Errors**:
- `400`: Missing refresh token
- `401`: Invalid or expired refresh token

---

### Get Current User

```
GET /api/auth/me
```

**Description**: Get authenticated user's information

**Authentication**: Required

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "alice@example.com",
      "username": "alice_traveler",
      "profile": {
        "firstName": "Alice",
        "lastName": "Johnson",
        "bio": "",
        "profilePhoto": null,
        "location": {
          "city": "",
          "country": "",
          "coordinates": null
        }
      },
      "status": "active"
    }
  }
}
```

**Errors**:
- `401`: Not authenticated or invalid token

---

### Logout

```
POST /api/auth/logout
```

**Description**: Logout user (client should discard tokens)

**Authentication**: Required

**Response (200)**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Note**: With JWT, actual logout is handled client-side by removing tokens

---

### Verify Email

```
POST /api/auth/verify-email
```

**Description**: Verify user's email address with token

**Authentication**: Not required

**Request Body**:
```json
{
  "token": "verification_token_string"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Errors**:
- `400`: Invalid or expired token

---

## Rate Limiting

*(To be implemented in Task 17)*

Rate limiting will be applied to prevent abuse:
- Registration: 5 requests per hour per IP
- Login: 10 requests per 15 minutes per IP
- General API: 100 requests per 15 minutes per user

---

## Pagination

*(For list endpoints in upcoming tasks)*

List endpoints support pagination with query parameters:

```
GET /api/resource?page=1&limit=20&sortBy=createdAt&order=desc
```

**Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sortBy`: Field to sort by
- `order`: Sort order (`asc` or `desc`, default: `desc`)

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `TOKEN_EXPIRED` | Access token has expired, use refresh token |
| `VALIDATION_ERROR` | Input validation failed |
| `DUPLICATE_EMAIL` | Email already registered |
| `DUPLICATE_USERNAME` | Username already taken |
| `INVALID_CREDENTIALS` | Wrong email/username or password |
| `ACCOUNT_INACTIVE` | User account is suspended or deleted |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist |
| `PERMISSION_DENIED` | Insufficient permissions for action |

---

## Examples

### Complete Authentication Flow

#### 1. Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "username": "alice_traveler",
    "password": "SecurePass123",
    "firstName": "Alice"
  }'
```

Save the `accessToken` and `refreshToken` from response.

#### 2. Access Protected Resource

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3. Refresh Token (before access token expires)

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

#### 4. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Upcoming Endpoints

The following endpoints will be added in subsequent tasks:

- **Task 4**: User Profile Management (`/api/users`)
- **Task 5**: Destinations (`/api/destinations`)
- **Task 6**: Trips (`/api/trips`)
- **Task 7**: Social Connections (`/api/connections`)
- **Task 8**: Posts (`/api/posts`)
- **Task 9**: Comments & Interactions (`/api/posts/:id/comments`)
- **Task 10**: Search (`/api/search`)
- **Task 11**: Feed (`/api/feed`)

---

## Security Notes

1. **Password Security**:
   - Passwords are hashed with bcrypt (cost factor: 10)
   - Never returned in API responses
   - Minimum 8 characters required

2. **JWT Tokens**:
   - Signed with HS256 algorithm
   - Secret key configured in environment variables
   - Access token: 24 hours validity
   - Refresh token: 7 days validity

3. **HTTPS**:
   - Use HTTPS in production
   - Never transmit tokens over HTTP

4. **CORS**:
   - Configured for specific origins
   - Credentials enabled for cookies

---

**Last Updated**: Task 3 Complete  
**Next Update**: Task 4 - User Profile Management


---

## User Profile Management

### Get Current User Profile

```
GET /api/users/me
```

**Description**: Get authenticated user's full profile

**Authentication**: Required

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-...",
      "email": "alice@example.com",
      "username": "alice_traveler",
      "profile": {
        "firstName": "Alice",
        "lastName": "Johnson",
        "bio": "Adventure seeker",
        "profilePhoto": "/uploads/profiles/photo.jpg",
        "location": {
          "city": "San Francisco",
          "country": "USA",
          "coordinates": null
        },
        "dateOfBirth": "1990-05-15"
      },
      "interests": ["hiking", "photography"],
      "preferences": {
        "travelStyle": ["adventure", "cultural"],
        "languages": ["en", "es"],
        "privacySettings": {
          "profileVisibility": "public",
          "tripVisibility": "public",
          "showEmail": false
        }
      },
      "stats": {
        "tripCount": 5,
        "postCount": 23,
        "followerCount": 45,
        "followingCount": 67
      },
      "status": "active",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-02-20T14:22:00.000Z"
    }
  }
}
```

---

### Update Profile

```
PATCH /api/users/me
```

**Description**: Update authenticated user's profile

**Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "profile.firstName": "Alice",
  "profile.lastName": "Johnson",
  "profile.bio": "Adventure seeker and food lover",
  "profile.location.city": "San Francisco",
  "profile.location.country": "USA",
  "profile.dateOfBirth": "1990-05-15",
  "interests": ["hiking", "photography", "food"],
  "preferences.travelStyle": ["adventure", "cultural"],
  "preferences.languages": ["en", "es", "fr"],
  "preferences.privacySettings.profileVisibility": "public",
  "preferences.privacySettings.tripVisibility": "public",
  "preferences.privacySettings.showEmail": false
}
```

**Allowed Fields**:
- `profile.firstName`, `profile.lastName`, `profile.bio`
- `profile.location.city`, `profile.location.country`
- `profile.dateOfBirth`
- `interests` (array)
- `preferences.travelStyle` (array)
- `preferences.languages` (array)
- `preferences.privacySettings.*`

**Response (200)**: Updated user object

**Errors**:
- `400`: No valid fields to update
- `401`: Not authenticated

---

### Upload Profile Photo

```
POST /api/users/me/photo
```

**Description**: Upload user profile photo

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Request Body**:
- `photo`: Image file (jpeg, jpg, png, gif, webp)
- Max size: 5MB

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-...",
      "profile": {
        "profilePhoto": "/uploads/profiles/uuid-filename.jpg"
      },
      ...
    },
    "photoUrl": "/uploads/profiles/uuid-filename.jpg"
  },
  "message": "Profile photo updated successfully"
}
```

**Errors**:
- `400`: No file uploaded or invalid file type
- `413`: File too large (>5MB)

---

### Get User by ID

```
GET /api/users/:id
```

**Description**: Get public user profile by ID

**Authentication**: Optional

**Response (200)**: Public user profile (email excluded)

---

### Get User by Username

```
GET /api/users/username/:username
```

**Description**: Get public user profile by username

**Authentication**: Optional

**Response (200)**: Public user profile

---

### Search Users

```
GET /api/users/search?q=query&limit=20&offset=0
```

**Description**: Search users by username, name, or location

**Authentication**: Optional

**Query Parameters**:
- `q`: Search query (min 2 characters, required)
- `limit`: Results per page (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "550e8400-...",
        "username": "alice_traveler",
        "profile": {...},
        "interests": [...],
        "stats": {...}
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "count": 5
    }
  }
}
```

**Errors**:
- `400`: Query too short (<2 characters)

---

### Get User Statistics

```
GET /api/users/:id/stats
```

**Description**: Get user statistics

**Authentication**: Optional

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-...",
    "username": "alice_traveler",
    "stats": {
      "tripCount": 5,
      "postCount": 23,
      "followerCount": 45,
      "followingCount": 67
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Delete Account

```
DELETE /api/users/me
```

**Description**: Delete (soft delete) user account

**Authentication**: Required

**Response (200)**:
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Note**: This is a soft delete. Account is marked as deleted but data is retained.

---


---

## Destination Management

### List All Destinations

```
GET /api/destinations?country=&category=&tag=&limit=50&offset=0&sortBy=name&order=asc
```

**Description**: Get all destinations with optional filters

**Authentication**: Not required

**Query Parameters**:
- `country`: Filter by country name (optional)
- `category`: Filter by category (beach, city, mountains, cultural, etc.) (optional)
- `tag`: Filter by tag (optional)
- `limit`: Results per page (default: 50, max: 100)
- `offset`: Pagination offset (default: 0)
- `sortBy`: Sort field - `name`, `popularity`, `rating` (default: name)
- `order`: Sort order - `asc`, `desc` (default: asc)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "destinations": [
      {
        "id": "destination-paris-001",
        "type": "destination",
        "name": "Paris",
        "slug": "paris",
        "country": "France",
        "countryCode": "FR",
        "coordinates": { "lat": 48.8566, "lon": 2.3522 },
        "description": "The City of Light...",
        "summary": "Iconic city famous for...",
        "categories": ["city", "cultural", "romantic"],
        "tags": ["romantic", "cultural", "food"],
        "climate": {
          "type": "temperate",
          "bestMonths": [4, 5, 6, 9, 10]
        },
        "travelInfo": {
          "currency": "EUR",
          "languages": ["French"],
          "timezone": "CET"
        },
        "stats": {
          "tripCount": 0,
          "postCount": 0,
          "viewCount": 0,
          "rating": 0
        }
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

### Get Popular Destinations

```
GET /api/destinations/popular?limit=20
```

**Description**: Get popular destinations sorted by trip count

**Authentication**: Not required

**Query Parameters**:
- `limit`: Number of destinations (default: 20, max: 100)

**Response (200)**: List of destinations sorted by popularity

---

### Search Destinations

```
GET /api/destinations/search?q=query&limit=20
```

**Description**: Search destinations by name, country, or description

**Authentication**: Not required

**Query Parameters**:
- `q`: Search query (min 2 characters, required)
- `limit`: Results limit (default: 20, max: 100)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "destinations": [...],
    "query": "paris",
    "count": 1
  }
}
```

**Errors**:
- `400`: Query too short (<2 characters)

---

### Get Destination Details

```
GET /api/destinations/:countryCode/:slug
```

**Description**: Get detailed information about a destination

**Authentication**: Not required

**Parameters**:
- `countryCode`: ISO 3166-1 alpha-2 country code (e.g., FR, US, JP)
- `slug`: Destination slug (e.g., paris, new-york, tokyo)

**Response (200)**: Full destination object

**Note**: View count is automatically incremented on each request

**Errors**:
- `404`: Destination not found

**Examples**:
- `/api/destinations/FR/paris` - Paris, France
- `/api/destinations/JP/tokyo` - Tokyo, Japan
- `/api/destinations/US/new-york` - New York, USA

---

### Create Destination

```
POST /api/destinations
```

**Description**: Create a new destination (admin only)

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Sydney",
  "country": "Australia",
  "countryCode": "AU",
  "region": "New South Wales",
  "coordinates": {
    "lat": -33.8688,
    "lon": 151.2093
  },
  "description": "Harbor city known for Opera House...",
  "summary": "Iconic Australian city with stunning harbor",
  "categories": ["city", "beach", "modern"],
  "tags": ["beach", "urban", "surfing", "landmarks"],
  "climate": {
    "type": "temperate",
    "bestMonths": [9, 10, 11, 12, 1, 2, 3]
  },
  "travelInfo": {
    "currency": "AUD",
    "languages": ["English"],
    "timezone": "AEDT",
    "visaRequired": true
  }
}
```

**Validation**:
- `name`: 2-100 characters, required
- `country`: 2-100 characters, required
- `countryCode`: 2 uppercase letters, required
- `coordinates.lat`: -90 to 90, required
- `coordinates.lon`: -180 to 180, required

**Response (201)**: Created destination object

**Errors**:
- `400`: Invalid data
- `401`: Not authenticated
- `409`: Destination already exists

---

### Update Destination

```
PATCH /api/destinations/:countryCode/:slug
```

**Description**: Update destination information (admin only)

**Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "summary": "Updated summary",
  "categories": ["city", "beach"],
  "tags": ["new", "tags"],
  "climate": {...},
  "travelInfo": {...}
}
```

**Response (200)**: Updated destination object

**Errors**:
- `400`: No valid fields to update
- `401`: Not authenticated
- `404`: Destination not found

---

### Delete Destination

```
DELETE /api/destinations/:countryCode/:slug
```

**Description**: Delete a destination (admin only)

**Authentication**: Required

**Response (200)**:
```json
{
  "success": true,
  "message": "Destination deleted successfully"
}
```

**Errors**:
- `401`: Not authenticated
- `404`: Destination not found

---

### Get Destinations by Country

```
GET /api/destinations/country/:country?limit=50&offset=0
```

**Description**: Get all destinations in a specific country

**Authentication**: Not required

**Parameters**:
- `country`: Country name (e.g., France, Japan, USA)

**Response (200)**: List of destinations in the country

---

### Get Destinations by Category

```
GET /api/destinations/category/:category?limit=50&offset=0
```

**Description**: Get destinations by category

**Authentication**: Not required

**Parameters**:
- `category`: Category name (beach, city, mountains, cultural, island, etc.)

**Response (200)**: List of destinations in the category

---

## Available Categories

- `beach` - Beach destinations
- `city` - Urban destinations
- `mountains` - Mountain destinations
- `cultural` - Cultural/historical destinations
- `island` - Island destinations
- `romantic` - Romantic destinations
- `adventure` - Adventure destinations
- `nature` - Natural attractions
- `historical` - Historical sites
- `modern` - Modern cities
- `luxury` - Luxury destinations
- `spiritual` - Spiritual/religious sites
- `entertainment` - Entertainment hubs

---

## Available Tags

Common tags include:
- `romantic`, `family-friendly`, `adventure`, `budget`, `luxury`
- `food`, `nightlife`, `shopping`, `art`, `museums`
- `hiking`, `surfing`, `skiing`, `diving`, `photography`
- `beaches`, `temples`, `architecture`, `wildlife`, `wine`
- `cultural`, `historical`, `modern`, `tropical`, `urban`

---
