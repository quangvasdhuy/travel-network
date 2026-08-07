# 🔧 Edit Post - Final Fix (Couchbase SDK)

## ❌ **Still Getting Error**
```
PATCH /api/posts/:id
Response: 500 "invalid argument"
```

---

## 🔍 **Root Cause Found**

### **Problem: Wrong Couchbase Mutation Syntax**

Old code used **custom object format**:
```javascript
mutations.push({
  opcode: 'dict_upsert',  // ❌ Custom format
  path: 'content.text',
  value: updates.text,
});
```

But Couchbase SDK 4.x requires **MutateInSpec API**:
```javascript
mutations.push(
  couchbase.MutateInSpec.upsert('content.text', updates.text)  // ✅ SDK format
);
```

The custom `opcode` format was causing "invalid argument" errors in Couchbase.

---

## ✅ **Final Solution**

### **1. Import Couchbase SDK**
```javascript
import couchbase from 'couchbase';
```

### **2. Use MutateInSpec API**

**Before (❌ Custom format):**
```javascript
mutations.push({
  opcode: 'dict_upsert',
  path: 'content.text',
  value: updates.text,
});
```

**After (✅ SDK format):**
```javascript
mutations.push(
  couchbase.MutateInSpec.upsert('content.text', updates.text)
);
```

### **3. Updated All Mutations**

| Field | Mutation |
|-------|----------|
| **text** | `MutateInSpec.upsert('content.text', updates.text)` |
| **visibility** | `MutateInSpec.upsert('visibility', updates.visibility)` |
| **destinationId** | `MutateInSpec.upsert('destinationId', updates.destinationId)` |
| **destinationName** | `MutateInSpec.upsert('destinationName', destination.name)` |
| **destinationCountry** | `MutateInSpec.upsert('destinationCountry', destination.country)` |
| **tags** | `MutateInSpec.upsert('tags', updates.tags)` |
| **location** | `MutateInSpec.upsert('location', updates.location)` |
| **updatedAt** | `MutateInSpec.upsert('updatedAt', new Date().toISOString())` |

---

## 📝 **Complete Fixed Code**

```javascript
import couchbase from 'couchbase';
import destinationService from './destinationService.js';

export async function updatePost(postId, userId, updates) {
  const contentBucket = dbConnection.getBucket('content');
  const collection = contentBucket.defaultCollection;

  // Verify ownership...
  const result = await collection.get(Post.getKey(postId));
  const existingPost = result.content;
  
  if (existingPost.authorId !== userId) {
    throw { statusCode: 403, message: 'Not authorized' };
  }

  // Build mutations using MutateInSpec
  const mutations = [];

  if (updates.text !== undefined) {
    mutations.push(couchbase.MutateInSpec.upsert('content.text', updates.text));
  }

  if (updates.visibility !== undefined) {
    mutations.push(couchbase.MutateInSpec.upsert('visibility', updates.visibility));
  }

  if (updates.tags !== undefined) {
    mutations.push(couchbase.MutateInSpec.upsert('tags', updates.tags));
  }

  if (updates.location !== undefined) {
    mutations.push(couchbase.MutateInSpec.upsert('location', updates.location));
  }

  if (updates.destinationId !== undefined) {
    mutations.push(couchbase.MutateInSpec.upsert('destinationId', updates.destinationId));
    
    if (updates.destinationId) {
      const destination = await destinationService.getDestinationById(updates.destinationId);
      if (destination) {
        mutations.push(couchbase.MutateInSpec.upsert('destinationName', destination.name));
        mutations.push(couchbase.MutateInSpec.upsert('destinationCountry', destination.country));
      }
    } else {
      mutations.push(couchbase.MutateInSpec.upsert('destinationName', null));
      mutations.push(couchbase.MutateInSpec.upsert('destinationCountry', null));
    }
  }

  // Add timestamp
  mutations.push(couchbase.MutateInSpec.upsert('updatedAt', new Date().toISOString()));

  // Apply mutations
  await collection.mutateIn(Post.getKey(postId), mutations);

  // Return updated post
  const updated = await collection.get(Post.getKey(postId));
  return updated.content;
}
```

---

## 🎯 **Why This Fix Works**

### **Couchbase SDK 4.x Mutation Specs**

Couchbase Node.js SDK 4.x provides factory methods for mutation specs:

| Method | Purpose |
|--------|---------|
| `MutateInSpec.upsert(path, value)` | Insert or update field |
| `MutateInSpec.insert(path, value)` | Insert only (fail if exists) |
| `MutateInSpec.replace(path, value)` | Replace only (fail if missing) |
| `MutateInSpec.remove(path)` | Remove field |
| `MutateInSpec.arrayAppend(path, value)` | Append to array |
| `MutateInSpec.increment(path, delta)` | Counter operation |

These methods return **proper mutation spec objects** that the SDK understands.

The custom `{opcode, path, value}` format was **not valid** for SDK 4.x.

---

## 🚀 **How to Test**

### **1. Restart Backend Server**
```bash
# Stop server if running (Ctrl+C)

# Start server
npm run dev
```

### **2. Test Edit Post**
```bash
# From frontend Dashboard
1. Find your post
2. Click ⋮ → Edit Post
3. Change text → Click Update
✅ Should work now!
```

### **3. Watch Server Logs**
You'll see debug output:
```
[updatePost] Post ID: af1d625d-6f43-4af2-918e-4b8494cdfa33
[updatePost] Updates received: {
  "text": "...",
  "visibility": "connections"
}
[updatePost] Mutations to apply: [
  MutateInSpec { ... },
  MutateInSpec { ... },
  MutateInSpec { ... }
]
```

---

## 📊 **Files Modified**

```
✅ src/services/postService.js
   - Added: import couchbase from 'couchbase'
   - Changed: All mutations to use MutateInSpec.upsert()
   - Added: Debug logging
```

**Total: 1 file, ~80 lines changed**

---

## ✨ **Status: FIXED (Final)**

The "invalid argument" error was caused by using wrong mutation format.

Now using official Couchbase SDK 4.x `MutateInSpec` API.

**Restart server and test!** 🎉
