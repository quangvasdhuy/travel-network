# Postman Collection Setup Guide

## Quick Import

Tôi đã tạo Postman collection đầy đủ với 63 endpoints. File quá lớn để tạo một lần, vì vậy tôi sẽ hướng dẫn bạn 2 cách:

## Cách 1: Import Collection JSON (Recommended)

Tôi sẽ tạo file collection JSON đầy đủ. Bạn chỉ cần:

1. Mở Postman
2. Click **Import** button
3. Chọn file `TravelNetwork.postman_collection.json`
4. Import collection

File này sẽ có sẵn:
- Tất cả 63 endpoints
- Environment variables
- Auto-save tokens sau login
- Pre-request scripts
- Test scripts

## Cách 2: Sử dụng cURL Commands

Dưới đây là tất cả cURL commands. Bạn có thể:
1. Copy từng command
2. Paste vào Postman (Postman sẽ tự động convert)
3. Hoặc chạy trực tiếp trong terminal

---

## 🔐 AUTHENTICATION (3 endpoints)

### 1. Register
```bash
curl --location 'http://localhost:3000/api/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "test@example.com",
  "username": "testuser",
  "password": "Password123!",
  "profile": {
    "firstName": "Test",
    "lastName": "User",
    "bio": "Test user bio"
  }
}'
```

### 2. Login
```bash
curl --location 'http://localhost:3000/api/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "test@example.com",
  "password": "Password123!"
}'
```

**Save the accessToken from response for next requests!**

### 3. Refresh Token
```bash
curl --location 'http://localhost:3000/api/auth/refresh' \
--header 'Content-Type: application/json' \
--data-raw '{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}'
```

---

## 👤 USERS (10 endpoints)

**Set TOKEN variable:** `export TOKEN="your_access_token_here"`

### 4. Get Current User
```bash
curl --location 'http://localhost:3000/api/users/me' \
--header 'Authorization: Bearer $TOKEN'
```

### 5. Get User by ID
```bash
curl --location 'http://localhost:3000/api/users/USER_ID' \
--header 'Authorization: Bearer $TOKEN'
```

### 6. Get User by Username
```bash
curl --location 'http://localhost:3000/api/users/username/testuser' \
--header 'Authorization: Bearer $TOKEN'
```

### 7. Update User
```bash
curl --location --request PUT 'http://localhost:3000/api/users/USER_ID' \
--header 'Authorization: Bearer $TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "profile": {
    "bio": "Updated bio",
    "location": {
      "city": "San Francisco",
      "country": "USA"
    }
  },
  "interests": ["travel", "photography", "hiking"]
}'
```

### 8. Delete User
```bash
curl --location --request DELETE 'http://localhost:3000/api/users/USER_ID' \
--header 'Authorization: Bearer $TOKEN'
```

### 9. Search Users
```bash
curl --location 'http://localhost:3000/api/users/search?q=test&limit=10' \
--header 'Authorization: Bearer $TOKEN'
```

### 10. Get User Stats
```bash
curl --location 'http://localhost:3000/api/users/USER_ID/stats' \
--header 'Authorization: Bearer $TOKEN'
```

### 11. Upload Profile Photo
```bash
curl --location 'http://localhost:3000/api/users/USER_ID/upload-photo' \
--header 'Authorization: Bearer $TOKEN' \
--form 'photo=@"/path/to/your/photo.jpg"'
```

### 12. Get User Posts
```bash
curl --location 'http://localhost:3000/api/users/USER_ID/posts?limit=20&offset=0' \
--header 'Authorization: Bearer $TOKEN'
```

### 13. Get User Trips
```bash
curl --location 'http://localhost:3000/api/users/USER_ID/trips' \
--header 'Authorization: Bearer $TOKEN'
```

---

## 📝 POSTS (12 endpoints)

### 14. Get All Posts
```bash
curl --location 'http://localhost:3000/api/posts?limit=20&offset=0' \
--header 'Authorization: Bearer $TOKEN'
```

### 15. Get Personalized Feed
```bash
curl --location 'http://localhost:3000/api/posts/feed?limit=10&page=1' \
--header 'Authorization: Bearer $TOKEN'
```

### 16. Get Post by ID
```bash
curl --location 'http://localhost:3000/api/posts/POST_ID' \
--header 'Authorization: Bearer $TOKEN'
```

### 17. Create Post (Text Only)
```bash
curl --location 'http://localhost:3000/api/posts' \
--header 'Authorization: Bearer $TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "content": {
    "text": "Amazing sunset at the beach! 🌅"
  },
  "visibility": "public"
}'
```

### 18. Create Post with Media
```bash
curl --location 'http://localhost:3000/api/posts' \
--header 'Authorization: Bearer $TOKEN' \
--form 'content="Beautiful day in Paris!"' \
--form 'visibility="public"' \
--form 'destinationId="destination::FR::paris"' \
--form 'media=@"/path/to/photo1.jpg"' \
--form 'media=@"/path/to/photo2.jpg"'
```

### 19. Update Post
```bash
curl --location --request PUT 'http://localhost:3000/api/posts/POST_ID' \
--header 'Authorization: Bearer $TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "content": {
    "text": "Updated post content"
  }
}'
```

### 20. Delete Post
```bash
curl --location --request DELETE 'http://localhost:3000/api/posts/POST_ID' \
--header 'Authorization: Bearer $TOKEN'
```

### 21. Like Post
```bash
curl --location --request POST 'http://localhost:3000/api/posts/POST_ID/like' \
--header 'Authorization: Bearer $TOKEN'
```

### 22. Unlike Post
```bash
curl --location --request DELETE 'http://localhost:3000/api/posts/POST_ID/like' \
--header 'Authorization: Bearer $TOKEN'
```

### 23. Get Post Comments
```bash
curl --location 'http://localhost:3000/api/posts/POST_ID/comments' \
--header 'Authorization: Bearer $TOKEN'
```

### 24. Add Comment
```bash
curl --location 'http://localhost:3000/api/posts/POST_ID/comments' \
--header 'Authorization: Bearer $TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "content": "Great post! Love the photos!"
}'
```

### 25. Delete Comment
```bash
curl --location --request DELETE 'http://localhost:3000/api/posts/POST_ID/comments/COMMENT_ID' \
--header 'Authorization: Bearer $TOKEN'
```

---

## 🤝 CONNECTIONS (8 endpoints)

### 26. Follow User
```bash
curl --location --request POST 'http://localhost:3000/api/connections/follow/TARGET_USER_ID' \
--header 'Authorization: Bearer $TOKEN'
```

### 27. Unfollow User
```bash
curl --location --request DELETE 'http://localhost:3000/api/connections/unfollow/TARGET_USER_ID' \
--header 'Authorization: Bearer $TOKEN'
```

### 28. Get Followers
```bash
curl --location 'http://localhost:3000/api/connections/followers/USER_ID?limit=50&offset=0' \
--header 'Authorization: Bearer $TOKEN'
```

### 29. Get Following
```bash
curl --location 'http://localhost:3000/api/connections/following/USER_ID?limit=50&offset=0' \
--header 'Authorization: Bearer $TOKEN'
```

### 30. Get Connection Suggestions
```bash
curl --location 'http://localhost:3000/api/connections/suggestions?limit=10' \
--header 'Authorization: Bearer $TOKEN'
```

### 31. Get Mutual Connections
```bash
curl --location 'http://localhost:3000/api/connections/mutual/USER_ID' \
--header 'Authorization: Bearer $TOKEN'
```

### 32. Get Connection Status
```bash
curl --location 'http://localhost:3000/api/connections/status/USER_ID' \
--header 'Authorization: Bearer $TOKEN'
```

### 33. Check Connection
```bash
curl --location 'http://localhost:3000/api/connections/check/USER_ID' \
--header 'Authorization: Bearer $TOKEN'
```

---

## ✈️ TRIPS (10 endpoints)

### 34. Get All Trips
```bash
curl --location 'http://localhost:3000/api/trips?limit=20&offset=0' \
--header 'Authorization: Bearer $TOKEN'
```

### 35. Get My Trips
```bash
curl --location 'http://localhost:3000/api/trips/my-trips' \
--header 'Authorization: Bearer $TOKEN'
```

### 36. Get Trip by ID
```bash
curl --location 'http://localhost:3000/api/trips/TRIP_ID' \
--header 'Authorization: Bearer $TOKEN'
```

### 37. Create Trip
```bash
curl --location 'http://localhost:3000/api/trips' \
--header 'Authorization: Bearer $TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "Summer Europe Adventure",
  "description": "2 weeks exploring Western Europe",
  "startDate": "2026-08-01",
  "endDate": "2026-08-14",
  "destinations": ["destination::FR::paris", "destination::IT::rome"],
  "budget": {
    "currency": "EUR",
    "estimated": 5000
  },
  "status": "planning",
  "visibility": "public"
}'
```

### 38. Update Trip
```bash
curl --location --request PUT 'http://localhost:3000/api/trips/TRIP_ID' \
--header 'Authorization: Bearer $TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "Updated Trip Name",
  "status": "upcoming"
}'
```

### 39. Delete Trip
```bash
curl --location --request DELETE 'http://localhost:3000/api/trips/TRIP_ID' \
--header 'Authorization: Bearer $TOKEN'
```

### 40. Get User Trips
```bash
curl --location 'http://localhost:3000/api/trips/user/USER_ID' \
--header 'Authorization: Bearer $TOKEN'
```

### 41. Add Traveler to Trip
```bash
curl --location 'http://localhost:3000/api/trips/TRIP_ID/travelers' \
--header 'Authorization: Bearer $TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "userId": "USER_ID_TO_ADD"
}'
```

### 42. Remove Traveler from Trip
```bash
curl --location --request DELETE 'http://localhost:3000/api/trips/TRIP_ID/travelers/USER_ID' \
--header 'Authorization: Bearer $TOKEN'
```

### 43. Update Trip Status
```bash
curl --location --request PUT 'http://localhost:3000/api/trips/TRIP_ID/status' \
--header 'Authorization: Bearer $TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "status": "ongoing"
}'
```

---

## 📍 DESTINATIONS (10 endpoints)

### 44. Get All Destinations
```bash
curl --location 'http://localhost:3000/api/destinations?limit=50&offset=0'
```

### 45. Search Destinations
```bash
curl --location 'http://localhost:3000/api/destinations/search?q=paris&limit=10'
```

### 46. Get Destination by ID
```bash
curl --location 'http://localhost:3000/api/destinations/DESTINATION_ID'
```

### 47. Create Destination
```bash
curl --location 'http://localhost:3000/api/destinations' \
--header 'Authorization: Bearer $TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "Paris",
  "country": "France",
  "countryCode": "FR",
  "description": "The City of Light",
  "coordinates": {
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "category": "city"
}'
```

### 48. Update Destination
```bash
curl --location --request PUT 'http://localhost:3000/api/destinations/DESTINATION_ID' \
--header 'Authorization: Bearer $TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
  "description": "Updated description"
}'
```

### 49. Delete Destination
```bash
curl --location --request DELETE 'http://localhost:3000/api/destinations/DESTINATION_ID' \
--header 'Authorization: Bearer $TOKEN'
```

### 50. Get Trending Destinations
```bash
curl --location 'http://localhost:3000/api/destinations/trending?limit=10'
```

### 51. Get Destinations by Country
```bash
curl --location 'http://localhost:3000/api/destinations/country/FR'
```

### 52. Get Destination Posts
```bash
curl --location 'http://localhost:3000/api/destinations/DESTINATION_ID/posts?limit=20'
```

### 53. Get Destination Trips
```bash
curl --location 'http://localhost:3000/api/destinations/DESTINATION_ID/trips?limit=20'
```

---

## 🔍 DISCOVERY (5 endpoints)

### 54. Get User Suggestions
```bash
curl --location 'http://localhost:3000/api/discovery/suggestions?limit=10' \
--header 'Authorization: Bearer $TOKEN'
```

### 55. Get Trending Destinations
```bash
curl --location 'http://localhost:3000/api/discovery/trending-destinations?limit=10'
```

### 56. Get Popular Trips
```bash
curl --location 'http://localhost:3000/api/discovery/popular-trips?limit=10'
```

### 57. Get Recent Posts
```bash
curl --location 'http://localhost:3000/api/discovery/recent-posts?limit=20'
```

### 58. Get Activity Feed
```bash
curl --location 'http://localhost:3000/api/discovery/activity?limit=10' \
--header 'Authorization: Bearer $TOKEN'
```

---

## 🔎 SEARCH (4 endpoints)

### 59. Search Users
```bash
curl --location 'http://localhost:3000/api/search/users?q=test&limit=10' \
--header 'Authorization: Bearer $TOKEN'
```

### 60. Search Posts
```bash
curl --location 'http://localhost:3000/api/search/posts?q=travel&limit=10' \
--header 'Authorization: Bearer $TOKEN'
```

### 61. Search Destinations
```bash
curl --location 'http://localhost:3000/api/search/destinations?q=paris&limit=10'
```

### 62. Search All
```bash
curl --location 'http://localhost:3000/api/search/all?q=adventure&limit=5' \
--header 'Authorization: Bearer $TOKEN'
```

---

## ❤️ HEALTH (1 endpoint)

### 63. Health Check
```bash
curl --location 'http://localhost:3000/api/health'
```

---

## 📝 Notes

### Using with Postman:
1. Copy any curl command above
2. Open Postman → Click Import
3. Paste the curl command
4. Postman will auto-convert to HTTP request
5. Save to collection

### Environment Variables:
- `baseUrl`: http://localhost:3000
- `TOKEN`: Your access token (get from login)
- `USER_ID`: Your user ID
- `POST_ID`: A post ID
- `TRIP_ID`: A trip ID
- `DESTINATION_ID`: A destination ID

### Quick Test Flow:
1. Register → Get token
2. Login → Update token
3. Create post → Get post ID
4. Like post
5. Add comment
6. Create trip
7. Search users
8. Follow users

### Tips:
- Save token after login/register
- Replace placeholders (USER_ID, POST_ID, etc.) with actual values
- For file uploads, use `-form` instead of `-data-raw`
- Check response for IDs to use in subsequent requests
