# 🔍 Destination Search Not Working - Debug Guide

## 🐛 **Problems Reported:**

1. ❌ Destination search không hiển thị kết quả
2. ❌ Location/destination không hiển thị khi edit post

---

## ✅ **Fixes Applied:**

### **1. Fixed Edit Mode - Load Destination ID**

**Problem:** When editing, destination display bị missing vì thiếu `id` field.

**File:** `client/src/components/PostCreationModal.jsx`

**Before:**
```javascript
if (post.destinationName) {
  setSelectedDestination({
    name: post.destinationName,          // ❌ Missing id
    country: post.destinationCountry,
  });
}
```

**After:**
```javascript
if (post.destinationId && post.destinationName) {
  setSelectedDestination({
    id: post.destinationId,              // ✅ Added
    name: post.destinationName,
    country: post.destinationCountry,
  });
}
```

---

### **2. Added Debug Logging for Search**

**File:** `client/src/components/PostCreationModal.jsx`

```javascript
const searchDestinations = async (query) => {
  console.log('[PostModal] Searching destinations for:', query);
  const response = await destinationAPI.search(query);
  console.log('[PostModal] Search response:', response.data);
  const destinations = response.data.data?.destinations || response.data.data || [];
  console.log('[PostModal] Found destinations:', destinations.length);
  setDestinationResults(destinations);
};
```

---

## 🧪 **How to Test:**

### **Test 1: Check if Destinations Exist in Database**

Run query in Couchbase:
```sql
SELECT COUNT(*) as count
FROM travel_trips d
WHERE d.type = 'destination'
```

**Expected:** Should return count > 0 (at least 30 destinations from seed)

---

### **Test 2: Test Search API Directly**

```bash
curl "http://localhost:3000/api/destinations/search?q=paris"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "destinations": [
      {
        "id": "destination::FR::paris",
        "name": "Paris",
        "country": "France",
        "countryCode": "FR",
        ...
      }
    ],
    "query": "paris",
    "count": 1
  }
}
```

---

### **Test 3: Test in Frontend**

1. Open Dashboard
2. Click "Create Post"
3. In "Add Location" field, type: **"paris"**
4. Open browser console (F12)
5. Look for logs:
   ```
   [PostModal] Searching destinations for: paris
   [PostModal] Search response: { success: true, data: {...} }
   [PostModal] Found destinations: 1
   ```

---

## 🔍 **Possible Root Causes if Still Not Working:**

### **Issue 1: Destinations Not Seeded**

**Check:**
```sql
SELECT d.id, d.name, d.country
FROM travel_trips d
WHERE d.type = 'destination'
LIMIT 5
```

**If empty:** Run seed script:
```bash
node src/scripts/seedRealisticData.js
```

---

### **Issue 2: Wrong Bucket Name**

**Check `.env`:**
```bash
BUCKET_TRIPS=travel_trips
```

**Backend uses:**
```javascript
const bucketName = process.env.BUCKET_TRIPS || 'travel_trips';
```

---

### **Issue 3: Query Returns Wrong Structure**

**Current query:**
```sql
SELECT META(d).id as metaId, d.id, d.name, d.country, d.countryCode, d.slug, ...
FROM travel_trips d
WHERE d.type = 'destination'
  AND (LOWER(d.name) LIKE $query OR LOWER(d.country) LIKE $query)
```

**Returns:**
```json
[
  {
    "metaId": "destination::FR::paris",
    "id": "destination::FR::paris",  ← This is what we need
    "name": "Paris",
    ...
  }
]
```

---

### **Issue 4: Frontend Parsing Wrong**

**Check response structure:**

Backend sends:
```javascript
res.json({
  success: true,
  data: {
    destinations: [...],  // ← Array here
    query: "paris",
    count: 1
  }
});
```

Frontend expects:
```javascript
const destinations = response.data.data?.destinations  // ✅ Correct
```

---

## 🚀 **Next Steps to Debug:**

### **Step 1: Check Server Logs**

When you type in search box, you should see:
```
GET /api/destinations/search?q=paris
```

If you see **404** → Route not registered
If you see **500** → Query error

---

### **Step 2: Check Browser Console**

Open DevTools (F12) → Console tab

You should see:
```
[PostModal] Searching destinations for: paris
[PostModal] Search response: {...}
[PostModal] Found destinations: 1
```

If you see **error** → Check Network tab for API response

---

### **Step 3: Check Network Tab**

1. Open DevTools (F12) → Network tab
2. Type in destination search
3. Find request: `search?q=paris`
4. Click on it → Preview tab
5. Check response structure

**Expected:**
```json
{
  "success": true,
  "data": {
    "destinations": [...]
  }
}
```

**If you see `destinations: []`:** No data in database

---

## 🔧 **Quick Fixes:**

### **Fix 1: Re-seed Destinations**

```bash
# Stop server
# Run seed script
node src/scripts/seedRealisticData.js

# Restart server
npm run dev
```

---

### **Fix 2: Test Single Destination Manually**

```javascript
// In browser console on frontend:
fetch('http://localhost:3000/api/destinations/search?q=paris')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

### **Fix 3: Verify Bucket Connection**

```javascript
// Add to backend startup (src/server.js):
const testQuery = await cluster.query(`
  SELECT COUNT(*) as count
  FROM travel_trips d
  WHERE d.type = 'destination'
`);
console.log('[Server] Destinations in DB:', testQuery.rows[0].count);
```

---

## 📊 **Files Modified:**

```
✅ client/src/components/PostCreationModal.jsx
   - Fixed: Load destination ID when editing
   - Added: Debug logging for search
```

---

## ✨ **Status:**

- ✅ Edit mode destination display - FIXED
- 🔍 Search functionality - NEEDS TESTING

**Test theo steps trên và cho tôi biết:**
1. Có thấy logs trong console không?
2. API response trả về gì?
3. Có bao nhiêu destinations trong database?

