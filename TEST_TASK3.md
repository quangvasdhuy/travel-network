# Task 3 Testing Guide - Authentication System

## Prerequisites

- Tasks 1 & 2 completed
- Server running: `npm run dev`
- Database initialized: `npm run db:init`

## API Endpoints to Test

Base URL: `http://localhost:3000`

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/register` | POST | No | Register new user |
| `/api/auth/login` | POST | No | Login user |
| `/api/auth/refresh` | POST | No | Refresh access token |
| `/api/auth/me` | GET | Yes | Get current user |
| `/api/auth/logout` | POST | Yes | Logout user |
| `/api/auth/verify-email` | POST | No | Verify email with token |
| `/api/auth/test-protected` | GET | Yes | Test protected route |

## Testing with PowerShell

### Test 1: User Registration

```powershell
$body = @{
    email = "alice@example.com"
    username = "alice_traveler"
    password = "SecurePass123"
    firstName = "Alice"
    lastName = "Johnson"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" | Select-Object -Expand Content
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-...",
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
      "createdAt": "2024-..."
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

**Save the accessToken for next tests!**

### Test 2: User Login

```powershell
$body = @{
    emailOrUsername = "alice_traveler"
    password = "SecurePass123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" | Select-Object -Expand Content
```

**Expected Response (200):** Same structure as registration

### Test 3: Get Current User (Protected Route)

```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/me" `
    -Method GET `
    -Headers @{Authorization = "Bearer $token"} | Select-Object -Expand Content
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-...",
      "email": "alice@example.com",
      "username": "alice_traveler",
      "profile": {...},
      "status": "active"
    }
  }
}
```

### Test 4: Test Protected Route

```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/test-protected" `
    -Method GET `
    -Headers @{Authorization = "Bearer $token"} | Select-Object -Expand Content
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "This is a protected route",
    "user": {
      "id": "550e8400-...",
      "email": "alice@example.com",
      "username": "alice_traveler",
      ...
    }
  }
}
```

### Test 5: Refresh Token

```powershell
$body = @{
    refreshToken = "YOUR_REFRESH_TOKEN_HERE"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/refresh" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" | Select-Object -Expand Content
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "new_token...",
      "refreshToken": "new_refresh_token...",
      "expiresIn": "24h"
    }
  },
  "message": "Token refreshed successfully"
}
```

### Test 6: Logout

```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/logout" `
    -Method POST `
    -Headers @{Authorization = "Bearer $token"} | Select-Object -Expand Content
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Validation Tests

### Test 7: Invalid Email Format

```powershell
$body = @{
    email = "invalid-email"
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "statusCode": 400,
    "details": [
      {
        "field": "body.email",
        "message": "Please provide a valid email address"
      }
    ]
  }
}
```

### Test 8: Short Password

```powershell
$body = @{
    email = "test@example.com"
    username = "testuser"
    password = "short"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Expected Response (400):** Validation error for password length

### Test 9: Duplicate Email

Register the same user twice:

```powershell
# First registration
$body = @{
    email = "duplicate@example.com"
    username = "user1"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Second registration with same email
$body2 = @{
    email = "duplicate@example.com"
    username = "user2"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Body $body2 `
    -ContentType "application/json"
```

**Expected Response (409):**
```json
{
  "success": false,
  "error": {
    "message": "Email already registered",
    "statusCode": 409
  }
}
```

### Test 10: Duplicate Username

```powershell
# Register with duplicate username
$body = @{
    email = "different@example.com"
    username = "alice_traveler"  # Already exists
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Expected Response (409):** Username already taken

## Authentication Error Tests

### Test 11: Missing Token

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/me" `
    -Method GET
```

**Expected Response (401):**
```json
{
  "success": false,
  "error": {
    "message": "No token provided",
    "statusCode": 401
  }
}
```

### Test 12: Invalid Token

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/me" `
    -Method GET `
    -Headers @{Authorization = "Bearer invalid_token_here"}
```

**Expected Response (401):** Invalid token

### Test 13: Wrong Password

```powershell
$body = @{
    emailOrUsername = "alice_traveler"
    password = "WrongPassword"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Expected Response (401):** Invalid credentials

## Database Verification

### Verify User Created in Couchbase

1. Open Couchbase Web Console: http://localhost:8091
2. Navigate to **Query** tab
3. Run query:

```sql
SELECT u.id, u.email, u.username, u.profile, u.createdAt, u.status
FROM travel_users u
WHERE u.type = 'user' AND u.email = 'alice@example.com'
```

**Expected:** User document with hashed password, NOT plain text

### Verify Password is Hashed

```sql
SELECT u.passwordHash
FROM travel_users u
WHERE u.type = 'user' AND u.email = 'alice@example.com'
```

**Expected:** Hash starting with `$2a$10$` (bcrypt hash)

### Check Last Login Update

Login, then verify:

```sql
SELECT u.lastLoginAt
FROM travel_users u
WHERE u.type = 'user' AND u.email = 'alice@example.com'
```

**Expected:** Recent timestamp after login

## JWT Token Verification

You can decode JWT tokens at https://jwt.io/ to verify:

1. Copy your access token
2. Paste into jwt.io decoder
3. Verify payload contains:
   - `userId`: Your user ID
   - `type`: "access"
   - `iat`: Issued at timestamp
   - `exp`: Expiration timestamp

## Success Criteria

✅ **Task 3 is complete when:**

1. **Registration**:
   - Users can register with email, username, password ✓
   - Passwords are hashed with bcrypt ✓
   - Duplicate emails/usernames are rejected ✓
   - Input validation works ✓

2. **Login**:
   - Users can login with email or username ✓
   - Wrong password is rejected ✓
   - Last login timestamp is updated ✓
   - JWT tokens are returned ✓

3. **Authentication**:
   - JWT tokens are generated correctly ✓
   - Protected routes require valid token ✓
   - Invalid/missing tokens are rejected ✓
   - User data is attached to request ✓

4. **Token Refresh**:
   - Refresh tokens can generate new access tokens ✓
   - Invalid refresh tokens are rejected ✓

5. **Middleware**:
   - `authenticate` middleware works ✓
   - `optionalAuth` middleware exists ✓
   - `requireOwnership` helper exists ✓

6. **Validation**:
   - Input validation with Joi works ✓
   - Validation errors are user-friendly ✓

7. **Security**:
   - Passwords are never returned in responses ✓
   - JWT secret is configurable ✓
   - Tokens have expiration ✓

## Files Created

```
src/
├── middleware/
│   ├── auth.js ✓         # Authentication middleware
│   └── validation.js ✓   # Input validation
├── routes/
│   └── auth.js ✓         # Auth endpoints
├── services/
│   └── authService.js ✓  # Auth business logic
└── server.js (updated) ✓ # Auth routes registered
```

## Next Steps

- ✅ Task 1: Server & DB Connection
- ✅ Task 2: Database Schema
- ✅ Task 3: Authentication
- ⏭️ Task 4: User Profile Management
- ⏭️ Task 5: Destination Management

---

**Note**: Save your access tokens during testing as you'll need them for subsequent protected route tests!
