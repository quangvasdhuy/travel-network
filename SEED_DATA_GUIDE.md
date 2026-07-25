# Hướng Dẫn Seed Dữ Liệu Mẫu

## Mục Đích
Script này tạo dữ liệu mẫu để test Task 13 và các tính năng social network.

## Dữ Liệu Được Tạo

### 👥 **5 Users**
1. **traveler_sarah** - Adventure seeker, đã đi 30+ quốc gia
2. **explorer_mike** - Digital nomad, food enthusiast
3. **wanderlust_emma** - Solo traveler, yoga instructor
4. **adventure_alex** - Mountain climber, extreme sports
5. **cultural_lisa** - History buff, art lover

**Login info cho tất cả:** `password123`

### 📝 **8 Posts**
- Posts về các địa điểm nổi tiếng
- Machu Picchu, Tokyo, Bali, Kilimanjaro, Rome, Thailand, Colombia, Angkor Wat
- Mỗi post có location, likes, comments (random)
- Posts được phân bổ đều cho các users

### 🤝 **Connections**
- **20 connections** - Mọi user follow lẫn nhau
- Điều này có nghĩa:
  - Mỗi user có 4 followers
  - Mỗi user following 4 người
  - Feed sẽ hiển thị posts từ tất cả users

### ✈️ **3 Trips**
1. European Summer Adventure (completed)
2. Southeast Asia Exploration (upcoming)
3. Patagonia Hiking Trip (planning)

## Cách Chạy

### Bước 1: Đảm bảo Backend đang chạy
```powershell
cd c:\Workspace\caohoc\travelnetwork
npm run dev
```

### Bước 2: Chạy seed script
```powershell
# Terminal mới
npm run db:seed
```

### Output Mong Đợi:
```
═══════════════════════════════════════
  Travel Network - Data Seeding Script
═══════════════════════════════════════

Connecting to Couchbase...
✓ Connected to Couchbase

Seeding users...
  ✓ Created user: traveler_sarah
  ✓ Created user: explorer_mike
  ✓ Created user: wanderlust_emma
  ✓ Created user: adventure_alex
  ✓ Created user: cultural_lisa
✓ Created 5 users

Seeding connections...
✓ Created 20 connections

Seeding posts...
  ✓ Created post by traveler_sarah
  ✓ Created post by explorer_mike
  ...
✓ Created 8 posts

Seeding trips...
  ✓ Created trip: European Summer Adventure
  ✓ Created trip: Southeast Asia Exploration
  ✓ Created trip: Patagonia Hiking Trip
✓ Created 3 trips

═══════════════════════════════════════
✓ Data seeding completed successfully!
═══════════════════════════════════════

Sample accounts created:
  • traveler_sarah / sarah@example.com / password123
  • explorer_mike / mike@example.com / password123
  • wanderlust_emma / emma@example.com / password123
  • adventure_alex / alex@example.com / password123
  • cultural_lisa / lisa@example.com / password123
```

## Test Task 13 Features

### 1. **Login với một trong các accounts**
```
Username: traveler_sarah
Password: password123
```

### 2. **Dashboard**
Sau khi login, bạn sẽ thấy:
- ✅ **Stats Cards:** Posts (0 ban đầu), Followers (4), Following (4)
- ✅ **Feed:** 8 posts từ các users khác
- ✅ **Sidebar:** Suggested users (3 người)
- ✅ **Like/Comment counts** trên mỗi post

### 3. **Profile Page**
Click username → Profile:
- ✅ **Posts Tab:** Posts của user đó
- ✅ **Followers Tab:** 4 followers với follow buttons
- ✅ **Following Tab:** 4 following với unfollow buttons

### 4. **Visit Other Profiles**
Search hoặc click vào tên user khác:
- ✅ Thấy Follow button (thay vì Edit Profile)
- ✅ Xem posts, followers, following của họ
- ✅ Follow/Unfollow hoạt động
- ✅ Stats update real-time

### 5. **Post Interactions**
- ✅ Like posts (heart icon)
- ✅ View comments
- ✅ See location on posts
- ✅ Navigate to author profile

### 6. **Follow System**
- ✅ Follow từ suggestions sidebar
- ✅ Follow từ search results
- ✅ Follow từ followers/following lists
- ✅ Stats update immediately

## Xóa Dữ Liệu

Nếu muốn reset và seed lại:

### Cách 1: Xóa từ Couchbase UI
1. Mở http://localhost:8091
2. Buckets → travel_users → Documents
3. Xóa tất cả documents có prefix `user::`
4. Làm tương tự cho posts, connections, trips

### Cách 2: Drop và tạo lại buckets
```powershell
# Re-run database init (sẽ xóa hết)
npm run db:init

# Seed lại data
npm run db:seed
```

## Troubleshooting

### Lỗi: "Cannot connect to Couchbase"
**Giải pháp:**
- Đảm bảo Couchbase đang chạy
- Check connection string trong `.env`

### Lỗi: "Bucket not found"
**Giải pháp:**
```powershell
# Chạy init script trước
npm run db:init

# Sau đó seed
npm run db:seed
```

### Lỗi: "Document already exists"
**Giải pháp:**
- Script sẽ overwrite documents cũ
- Hoặc xóa users cũ trước khi chạy

### Feed vẫn trống sau khi seed?
**Kiểm tra:**
1. Posts đã được tạo? Check Couchbase UI
2. Connections đã được tạo? Check `connection::*` documents
3. Backend API `/api/posts/feed` có hoạt động?

### Stats không đúng?
**Lưu ý:** Stats được tính từ N1QL queries, không phải từ seed data.
- `followerCount` = count connections where followingId = userId
- `followingCount` = count connections where followerId = userId
- `postCount` = count posts where authorId = userId

## Customize Data

Muốn thêm users/posts riêng? Edit file:
```
src/scripts/seedData.js
```

Thêm vào arrays:
```javascript
const sampleUsers = [
  // Thêm users mới ở đây
  {
    username: 'your_username',
    email: 'your@email.com',
    password: 'password123',
    // ...
  }
];

const samplePosts = [
  // Thêm posts mới ở đây
  {
    text: 'Your post content',
    location: { name: 'Location' },
  }
];
```

Sau đó chạy lại:
```powershell
npm run db:seed
```

## Tips

### Test Follow/Unfollow
1. Login as `traveler_sarah`
2. Go to `explorer_mike` profile
3. Click Unfollow
4. Stats decrease
5. Click Follow
6. Stats increase

### Test Posts Feed
1. Login as any user
2. Dashboard feed shows 8 posts
3. Click Like on posts
4. Go to post author's profile
5. See their posts

### Test Suggestions
1. Dashboard sidebar shows 3 suggested users
2. Click Follow
3. Button changes to Unfollow
4. Following count increases

## Accounts Cheat Sheet

| Username | Email | Location | Interests |
|----------|-------|----------|-----------|
| traveler_sarah | sarah@example.com | San Francisco, USA | Hiking, Photography |
| explorer_mike | mike@example.com | Tokyo, Japan | Food, Culture |
| wanderlust_emma | emma@example.com | Barcelona, Spain | Beaches, Yoga |
| adventure_alex | alex@example.com | Kathmandu, Nepal | Climbing, Mountains |
| cultural_lisa | lisa@example.com | Rome, Italy | History, Art |

**Password cho tất cả:** `password123`

## Kết Quả Mong Đợi

Sau khi seed xong và login:

### Dashboard:
- Posts: 0 (mới login)
- Followers: 4
- Following: 4
- Feed: 8 posts từ others

### Profile:
- Posts tab: Empty (chưa có posts)
- Followers tab: 4 users
- Following tab: 4 users

### Other Profiles:
- See their posts
- Follow button visible
- Can interact

## Next Steps

1. **Tạo post mới:** Hiện tại chưa có UI tạo post (Task 15)
2. **Add comments:** Backend ready, frontend Task 15
3. **Upload photos:** Backend ready, frontend Task 15

---

**✅ Bây giờ Task 13 có đủ data để test tất cả features!**
