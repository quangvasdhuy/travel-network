// Script to generate complete Postman collection
import fs from 'fs';

const collection = {
  info: {
    name: "Travel Network API - Complete",
    description: "Complete API collection with all 63 endpoints",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  auth: {
    type: "bearer",
    bearer: [{ key: "token", value: "{{accessToken}}", type: "string" }]
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:3000", type: "string" },
    { key: "accessToken", value: "", type: "string" },
    { key: "refreshToken", value: "", type: "string" },
    { key: "userId", value: "", type: "string" },
    { key: "postId", value: "", type: "string" },
    { key: "tripId", value: "", type: "string" },
    { key: "destinationId", value: "", type: "string" },
    { key: "commentId", value: "", type: "string" }
  ],
  item: []
};

// Helper function to create request
const createRequest = (name, method, path, body = null, noAuth = false, isFormData = false) => {
  const request = {
    name,
    request: {
      method,
      header: [],
      url: {
        raw: `{{baseUrl}}${path}`,
        host: ["{{baseUrl}}"],
        path: path.split('/').filter(p => p)
      }
    }
  };

  if (noAuth) {
    request.request.auth = { type: "noauth" };
  }

  if (body) {
    if (isFormData) {
      request.request.body = {
        mode: "formdata",
        formdata: body
      };
    } else {
      request.request.body = {
        mode: "raw",
        raw: JSON.stringify(body, null, 2),
        options: { raw: { language: "json" } }
      };
    }
  }

  return request;
};

// 1. Authentication
collection.item.push({
  name: "1. Authentication",
  item: [
    {
      ...createRequest("Register", "POST", "/api/auth/register", {
        email: "test@example.com",
        username: "testuser",
        password: "Password123!",
        profile: { firstName: "Test", lastName: "User" }
      }, true),
      event: [{
        listen: "test",
        script: {
          exec: [
            "if (pm.response.code === 201) {",
            "    const res = pm.response.json();",
            "    pm.collectionVariables.set('userId', res.data.user.id);",
            "    pm.collectionVariables.set('accessToken', res.data.tokens.accessToken);",
            "    pm.collectionVariables.set('refreshToken', res.data.tokens.refreshToken);",
            "}"
          ]
        }
      }]
    },
    {
      ...createRequest("Login", "POST", "/api/auth/login", {
        email: "test@example.com",
        password: "Password123!"
      }, true),
      event: [{
        listen: "test",
        script: {
          exec: [
            "if (pm.response.code === 200) {",
            "    const res = pm.response.json();",
            "    pm.collectionVariables.set('userId', res.data.user.id);",
            "    pm.collectionVariables.set('accessToken', res.data.tokens.accessToken);",
            "    pm.collectionVariables.set('refreshToken', res.data.tokens.refreshToken);",
            "}"
          ]
        }
      }]
    },
    createRequest("Refresh Token", "POST", "/api/auth/refresh", {
      refreshToken: "{{refreshToken}}"
    }, true)
  ]
});

// 2. Users
collection.item.push({
  name: "2. Users",
  item: [
    createRequest("Get Current User", "GET", "/api/users/me"),
    createRequest("Get User by ID", "GET", "/api/users/{{userId}}"),
    createRequest("Get User by Username", "GET", "/api/users/username/testuser"),
    createRequest("Update User", "PUT", "/api/users/{{userId}}", {
      profile: {
        bio: "Updated bio",
        location: { city: "San Francisco", country: "USA" }
      },
      interests: ["travel", "photography"]
    }),
    createRequest("Delete User", "DELETE", "/api/users/{{userId}}"),
    createRequest("Search Users", "GET", "/api/users/search?q=test&limit=10"),
    createRequest("Get User Stats", "GET", "/api/users/{{userId}}/stats"),
    createRequest("Get User Posts", "GET", "/api/users/{{userId}}/posts?limit=20"),
    createRequest("Get User Trips", "GET", "/api/users/{{userId}}/trips")
  ]
});

// 3. Posts
collection.item.push({
  name: "3. Posts",
  item: [
    createRequest("Get All Posts", "GET", "/api/posts?limit=20"),
    {
      ...createRequest("Get Feed", "GET", "/api/posts/feed?limit=10&page=1"),
      event: [{
        listen: "test",
        script: {
          exec: [
            "if (pm.response.code === 200 && pm.response.json().data.posts.length > 0) {",
            "    pm.collectionVariables.set('postId', pm.response.json().data.posts[0].id);",
            "}"
          ]
        }
      }]
    },
    createRequest("Get Post by ID", "GET", "/api/posts/{{postId}}"),
    {
      ...createRequest("Create Post", "POST", "/api/posts", {
        content: { text: "Amazing sunset! 🌅" },
        visibility: "public"
      }),
      event: [{
        listen: "test",
        script: {
          exec: [
            "if (pm.response.code === 201) {",
            "    pm.collectionVariables.set('postId', pm.response.json().data.post.id);",
            "}"
          ]
        }
      }]
    },
    createRequest("Update Post", "PUT", "/api/posts/{{postId}}", {
      content: { text: "Updated content" }
    }),
    createRequest("Delete Post", "DELETE", "/api/posts/{{postId}}"),
    createRequest("Like Post", "POST", "/api/posts/{{postId}}/like"),
    createRequest("Unlike Post", "DELETE", "/api/posts/{{postId}}/like"),
    createRequest("Get Comments", "GET", "/api/posts/{{postId}}/comments"),
    {
      ...createRequest("Add Comment", "POST", "/api/posts/{{postId}}/comments", {
        content: "Great post!"
      }),
      event: [{
        listen: "test",
        script: {
          exec: [
            "if (pm.response.code === 201) {",
            "    pm.collectionVariables.set('commentId', pm.response.json().data.comment.id);",
            "}"
          ]
        }
      }]
    },
    createRequest("Delete Comment", "DELETE", "/api/posts/{{postId}}/comments/{{commentId}}"),
    createRequest("Get Posts by User", "GET", "/api/posts/user/{{userId}}")
  ]
});

// 4. Connections
collection.item.push({
  name: "4. Connections",
  item: [
    createRequest("Follow User", "POST", "/api/connections/follow/{{userId}}"),
    createRequest("Unfollow User", "DELETE", "/api/connections/unfollow/{{userId}}"),
    createRequest("Get Followers", "GET", "/api/connections/followers/{{userId}}"),
    createRequest("Get Following", "GET", "/api/connections/following/{{userId}}"),
    createRequest("Get Suggestions", "GET", "/api/connections/suggestions?limit=10"),
    createRequest("Get Mutual Connections", "GET", "/api/connections/mutual/{{userId}}"),
    createRequest("Get Connection Status", "GET", "/api/connections/status/{{userId}}"),
    createRequest("Check Connection", "GET", "/api/connections/check/{{userId}}")
  ]
});

// 5. Trips
collection.item.push({
  name: "5. Trips",
  item: [
    createRequest("Get All Trips", "GET", "/api/trips?limit=20"),
    createRequest("Get My Trips", "GET", "/api/trips/my-trips"),
    createRequest("Get Trip by ID", "GET", "/api/trips/{{tripId}}"),
    {
      ...createRequest("Create Trip", "POST", "/api/trips", {
        name: "Summer Europe Adventure",
        description: "2 weeks exploring",
        startDate: "2026-08-01",
        endDate: "2026-08-14",
        status: "planning",
        visibility: "public",
        budget: { currency: "EUR", estimated: 5000 }
      }),
      event: [{
        listen: "test",
        script: {
          exec: [
            "if (pm.response.code === 201) {",
            "    pm.collectionVariables.set('tripId', pm.response.json().data.trip.id);",
            "}"
          ]
        }
      }]
    },
    createRequest("Update Trip", "PUT", "/api/trips/{{tripId}}", {
      name: "Updated Trip Name",
      status: "upcoming"
    }),
    createRequest("Delete Trip", "DELETE", "/api/trips/{{tripId}}"),
    createRequest("Get User Trips", "GET", "/api/trips/user/{{userId}}"),
    createRequest("Add Traveler", "POST", "/api/trips/{{tripId}}/travelers", {
      userId: "{{userId}}"
    }),
    createRequest("Remove Traveler", "DELETE", "/api/trips/{{tripId}}/travelers/{{userId}}"),
    createRequest("Update Trip Status", "PUT", "/api/trips/{{tripId}}/status", {
      status: "ongoing"
    })
  ]
});

// 6. Destinations
collection.item.push({
  name: "6. Destinations",
  item: [
    createRequest("Get All Destinations", "GET", "/api/destinations?limit=50", null, true),
    createRequest("Search Destinations", "GET", "/api/destinations/search?q=paris", null, true),
    createRequest("Get Destination by ID", "GET", "/api/destinations/{{destinationId}}", null, true),
    {
      ...createRequest("Create Destination", "POST", "/api/destinations", {
        name: "Paris",
        country: "France",
        countryCode: "FR",
        description: "City of Light",
        coordinates: { latitude: 48.8566, longitude: 2.3522 },
        category: "city"
      }),
      event: [{
        listen: "test",
        script: {
          exec: [
            "if (pm.response.code === 201) {",
            "    pm.collectionVariables.set('destinationId', pm.response.json().data.destination.id);",
            "}"
          ]
        }
      }]
    },
    createRequest("Update Destination", "PUT", "/api/destinations/{{destinationId}}", {
      description: "Updated description"
    }),
    createRequest("Delete Destination", "DELETE", "/api/destinations/{{destinationId}}"),
    createRequest("Get Trending", "GET", "/api/destinations/trending?limit=10", null, true),
    createRequest("Get by Country", "GET", "/api/destinations/country/FR", null, true),
    createRequest("Get Destination Posts", "GET", "/api/destinations/{{destinationId}}/posts"),
    createRequest("Get Destination Trips", "GET", "/api/destinations/{{destinationId}}/trips")
  ]
});

// 7. Discovery
collection.item.push({
  name: "7. Discovery",
  item: [
    createRequest("Get User Suggestions", "GET", "/api/discovery/suggestions?limit=10"),
    createRequest("Get Trending Destinations", "GET", "/api/discovery/trending-destinations?limit=10", null, true),
    createRequest("Get Popular Trips", "GET", "/api/discovery/popular-trips?limit=10", null, true),
    createRequest("Get Recent Posts", "GET", "/api/discovery/recent-posts?limit=20", null, true),
    createRequest("Get Activity Feed", "GET", "/api/discovery/activity?limit=10")
  ]
});

// 8. Search
collection.item.push({
  name: "8. Search",
  item: [
    createRequest("Search Users", "GET", "/api/search/users?q=test&limit=10"),
    createRequest("Search Posts", "GET", "/api/search/posts?q=travel&limit=10"),
    createRequest("Search Destinations", "GET", "/api/search/destinations?q=paris&limit=10", null, true),
    createRequest("Search All", "GET", "/api/search/all?q=adventure&limit=5")
  ]
});

// 9. Health
collection.item.push({
  name: "9. Health",
  item: [
    createRequest("Health Check", "GET", "/api/health", null, true)
  ]
});

// Write to file
fs.writeFileSync(
  'TravelNetwork-Complete.postman_collection.json',
  JSON.stringify(collection, null, 2)
);

console.log('✅ Postman collection generated: TravelNetwork-Complete.postman_collection.json');
console.log('📦 Total endpoints: 63');
console.log('📝 Import this file into Postman to get started!');
