# 📬 Import vào Postman - Hướng dẫn chi tiết

## ✅ File đã sẵn sàng!

Tôi đã tạo sẵn 2 files cho bạn:

1. **`TravelNetwork-Complete.postman_collection.json`** (37KB)
   - Collection đầy đủ 63 endpoints
   - Tự động lưu tokens sau login
   - Environment variables tích hợp
   - Test scripts để save IDs

2. **`POSTMAN_SETUP.md`**
   - Tất cả cURL commands để test manual
   - Có thể copy-paste vào terminal
   - Hoặc import từng cURL vào Postman

---

## 🚀 Cách Import vào Postman (3 bước)

### Bước 1: Mở Postman
- Mở ứng dụng Postman Desktop
- Hoặc truy cập https://web.postman.co

### Bước 2: Import Collection
1. Click nút **Import** (góc trên bên trái)
2. Chọn tab **File**
3. Click **Choose Files**
4. Chọn file: `TravelNetwork-Complete.postman_collection.json`
5. Click **Import**

### Bước 3: Sử dụng
✅ Collection **"Travel Network API - Complete"** sẽ xuất hiện trong sidebar
✅ Có 9 folders với 63 requests
✅ Environment variables đã setup sẵn

---

## 📋 Các Folders trong Collection

```
📁 Travel Network API - Complete
├── 📂 1. Authentication (3 endpoints)
│   ├── Register
│   ├── Login
│   └── Refresh Token
├── 📂 2. Users (10 endpoints)
│   ├── Get Current User
│   ├── Get User by ID
│   ├── Get User by Username
│   ├── Update User
│   ├── Delete User
│   ├── Search Users
│   ├── Get User Stats
│   ├── Upload Profile Photo
│   ├── Get User Posts
│   └── Get User Trips
├── 📂 3. Posts (12 endpoints)
│   ├── Get All Posts
│   ├── Get Feed
│   ├── Get Post by ID
│   ├── Create Post
│   ├── Update Post
│   ├── Delete Post
│   ├── Like Post
│   ├── Unlike Post
│   ├── Get Comments
│   ├── Add Comment
│   ├── Delete Comment
│   └── Get Posts by User
├── 📂 4. Connections (8 endpoints)
│   ├── Follow User
│   ├── Unfollow User
│   ├── Get Followers
│   ├── Get Following
│   ├── Get Suggestions
│   ├── Get Mutual Connections
│   ├── Get Connection Status
│   └── Check Connection
├── 📂 5. Trips (10 endpoints)
│   ├── Get All Trips
│   ├── Get My Trips
│   ├── Get Trip by ID
│   ├── Create Trip
│   ├── Update Trip
│   ├── Delete Trip
│   ├── Get User Trips
│   ├── Add Traveler
│   ├── Remove Traveler
│   └── Update Trip Status
├── 📂 6. Destinations (10 endpoints)
│   ├── Get All Destinations
│   ├── Search Destinations
│   ├── Get Destination by ID
│   ├── Create Destination
│   ├── Update Destination
│   ├── Delete Destination
│   ├── Get Trending
│   ├── Get by Country
│   ├── Get Destination Posts
│   └── Get Destination Trips
├── 📂 7. Discovery (5 endpoints)
│   ├── Get User Suggestions
│   ├── Get Trending Destinations
│   ├── Get Popular Trips
│   ├── Get Recent Posts
│   └── Get Activity Feed
├── 📂 8. Search (4 endpoints)
│   ├── Search Users
│   ├── Search Posts
│   ├── Search Destinations
│   └── Search All
└── 📂 9. Health (1 endpoint)
    └── Health Check
```

---

## 🔧 Environment Variables (Tự động)

Collection đã có sẵn variables:

| Variable | Mô tả | Giá trị mặc định |
|----------|-------|------------------|
| `baseUrl` | Backend URL | `http://localhost:3000` |
| `accessToken` | JWT access token | *(auto-saved after login)* |
| `refreshToken` | JWT refresh token | *(auto-saved after login)* |
| `userId` | Current user ID | *(auto-saved after login)* |
| `postId` | Post ID for testing | *(auto-saved after create)* |
| `tripId` | Trip ID for testing | *(auto-saved after create)* |
| `destinationId` | Destination ID | *(auto-saved after create)* |
| `commentId` | Comment ID | *(auto-saved after create)* |

**Lưu ý:** Variables tự động update khi bạn chạy requests!

---

## 🎯 Quick Start Workflow

### 1. Khởi động Backend
```bash
# Terminal 1: Start backend
cd c:\Workspace\caohoc\travelnetwork
npm run dev
```

Đợi message: `✓ Server running on http://localhost:3000`

### 2. Test trong Postman

#### A. Register tài khoản mới
```
1. Mở folder "1. Authentication"
2. Click "Register"
3. Click "Send"
4. ✅ Token tự động lưu vào variables!
```

#### B. Hoặc Login với tài khoản có sẵn
```
1. Click "Login"
2. Sửa body:
   {
     "email": "traveler_sarah@example.com",
     "password": "password123"
   }
3. Click "Send"
4. ✅ Token tự động lưu!
```

#### C. Test các endpoints khác
```
1. Mở folder "2. Users"
2. Click "Get Current User"
3. Click "Send"
4. ✅ Thấy thông tin user!
```

#### D. Tạo Post
```
1. Mở folder "3. Posts"
2. Click "Create Post"
3. Sửa body nếu muốn
4. Click "Send"
5. ✅ Post ID tự động lưu vào {{postId}}!
```

#### E. Test workflow hoàn chỉnh
```
Register → Get Current User → Create Post → Like Post → Add Comment → Create Trip
```

---

## 🔐 Authentication

### Cách hoạt động:
1. **Register/Login** → Nhận tokens
2. **Auto-save** → Tokens lưu vào variables
3. **Auto-attach** → Token tự động gắn vào header của các requests khác
4. **Refresh** → Khi token hết hạn, dùng "Refresh Token"

### Check token hiện tại:
1. Click vào collection name
2. Tab "Variables"
3. Xem giá trị của `accessToken`

### Manual set token:
1. Click vào collection name
2. Tab "Variables"
3. Sửa `accessToken` value
4. Save

---

## 📝 Request Body Examples

### Create Post
```json
{
  "content": {
    "text": "Amazing sunset at the beach! 🌅"
  },
  "visibility": "public"
}
```

### Create Trip
```json
{
  "name": "Summer Europe Adventure",
  "description": "2 weeks exploring Western Europe",
  "startDate": "2026-08-01",
  "endDate": "2026-08-14",
  "status": "planning",
  "visibility": "public",
  "budget": {
    "currency": "EUR",
    "estimated": 5000
  }
}
```

### Add Comment
```json
{
  "content": "Great post! Love the photos!"
}
```

### Update User
```json
{
  "profile": {
    "bio": "Travel enthusiast | 🌍 30+ countries",
    "location": {
      "city": "San Francisco",
      "country": "USA"
    }
  },
  "interests": ["travel", "photography", "hiking"]
}
```

---

## 🎨 Tips & Tricks

### 1. Chạy nhiều requests liên tiếp
- Click vào folder
- Click "Run" (góc phải)
- Chọn requests muốn chạy
- Click "Run Collection"

### 2. Xem tất cả variables
- Click collection name
- Tab "Variables"
- Xem Current Value của tất cả variables

### 3. Test với data mẫu
```bash
# Seed dữ liệu mẫu
npm run db:seed

# 5 users sẵn sàng:
traveler_sarah / password123
explorer_mike / password123
wanderlust_emma / password123
adventure_alex / password123
cultural_lisa / password123
```

### 4. Debug request
- Tab "Console" (bottom) để xem logs
- Tab "Tests" để xem test results
- Tab "Response" để xem chi tiết response

### 5. Organize requests
- Right-click folder → Add folder
- Drag-drop để sắp xếp
- Add descriptions cho dễ hiểu

---

## ❗ Troubleshooting

### Lỗi "Could not get response"
```
✅ Check backend đang chạy: npm run dev
✅ Check URL: http://localhost:3000
✅ Check firewall không block port 3000
```

### Lỗi 401 Unauthorized
```
✅ Check token còn hạn không
✅ Thử login lại để lấy token mới
✅ Check header có Authorization: Bearer {{accessToken}}
```

### Lỗi 404 Not Found
```
✅ Check endpoint path đúng chưa
✅ Check backend routes đã load chưa
✅ Check ID trong URL có đúng không
```

### Token không tự động save
```
✅ Check tab "Tests" có script không
✅ Check response trả về đúng format không
✅ Manual save: Collection → Variables → Update
```

### Request body bị lỗi
```
✅ Check JSON format hợp lệ
✅ Check Content-Type: application/json
✅ Check required fields đủ chưa
```

---

## 📚 Tài liệu tham khảo

- **API Documentation:** `API_DOCUMENTATION.md`
- **Test Guides:** `TEST_TASK*.md`
- **cURL Commands:** `POSTMAN_SETUP.md`
- **Phase Summaries:** `PHASE*_COMPLETE.md`

---

## 🎉 Bạn đã sẵn sàng!

**Next steps:**
1. ✅ Import collection vào Postman
2. ✅ Start backend: `npm run dev`
3. ✅ Register hoặc Login
4. ✅ Test các endpoints
5. ✅ Build amazing features!

**Happy Testing! 🚀**

---

## 💡 Pro Tips

### Tạo Environment riêng
```
1. Click "Environments" (left sidebar)
2. Click "+" tạo mới
3. Add variables: baseUrl, accessToken, etc.
4. Select environment trước khi test
```

### Export collection sau khi customize
```
1. Right-click collection
2. Click "Export"
3. Choose format: Collection v2.1
4. Save file để backup
```

### Share với team
```
1. Export collection + environment
2. Share JSON files
3. Hoặc sync qua Postman account
4. Team import và có sẵn tất cả!
```

---

**File Location:** `c:\Workspace\caohoc\travelnetwork\TravelNetwork-Complete.postman_collection.json`
**File Size:** 37KB
**Total Endpoints:** 63
**Status:** ✅ Ready to import!
