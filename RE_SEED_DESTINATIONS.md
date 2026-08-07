# 🔧 URGENT: Re-seed Database để Fix Destination Search

## ❌ **Problem:**
API trả về **0 destinations** → Database chưa có destinations với format mới!

```bash
GET /api/destinations/search?q=paris
Response: { count: 0, destinations: [] }  # ❌ Empty!
```

---

## ✅ **Solution: Re-seed Database**

### **Step 1: Clear Old Data (Optional but Recommended)**

**Option A: Clear only destinations**
```javascript
// Run this in Couchbase Query Workbench:
DELETE FROM travel_trips d
WHERE d.type = 'destination'
```

**Option B: Full reset (clears everything)**
```bash
node src/scripts/clearData.js
```

---

### **Step 2: Run Seed Script**

```bash
# Make sure backend is running
# In a NEW terminal:

node src/scripts/seedRealisticData.js
```

**Expected output:**
```
Seeding 30 destinations...
✓ Created 30 destinations

Seeding 50 realistic users...
✓ Created 50 users

Seeding 100 realistic posts...
✓ Created 100 posts
...
```

---

### **Step 3: Verify Destinations Exist**

**Query in Couchbase:**
```sql
SELECT d.id, d.name, d.country, d.countryCode, d.slug
FROM travel_trips d
WHERE d.type = 'destination'
LIMIT 5
```

**Expected result:**
```json
[
  {
    "id": "destination::FR::paris",
    "name": "Paris",
    "country": "France",
    "countryCode": "FR",
    "slug": "paris"
  },
  {
    "id": "destination::JP::tokyo",
    "name": "Tokyo",
    "country": "Japan",
    "countryCode": "JP",
    "slug": "tokyo"
  }
]
```

---

### **Step 4: Test API Again**

**Browser test:**
```javascript
// Open browser console (F12)
fetch('http://localhost:3000/api/destinations/search?q=paris')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "destinations": [
      {
        "id": "destination::FR::paris",
        "name": "Paris",
        "country": "France",
        ...
      }
    ],
    "count": 1
  }
}
```

---

### **Step 5: Test in Frontend**

1. Open Create Post modal
2. Type "paris" in location search
3. Should see dropdown với **Paris, France** ✅

---

## 🔍 **Why This Happened:**

### **Old seed format (wrong):**
```javascript
{
  id: "paris",              // ❌ Wrong format
  name: "Paris",
  country: "France"
  // ❌ Missing: countryCode, slug
}

// Saved as: "destination::paris"  ← Wrong key format
```

### **New seed format (correct):**
```javascript
{
  id: "destination::FR::paris",  // ✅ Proper format
  name: "Paris",
  country: "France",
  countryCode: "FR",             // ✅ Required for search
  slug: "paris",                 // ✅ Required for search
  stats: {
    tripCount: 123               // ✅ For sorting
  }
}

// Saved as: "destination::FR::paris"  ← Correct!
```

**Search query needs `countryCode` and `slug` fields!**

---

## 🚨 **Common Issues:**

### **Issue 1: "Documents already exist"**
```
Error: Document already exists
```

**Solution:** Clear old data first
```bash
node src/scripts/clearData.js
```

---

### **Issue 2: "Bucket not found"**
```
Error: travel_trips bucket not found
```

**Solution:** Check .env
```bash
BUCKET_TRIPS=travel_trips
```

---

### **Issue 3: Seed script runs but destinations still not found**

**Debug query:**
```sql
-- Check what's actually in database
SELECT META(d).id, d.type, d.name, d.countryCode, d.slug
FROM travel_trips d
WHERE d.type = 'destination'
LIMIT 10
```

**If countryCode or slug is NULL:**
- Seed script didn't run with new version
- Git pull latest code
- Re-run seed

---

## 📋 **Quick Checklist:**

- [ ] Pull latest code (`git pull` if needed)
- [ ] Clear old data (`node src/scripts/clearData.js`)
- [ ] Run seed script (`node src/scripts/seedRealisticData.js`)
- [ ] Verify in Couchbase Query (see Step 3)
- [ ] Test API (`curl http://localhost:3000/api/destinations/search?q=paris`)
- [ ] Test frontend (Create Post → Search location)

---

## ✅ **Expected Final Result:**

**When you type "paris" in location search:**
```
┌─────────────────────────────┐
│ 🔍 Search location          │
│ paris                       │ ← You type this
├─────────────────────────────┤
│ ✓ Paris                     │ ← Should show this
│   France                    │
└─────────────────────────────┘
```

---

## 🎯 **Run This Now:**

```bash
# Step 1: Clear old data
node src/scripts/clearData.js

# Step 2: Seed new data
node src/scripts/seedRealisticData.js

# Step 3: Test
curl "http://localhost:3000/api/destinations/search?q=paris"
```

Should see destinations! 🎉
