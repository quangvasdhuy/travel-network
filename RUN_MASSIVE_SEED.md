# 🚀 QUICK START - MASSIVE DATA SEEDING

## 📋 Các bước thực hiện

### **Option 1: Production Scale (Recommended)** 🏭

Tạo **1000 users** với **100+ posts, trips, connections** mỗi user:

```bash
# Step 1: Xóa data cũ (nếu cần)
node src/scripts/clearAllData.js

# Step 2: Chạy massive seed (4-8 giờ)
node src/scripts/seedMassiveData.js
```

**Kết quả:**
- ✅ 1,000 users
- ✅ 100,000 posts
- ✅ 100,000 trips
- ✅ ~125,000 connections
- ✅ ~10M likes
- ✅ ~10M comments

---

### **Option 2: Quick Test** 🧪

Tạo **100 users** để test nhanh (30-60 phút):

```bash
# Option A: Sử dụng script hiện có
node src/scripts/addMoreData.js
node src/scripts/addMoreEngagement.js
node src/scripts/fixUserStats.js

# Option B: Large data script (coming soon)
node src/scripts/seedLargeData.js
```

**Kết quả:**
- ✅ 45 users (từ seedRealisticData)
- ✅ ~300 posts
- ✅ ~1000 comments
- ✅ ~1000 likes

---

## ⚡ FASTEST WAY (Recommended)

```bash
# Một lệnh duy nhất - chạy và đi ngủ! 🌙
node src/scripts/seedMassiveData.js
```

Script sẽ:
1. ✅ Tự động tạo users, posts, trips, connections
2. ✅ Thêm likes và comments
3. ✅ Recalculate stats
4. ✅ Có checkpoint - có thể resume nếu bị ngắt
5. ✅ Progress tracking real-time

---

## 🔧 Nếu Bị Ngắt Giữa Chừng

```bash
# Chỉ cần chạy lại - script sẽ tự động resume!
node src/scripts/seedMassiveData.js

# Check progress
cat seed_checkpoint.json
```

---

## 🎯 Sau Khi Xong

### Test Login
```bash
# Email: bất kỳ username nào @ travel.network
# Ví dụ: jamessmith123@travel.network
# Password: Travel2024!
```

### Start Application
```bash
# Terminal 1: Backend
npm start

# Terminal 2: Frontend
cd client
npm run dev
```

---

## 📊 Xem Data Stats

```bash
# Count users
curl http://localhost:3000/api/users

# Count posts
curl http://localhost:3000/api/posts/feed

# Search users
curl http://localhost:3000/api/search/users?q=james
```

---

## 🗑️ Reset Everything

```bash
# Xóa tất cả data
node src/scripts/clearAllData.js

# Sau đó seed lại
node src/scripts/seedMassiveData.js
```

---

## ⏱️ Time Estimates

| Script | Users | Posts | Time | Storage |
|--------|-------|-------|------|---------|
| seedRealisticData.js | 45 | 100 | 2 min | 50MB |
| addMoreData.js + addMoreEngagement.js | +0 | +200 | 5 min | +100MB |
| **seedMassiveData.js** | **1000** | **100K** | **4-8 hrs** | **10-20GB** |

---

## 🎉 YOU'RE READY!

```bash
node src/scripts/seedMassiveData.js
```

Đi uống cà phê, script sẽ tự chạy! ☕🚀

