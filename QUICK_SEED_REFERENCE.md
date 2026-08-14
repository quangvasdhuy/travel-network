# ⚡ QUICK REFERENCE - SEED DATA COMMANDS

## 🎯 ONE-LINER (Recommended)

```bash
npm run db:seed-massive
```

**Kết quả:** 1000 users, 100K posts, 100K trips, 10M+ interactions  
**Time:** 4-8 hours  
**Perfect for:** Yêu cầu của bạn!

---

## 📋 ALL COMMANDS

### Initialize
```bash
npm run db:init              # Create buckets & indexes
```

### Seed Data
```bash
npm run db:seed-realistic    # 45 users (2 min)
npm run db:seed-large         # 100 users (30-60 min)
npm run db:seed-massive       # 1000 users (4-8 hrs) ⭐
```

### Add to Existing
```bash
npm run db:add-data           # +200 posts, +connections
npm run db:add-engagement     # +likes, +comments
npm run db:fix-stats          # Recalculate user stats
```

### Clear Data
```bash
npm run db:clear              # Clear specific data
npm run db:clear-all          # Clear ALL (with confirm)
```

---

## 🚀 COMMON WORKFLOWS

### Fresh Start (Production Scale)
```bash
npm run db:clear-all && npm run db:seed-massive
```

### Quick Test
```bash
npm run db:seed-realistic
```

### Add More to Existing
```bash
npm run db:add-data && npm run db:add-engagement && npm run db:fix-stats
```

---

## 📊 COMPARISON

| Command | Users | Posts | Time |
|---------|-------|-------|------|
| `db:seed-realistic` | 45 | 100 | 2 min |
| `db:seed-large` | 100 | 10K | 30-60 min |
| `db:seed-massive` | **1000** | **100K** | **4-8 hrs** |

---

## 🔑 TEST LOGIN

```
Email: ANY_USERNAME@travel.network
Password: Travel2024!

Examples:
- jamessmith123@travel.network
- mariagonzalez456@travel.network
```

---

## 💡 TIPS

✅ Run massive overnight  
✅ Script auto-resumes if interrupted  
✅ Check progress in `seed_checkpoint.json`  
✅ 8GB+ RAM recommended  

---

## 📖 FULL DOCS

- English: `MASSIVE_DATA_SEEDING.md`
- Tiếng Việt: `HUONG_DAN_SEED_DATA.md`
- Summary: `SEED_MASSIVE_SUMMARY.md`

