# 🔧 KHÔI PHỤC DỮ LIỆU

## 🚨 **Dữ liệu bị hỏng do:**
- `seedMassiveData.js` - Script phức tạp, có thể conflict
- `addMoreData.js`, `addMoreEngagement.js` - Thêm data không nhất quán
- Checkpoint files - Resume không đúng

---

## ✅ **CÁCH KHÔI PHỤC:**

### **Bước 1: Dọn dẹp scripts nguy hiểm**

```powershell
# Xóa các scripts có thể gây lỗi
Remove-Item src/scripts/seedMassiveData.js -Force
Remove-Item src/scripts/seedLargeData.js -Force
Remove-Item src/scripts/addMoreData.js -Force
Remove-Item src/scripts/addMoreEngagement.js -Force
Remove-Item src/scripts/fixUserStats.js -Force
Remove-Item seed_checkpoint.json -Force

Write-Host "✓ Đã xóa scripts nguy hiểm"
```

### **Bước 2: Clear database**

```powershell
node src/scripts/clearAllData.js
# Gõ "DELETE" để confirm
```

### **Bước 3: Rebuild với script an toàn**

```powershell
# Init lại database structure
npm run db:init

# Seed data gốc (SAFE - script đã test kỹ)
npm run db:seed-realistic
```

---

## 📋 **Scripts AN TOÀN để dùng:**

| Script | Mô tả | An toàn? |
|--------|-------|----------|
| `initDatabase.js` | Tạo buckets & indexes | ✅ SAFE |
| `seedData.js` | Seed cơ bản | ✅ SAFE |
| `seedRealisticData.js` | Seed 45 users realistic | ✅ SAFE |
| `clearData.js` | Clear specific data | ✅ SAFE |
| `clearAllData.js` | Clear all data | ✅ SAFE (với confirm) |
| ~~`seedMassiveData.js`~~ | **REMOVED** | ❌ Gây lỗi |
| ~~`addMoreData.js`~~ | **REMOVED** | ❌ Gây lỗi |
| ~~`addMoreEngagement.js`~~ | **REMOVED** | ❌ Gây lỗi |

---

## 🎯 **REBUILD PROCEDURE:**

```powershell
# 1. Cleanup
Remove-Item src/scripts/seed*Massive*.js -Force
Remove-Item src/scripts/add*.js -Force
Remove-Item src/scripts/fix*.js -Force
Remove-Item seed_checkpoint.json -Force

# 2. Clear database
node src/scripts/clearAllData.js

# 3. Rebuild
npm run db:init
npm run db:seed-realistic

# 4. Verify
Write-Host "Database rebuilt with SAFE data"
```

**Result:**
- 45 realistic users
- 100 posts
- 50 trips
- Proper connections
- Working login/auth

---

## 🔐 **Test Credentials sau khi rebuild:**

```
Email: sarah@travel.network
Password: Travel2024!

Email: mike@travel.network
Password: Travel2024!

Email: emma@travel.network
Password: Travel2024!
```

---

## 📦 **Nếu cần nhiều data hơn:**

**KHÔNG DÙNG scripts phức tạp!**

Thay vào đó:

### **Option A: Chạy seed nhiều lần**
```powershell
# Modify seedRealisticData.js to use different email suffix
npm run db:seed-realistic
# Edit script, change email domain
npm run db:seed-realistic
```

### **Option B: API-based seeding (an toàn hơn)**

Create simple script:
```javascript
// simpleSeed.js
import fetch from 'node-fetch';

async function createUsers(count) {
  for (let i = 0; i < count; i++) {
    await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `user${i}@travel.network`,
        username: `user${i}`,
        password: 'Travel2024!',
        firstName: 'User',
        lastName: `${i}`
      })
    });
  }
}

createUsers(100); // Create 100 users safely
```

---

## ⚠️ **TẠI SAO Scripts Massive bị lỗi:**

1. **Checkpoint conflicts** - Resume không đúng state
2. **Query timeouts** - OFFSET queries quá chậm
3. **Memory issues** - Process quá nhiều data cùng lúc
4. **Data inconsistency** - Mix old + new data

---

## ✅ **SAFE PRACTICE:**

1. ✅ Chỉ dùng `seedRealisticData.js`
2. ✅ Test trên small dataset trước
3. ✅ Backup trước khi seed
4. ✅ Avoid checkpoint-based scripts
5. ✅ Prefer API-based data creation

---

## 🚀 **QUICK FIX NOW:**

```powershell
# One-liner: Clean + Rebuild
node src/scripts/clearAllData.js; npm run db:init; npm run db:seed-realistic
```

(Gõ "DELETE" khi được hỏi)

**Database sẽ clean & hoạt động tốt!** ✨

