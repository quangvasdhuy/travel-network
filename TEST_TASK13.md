# Task 13 Test Guide: Enhanced Profile & Dashboard UI

## ✅ Task Complete

**What was built:**
- Enhanced profile pages with tabs (Posts, Followers, Following)
- Improved dashboard with stats cards and sidebar
- Reusable components (PostCard, UserCard, StatsCard)
- User follow/unfollow from lists
- Post like/delete functionality
- Suggested connections sidebar
- Activity feed display
- User statistics dashboard
- Real-time stat updates

---

## 🚀 Setup Instructions

### Prerequisites
- Task 12 completed (React app running)
- Backend API running on port 3000
- At least 2 registered users for testing

### Start Application

**Terminal 1 - Backend:**
```powershell
cd c:\Workspace\caohoc\travelnetwork
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd client
npm run dev
```

Frontend: `http://localhost:5173`

---

## 🧪 Testing Guide

### Test 1: Enhanced Dashboard

1. Login to your account
2. Navigate to `/dashboard`

**Expected:**
- Welcome message with your first name
- 4 stat cards showing:
  - Posts count (clickable → profile)
  - Followers count (clickable → profile)
  - Following count (clickable → profile)
  - Total likes count
- Feed section with posts from people you follow
- Right sidebar with:
  - "Suggested for you" (3 users)
  - "Trending Destinations" link
  - "Recent Activity" (if available)

**Verify:**
- [ ] Stats cards display correct numbers
- [ ] Clicking stat cards navigates to profile
- [ ] Feed shows posts if following users
- [ ] Empty state shows if not following anyone
- [ ] Suggested users have Follow buttons

### Test 2: Profile Page with Tabs

1. Click your username in navbar (or navigate to `/profile/your-username`)
2. **Expected:** Profile page with 3 tabs:
   - Posts (default active)
   - Followers
   - Following

**Posts Tab:**
- Shows all your posts
- Each post has:
  - Author info with photo
  - Post content
  - Location (if set)
  - Media images (if any)
  - Like count and button
  - Comment count
  - Menu button (your posts only) with Delete option
- Empty state if no posts

**Followers Tab:**
- Shows users who follow you
- Each follower card shows:
  - Profile photo
  - Full name
  - Username
  - Location
  - Bio (if set)
  - Post/follower counts
  - Follow button (if not yourself)
- Empty state if no followers

**Following Tab:**
- Shows users you follow
- Same card format as Followers
- Unfollow button (shows "Unfollow" for followed users)
- Empty state if not following anyone

**Verify:**
- [ ] Tab switching works smoothly
- [ ] Active tab highlighted
- [ ] Data loads on tab switch
- [ ] Loading spinner shows during data fetch
- [ ] Empty states display correctly
- [ ] Stats update when follow/unfollow

### Test 3: Visit Another User's Profile

1. Search for another user
2. Click their profile

**Expected:**
- Follow button (instead of Edit Profile)
- Can view their Posts/Followers/Following
- Can follow/unfollow from their profile
- Stats update in real-time
- Follow button shows correct state

**Verify:**
- [ ] Follow button appears (not Edit Profile)
- [ ] Clicking Follow updates button to "Unfollow"
- [ ] Follower count increments
- [ ] Can view all tabs
- [ ] Can follow users from their follower/following lists

### Test 4: Post Interactions

1. From dashboard or profile, find a post
2. **Like a Post:**
   - Click heart icon
   - Heart turns red and fills
   - Like count increments
   - Click again to unlike
   - Heart turns gray
   - Like count decrements

3. **Delete Your Post:**
   - On your own post, click menu (⋮)
   - Click "Delete Post"
   - Confirm deletion
   - Post disappears
   - Post count in stats decrements

**Verify:**
- [ ] Like toggle works
- [ ] Like count updates immediately
- [ ] Unlike works
- [ ] Delete menu only on own posts
- [ ] Delete confirmation shows
- [ ] Post disappears after delete
- [ ] Stats update after delete

### Test 5: Follow/Unfollow from Lists

1. Go to any profile
2. Switch to Followers or Following tab
3. Click Follow on a user you don't follow
4. **Expected:**
   - Button changes to "Unfollow"
   - Toast notification
   - Your following count increases

5. Click Unfollow
6. **Expected:**
   - Button changes to "Follow"
   - Toast notification
   - Your following count decreases

**Verify:**
- [ ] Follow button works from lists
- [ ] Button state updates
- [ ] Toast shows success message
- [ ] Stats update correctly
- [ ] Can follow multiple users
- [ ] No follow button on own card

### Test 6: Suggested Connections (Dashboard Sidebar)

1. View dashboard
2. Check "Suggested for you" section

**Expected:**
- Shows 3 suggested users
- Each has:
  - Profile photo
  - Name and username
  - Location (if set)
  - Bio preview
  - Stats (posts, followers)
  - Follow button
- "See all" link to explore page

**Test:**
1. Click Follow on a suggestion
2. **Expected:**
   - Button changes to "Unfollow"
   - Your following count increases in stats cards
   - Suggestion stays in list with updated button

**Verify:**
- [ ] Suggestions load
- [ ] Follow works from sidebar
- [ ] Button state updates
- [ ] Stats update
- [ ] "See all" link works

### Test 7: Post Card Features

**Test Each Feature:**

1. **Author Link:**
   - Click author name/photo
   - Should navigate to their profile

2. **Timestamp:**
   - Shows relative time ("2 hours ago")
   - Updates correctly

3. **Location:**
   - Shows if post has location
   - Location icon displays

4. **Media Grid:**
   - Single image: full width
   - 2 images: 2 columns
   - 3 images: 1 large + 2 small
   - 4+ images: 2x2 grid with "+X" overlay

5. **Actions:**
   - Like button (heart)
   - Comment count (for later)

**Verify:**
- [ ] All post elements display correctly
- [ ] Links work
- [ ] Images load and display properly
- [ ] Grid layouts adapt to image count
- [ ] Actions are clickable

### Test 8: User Card Features

1. Find a UserCard (search, followers, following, suggestions)

**Features:**
- Profile photo or initial avatar
- Full name (clickable to profile)
- Username
- Location with icon
- Bio preview (2 lines max)
- Stats (posts, followers)
- Follow button (conditional)

**Test:**
1. Click name → Should go to profile
2. Click Follow → Should update state
3. Long bio → Should truncate with ellipsis
4. No location → Location row hidden

**Verify:**
- [ ] All fields display correctly
- [ ] Click navigation works
- [ ] Follow button appears conditionally
- [ ] Text truncation works
- [ ] Optional fields hidden when empty

### Test 9: Stats Card Interactions

1. Go to dashboard
2. View the 4 stats cards

**Test Each Card:**
1. **Posts Card:**
   - Click → Navigate to profile posts tab
   - Shows correct count

2. **Followers Card:**
   - Click → Navigate to profile followers tab
   - Shows correct count

3. **Following Card:**
   - Click → Navigate to profile following tab
   - Shows correct count

4. **Total Likes Card:**
   - Shows total likes across all posts
   - Not clickable

**Verify:**
- [ ] Cards are clickable (first 3)
- [ ] Navigation works
- [ ] Counts are accurate
- [ ] Colors match design (primary, green, blue, orange)

### Test 10: Real-Time Updates

**Test Stat Updates:**

1. Note your current stats
2. Follow a new user
3. **Expected:** Following count +1 immediately

4. Unfollow a user
5. **Expected:** Following count -1 immediately

6. Delete one of your posts
7. **Expected:** Post count -1 immediately

8. Like a post
9. **Expected:** Like count on post +1

**Verify:**
- [ ] Stats update without page refresh
- [ ] Updates are immediate
- [ ] Multiple actions update correctly
- [ ] No race conditions or flickering

### Test 11: Empty States

**Test All Empty States:**

1. **Dashboard Feed:**
   - Unfollow everyone
   - Refresh dashboard
   - Should show: "Your feed is empty" with explore link

2. **Profile Posts:**
   - Visit a user with no posts
   - Should show: Grid icon + "No posts yet"

3. **Profile Followers:**
   - Visit a user with no followers
   - Should show: UserCheck icon + "No followers yet"

4. **Profile Following:**
   - Visit a user not following anyone
   - Should show: UserPlus icon + "Not following anyone"

5. **Dashboard Suggestions:**
   - If no suggestions available
   - Should show: "No suggestions available"

**Verify:**
- [ ] All empty states display
- [ ] Icons show correctly
- [ ] Messages are contextual (you vs. other user)
- [ ] CTA buttons present where appropriate

### Test 12: Responsive Design

**Mobile (375px):**
1. Resize browser to mobile width
2. **Dashboard:**
   - Stats: 2 columns
   - Feed: Single column
   - Sidebar: Full width below feed

3. **Profile:**
   - Tabs: Stacked/scrollable
   - Cards: Single column
   - Stats: 3 columns maintained

**Tablet (768px):**
1. Resize to tablet width
2. **Dashboard:**
   - Stats: 4 columns
   - Feed: Main content
   - Sidebar: Visible

3. **Profile:**
   - Tabs: Full width
   - Cards: 2 columns

**Desktop (1920px):**
- All elements at max width
- 3-column dashboard layout
- Optimal spacing

**Verify:**
- [ ] Mobile: Readable, functional
- [ ] Tablet: Good layout
- [ ] Desktop: Full features
- [ ] No horizontal scroll
- [ ] Touch targets adequate

### Test 13: Loading States

**Test All Loading Indicators:**

1. **Initial Dashboard Load:**
   - Shows large spinner
   - Centered on page

2. **Tab Switching (Profile):**
   - Shows spinner while loading
   - Replaces content smoothly

3. **Suggestions Sidebar:**
   - Shows small spinner
   - Only in that section

4. **Post Actions:**
   - Deleting: Button shows "Deleting..."
   - Button disabled during action

**Verify:**
- [ ] Spinners show during load
- [ ] Appropriate size for context
- [ ] Smooth transitions
- [ ] No layout shift
- [ ] Buttons disable during actions

### Test 14: Error Handling

**Test Error Scenarios:**

1. **API Failure:**
   - Stop backend
   - Try to follow user
   - Should show error toast

2. **Invalid Profile:**
   - Navigate to `/profile/nonexistentuser`
   - Should show "User not found"

3. **Network Error:**
   - Throttle network (dev tools)
   - Actions should timeout gracefully
   - Error toasts should show

4. **Delete Confirmation:**
   - Cancel delete → Post stays
   - Confirm delete → Post removes

**Verify:**
- [ ] Error toasts display
- [ ] Errors don't break UI
- [ ] User can retry actions
- [ ] Confirmation dialogs work

---

## 🔍 Verification Checklist

### ✅ Dashboard Features
- [ ] Welcome message displays
- [ ] 4 stats cards show correct data
- [ ] Stats cards are clickable
- [ ] Feed loads posts
- [ ] Empty state shows correctly
- [ ] Sidebar suggestions load
- [ ] Follow from suggestions works
- [ ] Trending destinations link
- [ ] Activity feed displays
- [ ] Responsive layout

### ✅ Profile Features
- [ ] 3 tabs (Posts, Followers, Following)
- [ ] Tab switching works
- [ ] Posts display correctly
- [ ] Followers list loads
- [ ] Following list loads
- [ ] Follow/unfollow from lists
- [ ] Stats update in real-time
- [ ] Empty states for all tabs
- [ ] Own profile: Edit button
- [ ] Other profile: Follow button

### ✅ Components
- [ ] PostCard displays all elements
- [ ] PostCard like toggle works
- [ ] PostCard delete works (own posts)
- [ ] UserCard shows all info
- [ ] UserCard follow button works
- [ ] StatsCard displays correctly
- [ ] StatsCard click navigation

### ✅ Interactions
- [ ] Like/unlike posts
- [ ] Follow/unfollow users
- [ ] Delete own posts
- [ ] Navigate to profiles
- [ ] View all tabs
- [ ] Real-time stat updates

### ✅ UX
- [ ] Loading spinners
- [ ] Error toasts
- [ ] Success toasts
- [ ] Empty states
- [ ] Confirmation dialogs
- [ ] Smooth transitions
- [ ] No flickering
- [ ] Responsive design

---

## 🐛 Common Issues & Solutions

### Issue: Stats cards show 0 even with data
**Solution:**
- Check if user stats API endpoint returns data
- Verify `userAPI.getUserStats(userId)` call
- Check backend user stats calculation

### Issue: Tabs don't load data
**Solution:**
- Check `useEffect` dependency array includes `[activeTab, profile]`
- Verify API endpoints work in Postman
- Check network tab for errors

### Issue: Follow button doesn't update
**Solution:**
- Verify state update in `handleFollowToggle`
- Check if `isFollowing` prop passed correctly
- Ensure connection status API works

### Issue: Posts don't show in profile
**Solution:**
- Verify post feed API accepts `authorId` parameter
- Check if posts exist for that user
- Verify `postAPI.getFeed({ authorId })` call

### Issue: Images don't load
**Solution:**
- Check image URLs are complete
- Verify `uploads/` directory exists
- Check if backend serves static files

---

## 📊 Test Results Template

```
✅ Enhanced Dashboard      - PASS
✅ Profile Tabs            - PASS
✅ Visit Other Profile     - PASS
✅ Post Interactions       - PASS
✅ Follow from Lists       - PASS
✅ Suggested Connections   - PASS
✅ Post Card Features      - PASS
✅ User Card Features      - PASS
✅ Stats Card Interactions - PASS
✅ Real-Time Updates       - PASS
✅ Empty States            - PASS
✅ Responsive Design       - PASS
✅ Loading States          - PASS
✅ Error Handling          - PASS

Overall: ALL TESTS PASSED ✅
```

---

## 🎯 What's Next

Task 13 complete! Ready for:

**Task 14:** Trip Planning Interface
- Trip creation wizard
- Trip list view
- Trip detail pages
- Destination selection
- Date picker integration

---

## 📝 Notes

- Follow/unfollow updates stats in real-time
- Like counts persist across page navigation
- Empty states are contextual (you vs. other users)
- All lists support pagination (backend ready)
- Post media displays in smart grid layouts

---

## ✨ Task 13 Complete!

**Built:**
- ✅ Enhanced dashboard with stats and sidebar
- ✅ Profile tabs (Posts, Followers, Following)
- ✅ Reusable components (PostCard, UserCard, StatsCard)
- ✅ Post interactions (like, delete)
- ✅ Follow/unfollow from anywhere
- ✅ Real-time stat updates
- ✅ Suggested connections
- ✅ Activity feed display
- ✅ Empty states everywhere
- ✅ Responsive design

**Ready for Task 14: Trip Planning UI!** 🎊
