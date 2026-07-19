# Task 4 Testing Guide - User Profile Management

## Prerequisites

- Tasks 1-3 completed
- Server running: `npm run dev`
- At least one user registered (from Task 3)
- Valid access token

## Setup for Testing

First, register a user and save the token:

```powershell
$body = @{
    email = "bob@example.com"
    username = "bob_explorer"
    password = "SecurePass123"
    firstName = "Bob"
    lastName = "Smith"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$data = $response.Content | ConvertFrom-Json
$token = $data.data.tokens.accessToken

Write-Host "Access Token: $token"
```

Save the token for subsequent requests!

## API Endpoints to Test

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users/me` | GET | Required | Get own profile |
| `/api/users/me` | PATCH | Required | Update own profile |
| `/api/users/me/photo` | POST | Required | Upload profile photo |
| `/api/users/me` | DELETE | Required | Delete account |
| `/api/users/:id` | GET | Optional | Get user by ID |
| `/api/users/username/:username` | GET | Optional | Get user by username |
| `/api/users/search` | GET | Optional | Search users |
| `/api/users/:id/stats` | GET | Optional | Get user stats |

---

## Test 1: Get Own Profile

```powershell
$token = "YOUR_ACCESS_TOKEN"

Invoke-WebRequest -Uri "http://localhost:3000/api/users/me" `
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
      "type": "user",
      "email": "bob@example.com",
      "username": "bob_explorer",
      "profile": {
        "firstName": "Bob",
        "lastName": "Smith",
        "bio": "",
        "profilePhoto": null,
        "location": {
          "city": "",
          "country": "",
          "coordinates": null
        },
        "dateOfBirth": null
      },
      "interests": [],
      "preferences": {
        "travelStyle": [],
        "languages": [],
        "privacySettings": {
          "profileVisibility": "public",
          "tripVisibility": "public",
          "showEmail": false
        }
      },
      "stats": {
        "tripCount": 0,
        "postCount": 0,
        "followerCount": 0,
        "followingCount": 0
      },
      "status": "active",
      "createdAt": "2024-...",
      "updatedAt": "2024-..."
    }
  }
}
```

---

## Test 2: Update Profile

```powershell
$token = "YOUR_ACCESS_TOKEN"

$updateBody = @{
    "profile.firstName" = "Robert"
    "profile.bio" = "Adventure seeker and photography enthusiast"
    "profile.location.city" = "San Francisco"
    "profile.location.country" = "USA"
    "interests" = @("hiking", "photography", "food", "culture")
    "preferences.travelStyle" = @("adventure", "cultural", "budget")
    "preferences.languages" = @("en", "es")
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/users/me" `
    -Method PATCH `
    -Body $updateBody `
    -Headers @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    } | Select-Object -Expand Content
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-...",
      "email": "bob@example.com",
      "username": "bob_explorer",
      "profile": {
        "firstName": "Robert",
        "lastName": "Smith",
        "bio": "Adventure seeker and photography enthusiast",
        "location": {
          "city": "San Francisco",
          "country": "USA",
          "coordinates": null
        }
      },
      "interests": ["hiking", "photography", "food", "culture"],
      "preferences": {
        "travelStyle": ["adventure", "cultural", "budget"],
        "languages": ["en", "es"],
        ...
      },
      "updatedAt": "2024-..." // Updated timestamp
    }
  },
  "message": "Profile updated successfully"
}
```

---

## Test 3: Upload Profile Photo

**PowerShell (multipart/form-data):**

```powershell
$token = "YOUR_ACCESS_TOKEN"
$photoPath = "C:\path\to\your\photo.jpg"

# Create form data
$form = @{
    photo = Get-Item -Path $photoPath
}

Invoke-WebRequest -Uri "http://localhost:3000/api/users/me/photo" `
    -Method POST `
    -Headers @{Authorization = "Bearer $token"} `
    -Form $form | Select-Object -Expand Content
```

**Alternative using curl (if installed):**

```bash
curl -X POST http://localhost:3000/api/users/me/photo \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "photo=@/path/to/photo.jpg"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-...",
      "username": "bob_explorer",
      "profile": {
        ...
        "profilePhoto": "/uploads/profiles/uuid-filename.jpg"
      },
      "updatedAt": "2024-..."
    },
    "photoUrl": "/uploads/profiles/uuid-filename.jpg"
  },
  "message": "Profile photo updated successfully"
}
```

**Verify photo is accessible:**

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/uploads/profiles/uuid-filename.jpg" `
    -OutFile "downloaded-photo.jpg"
```

The photo should download successfully!

---

## Test 4: Get User by ID (Public Profile)

```powershell
$userId = "550e8400-..."  # Use actual user ID from registration

Invoke-WebRequest -Uri "http://localhost:3000/api/users/$userId" `
    -Method GET | Select-Object -Expand Content
```

**Expected Response (200):** Public profile (no email, no sensitive data)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-...",
      "username": "bob_explorer",
      "profile": {
        "firstName": "Robert",
        "lastName": "Smith",
        "bio": "Adventure seeker...",
        "profilePhoto": "/uploads/profiles/...",
        "location": {
          "city": "San Francisco",
          "country": "USA"
        }
      },
      "interests": ["hiking", "photography", "food", "culture"],
      "preferences": {
        "travelStyle": ["adventure", "cultural", "budget"]
      },
      "stats": {
        "tripCount": 0,
        "postCount": 0,
        "followerCount": 0,
        "followingCount": 0
      },
      "createdAt": "2024-..."
    }
  }
}
```

**Note**: Email and other sensitive data are NOT included in public profile!

---

## Test 5: Get User by Username

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/users/username/bob_explorer" `
    -Method GET | Select-Object -Expand Content
```

**Expected Response (200):** Same as Test 4 (public profile)

---

## Test 6: Search Users

```powershell
# Search by username
Invoke-WebRequest -Uri "http://localhost:3000/api/users/search?q=bob" `
    -Method GET | Select-Object -Expand Content

# Search by location
Invoke-WebRequest -Uri "http://localhost:3000/api/users/search?q=francisco&limit=10" `
    -Method GET | Select-Object -Expand Content
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "550e8400-...",
        "username": "bob_explorer",
        "profile": {...},
        "interests": [...],
        "stats": {...}
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "count": 1
    }
  }
}
```

---

## Test 7: Get User Stats

```powershell
$userId = "550e8400-..."

Invoke-WebRequest -Uri "http://localhost:3000/api/users/$userId/stats" `
    -Method GET | Select-Object -Expand Content
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-...",
    "username": "bob_explorer",
    "stats": {
      "tripCount": 0,
      "postCount": 0,
      "followerCount": 0,
      "followingCount": 0
    },
    "createdAt": "2024-..."
  }
}
```

---

## Test 8: Update Privacy Settings

```powershell
$token = "YOUR_ACCESS_TOKEN"

$privacyBody = @{
    "preferences.privacySettings.profileVisibility" = "connections"
    "preferences.privacySettings.tripVisibility" = "private"
    "preferences.privacySettings.showEmail" = $false
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/users/me" `
    -Method PATCH `
    -Body $privacyBody `
    -Headers @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    } | Select-Object -Expand Content
```

**Expected Response (200):** Profile with updated privacy settings

---

## Error Tests

### Test 9: Upload Invalid File Type

```powershell
$token = "YOUR_ACCESS_TOKEN"
$filePath = "C:\path\to\document.pdf"  # Non-image file

$form = @{
    photo = Get-Item -Path $filePath
}

Invoke-WebRequest -Uri "http://localhost:3000/api/users/me/photo" `
    -Method POST `
    -Headers @{Authorization = "Bearer $token"} `
    -Form $form
```

**Expected Response (400):** Error about file type not allowed

### Test 10: Get Non-Existent User

```powershell
$fakeId = "00000000-0000-0000-0000-000000000000"

Invoke-WebRequest -Uri "http://localhost:3000/api/users/$fakeId" `
    -Method GET
```

**Expected Response (404):**
```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "statusCode": 404
  }
}
```

### Test 11: Update Profile Without Auth

```powershell
$updateBody = @{
    "profile.bio" = "Hacker trying to update profile"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/users/me" `
    -Method PATCH `
    -Body $updateBody `
    -ContentType "application/json"
```

**Expected Response (401):** No token provided

### Test 12: Search with Short Query

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/users/search?q=a" `
    -Method GET
```

**Expected Response (400):** Query must be at least 2 characters

---

## Test 13: Delete Account

```powershell
$token = "YOUR_ACCESS_TOKEN"

Invoke-WebRequest -Uri "http://localhost:3000/api/users/me" `
    -Method DELETE `
    -Headers @{Authorization = "Bearer $token"} | Select-Object -Expand Content
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Verify deletion:**
```powershell
# Try to get profile again
Invoke-WebRequest -Uri "http://localhost:3000/api/users/me" `
    -Method GET `
    -Headers @{Authorization = "Bearer $token"}
```

**Expected Response (404):** User not found (account marked as deleted)

---

## Database Verification

### Verify Profile Update in Couchbase

```sql
SELECT u.username, u.profile, u.interests, u.updatedAt
FROM travel_users u
WHERE u.type = 'user' AND u.username = 'bob_explorer'
```

### Verify Photo Path is Stored

```sql
SELECT u.username, u.profile.profilePhoto
FROM travel_users u
WHERE u.type = 'user' AND u.username = 'bob_explorer'
```

### Verify Soft Delete

```sql
SELECT u.username, u.status, u.updatedAt
FROM travel_users u
WHERE u.type = 'user' AND u.username = 'bob_explorer'
```

**Expected**: `status` = `"deleted"`

---

## Success Criteria

✅ **Task 4 is complete when:**

1. **Profile CRUD**:
   - Get own profile with full details ✓
   - Get public profile by ID ✓
   - Get public profile by username ✓
   - Update profile fields ✓
   - Soft delete account ✓

2. **Photo Upload**:
   - Upload profile photo ✓
   - File validation (type, size) ✓
   - Photo stored in filesystem ✓
   - Photo accessible via URL ✓

3. **Privacy**:
   - Public profiles don't expose email ✓
   - Own profile includes private data ✓
   - Privacy settings updatable ✓

4. **Search**:
   - Search users by username ✓
   - Search by location ✓
   - Pagination works ✓

5. **Statistics**:
   - Get user stats ✓

6. **Authorization**:
   - Only authenticated users can update profiles ✓
   - Users can only update their own profile ✓

## Files Created/Modified

```
src/
├── routes/
│   └── users.js ✓         # User endpoints
├── services/
│   └── userService.js ✓   # User business logic
├── server.js (updated) ✓  # User routes & static files
└── package.json (updated) ✓ # Added multer

uploads/
└── profiles/
    └── .gitkeep ✓         # Profile photos directory
```

---

**Status**: Ready for Task 5 - Destination Management
