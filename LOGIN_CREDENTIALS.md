# 🔐 Login Credentials

## Current Status
You need to **seed the database** with new data first!

---

## 🚀 Quick Setup (3 steps)

### Step 1: Clear old data (optional if data exists)
```bash
node src/scripts/clearData.js
```

### Step 2: Seed new realistic data
```bash
node src/scripts/seedRealisticData.js
```

### Step 3: Login with any user below

---

## 👥 **NEW** Login Credentials (after seeding)

**Password for ALL users:** `Travel2024!`

### Featured Users:

#### Travel Bloggers:
```
Email: matt.kepnes@travelmail.com
Username: nomadic_matt
Password: Travel2024!
```

```
Email: matthew.karsten@adventuremail.com
Username: expert_vagabond
Password: Travel2024!
```

```
Email: nadine.sykora@worldtravel.com
Username: hey_nadine
Password: Travel2024!
```

#### Digital Nomads:
```
Email: sophia.chen@remotework.io
Username: digital_sophia
Password: Travel2024!
```

```
Email: alex.rivera@devremote.com
Username: code_and_travel
Password: Travel2024!
```

#### Adventure Travelers:
```
Email: mike.anderson@climbing.com
Username: mountain_mike
Password: Travel2024!
```

```
Email: sarah.johnson@hikinglife.com
Username: trail_sarah
Password: Travel2024!
```

#### Luxury Travelers:
```
Email: kate.wellington@luxurylife.com
Username: luxury_travels_kate
Password: Travel2024!
```

---

## 🔴 **OLD** Credentials (no longer work after clear)

These were from `seedData.js`:
```
❌ emma@example.com / password123
❌ sarah@example.com / password123
❌ mike@example.com / password123
```

**Status:** Deleted after running `clearData.js`

---

## ⚠️ Troubleshooting

### Error: "Invalid credentials"

**Cause:** Database is empty or using old credentials

**Solution:**
1. Check if you ran seed script:
   ```bash
   node src/scripts/seedRealisticData.js
   ```

2. Use NEW password: `Travel2024!`

3. Verify user exists in Couchbase:
   - Open http://localhost:8091
   - Go to `travel_users` bucket
   - Search for `user::` documents

### Error: "User not found"

**Cause:** Database is empty

**Solution:** Run seed script:
```bash
node src/scripts/seedRealisticData.js
```

---

## 📊 Database Check

### Verify data exists:
```bash
# Check Couchbase Web UI
http://localhost:8091

# Navigate to:
Buckets > travel_users > Documents
```

**Should see:**
- 50 user documents
- Keys starting with `user::`
- Each with `username`, `email`, `passwordHash`

---

## 🎯 Quick Test

### Test login via curl:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "nomadic_matt",
    "password": "Travel2024!"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

---

## 💡 Summary

| Item | Old | New |
|------|-----|-----|
| **Password** | `password123` | `Travel2024!` |
| **Users** | 5 test users | 50 professional users |
| **Script** | `seedData.js` | `seedRealisticData.js` |
| **Status** | ❌ Cleared | ✅ Active (after seeding) |

**Next:** Run seed script and use new credentials!

