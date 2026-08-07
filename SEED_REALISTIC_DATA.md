# 🌟 Seed Realistic Data - 100 High-Quality Records

## 📋 Overview

Script `seedRealisticData.js` tạo **100 records chất lượng cao, realistic** thay vì fake data:

- ✅ **50 Professional Users** - Travel bloggers, digital nomads, photographers, etc.
- ✅ **30 Top Destinations** - Paris, Tokyo, Bali, Santorini, etc.
- ✅ **100 Authentic Posts** - Real travel stories and experiences
- ✅ **~400 Realistic Connections** - Natural social graph (5-15 follows per user)
- ✅ **50 Travel Trips** - Various statuses (planning, upcoming, completed)

---

## 🚀 How to Run

### Method 1: Using NPM Script
```bash
npm run db:seed-realistic
```

### Method 2: Direct Node Execution
```bash
node src/scripts/seedRealisticData.js
```

### Method 3: PowerShell (if execution policy allows)
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run db:seed-realistic
```

---

## 👥 Sample User Profiles

### Travel Bloggers & Influencers:
- **nomadic_matt** - Budget travel expert, NYT bestselling author
- **expert_vagabond** - Adventure travel photographer, Nat Geo contributor
- **hey_nadine** - Video creator, solo female traveler
- **migrationology** - Food and travel vlogger

### Digital Nomads:
- **digital_sophia** - UX Designer, currently in Lisbon
- **code_and_travel** - Full-stack developer, building startups
- **remote_olivia** - Content strategist, slow travel advocate

### Adventure Enthusiasts:
- **mountain_mike** - Mountaineer, climbed 6 of 7 summits
- **trail_sarah** - Thru-hiker (PCT, AT, CDT completed)
- **dive_deep_tom** - Scuba instructor, underwater photographer

### Luxury Travelers:
- **luxury_travels_kate** - Luxury travel consultant
- **yacht_lifestyle** - Yacht captain, Mediterranean sailing
- **spa_wellness_jen** - Wellness travel expert

---

## 🔐 Login Credentials

**All users have the same password:**
```
Password: Travel2024!
```

**Example logins:**
- Username: `nomadic_matt` / Password: `Travel2024!`
- Username: `digital_sophia` / Password: `Travel2024!`
- Username: `mountain_mike` / Password: `Travel2024!`

---

## 🌍 Destinations Included

### Europe:
Paris, Barcelona, London, Rome, Santorini, Amsterdam, Prague, Vienna, Lisbon, Dubrovnik

### Asia:
Tokyo, Bali, Singapore, Bangkok, Kyoto, Hanoi, Istanbul, Marrakech, Dubai, Petra

### Americas:
New York, Rio de Janeiro, Buenos Aires, Machu Picchu, Banff

### Oceania:
Sydney, Bora Bora, Maldives

### Africa:
Cape Town, Marrakech

---

## 📝 Post Examples

Posts are generated with realistic content:

```
"Just watched the sunrise at Machu Picchu. Words can't describe how beautiful it was. This is why I travel. 🌅"

"Best ramen I've ever had was at this little street stall in Tokyo. The locals know best! 🍜"

"Spent the day exploring Prague. Every corner is Instagram-worthy but even better in real life. 📸"

"Working remotely from Lisbon this month. Best office view ever! Digital nomad life is treating me well. 💻"
```

---

## 📊 Data Quality Features

✅ **Realistic Usernames** - Professional, memorable names (not user12345)
✅ **Authentic Bios** - Real-sounding profiles with personality
✅ **Natural Social Graph** - Each user follows 5-15 others randomly
✅ **Varied Engagement** - Posts have 5-200 likes, 1-50 comments
✅ **Diverse Interests** - photography, food, hiking, culture, etc.
✅ **Real Locations** - Actual coordinates for major destinations
✅ **Timestamp Variety** - Data spread across last 90 days
✅ **Multiple Trip Statuses** - planning, upcoming, ongoing, completed

---

## 🎯 Next Steps - Scale to 1000s

Once you verify these 100 records look good, I can create a larger script to generate:

- **500-1000 Users**
- **50-100 Destinations** (smaller cities, hidden gems)
- **5,000-10,000 Posts**
- **20,000-50,000 Connections**
- **1,000-2,000 Trips**
- **10,000+ Comments**
- **50,000+ Likes**

Let me know when you want to scale up! 🚀

---

## 🐛 Troubleshooting

### Error: "Cannot connect to Couchbase"
- Ensure Couchbase is running
- Check `.env` file for correct credentials

### Error: "Bucket not found"
- Run `npm run db:init` first to create buckets

### PowerShell Execution Policy Error
- Use Method 2 (direct node execution)
- Or temporarily bypass: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

---

## 📞 Support

If you encounter issues:
1. Check Couchbase is running: `http://localhost:8091`
2. Verify buckets exist: `travel_users`, `travel_content`, `travel_social`, `travel_trips`
3. Check `.env` file configuration
4. Review script output for specific errors

