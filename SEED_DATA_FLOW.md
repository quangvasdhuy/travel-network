# 📊 SEED DATA FLOW DIAGRAM

## 🎯 seedMassiveData.js Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    START SEEDING                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Load Checkpoint (if exists)                        │
│  • Check seed_checkpoint.json                               │
│  • Resume from last position                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Connect to Couchbase                               │
│  • travel_users bucket                                      │
│  • travel_content bucket                                    │
│  • travel_trips bucket                                      │
│  • travel_social bucket                                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Create 1000 Users                   [2-3 minutes]  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ • Generate realistic names (First + Last)             │  │
│  │ • Create emails: {firstname}{lastname}{num}@...      │  │
│  │ • Hash password: Travel2024!                          │  │
│  │ • Random avatars, bios, locations                     │  │
│  │ • Batch insert 1000 docs/batch                        │  │
│  │ • Save userIds to checkpoint                          │  │
│  └───────────────────────────────────────────────────────┘  │
│  Output: 1000 users with full profiles                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Create 15 Destinations              [< 1 minute]   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ • Paris, Tokyo, Bali, London, NYC, etc.               │  │
│  │ • With country codes and slugs                        │  │
│  └───────────────────────────────────────────────────────┘  │
│  Output: 15 destinations                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 5: Create 100,000 Posts              [30-60 minutes]  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ For each user (1000):                                 │  │
│  │   For i = 1 to 100:                                   │  │
│  │     • Pick random post template                       │  │
│  │     • Pick random destination                         │  │
│  │     • Generate 0-3 images (80% have images)           │  │
│  │     • Create post with metadata                       │  │
│  │     • Batch insert every 1000 posts                   │  │
│  │   Save checkpoint every user                          │  │
│  └───────────────────────────────────────────────────────┘  │
│  Progress: ✓ Posts for user 1/1000 ... 1000/1000           │
│  Output: 100,000 posts with content & media                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Create 100,000 Trips              [30-60 minutes]  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ For each user (1000):                                 │  │
│  │   For i = 1 to 100:                                   │  │
│  │     • Pick trip template                              │  │
│  │     • Pick 2-5 destinations                           │  │
│  │     • Generate dates (past/present/future)            │  │
│  │     • Create detailed itinerary                       │  │
│  │     • Batch insert                                    │  │
│  │   Save checkpoint every user                          │  │
│  └───────────────────────────────────────────────────────┘  │
│  Output: 100,000 trips with detailed plans                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: Create ~125,000 Connections      [15-30 minutes]   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ For each user (1000):                                 │  │
│  │   • Pick 100-150 random users to follow               │  │
│  │   • Create connection documents                       │  │
│  │   • Batch insert                                      │  │
│  │   Save checkpoint every 100 users                     │  │
│  └───────────────────────────────────────────────────────┘  │
│  Output: ~125,000 bi-directional connections                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: Add Engagement                     [2-4 HOURS] ⏰  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Process posts in batches of 100:                      │  │
│  │   For each post (100,000):                            │  │
│  │     LIKES:                                            │  │
│  │     • Pick 80-120 random users                        │  │
│  │     • Add to interactions.likes array                 │  │
│  │     • Update stats.likeCount                          │  │
│  │                                                         │  │
│  │     COMMENTS:                                         │  │
│  │     • Generate 80-120 comments                        │  │
│  │     • Pick random comment templates                   │  │
│  │     • Pick random users as commenters                 │  │
│  │     • Add to interactions.comments array              │  │
│  │     • Update stats.commentCount                       │  │
│  │                                                         │  │
│  │   MutateIn (atomic update)                            │  │
│  │   Save checkpoint every 1000 posts                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  Progress: ✓ Processed 1000/100000 ... 100000/100000       │
│  Output: ~10M likes + ~10M comments = 20M interactions!     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 9: Recalculate User Stats           [10-15 minutes]   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ For each user (1000):                                 │  │
│  │   • Count posts (query)                               │  │
│  │   • Count trips (query)                               │  │
│  │   • Count followers (query)                           │  │
│  │   • Count following (query)                           │  │
│  │   • Update stats.* fields (MutateIn)                  │  │
│  └───────────────────────────────────────────────────────┘  │
│  Progress: ✓ Updated 100/1000 ... 1000/1000                │
│  Output: All user stats accurate                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 10: Cleanup & Summary                                 │
│  • Delete seed_checkpoint.json                              │
│  • Display final stats                                      │
│  • Show total time taken                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    ✅ COMPLETE!
```

---

## 📊 TIMELINE

```
Time 0:00  ████ Start
Time 0:02  ████ Users created (1000)
Time 0:03  ████ Destinations created (15)
Time 0:30  ████ Posts 50% (50,000)
Time 1:00  ████ Posts done (100,000)
Time 1:30  ████ Trips 50% (50,000)
Time 2:00  ████ Trips done (100,000)
Time 2:15  ████ Connections done (~125,000)
Time 3:00  ████ Engagement 25% (25,000 posts)
Time 4:00  ████ Engagement 50% (50,000 posts)
Time 5:00  ████ Engagement 75% (75,000 posts)
Time 6:00  ████ Engagement 100% (100,000 posts) ⏰ LONGEST!
Time 6:15  ████ User stats recalculated
Time 6:15  ✅ DONE!
```

**Most time:** Step 8 (Add Engagement) - 60-70% of total time

---

## 💾 CHECKPOINT SAVES

```javascript
{
  "usersCreated": 1000,        // After Step 3
  "postsCreated": 75000,       // During Step 5 (75%)
  "tripsCreated": 100000,      // After Step 6
  "connectionsCreated": 125000, // After Step 7
  "engagementProcessed": 50000, // During Step 8 (50%)
  "userIds": ["...", "..."]    // All user IDs
}
```

**Resume:** Script checks checkpoint → skips completed steps → continues from last position

---

## 🔄 RESUME LOGIC

```
IF checkpoint exists:
  ├─ usersCreated < 1000
  │  └─ Create remaining users
  ├─ postsCreated < 100000
  │  └─ Create remaining posts (per user)
  ├─ tripsCreated < 100000
  │  └─ Create remaining trips (per user)
  ├─ connectionsCreated < target
  │  └─ Create remaining connections
  ├─ engagementProcessed < 100000
  │  └─ Process remaining posts (add likes/comments)
  └─ ELSE: Run user stats recalculation

IF no checkpoint:
  └─ Start from Step 1
```

---

## 📦 DATA SIZE BREAKDOWN

```
┌─────────────────────────────────────────────┐
│ Bucket: travel_users                        │
│ Documents: 1,000                            │
│ Size: ~100 MB (100KB/user with stats)      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Bucket: travel_content                      │
│ Documents: 100,000 posts                    │
│ Size: ~8-10 GB                              │
│   ├─ Post metadata: ~500 MB                 │
│   ├─ Likes arrays: ~2 GB (100 users/post)  │
│   └─ Comments arrays: ~6 GB (100/post)     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Bucket: travel_trips                        │
│ Documents: 100,015 (100K trips + 15 dests) │
│ Size: ~1 GB (detailed itineraries)         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Bucket: travel_social                       │
│ Documents: ~125,000 connections             │
│ Size: ~100 MB (small connection docs)      │
└─────────────────────────────────────────────┘

═══════════════════════════════════════════════
TOTAL: ~11-12 GB
═══════════════════════════════════════════════
```

---

## 🎯 BOTTLENECKS & OPTIMIZATION

### Bottleneck: Engagement Step (Step 8)
**Why:** 100,000 posts × (80-120 likes + 80-120 comments) = 20M+ writes

**Optimizations:**
- ✅ Batch processing (100 posts at a time)
- ✅ MutateIn (atomic updates, no read-modify-write)
- ✅ Checkpoint every 1000 posts (can resume)
- ✅ Progress tracking (know where you are)

**Alternative approaches (not implemented):**
- ❌ Parallel processing (complex, risk of memory issues)
- ❌ Skip engagement (doesn't meet requirements)
- ❌ Fewer likes/comments (not realistic)

### Memory Management
- Documents created in batches of 1000
- No large arrays held in memory
- Checkpoint saves progress incrementally

---

## 🚀 PERFORMANCE TIPS

### Before Running:
1. Close other applications (free RAM)
2. Ensure 8GB+ RAM available
3. Use SSD if possible
4. Increase Couchbase RAM quota to 2GB+

### During Running:
1. Don't interrupt during batch inserts
2. Monitor progress via console
3. Check `seed_checkpoint.json` if curious
4. Be patient with Step 8 (engagement)

### If Problems:
1. Script crashes → Just run again (auto-resume)
2. Slow performance → Check Couchbase memory
3. "Out of memory" → Reduce BATCH_SIZE constant
4. "Timeout" → Check Couchbase is running

---

## ✅ SUCCESS INDICATORS

```
✓ Users: 1,000/1,000
✓ Created 15 destinations
✓ Created 100,000 posts
✓ Created 100,000 trips
✓ Created 125,000 connections
✓ Added 10,000,000 likes
✓ Added 10,000,000 comments
✓ Recalculated stats for all users
✓ Checkpoint file cleaned up

════════════════════════════════════════════════════
✅ MASSIVE DATA SEEDING COMPLETED!
════════════════════════════════════════════════════
```

**Time taken: XX minutes**

---

## 🎉 YOU'RE READY!

```bash
npm run db:seed-massive
```

And watch the magic happen! ✨

