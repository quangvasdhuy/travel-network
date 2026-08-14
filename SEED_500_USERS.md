# 🎯 SEED 500 USERS (50% Scale)

## ✅ **ĐÃ GIẢM XUỐNG 50%**

Script đã được update:

| Metric | Value |
|--------|-------|
| **Users** | 500 |
| **Posts** | 50,000 (100/user) |
| **Trips** | 50,000 (100/user) |
| **Connections** | ~62,500 (100-150/user) |
| **Likes** | ~5,000,000 (80-120/post) |
| **Comments** | ~5,000,000 (80-120/post) |
| **Time** | 2-4 hours ⏱️ |
| **Storage** | 5-10GB 💾 |

---

## 🚀 **2 OPTIONS:**

### **Option A: Clear & Reseed (Recommended)**

```bash
# Step 1: Clear all data
node src/scripts/clearAllData.js
# Type "DELETE" to confirm

# Step 2: Seed fresh 500 users
node src/scripts/seedMassiveData.js
```

**Result:** Clean database với đúng 500 users + full data

---

### **Option B: Keep Old + Continue**

```bash
# Just run - will add to existing data
node src/scripts/seedMassiveData.js
```

**Result:** Mix of old (1000 users incomplete) + new data  
**⚠️ Not recommended** - data không nhất quán

---

## 📋 **Recommended: Option A**

```bash
# 1. Clear (type DELETE to confirm)
node src/scripts/clearAllData.js

# 2. Seed 500 users fresh
node src/scripts/seedMassiveData.js
```

**Time:** ~2-4 hours (much faster than 1000 users!)

---

## 📊 **New Configuration:**

```javascript
const NUM_USERS = 500;              // Was 1000
const POSTS_PER_USER = 100;         // Same
const TRIPS_PER_USER = 100;         // Same
const MIN_CONNECTIONS_PER_USER = 100;
const MAX_CONNECTIONS_PER_USER = 150;
const MIN_LIKES_PER_POST = 80;
const MAX_LIKES_PER_POST = 120;
const MIN_COMMENTS_PER_POST = 80;
const MAX_COMMENTS_PER_POST = 120;
```

**Total data:**
- 500 users
- 50K posts
- 50K trips
- ~5M likes
- ~5M comments
- **~10M interactions total!**

Vẫn rất impressive! 🚀

---

## ⚡ **Quick Start:**

```bash
# Clear + Seed
npm run db:clear-all && npm run db:seed-massive
```

**One command, 2-4 hours, production-ready data!** ✨

