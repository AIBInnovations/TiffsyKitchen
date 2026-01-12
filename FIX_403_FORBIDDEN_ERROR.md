# Fix 403 Forbidden Error - Complete Solution

## Root Cause Analysis

The 403 Forbidden error is caused by **using mock authentication tokens** instead of real admin tokens from the backend.

### Current Problem

In [`src/services/auth.service.ts`](src/services/auth.service.ts:11):
```typescript
const USE_MOCK_LOGIN = false;  // ✅ FIXED - Was true
```

When `USE_MOCK_LOGIN = true`, the app uses **fake tokens** like:
- `'mock-token-kitchen-staff-123'`
- `'mock-token-driver-456'`

These mock tokens are **NOT recognized** by the real backend API at `https://tiffsy-backend.onrender.com`, causing 403 Forbidden errors.

---

## ✅ Solution Applied

### Step 1: Disable Mock Login ✅ COMPLETED

**File:** `src/services/auth.service.ts`

**Changed:**
```typescript
// Before:
const USE_MOCK_LOGIN = true;  ❌

// After:
const USE_MOCK_LOGIN = false;  ✅
```

---

## 🔐 Authentication Flow for Admin

According to the documentation, the admin authentication requires:

### Admin Login Flow

```
1. Phone Number Input
   ↓
2. Firebase OTP Verification
   ↓
3. Admin Login Screen (username + password)
   ↓
4. POST /api/auth/admin/login
   Request Headers:
     - Authorization: Bearer <firebase_id_token>
   Request Body:
     - username
     - password
   ↓
5. Backend Returns Auth Token
   Response:
     {
       "success": true,
       "data": {
         "token": "real-backend-jwt-token",
         "user": {
           "role": "ADMIN",
           ...
         }
       }
     }
   ↓
6. Token Stored in AsyncStorage as 'authToken'
   ↓
7. All API Requests Use This Token
   Header: Authorization: Bearer <real-backend-jwt-token>
```

---

## 📋 Complete Fix Checklist

### ✅ Step 1: Mock Login Disabled
- [x] Changed `USE_MOCK_LOGIN = false` in `auth.service.ts`
- [x] App will now use real backend authentication

### ⏭️ Step 2: Ensure Proper Login

You need to **login through the admin flow** to get a real token:

1. **Open the app**
2. **Phone Authentication:**
   - Enter your phone number
   - Receive and enter OTP from Firebase

3. **Admin Login:**
   - Enter admin username
   - Enter admin password
   - App will call: `POST /api/auth/admin/login`
   - Backend validates and returns JWT token

4. **Token Storage:**
   - Token is stored in AsyncStorage as `'authToken'`
   - All subsequent API calls use this token

### ⏭️ Step 3: Verify Token is Stored

Add this debug code temporarily to check:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add a button in your app to run this
const debugAuth = async () => {
  const token = await AsyncStorage.getItem('authToken');
  const role = await AsyncStorage.getItem('adminRole');

  console.log('=== AUTH DEBUG ===');
  console.log('Token exists:', !!token);
  console.log('Token preview:', token?.substring(0, 30) + '...');
  console.log('Admin role:', role);
  console.log('==================');
};
```

**Expected Output:**
```
=== AUTH DEBUG ===
Token exists: true
Token preview: eyJhbGciOiJIUzI1NiIsInR5cCI...
Admin role: ADMIN
==================
```

---

## 🔍 Verify the Fix Works

### Test 1: Check API Service Logs

When you make an API request, check the console logs:

```
========== API SERVICE REQUEST ==========
Endpoint: https://tiffsy-backend.onrender.com/api/orders/admin/all
Method: GET
Token Retrieved from Storage: YES  ✅ (Must be YES)
Token Length: 234
Token (first 50 chars): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Authorization Header Set: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...
=========================================
```

**Look for:**
- ✅ `Token Retrieved from Storage: YES`
- ✅ Token is a long JWT string (not `mock-token-...`)
- ✅ Authorization header is set

**Bad signs:**
- ❌ `Token Retrieved from Storage: NO`
- ❌ `⚠️ No token available`
- ❌ Token is `mock-token-kitchen-staff-123`

### Test 2: Check API Response

```
========== API SERVICE RESPONSE ==========
Endpoint: /api/orders/admin/all
Status Code: 200  ✅ (Should be 200, not 403)
Status Text: OK
Response OK: true
==========================================
```

**Success:**
- ✅ Status Code: 200
- ✅ Response OK: true

**Still failing:**
- ❌ Status Code: 403
- ❌ Error Message: "Forbidden" or "Unauthorized"

---

## 🚨 If Still Getting 403 Error

### Issue 1: Not Logged In

**Symptom:** No token in AsyncStorage

**Solution:**
1. Logout from the app (if logged in)
2. Close and reopen the app
3. Go through complete login flow
4. Check that token is stored

### Issue 2: Wrong User Role

**Symptom:** Token exists but role is not "ADMIN"

The orders admin endpoints require **ADMIN role**:
- `/api/orders/admin/all`
- `/api/orders/admin/stats`
- `/api/orders/:id/admin-cancel`

**Solution:**
- Login with an account that has **ADMIN** role
- Contact backend team to verify your account has admin privileges

### Issue 3: Token Expired

**Symptom:** Token exists but backend rejects it

**Solution:**
1. Clear app data:
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```
2. Restart app
3. Login again

### Issue 4: Firebase Token Issue

**Symptom:** Admin login fails or returns error

**Check:**
1. Firebase is properly configured (`google-services.json` in place)
2. Phone OTP verification works
3. Firebase token is valid

**Solution:**
- Complete Firebase setup (see [FIREBASE_SETUP.md](FIREBASE_SETUP.md))
- Verify Firebase auth is enabled in Firebase Console

---

## 🎯 Role-Based Access

Different endpoints require different roles:

| Endpoint | Required Role | Who Can Access |
|----------|---------------|----------------|
| `/api/orders/admin/all` | **ADMIN** | Admin only |
| `/api/orders/admin/stats` | **ADMIN** | Admin only |
| `/api/orders/:id/admin-cancel` | **ADMIN** | Admin only |
| `/api/kitchen/orders` | **KITCHEN_STAFF** | Kitchen staff only |
| `/api/driver/deliveries` | **DRIVER** | Drivers only |
| `/api/orders/:id/track` | Any authenticated | All users |

**Important:**
- Admin endpoints (`/api/orders/admin/*`) need **ADMIN role**
- Kitchen endpoints (`/api/kitchen/*`) need **KITCHEN_STAFF role**
- Driver endpoints (`/api/driver/*`) need **DRIVER role**

Your app is an **Admin app**, so you must login with admin credentials to access admin endpoints.

---

## 📝 Implementation Details

### API Service Token Handling

The API service ([`src/services/api.service.ts`](src/services/api.service.ts)) automatically:

1. **Retrieves token** from AsyncStorage (`'authToken'`)
2. **Adds to headers:** `Authorization: Bearer <token>`
3. **Sends with every request**

**Code snippet:**
```typescript
private async getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem('authToken');
}

// In request method:
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### Token Storage

After successful admin login, token is stored in [AdminLoginScreen.tsx](src/screens/admin/AdminLoginScreen.tsx:197-218):

```typescript
if (response.ok && !data.error && data.data) {
  // Verify user role is ADMIN
  const userRole = data.data?.user?.role;

  if (userRole !== 'ADMIN') {
    setGlobalError('Access Denied. Admin privileges required.');
    return;
  }

  // Store token and user data
  onLoginSuccess(JSON.stringify({
    token: data.data.token,  // ← Real JWT token from backend
    user: data.data.user,
    expiresIn: data.data.expiresIn,
    rememberMe: rememberMe,
  }));
}
```

---

## ✅ Summary of Changes

### Files Modified

1. **`src/services/auth.service.ts`** ✅
   - Changed: `USE_MOCK_LOGIN = false`
   - Impact: App now uses real backend authentication

### What This Fixes

- ✅ No more mock tokens being sent to backend
- ✅ App will use real JWT tokens from admin login
- ✅ API requests will be properly authenticated
- ✅ 403 Forbidden errors should be resolved (if properly logged in)

---

## 🧪 Testing Steps

### 1. Clear App Data

```bash
# On Android emulator/device
adb shell pm clear com.tiffsykitchen
```

Or programmatically:
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

### 2. Restart App

```bash
npx react-native run-android
```

### 3. Complete Login Flow

1. Enter phone number
2. Verify OTP
3. Enter admin username and password
4. Wait for successful login

### 4. Test API Calls

Navigate to Orders screen and check:
- Orders load without 403 error
- Statistics show up
- Order details work

### 5. Monitor Console Logs

Watch for:
```
✅ Token Retrieved from Storage: YES
✅ Status Code: 200
✅ Response OK: true
```

---

## 🆘 Still Need Help?

If you're still getting 403 errors after following all steps:

### Check These Items:

1. **Backend Status:**
   - Is `https://tiffsy-backend.onrender.com` running?
   - Try accessing it in a browser

2. **Admin Account:**
   - Do you have valid admin credentials?
   - Has your account been created in the backend?
   - Does your account have ADMIN role?

3. **Token Validity:**
   - Is the token expired?
   - Try logging out and logging in again

4. **Network:**
   - Can your device/emulator reach the backend?
   - Check internet connection

### Get Backend Logs

Ask backend team to check:
- Was the request received?
- What token was sent?
- Was the token valid?
- What role does the user have?
- Why was the request rejected?

---

## 📞 Contact Backend Team

If the issue persists, provide this information to backend team:

```
Issue: 403 Forbidden on orders API

Details:
- Endpoint: /api/orders/admin/all (or specific endpoint)
- Method: GET
- Token sent: [first 50 chars of token]
- Expected role: ADMIN
- User account: [your admin username]
- App version: [version]
- Time of request: [timestamp]

Console logs:
[Paste relevant logs from console]
```

---

## ✅ Success Checklist

After applying the fix, verify:

- [ ] `USE_MOCK_LOGIN = false` in auth.service.ts
- [ ] Logged in through admin flow (phone OTP + username/password)
- [ ] Token stored in AsyncStorage as 'authToken'
- [ ] Token is real JWT (not 'mock-token-...')
- [ ] API requests include Authorization header
- [ ] Orders API returns 200 status (not 403)
- [ ] Orders data loads successfully
- [ ] No "Forbidden" errors in console

---

**Status:** ✅ Mock login disabled - Ready for real authentication

**Next Step:** Complete admin login flow to get real token

**Expected Result:** All API calls should work with proper authentication
