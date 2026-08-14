# 🔐 TEST LOGIN - QUICK GUIDE

## ⚠️ **Current Issue:**
Database có thể empty hoặc data không consistent.

## ✅ **SOLUTION: Register New User**

### **1. Register a test user:**

```powershell
$body = @{
    email = "testuser@travel.network"
    username = "testuser"
    password = "Travel2024!"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body $body
```

### **2. Login with new user:**

```powershell
$loginBody = @{
    emailOrUsername = "testuser@travel.network"
    password = "Travel2024!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
```

---

## 🔍 **Check Database Status:**

### **Option A: Query Couchbase directly**

Open Couchbase Web Console: http://localhost:8091

```sql
-- Count users
SELECT COUNT(*) as total 
FROM `travel_users` 
WHERE type = 'user';

-- List first 10 users
SELECT username, email 
FROM `travel_users` 
WHERE type = 'user' 
LIMIT 10;
```

### **Option B: Seed fresh data**

```powershell
# Clear all data
node src/scripts/clearAllData.js
# Type "DELETE" when prompted

# Seed 500 users with full data
node src/scripts/seedMassiveData.js
```

After seeding, login with any user:
```powershell
# Example usernames from seed (format: {firstname}{lastname}{100-9999})
$loginBody = @{
    emailOrUsername = "jamessmith4523@travel.network"
    password = "Travel2024!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
```

---

## 📋 **API Credentials Format:**

### **Login API:**
- **Endpoint:** `POST /api/auth/login`
- **Field:** `emailOrUsername` (NOT `email`!)
- **Password:** `Travel2024!` (for all seeded users)

### **Body format:**
```json
{
  "emailOrUsername": "testuser@travel.network",
  "password": "Travel2024!"
}
```

**OR use username:**
```json
{
  "emailOrUsername": "testuser",
  "password": "Travel2024!"
}
```

---

## 🎯 **Quick Test Sequence:**

```powershell
# 1. Register
$regBody = '{"email":"test@travel.network","username":"test","password":"Travel2024!","firstName":"Test","lastName":"User"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body $regBody

# 2. Login
$loginBody = '{"emailOrUsername":"test@travel.network","password":"Travel2024!"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
```

---

## 🔧 **If Database Is Empty:**

```powershell
# Quick seed (45 users, 2 minutes)
npm run db:seed-realistic

# OR Massive seed (500 users, 2-4 hours)
npm run db:clear-all
npm run db:seed-massive
```

After seeding with `seedRealisticData.js`, use:
```
Email: sarah@travel.network
Username: sarah
Password: Travel2024!
```

After seeding with `seedMassiveData.js`, use format:
```
Email: {firstname}{lastname}{number}@travel.network
Username: {firstname}{lastname}{number}
Password: Travel2024!

Examples:
- jamessmith4523@travel.network
- maryjohnson8765@travel.network
```

---

## ✅ **Recommended: Register Test User Now**

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body '{"email":"admin@travel.network","username":"admin","password":"Travel2024!","firstName":"Admin","lastName":"User"}'
```

Then login:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"emailOrUsername":"admin","password":"Travel2024!"}'
```

**This will work immediately without seeding!** ✨

