# 🚀 MASSIVE DATA SEEDING GUIDE

## 📊 Overview

Hệ thống có **2 scripts** để seed data quy mô lớn:

### 1. **seedMassiveData.js** - Production Scale 🏭
- **1000 users**
- **100,000 posts** (100 per user)
- **100,000 trips** (100 per user)
- **~125,000 connections** (100-150 per user)
- **~10M likes** (80-120 per post)
- **~10M comments** (80-120 per post)
- ⏱️ **Time: 4-8 hours**
- 💾 **Storage: 10-20GB**
- 🧠 **RAM: 8GB+**

### 2. **seedLargeData.js** - Quick Test 🧪
- **100 users**
- **10,000 posts** (100 per user)
- **5,000 trips** (50 per user)
- **~12,500 connections** (100-150 per user)
- **~1M likes**
- **~1M comments**
- ⏱️ **Time: 30-60 minutes**
- 💾 **Storage: 1-2GB**

---

## 🎯 Recommendation

**Bắt đầu với seedMassiveData.js** để có data production-scale thực tế:

```bash
node src/scripts/seedMassiveData.js
```

---

## ✨ Features

### ✅ **Checkpoint System**
- Script có thể bị **ngắt và resume**
- Progress được lưu vào `seed_checkpoint.json`
- Nếu bị lỗi, chỉ cần chạy lại script!

### ✅ **Batch Processing**
- Insert 1000 docs/batch để tối ưu performance
- Memory-efficient

### ✅ **Progress Tracking**
- Real-time progress updates
- Hiển thị số lượng đã tạo/tổng số

### ✅ **Realistic Data**
- Đa dạng tên (80 first names, 64 last names)
- 20 post templates khác nhau
- 40+ comment templates
- Random images từ Cloudinary hoặc Lorem Picsum
- Connections tự nhiên (100-150 followers/following)
- Like/comment counts thực tế (80-120)

---

## 🚀 Usage

### Step 1: Clean Database (Optional)
```bash
# Nếu muốn start fresh
node src/scripts/initDatabase.js
```

### Step 2: Run Massive Seeding
```bash
# Production scale (recommended)
node src/scripts/seedMassiveData.js

# OR Quick test version
node src/scripts/seedLargeData.js
```

### Step 3: Monitor Progress
Script sẽ hiển thị progress real-time:
```
✓ Users: 1,000/1,000
✓ Posts for user 500/1,000
✓ Trips for user 750/1,000
✓ Connections for user 900/1,000
✓ Processed 50,000/100,000 posts
```

### Step 4: Resume if Interrupted
```bash
# Nếu script bị ngắt, chỉ cần chạy lại
node src/scripts/seedMassiveData.js
# Script sẽ tự động resume từ checkpoint!
```

---

## 📋 Steps Executed

1. **Create 1000 Users** 
   - Diverse profiles with realistic names
   - Random avatars and bios
   - Location data

2. **Create 15 Destinations**
   - Paris, Tokyo, Bali, London, NYC, etc.
   - Proper country codes and slugs

3. **Create 100,000 Posts**
   - 100 posts per user
   - 80% have 1-3 images
   - Random destinations
   - Realistic captions

4. **Create 100,000 Trips**
   - 100 trips per user
   - 2-5 destinations per trip
   - Past/present/future trips
   - Detailed itineraries

5. **Create ~125,000 Connections**
   - 100-150 per user
   - Bi-directional following
   - Active status

6. **Add Engagement**
   - 80-120 likes per post
   - 80-120 comments per post
   - From diverse users
   - Realistic timestamps

7. **Recalculate Stats**
   - postCount, tripCount
   - followerCount, followingCount
   - Accurate counts for all users

---

## 🔧 Configuration

Edit constants in script if needed:

```javascript
const NUM_USERS = 1000;              // Number of users
const POSTS_PER_USER = 100;          // Posts per user
const TRIPS_PER_USER = 100;          // Trips per user
const MIN_CONNECTIONS_PER_USER = 100; // Min followers/following
const MAX_CONNECTIONS_PER_USER = 150; // Max followers/following
const MIN_LIKES_PER_POST = 80;       // Min likes per post
const MAX_LIKES_PER_POST = 120;      // Max likes per post
const MIN_COMMENTS_PER_POST = 80;    // Min comments per post
const MAX_COMMENTS_PER_POST = 120;   // Max comments per post
const BATCH_SIZE = 1000;             // Batch insert size
```

---

## 🎉 Expected Results

After completion:

### Users
- 1000 users với profile đầy đủ
- Email: `{firstname}{lastname}{number}@travel.network`
- Password: `Travel2024!`
- Stats accurate: postCount, followerCount, etc.

### Posts
- 100,000 posts với content đa dạng
- 80% có 1-3 ảnh
- Mỗi post có 80-120 likes
- Mỗi post có 80-120 comments

### Social Network
- Network depth: 100-150 connections/user
- Total interactions: **10M+ likes + 10M+ comments = 20M+ interactions**
- Realistic engagement patterns

### Trips
- 100,000 travel plans
- Mix of planning/active/completed status
- Multiple destinations per trip

---

## ⚠️ Important Notes

### Performance Tips
1. **Close other applications** để free RAM
2. **Don't interrupt** during batch inserts
3. **Monitor Couchbase** memory usage
4. **Use SSD** nếu có thể

### If Something Goes Wrong
1. Script lưu checkpoint mỗi 100 users/1000 posts
2. Chỉ cần **run lại script** - sẽ resume automatically
3. Check `seed_checkpoint.json` để xem progress
4. Nếu stuck, delete checkpoint file và start over

### Cleanup
```bash
# Xóa checkpoint sau khi hoàn thành
rm seed_checkpoint.json

# Hoặc script sẽ tự động xóa khi done
```

---

## 🧪 Testing After Seeding

```bash
# 1. Start backend
npm start

# 2. Start frontend
cd client && npm run dev

# 3. Login với bất kỳ user nào
# Email: {any username}@travel.network
# Password: Travel2024!

# 4. Test features
- View posts (should see 100K posts)
- View user profiles (stats should be accurate)
- Like/comment (already has 100+ each)
- Follow users (already has 100+ connections)
- View trips (100 per user)
```

---

## 📊 Database Size Estimate

```
Users:         1,000 × 1KB     = 1MB
Posts:       100,000 × 5KB     = 500MB
Trips:       100,000 × 3KB     = 300MB
Connections: 125,000 × 0.5KB   = 63MB
Engagement:  20M interactions  = 10GB (comments + likes data)
-------------------------------------------
TOTAL:                          ~11-12GB
```

---

## 🎯 Use Cases

✅ **Load testing** - Test với data production-scale  
✅ **Performance tuning** - Query optimization với large dataset  
✅ **UI testing** - Pagination, infinite scroll, search  
✅ **Demo** - Impressive demo với realistic data  
✅ **Development** - Test với data gần thật nhất  

---

## 🚀 Let's Go!

```bash
node src/scripts/seedMassiveData.js
```

Sit back and let it run! ☕🚀

