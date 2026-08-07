# 🔧 Fix User Stats in UserCard

## ❌ **Problem:**
UserCard hiển thị **posts** và **followers** không đúng (showing 0 khi thực tế có data).

---

## 🔍 **Root Cause:**

### **Seed Process:**
```
1. Create users with stats = { postCount: 0, followerCount: 0, ... } ✅
2. Create posts (but don't update user.stats.postCount) ❌
3. Create connections (but don't update user.stats.followerCount) ❌
```

**Result:** Users have posts/followers in database, but `stats` fields still show 0!

---

## ✅ **Solution: Recalculate Stats After Seeding**

### **Added Function:**
```javascript
async function recalculateUserStats(usersBucket, contentBucket, socialBucket) {
  // For each user:
  // 1. COUNT posts where authorId = userId
  // 2. COUNT connections where followingId = userId (followers)
  // 3. COUNT connections where followerId = userId (following)
  // 4. COUNT trips where userId IN travelers
  // 5. UPDATE user.stats with actual counts
}
```

### **Integrated into main():**
```javascript
async function main() {
  // ... seed users, destinations, posts, connections, trips ...
  
  console.log('🔄 Recalculating user stats...');
  await recalculateUserStats(usersBucket, contentBucket, socialBucket);
  console.log('✓ User stats updated\n');
  
  // ... done ...
}
```

---

## 🚀 **How to Apply Fix:**

### **Step 1: Re-run Seed Script**
```bash
cd c:\Workspace\caohoc\travelnetwork
node src/scripts/seedRealisticData.js
```

**Look for new output:**
```
✅ REALISTIC DATA SEEDING COMPLETED!

🔄 Recalculating user stats...        ← NEW!
  Recalculating stats for 50 users...  ← NEW!
  ✓ Updated stats for 50 users         ← NEW!
✓ User stats updated
```

---

### **Step 2: Verify in Couchbase**
```sql
SELECT u.username, u.stats
FROM travel_users u
WHERE u.type = 'user'
LIMIT 5
```

**Expected Result:**
```json
[
  {
    "username": "nomadic_matt",
    "stats": {
      "postCount": 2,        ← Should be > 0
      "followerCount": 8,    ← Should be > 0
      "followingCount": 5,   ← Should be > 0
      "tripCount": 1
    }
  }
]
```

---

### **Step 3: Test Frontend**

1. **Dashboard → Suggested for you:**
   ```
   ┌─────────────────────────┐
   │ John Doe                │
   │ @john_doe               │
   │ 5 posts | 12 followers  │ ← Should show real numbers!
   └─────────────────────────┘
   ```

2. **ProfilePage → Followers/Following tabs:**
   - Click Followers → See UserCards với stats
   - Click Following → See UserCards với stats

3. **SearchPage → User results:**
   - Search for users
   - See stats in cards

---

## 📊 **What Gets Recalculated:**

| Stat | How It's Counted | API |
|------|------------------|-----|
| **postCount** | COUNT posts WHERE authorId = userId | `travel_content` |
| **followerCount** | COUNT connections WHERE followingId = userId | `travel_social` |
| **followingCount** | COUNT connections WHERE followerId = userId | `travel_social` |
| **tripCount** | COUNT trips WHERE userId IN travelers | `travel_trips` |

---

## 🎯 **Where Stats Are Displayed:**

**Frontend Components:**
- ✅ `UserCard.jsx` - Shows `{stats.postCount} posts` + `{stats.followerCount} followers`
- ✅ `ProfilePage.jsx` - Shows stats in header
- ✅ `DashboardPage.jsx` - Your Stats widget

**Backend APIs:**
- ✅ `GET /api/connections/suggestions` - Returns users with stats
- ✅ `GET /api/users/:username` - Returns user profile with stats
- ✅ `GET /api/connections/:userId/followers` - Returns followers with stats
- ✅ `GET /api/connections/:userId/following` - Returns following with stats

---

## 🔄 **Real-time Updates:**

Stats are updated automatically when:

| Action | Stats Updated |
|--------|---------------|
| **Create Post** | `postCount++` |
| **Delete Post** | `postCount--` |
| **Follow User** | `followerCount++` (target), `followingCount++` (actor) |
| **Unfollow User** | `followerCount--` (target), `followingCount--` (actor) |
| **Create Trip** | `tripCount++` |
| **Delete Trip** | `tripCount--` |

**Code locations:**
- `src/services/postService.js` → `updateUserPostCount()`
- `src/services/connectionService.js` → `updateFollowerCount()`, `updateFollowingCount()`

---

## ✨ **After Running Seed:**

**UserCard will show accurate stats:**
```jsx
<UserCard user={{
  username: "nomadic_matt",
  stats: {
    postCount: 2,       ✅ Real count from database
    followerCount: 8    ✅ Real count from database
  }
}} />
```

**Displays as:**
```
┌──────────────────────────┐
│ Matt Johnson            │
│ @nomadic_matt           │
│ Budget travel expert    │
│ 2 posts | 8 followers   │ ← ✅ Accurate!
└──────────────────────────┘
```

---

## 🧪 **Test Checklist:**

- [ ] Run seed script with stats recalculation
- [ ] Check Couchbase: verify stats > 0
- [ ] Dashboard → Suggested users show stats
- [ ] ProfilePage → Followers tab shows stats
- [ ] ProfilePage → Following tab shows stats
- [ ] SearchPage → User results show stats

---

## 📝 **Files Modified:**

```
✅ src/scripts/seedRealisticData.js
   - Added: recalculateUserStats() function
   - Modified: main() to call recalculation after seeding
```

**Total: 1 file, ~90 lines added**

---

## 🎉 **Status:**

✅ **Fix complete!** 

Run seed script để apply:
```bash
node src/scripts/seedRealisticData.js
```

UserCard stats sẽ hiển thị chính xác! 🚀
