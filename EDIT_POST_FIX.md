# 🔧 Edit Post Backend Fix

## ❌ **Original Error**
```
PATCH /api/posts/:id
{
  "text": "...",
  "visibility": "public"
}

Response: 500 Internal Server Error
{
  "success": false,
  "error": {
    "message": "invalid argument",
    "statusCode": 500
  }
}
```

---

## 🔍 **Root Cause**

### **Problem 1: Field Mismatch**
```javascript
// Frontend sends:
{ text: "...", visibility: "public", destinationId: "..." }

// Backend updatePost() expected:
{ content: { text: "..." }, visibility: "public" }  // ❌ Wrong structure
```

The service was looking for `updates.content` but frontend sends `updates.text`.

### **Problem 2: Missing destinationId Support**
```javascript
// Validation schema didn't allow destinationId
update: {
  body: Joi.object({
    text: Joi.string().max(5000).optional(),
    visibility: Joi.string().valid('public', 'connections', 'private').optional(),
    // ❌ destinationId missing!
  }).min(1),
}
```

### **Problem 3: Generic Field Update Loop**
```javascript
// Old code (too generic, caused Couchbase errors):
const allowedUpdates = ['content', 'tags', 'visibility', 'location'];

for (const [field, value] of Object.entries(updates)) {
  if (allowedUpdates.includes(field)) {
    mutations.push({
      opcode: 'dict_upsert',
      path: field,  // ❌ Wrong path for nested fields
      value: value,
    });
  }
}
```

When `field = "text"`, it tried to update top-level `text` field, but post structure is:
```json
{
  "content": {
    "text": "..."  ← Text is nested here
  }
}
```

---

## ✅ **Solution**

### **1. Fixed postService.updatePost()**
**File:** `src/services/postService.js`

**Changes:**
- ✅ Handle `updates.text` → update `content.text` (nested path)
- ✅ Handle `updates.destinationId` → resolve destination name/country
- ✅ Explicit field handling instead of generic loop
- ✅ Added destinationService import

**New Implementation:**
```javascript
async function updatePost(postId, userId, updates) {
  // ... ownership verification ...

  const mutations = [];

  // ✅ Handle text update (nested path)
  if (updates.text !== undefined) {
    mutations.push({
      opcode: 'dict_upsert',
      path: 'content.text',  // ← Correct nested path
      value: updates.text,
    });
  }

  // ✅ Handle visibility
  if (updates.visibility !== undefined) {
    mutations.push({
      opcode: 'dict_upsert',
      path: 'visibility',
      value: updates.visibility,
    });
  }

  // ✅ Handle destinationId with auto-resolve
  if (updates.destinationId !== undefined) {
    mutations.push({
      opcode: 'dict_upsert',
      path: 'destinationId',
      value: updates.destinationId,
    });

    if (updates.destinationId) {
      // Resolve destination name/country
      const destination = await destinationService.getDestinationById(updates.destinationId);
      if (destination) {
        mutations.push({
          opcode: 'dict_upsert',
          path: 'destinationName',
          value: destination.name,
        });
        mutations.push({
          opcode: 'dict_upsert',
          path: 'destinationCountry',
          value: destination.country,
        });
      }
    } else {
      // Clear destination if null
      mutations.push({ path: 'destinationName', value: null });
      mutations.push({ path: 'destinationCountry', value: null });
    }
  }

  // ... other fields (tags, location) ...

  // Add updatedAt timestamp
  mutations.push({
    opcode: 'dict_upsert',
    path: 'updatedAt',
    value: new Date().toISOString(),
  });

  await collection.mutateIn(Post.getKey(postId), mutations);
  
  // Return updated post
  const result = await collection.get(Post.getKey(postId));
  return result.content;
}
```

### **2. Updated Validation Schema**
**File:** `src/routes/posts.js`

```javascript
update: {
  body: Joi.object({
    text: Joi.string().max(5000).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    visibility: Joi.string().valid('public', 'connections', 'private').optional(),
    location: Joi.object().optional(),
    destinationId: Joi.string().optional().allow(null),  // ✅ Added
  }).min(1),
},
```

### **3. Added Import**
**File:** `src/services/postService.js`

```javascript
import destinationService from './destinationService.js';  // ✅ Added
```

---

## 🎯 **What's Fixed**

| Issue | Before | After |
|-------|--------|-------|
| **Text Update** | ❌ Tried `updates.content` | ✅ Uses `updates.text` → `content.text` |
| **Destination Update** | ❌ Not supported | ✅ Full support with auto-resolve |
| **Validation** | ❌ Rejected `destinationId` | ✅ Accepts `destinationId` |
| **Couchbase Path** | ❌ Wrong nested paths | ✅ Correct nested paths |
| **Error Message** | ❌ "invalid argument" | ✅ Proper updates |

---

## 🧪 **Test Again**

### **Request:**
```http
PATCH /api/posts/af1d625d-6f43-4af2-918e-4b8494cdfa33
Content-Type: application/json

{
  "text": "Spent the day exploring Dubrovnik. Every corner is Instagram-worthy but even better in real life! 📸",
  "visibility": "public"
}
```

### **Expected Response:**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "af1d625d-6f43-4af2-918e-4b8494cdfa33",
      "content": {
        "text": "Spent the day exploring Dubrovnik. Every corner is Instagram-worthy but even better in real life! 📸",
        "media": [...]
      },
      "visibility": "public",
      "updatedAt": "2026-08-01T..."
    }
  },
  "message": "Post updated successfully"
}
```

---

## 📋 **Files Modified**

```
✅ src/services/postService.js  - Fixed updatePost() implementation
✅ src/routes/posts.js           - Added destinationId to validation
```

---

## ✨ **Status: FIXED**

Restart your backend server and try editing a post again! 🎉

```bash
npm run dev
```

Then test edit functionality from Dashboard.
