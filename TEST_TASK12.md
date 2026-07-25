# Task 12 Test Guide: React Frontend Setup & Authentication

## ✅ Task Complete

**What was built:**
- React app with Vite
- React Router with protected routes
- Authentication context and JWT handling
- Login and Register pages with validation
- API service layer with axios interceptors
- Responsive navigation
- Basic pages (Dashboard, Profile, Explore, Search)
- Loading states and toast notifications

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```powershell
cd client
npm install
```

### 2. Create Environment File

```powershell
Copy-Item .env.example .env
```

### 3. Start Development Server

**Terminal 1 - Backend (if not running):**
```powershell
cd c:\Workspace\caohoc\travelnetwork
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd client
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 🧪 Testing Guide

### Test 1: Landing Page

1. Open `http://localhost:5173`
2. **Expected:**
   - Hero section with "Connect. Share. Explore."
   - Feature cards
   - Get Started and Sign In buttons
   - Responsive design

### Test 2: Registration Flow

1. Click "Get Started" or navigate to `/register`
2. Fill in the form:
   - Email: `test@example.com`
   - Username: `testuser`
   - First Name: `Test`
   - Last Name: `User`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create Account"

**Expected:**
- Form validation works (try empty fields)
- Password visibility toggle works
- Success toast appears
- Automatic redirect to `/dashboard`
- Navigation shows username

### Test 3: Login Flow

1. Logout (click username → Logout)
2. Navigate to `/login`
3. Login with:
   - Identifier: `testuser` or `test@example.com`
   - Password: `password123`
4. Click "Sign In"

**Expected:**
- Welcome back toast
- Redirect to dashboard
- User info in navbar

### Test 4: Protected Routes

1. Logout
2. Try to access `/dashboard` directly
3. **Expected:** Redirect to `/login`
4. After login, should redirect back to dashboard

### Test 5: Navigation

**When Logged In:**
1. Test navigation links:
   - Home (Dashboard)
   - Explore
   - Search
   - Profile (click username)
2. **Expected:** All routes work, active state shows correctly

**Mobile Menu:**
1. Resize browser to mobile width
2. Click hamburger menu
3. **Expected:** Menu slides in with all nav links

### Test 6: Dashboard

1. Navigate to `/dashboard`
2. **Expected:**
   - Welcome message with user's first name
   - Feed loads (may be empty if no posts)
   - "Start following travelers" message if feed empty

### Test 7: Profile Page

1. Click your username in navbar
2. **Expected:**
   - Profile photo or initial
   - Full name and username
   - Join date
   - Stats (posts, followers, following)
   - "Edit Profile" button visible

### Test 8: Edit Profile

1. From profile, click "Edit Profile"
2. Update information:
   - Change first/last name
   - Add bio
   - Add location (city, country)
   - Add interests (type and click Add)
3. Click "Save Changes"

**Expected:**
- Success toast
- Redirect to profile
- Changes reflected

**Photo Upload:**
1. Click "Change Photo"
2. Select image (JPG/PNG, max 5MB)
3. **Expected:** Upload progress, success toast, photo updates

### Test 9: Explore Page

1. Navigate to `/explore`
2. **Expected:**
   - "Trending Destinations" section
   - Destination cards with images
   - "Popular Posts" section
   - Post cards with author info

### Test 10: Search

1. Navigate to `/search`
2. Enter search query (e.g., "paris")
3. **Expected:**
   - Results grouped by Users, Destinations, Posts
   - Result counts
   - "No results" message if nothing found

### Test 11: Token Refresh

1. Login
2. Wait 24 hours (or modify token expiry)
3. Make any API call
4. **Expected:** Token refreshes automatically, no errors

**Manual Test:**
1. Open DevTools → Application → Local Storage
2. Delete `accessToken`
3. Try to access protected route
4. **Expected:** Refresh token used, new access token obtained

### Test 12: Error Handling

**Invalid Login:**
1. Login with wrong credentials
2. **Expected:** Error toast with message

**Network Error:**
1. Stop backend server
2. Try any API call
3. **Expected:** Error toast

**Validation Errors:**
1. Try registering with:
   - Invalid email format
   - Short username (< 3 chars)
   - Short password (< 6 chars)
   - Non-matching passwords
   - Special characters in username
2. **Expected:** Inline error messages

### Test 13: Responsive Design

**Desktop (1920x1080):**
- Full navigation bar
- Multi-column layouts

**Tablet (768x1024):**
- Adjusted grid layouts
- Hamburger menu appears

**Mobile (375x667):**
- Single column
- Mobile-optimized forms
- Bottom navigation accessible

### Test 14: 404 Page

1. Navigate to `/nonexistent`
2. **Expected:**
   - 404 error page
   - Animated compass
   - Links to dashboard and home

---

## 🔍 Verification Checklist

### ✅ Authentication
- [ ] Registration works with validation
- [ ] Login works with email or username
- [ ] Logout clears tokens and redirects
- [ ] Protected routes redirect to login
- [ ] Token refresh works automatically
- [ ] Auth state persists on page reload

### ✅ Navigation
- [ ] Navbar shows correct links when logged in
- [ ] Active route highlighted
- [ ] Mobile menu works
- [ ] Logout button functions
- [ ] Profile link goes to user's profile

### ✅ Pages
- [ ] Landing page loads
- [ ] Dashboard shows welcome and feed
- [ ] Profile page displays user info
- [ ] Edit profile updates data
- [ ] Explore shows trending/popular
- [ ] Search returns results
- [ ] 404 page for invalid routes

### ✅ UI/UX
- [ ] Loading spinners show during API calls
- [ ] Toast notifications for actions
- [ ] Form validation works
- [ ] Error messages display
- [ ] Buttons disabled during loading
- [ ] Responsive on mobile/tablet/desktop

### ✅ API Integration
- [ ] All endpoints called correctly
- [ ] Axios interceptors add tokens
- [ ] 401 errors trigger token refresh
- [ ] Error responses handled gracefully

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution:**
```powershell
cd client
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue: Port 5173 already in use
**Solution:**
```powershell
# Kill process on port 5173
Get-NetTCPConnection -LocalPort 5173 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
```

### Issue: API calls fail with CORS error
**Solution:**
- Ensure backend is running on port 3000
- Check CORS_ORIGIN in backend `.env` includes `http://localhost:5173`

### Issue: Login redirects to dashboard but shows "not authenticated"
**Solution:**
- Check localStorage has `accessToken`
- Check browser console for errors
- Verify token is valid (not expired)

### Issue: Styles not loading
**Solution:**
```powershell
cd client
npm run build
npm run dev
```

---

## 📊 Test Results Template

```
✅ Landing Page          - PASS
✅ Registration          - PASS
✅ Login                 - PASS
✅ Protected Routes      - PASS
✅ Navigation            - PASS
✅ Dashboard             - PASS
✅ Profile Page          - PASS
✅ Edit Profile          - PASS
✅ Explore Page          - PASS
✅ Search                - PASS
✅ Token Refresh         - PASS
✅ Error Handling        - PASS
✅ Responsive Design     - PASS
✅ 404 Page              - PASS

Overall: ALL TESTS PASSED ✅
```

---

## 🎯 What's Next

Task 12 is complete! The foundation is ready for:

**Task 13:** Enhanced profiles and dashboard
**Task 14:** Trip planning interface
**Task 15:** Social feed and content creation
**Task 16:** Responsive design polish

---

## 📝 Notes

- Backend must be running for full functionality
- Sample destinations and data from backend initialization
- Photo uploads require `uploads/profiles/` directory
- Token expiry set to 24h in backend

---

## ✨ Task 12 Complete!

**Built:**
- ✅ Complete React application structure
- ✅ Authentication system with JWT
- ✅ Protected routing
- ✅ API integration layer
- ✅ 8 complete pages
- ✅ Responsive navigation
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Toast notifications

**Ready for Task 13: Profile & Dashboard Enhancement**
