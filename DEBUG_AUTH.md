# Authentication Debug Guide

## Issue: Redirect to login after successful login

### Steps to Debug:

1. **Open Browser Console** (F12 → Console tab)

2. **Try to Login:**
   - Go to http://localhost:5173/login
   - Enter your credentials
   - Click "Sign In"

3. **Watch Console Logs:**
   Look for these log messages:

```
[AuthContext] Logging in with credentials: { emailOrUsername: "..." }
[AuthContext] Login response: { success: true, data: {...} }
[AuthContext] Login successful, user: ... authenticated: true
[ProtectedRoute] State: { isAuthenticated: true, loading: false, user: "..." }
[Dashboard] Loading data for user: ...
```

### Common Issues:

#### Issue 1: Token not being saved
**Logs to check:**
- `[AuthContext] Login successful`
- Check localStorage: `localStorage.getItem('accessToken')`

**Solution:**
Verify tokens are being set in localStorage after login.

#### Issue 2: Auth check failing
**Logs to check:**
- `[AuthContext] Checking auth, token: exists`
- `[AuthContext] Auth check failed`

**Solution:**
Check if backend is running and /api/auth/me endpoint works.

#### Issue 3: User state not updating
**Logs to check:**
- `[ProtectedRoute] State: { isAuthenticated: false, loading: false, user: undefined }`

**Solution:**
Check if `setIsAuthenticated(true)` is being called in login function.

#### Issue 4: Backend endpoint mismatch
**Error:** 404 on /api/auth/me

**Solution:**
Verify backend is running on port 3000 and routes are correct.

#### Issue 5: CORS issues
**Error:** CORS policy error in console

**Solution:**
Check backend .env has `CORS_ORIGIN=http://localhost:5173`

### Quick Checks:

**1. Backend Running:**
```powershell
# Check if backend is listening
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

**2. Test Backend Manually:**
```powershell
# Register a test user
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@test.com\",\"username\":\"testuser\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\"}'

# Login
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"emailOrUsername\":\"testuser\",\"password\":\"password123\"}'
```

**3. Test /me Endpoint:**
```powershell
# Use the token from login response
curl http://localhost:3000/api/auth/me `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Manual Test Flow:

1. **Clear everything:**
   - Clear localStorage: `localStorage.clear()`
   - Clear cookies
   - Close all browser tabs

2. **Start fresh:**
   - Open http://localhost:5173
   - Register new account
   - Check console for logs
   - Should redirect to /dashboard
   - Should NOT redirect back to /login

3. **Test persistence:**
   - Refresh page
   - Should stay on /dashboard
   - Should see "Welcome back, [name]"

### Solution if Still Failing:

If you see in console:
```
[AuthContext] Login successful, user: testuser, authenticated: true
[ProtectedRoute] State: { isAuthenticated: false, loading: false, user: undefined }
```

This means the auth state is not persisting. Try:

1. Clear browser cache completely
2. Check if multiple AuthProvider components exist
3. Verify App.jsx structure wraps everything correctly

### Expected Console Output (Success):

```
[AuthContext] Logging in with credentials: { emailOrUsername: "testuser" }
[AuthContext] Login response: { success: true, data: { user: {...}, accessToken: "...", refreshToken: "..." } }
[AuthContext] Login successful, user: testuser, authenticated: true
[ProtectedRoute] State: { isAuthenticated: true, loading: false, user: "testuser" }
[Dashboard] Loading data for user: user::abc-123
[Dashboard] Feed loaded: 0 posts
[Dashboard] Stats loaded: { postCount: 0, followerCount: 0, followingCount: 0 }
```

### Contact Points:

If issue persists after debugging:
1. Share console log output
2. Share network tab showing API calls
3. Share localStorage content
4. Share backend logs
