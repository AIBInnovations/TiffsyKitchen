# Firebase Token Auto-Refresh Implementation

**Date:** 2026-01-18
**Issue:** Firebase ID token expiration causing 401 errors

## Problem

From backend logs:
```
> JWT verification failed, trying Firebase: invalid algorithm
> Firebase verification also failed: Firebase ID token has expired.
> Admin auth error: Both JWT and Firebase verification failed
[WARN] RESPONSE: GET /api/admin/dashboard | statusCode:401, error:"Unauthorized"
```

Firebase ID tokens expire after 1 hour. When users stay logged in longer than that, API calls fail with 401 errors.

## Solution

Updated the token refresh mechanism in [src/services/api.enhanced.service.ts](src/services/api.enhanced.service.ts) to get a fresh Firebase ID token from the Firebase Auth SDK instead of trying to refresh using the expired token.

## Changes Made

### 1. Added Firebase Auth Import
```typescript
import auth from '@react-native-firebase/auth';
```

### 2. Updated refreshToken() Method

**Old approach (WRONG):**
```typescript
// ❌ Tried to refresh using expired token
const response = await fetch(`${BASE_URL}/api/auth/admin/refresh`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${await this.getAuthToken()}`, // Expired token!
  },
});
```

**New approach (CORRECT):**
```typescript
// ✅ Get fresh token from Firebase Auth SDK
const currentUser = auth().currentUser;

if (!currentUser) {
  console.log('No Firebase user found, cannot refresh token');
  await this.setAuthToken(null);
  return null;
}

// Get a fresh Firebase ID token
// forceRefresh: true ensures we get a new token even if cached one hasn't expired
const freshToken = await currentUser.getIdToken(true);

// Store the new token
await this.setAuthToken(freshToken);
return freshToken;
```

## How It Works

1. **User makes API call** (e.g., GET /api/admin/dashboard)
2. **Backend returns 401** because Firebase token expired
3. **API service automatically calls refreshToken()**
4. **refreshToken() gets fresh token** from Firebase Auth SDK
5. **API service retries request** with fresh token
6. **Request succeeds** ✅

## Benefits

✅ Automatic token refresh - no user intervention needed
✅ Uses Firebase Auth SDK - guaranteed valid tokens
✅ Concurrent refresh handling - prevents multiple refresh calls
✅ Seamless user experience - no interruption
✅ Works for all authenticated API calls

## Technical Details

### Token Lifecycle

1. **Login:** User gets Firebase ID token (valid for 1 hour)
2. **API Calls:** Token sent in Authorization header
3. **Token Expires:** After 1 hour, backend rejects with 401
4. **Auto Refresh:** API service calls `currentUser.getIdToken(true)`
5. **New Token:** Firebase generates fresh token (valid for 1 hour)
6. **Retry:** API call retries with new token
7. **Success:** Request completes successfully

### Error Handling

If refresh fails (e.g., user logged out elsewhere):
- Token cleared from storage
- User redirected to login screen
- Error message: "Session expired. Please login again."

## Testing

### Test Expired Token Scenario

1. **Login to app**
2. **Wait 1+ hour** (or manually expire token in Firebase Console)
3. **Make API call** (navigate to dashboard, orders, etc.)
4. **Expected result:**
   - Brief loading indicator
   - Token refreshes automatically
   - Data loads successfully
   - No 401 error shown to user

### Console Logs to Verify

When token refresh happens:
```
========== TOKEN REFRESH STARTED ==========
Firebase user found, getting fresh ID token...
Fresh Firebase token obtained
Token length: 1234
========================================
```

If refresh fails:
```
========== TOKEN REFRESH FAILED ==========
Error: [error details]
==========================================
```

## Integration with RBAC

This fix works seamlessly with the role-based access control implementation:
- Token refresh preserves user role
- Role stored separately in AsyncStorage
- After refresh, API calls continue with correct role permissions
- No re-authentication required

## Backend Requirements

The backend must:
✅ Accept Firebase ID tokens in Authorization header
✅ Verify tokens using Firebase Admin SDK
✅ Return 401 when token is expired/invalid
✅ NOT require a separate refresh endpoint

## Migration Notes

### For Existing Users
- No changes required
- Works automatically on next API call after token expiry
- Transparent to users

### For New Deployments
- Ensure Firebase Admin SDK is configured on backend
- Verify backend accepts Firebase ID tokens
- Test with tokens older than 1 hour

## Common Issues

### Issue: Still getting 401 errors after fix
**Solutions:**
1. Verify Firebase user is still signed in: `auth().currentUser`
2. Check Firebase Admin SDK is configured on backend
3. Ensure backend token verification is working
4. Check console logs for refresh errors

### Issue: User logged out unexpectedly
**Solutions:**
1. Check if Firebase session was invalidated
2. Verify Firebase credentials haven't changed
3. Check backend logs for token verification errors
4. Ensure Firebase project ID matches

## Related Files

- [src/services/api.enhanced.service.ts](src/services/api.enhanced.service.ts) - Token refresh logic
- [App.tsx](App.tsx) - Authentication flow
- [src/services/auth.service.ts](src/services/auth.service.ts) - Auth methods

## References

- Firebase ID Token Documentation: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- Firebase getIdToken() API: https://firebase.google.com/docs/reference/js/auth.user#usergetidtoken

---

**Status:** ✅ IMPLEMENTED
**Impact:** All users benefit from automatic token refresh
**Testing:** Required before production deployment
