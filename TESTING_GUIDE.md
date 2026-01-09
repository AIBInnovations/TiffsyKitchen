# Testing Guide - Dashboard Integration

## Pre-Test Checklist

Before running the app, ensure:
- [ ] Backend server is running at `https://tiffsy-backend.onrender.com`
- [ ] You have admin credentials ready
- [ ] Android device/emulator is connected OR iOS simulator is running
- [ ] Metro bundler is not already running

## Step-by-Step Testing

### 1. Start the Development Server

Open a terminal and run:
```bash
npm start
```

Keep this terminal open - this is the Metro bundler.

### 2. Run the App

Open a **NEW terminal** (keep Metro running) and run:

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

### 3. Test Login Flow

#### Test Case 1: First Time Login
1. ✅ App should show AdminLoginScreen
2. ✅ Enter username (min 3 characters)
3. ✅ Enter password (min 6 characters)
4. ✅ Click "Sign In"
5. ✅ Should show loading indicator on button
6. ✅ On success, should navigate to Dashboard

**Expected Result:** Login → Dashboard transition

**What to Watch For:**
- Error messages for invalid credentials
- Network error if backend is unreachable
- Validation errors for short username/password

#### Test Case 2: Remember Session
1. ✅ Login successfully
2. ✅ Close the app completely
3. ✅ Reopen the app
4. ✅ Should go directly to Dashboard (token persisted)

**Expected Result:** Skip login, show Dashboard immediately

### 4. Test Dashboard Features

#### Test Case 3: Dashboard Data Loading
1. ✅ Dashboard should show loading spinner initially
2. ✅ Then display data from API:
   - Total Orders
   - Total Revenue
   - Active Customers
   - Active Kitchens
   - Today's stats (Orders, Revenue, New Customers)
   - Pending Actions count
   - Recent Activity list

**Expected Result:** Loading → Data displayed

**If Backend Returns Data:**
- Numbers should match backend data
- Recent activity should show actual actions

**If Backend is Down:**
- Should show error message
- "Unable to Load Dashboard" with retry button

#### Test Case 4: Pull to Refresh
1. ✅ Pull down on the dashboard
2. ✅ Should show refresh indicator at top
3. ✅ Should fetch fresh data from API
4. ✅ Data should update (if changed on backend)

**Expected Result:** Refresh indicator → Fresh data

#### Test Case 5: Caching (30 seconds)
1. ✅ Load dashboard (note the data)
2. ✅ Close app
3. ✅ Wait 10 seconds
4. ✅ Reopen app
5. ✅ Dashboard should show cached data immediately (no loading)
6. ✅ Close app again
7. ✅ Wait 40 seconds (total: 50 seconds)
8. ✅ Reopen app
9. ✅ Should show loading spinner and fetch fresh data

**Expected Result:**
- Within 30s: Instant cached data
- After 30s: Loading → Fresh data

#### Test Case 6: Logout
1. ✅ Click logout icon (top-right corner)
2. ✅ Should clear token
3. ✅ Should return to login screen
4. ✅ Try reopening app - should show login screen

**Expected Result:** Dashboard → Login screen, token cleared

#### Test Case 7: Error Handling - No Internet
1. ✅ Turn off WiFi/mobile data
2. ✅ Pull to refresh on dashboard
3. ✅ Should show error: "No internet connection"
4. ✅ Should show retry button
5. ✅ Turn on internet
6. ✅ Click retry button
7. ✅ Should fetch data successfully

**Expected Result:** Error message → Retry → Success

#### Test Case 8: Error Handling - Backend Down
1. ✅ Ensure backend is unreachable
2. ✅ Pull to refresh
3. ✅ Should show network error after retries
4. ✅ Should have retry button

**Expected Result:** Error with retry option

### 5. Performance Testing

#### Test Case 9: Double-Tap Prevention
1. ✅ On login screen, enter credentials
2. ✅ Tap "Sign In" button twice quickly
3. ✅ Should only send ONE API request (check network tab)

**Expected Result:** Request deduplication works

#### Test Case 10: Memory Leaks
1. ✅ Open dashboard
2. ✅ Navigate away (logout)
3. ✅ Login again
4. ✅ Repeat 5-10 times
5. ✅ App should remain responsive (no lag/crashes)

**Expected Result:** No memory leaks, smooth performance

## Debugging

### Common Issues

#### Issue 1: "Unable to connect to development server"
**Solution:**
```bash
# Kill any existing Metro processes
pkill -f "cli.js start"

# Clear Metro cache
npm start -- --reset-cache
```

#### Issue 2: App shows blank screen
**Solution:**
- Check Metro bundler terminal for errors
- Check React Native debugger console
- Try: `npm run android` (or ios) again

#### Issue 3: "Network request failed" on login
**Solution:**
- Verify backend URL: `https://tiffsy-backend.onrender.com/api/auth/admin/login`
- Check if backend is running: Open URL in browser
- Check Android network permissions in AndroidManifest.xml

#### Issue 4: TypeScript errors
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild app
cd android && ./gradlew clean && cd ..
npm run android
```

#### Issue 5: "Unable to Load Dashboard" error
**Possible Causes:**
1. Backend `/api/admin/dashboard` endpoint not working
2. Invalid auth token
3. Network issue

**Debug Steps:**
- Check Metro console for error details
- Try login again to get fresh token
- Check backend logs

### Developer Tools

#### Enable React Native Debugger
- Shake device/emulator
- Select "Debug" from menu
- Opens Chrome DevTools

#### Check Network Requests
1. Enable debugger
2. Open Chrome DevTools → Network tab
3. Watch API calls to backend

#### View AsyncStorage
```javascript
// Add this to check stored token
import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.getItem('authToken').then(token =>
  console.log('Stored token:', token)
);
```

## Test Results Template

Use this to document your test results:

```
## Test Session: [Date/Time]

### Environment
- Device: [Android/iOS, Model, OS Version]
- Backend Status: [Running/Down]
- Network: [WiFi/Mobile Data/Offline]

### Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. First Time Login | ✅/❌ | |
| 2. Remember Session | ✅/❌ | |
| 3. Dashboard Loading | ✅/❌ | |
| 4. Pull to Refresh | ✅/❌ | |
| 5. Caching | ✅/❌ | |
| 6. Logout | ✅/❌ | |
| 7. No Internet Error | ✅/❌ | |
| 8. Backend Down Error | ✅/❌ | |
| 9. Double-Tap Prevention | ✅/❌ | |
| 10. Memory Leaks | ✅/❌ | |

### Issues Found
1. [Issue description]
   - Expected: [what should happen]
   - Actual: [what actually happened]
   - Severity: [Critical/High/Medium/Low]

2. [Issue description]
   ...

### Screenshots
[Attach screenshots of issues]
```

## Next Steps After Testing

Once testing is complete:

✅ **All Tests Pass** → Proceed to implement more screens (Users, Orders, etc.)

⚠️ **Some Tests Fail** → Document issues, we'll fix them together

❌ **Critical Failures** → Stop and debug before proceeding

---

**Ready to Test?** Run `npm start` and let's see it in action! 🚀
