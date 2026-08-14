# 📚 HƯỚNG DẪN SEED DATA CHI TIẾT

## 🎯 Tổng Quan

Có **3 mức độ** seed data tùy theo nhu cầu:

| Mức | Script | Users | Posts | Connections | Time | Storage |
|-----|--------|-------|-------|-------------|------|---------|
| **Nhỏ** | `seedRealisticData.js` | 45 | 100 | ~10/user | 2 phút | 50MB |
| **Vừa** | `addMoreData + addMoreEngagement` | 45 | 300 | ~20/user | 5 phút | 150MB |
| **Lớn** | `seedMassiveData.js` | 1000 | 100K | ~125/user | 4-8 giờ | 10-20GB |

---

## 🚀 CÁCH 1: MASSIVE DATA (Recommended)

### ✅ Phù hợp với yêu cầu của bạn:
- ✅ 1000 users
- ✅ 100+ posts per user
- ✅ 100+ trips per user
- ✅ 100+ followers/following per user
- ✅ 80-120 likes per post
- ✅ 80-120 comments per post
- ✅ Data giống thật 100%

### 📋 Các Bước:

#### **Bước 1: Xóa data cũ (optional)**
```bash
npm run db:clear-all
# Hoặc
node src/scripts/clearAllData.js
```

Sẽ hỏi confirm, gõ `DELETE` để xác nhận.

#### **Bước 2: Chạy massive seed**
```bash
npm run db:seed-massive
# Hoặc
node src/scripts/seedMassiveData.js
```

### 📊 Process Flow:

Script sẽ chạy **7 bước**:

1. **Create 1000 Users** (2-3 phút)
   - Đa dạng: John Smith, Maria Garcia, etc.
   - Email: `{firstname}{lastname}{number}@travel.network`
   - Password: `Travel2024!`

2. **Create 15 Destinations** (< 1 phút)
   - Paris, Tokyo, Bali, London, NYC, etc.

3. **Create 100,000 Posts** (30-60 phút)
   - 100 posts per user
   - Random destinations
   - 80% có ảnh (1-3 ảnh/post)

4. **Create 100,000 Trips** (30-60 phút)
   - 100 trips per user
   - Detailed itineraries
   - Past/present/future

5. **Create ~125,000 Connections** (15-30 phút)
   - 100-150 connections per user
   - Bi-directional following

6. **Add Engagement** (2-4 giờ) ⏰ **Longest step!**
   - 80-120 likes per post
   - 80-120 comments per post
   - Realistic interactions

7. **Recalculate Stats** (10-15 phút)
   - Update all user stats
   - postCount, followerCount, etc.

### 🎯 Progress Tracking:

Script hiển thị progress real-time:
```
✓ Users: 1,000/1,000
✓ Posts for user 500/1,000
✓ Processed 50,000/100,000 posts
```

### 💾 Checkpoint System:

Nếu bị ngắt giữa chừng:
```bash
# Chỉ cần chạy lại, script tự resume!
npm run db:seed-massive
```

Checkpoint lưu ở `seed_checkpoint.json`:
```json
{
  "usersCreated": 1000,
  "postsCreated": 75000,
  "tripsCreated": 100000,
  "connectionsCreated": 125000,
  "engagementProcessed": 50000
}
```

---

## 🧪 CÁCH 2: QUICK TEST (Nhanh hơn)

Nếu muốn test nhanh với data nhỏ hơn:

### Option A: Seed hiện có + thêm data
```bash
# 1. Seed 45 users với 100 posts
npm run db:seed-realistic

# 2. Thêm 200 posts + connections
npm run db:add-data

# 3. Thêm likes + comments
npm run db:add-engagement

# 4. Fix user stats
npm run db:fix-stats
```

**Kết quả:**
- 45 users
- 300 posts
- ~15-30 connections/user
- 3-15 likes/post
- 2-8 comments/post
- **Time: ~5 phút**

### Option B: Large data script (100 users)
```bash
npm run db:seed-large
```

**Kết quả:**
- 100 users
- 10,000 posts (100/user)
- 5,000 trips (50/user)
- ~125 connections/user
- 80-120 likes/post
- 80-120 comments/post
- **Time: 30-60 phút**

---

## 📝 Test Data Credentials

Sau khi seed xong, login với:

```
Email: {bất kỳ username}@travel.network
Password: Travel2024!

Ví dụ:
- jamessmith123@travel.network
- mariagonzalez456@travel.network
- oliviaanderson789@travel.network
```

---

## 🎨 Data Characteristics

### Users
- **Tên thật:** 80 first names + 64 last names = 5120+ combinations
- **Email:** `firstname.lastname{number}@travel.network`
- **Location:** 33 cities worldwide
- **Bio:** 10 templates khác nhau
- **Avatar:** Random images (Cloudinary hoặc Lorem Picsum)

### Posts
- **Templates:** 20 post templates đa dạng
- **Destinations:** 15 destinations (Paris, Tokyo, Bali, etc.)
- **Media:** 80% có 1-3 ảnh, 20% text-only
- **Visibility:** 90% public, 10% connections-only

### Comments
- **Templates:** 40+ comment templates realistic
- **Examples:**
  - "This is absolutely stunning! 😍"
  - "Added to my bucket list!"
  - "What camera did you use?"
  - "How long did you stay there?"

### Trips
- **Templates:** 10 trip types
- **Destinations:** 2-5 per trip
- **Duration:** 7-30 days
- **Status:** Mix of planning/active/completed

### Connections
- **Distribution:** 100-150 per user (realistic social network)
- **Bi-directional:** A follows B không có nghĩa B follows A
- **Active status:** All connections active

---

## 🔧 Troubleshooting

### Vấn đề: Script chạy chậm
**Giải pháp:**
- Đóng apps khác để free RAM
- Chờ step 6 (Add Engagement) - đây là step lâu nhất
- Script optimized với batch processing

### Vấn đề: Script bị ngắt
**Giải pháp:**
```bash
# Chạy lại, sẽ tự động resume
npm run db:seed-massive

# Check progress
cat seed_checkpoint.json
```

### Vấn đề: Couchbase out of memory
**Giải pháp:**
- Tăng Couchbase RAM quota lên 2GB+
- Hoặc dùng script nhỏ hơn: `db:seed-large`

### Vấn đề: "Connection timeout"
**Giải pháp:**
- Check Couchbase đang chạy: `http://localhost:8091`
- Restart Couchbase service
- Check `.env` config

---

## 📊 Verify Data

### Check counts via API:
```bash
# Count users
curl http://localhost:3000/api/users | jq '.data | length'

# Get user with stats
curl http://localhost:3000/api/users/{userId} | jq '.data.stats'

# Get posts with engagement
curl http://localhost:3000/api/posts/feed | jq '.data[0].stats'
```

### Check counts via Couchbase Query:
```sql
-- Count users
SELECT COUNT(*) FROM `travel_users` WHERE type = 'user';

-- Count posts
SELECT COUNT(*) FROM `travel_content` WHERE type = 'post';

-- Count connections
SELECT COUNT(*) FROM `travel_social` WHERE type = 'connection';

-- User with most followers
SELECT u.username, u.stats.followerCount 
FROM `travel_users` u 
WHERE u.type = 'user' 
ORDER BY u.stats.followerCount DESC 
LIMIT 10;

-- Post with most likes
SELECT p.content.text, p.stats.likeCount 
FROM `travel_content` p 
WHERE p.type = 'post' 
ORDER BY p.stats.likeCount DESC 
LIMIT 10;
```

---

## 🗑️ Clean Up

### Xóa tất cả data:
```bash
npm run db:clear-all
```

### Xóa checkpoint:
```bash
rm seed_checkpoint.json
```

### Xóa và seed lại:
```bash
npm run db:clear-all
npm run db:seed-massive
```

---

## ⚡ NPM Scripts Tổng Hợp

```bash
# Initialize database (create buckets, indexes)
npm run db:init

# Seed scripts
npm run db:seed-realistic    # 45 users, 100 posts (2 min)
npm run db:seed-large         # 100 users, 10K posts (30-60 min)
npm run db:seed-massive       # 1000 users, 100K posts (4-8 hrs)

# Add more data to existing
npm run db:add-data           # Add 200 posts + connections
npm run db:add-engagement     # Add likes + comments
npm run db:fix-stats          # Recalculate user stats

# Clear data
npm run db:clear              # Clear specific data
npm run db:clear-all          # Clear ALL data (with confirm)

# Other
npm run images:upload         # Upload images to Cloudinary
```

---

## 🎯 Recommendation

Theo yêu cầu của bạn (1000 users, 100+ posts/trips/connections, 1000+ interactions):

### ⭐ **Chạy command này:**

```bash
npm run db:seed-massive
```

**Lý do:**
- ✅ Đúng yêu cầu: 1000 users, 100+ everything
- ✅ Data realistic: đa dạng, giống thật
- ✅ Có checkpoint: resume được nếu ngắt
- ✅ Production-ready: test với scale thực tế

**Thời gian:** 4-8 giờ (có thể chạy overnight)

---

## 🎉 Kết Luận

Sau khi seed xong, bạn sẽ có:

✅ **1,000 users** với profile đầy đủ  
✅ **100,000 posts** với content đa dạng  
✅ **100,000 trips** với detailed plans  
✅ **~125,000 connections** (network depth realistic)  
✅ **~10M likes** (80-120 per post)  
✅ **~10M comments** (80-120 per post)  
✅ **Total ~20M+ interactions** - truly social network!  

**Hệ thống sẵn sàng cho production!** 🚀

