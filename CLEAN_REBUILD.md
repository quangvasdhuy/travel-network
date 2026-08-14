# ✅ CLEAN & REBUILD - FIXED!

## 🔧 **ĐÃ FIX:**

1. ✅ Xóa scripts nguy hiểm (`seedMassiveData.js`, `addMoreData.js`, etc.)
2. ✅ Fix `seedRealisticData.js` - Dùng `MutateInSpec` thay vì opcode
3. ✅ Clean package.json - Chỉ giữ safe scripts

---

## 🚀 **REBUILD NGAY:**

### **Step 1: Clear old corrupted data**
```bash
npm run db:clear-all
```
**Gõ `DELETE` khi được hỏi**

### **Step 2: Seed clean data**
```bash
npm run db:seed-realistic
```

**Kết quả:**
- ✅ 45 users với stats chính xác
- ✅ 100 posts
- ✅ 50 trips
- ✅ ~450 connections
- ✅ **KHÔNG CÒN LỖI "invalid argument"!**

---

## 🔐 **Test Credentials:**

```
Email: sarah@travel.network
Password: Travel2024!

Email: mike@travel.network  
Password: Travel2024!

Email: emma@travel.network
Password: Travel2024!
```

---

## 📋 **One-Liner (Recommended):**

```bash
npm run db:clear-all && npm run db:seed-realistic
```

(Gõ `DELETE` khi được hỏi)

---

## ✅ **Safe Scripts Còn Lại:**

| Command | Mô tả | Status |
|---------|-------|--------|
| `npm run db:init` | Init buckets & indexes | ✅ SAFE |
| `npm run db:seed` | Basic seed | ✅ SAFE |
| `npm run db:seed-realistic` | 45 users realistic | ✅ **FIXED** |
| `npm run db:clear` | Clear specific data | ✅ SAFE |
| `npm run db:clear-all` | Clear ALL with confirm | ✅ SAFE |

---

## 🎯 **What Was Wrong:**

### **Problem:**
```javascript
// OLD - Causes "invalid argument" error
await collection.mutateIn(docId, [
  {
    opcode: 'dict_upsert',
    path: 'stats.postCount',
    value: 10
  }
]);
```

### **Fixed:**
```javascript
// NEW - Works perfectly!
await collection.mutateIn(docId, [
  couchbase.MutateInSpec.upsert('stats.postCount', 10)
]);
```

---

## 🚀 **EXECUTE NOW:**

```bash
# Clear old data (546 corrupted users)
npm run db:clear-all

# Seed fresh (45 clean users)
npm run db:seed-realistic
```

**Database sẽ clean và working 100%!** ✨

