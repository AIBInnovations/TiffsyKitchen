# Profile Endpoint Fallback

**Date:** 2026-01-18
**Status:** ⚠️ Endpoint Path Issue

---

## Issue

The frontend is getting 404 when calling `/api/auth/profile`, even though the backend team says they added it.

### Current Error:
```
📤 REQUEST: GET https://tiffsy-backend.onrender.com/api/auth/profile
❌ Response: 404 { "message": "Network error" }
```

---

## Solution Implemented

Added automatic fallback in [src/services/auth.service.ts](src/services/auth.service.ts):

```typescript
// Try primary endpoint
try {
  response = await apiService.get<any>('/api/auth/profile');
} catch (profileError) {
  // Fallback to alternate endpoint
  console.log('⚠️  /api/auth/profile failed, trying /api/auth/me...');
  response = await apiService.get<any>('/api/auth/me');
}
```

This ensures the app will work with either endpoint.

---

## Possible Backend Issues

### 1. Route Not Registered
The route might be added to the controller but not registered in the Express router.

**Check:** `src/auth/auth.routes.js`

Should have:
```javascript
router.get('/profile', authMiddleware, getCurrentUser);
// or
router.get('/api/auth/profile', authMiddleware, getCurrentUser);
```

### 2. Wrong Base Path
The route might be registered without the `/api` prefix, or vice versa.

**Possible paths:**
- `/auth/profile` (without /api)
- `/api/auth/profile` (with /api)
- `/api/auth/me` (alternate)

### 3. Middleware Order
The route might be registered after other middleware that catches all routes.

### 4. Method Mismatch
Route might be registered as POST instead of GET.

---

## Backend Verification

### Test Endpoint Manually

```bash
# Test with curl
curl -X GET https://tiffsy-backend.onrender.com/api/auth/profile \
  -H "Authorization: Bearer <firebase_token>" \
  -H "Content-Type: application/json"

# Also try without /api prefix
curl -X GET https://tiffsy-backend.onrender.com/auth/profile \
  -H "Authorization: Bearer <firebase_token>" \
  -H "Content-Type: application/json"

# Try the alternate endpoint
curl -X GET https://tiffsy-backend.onrender.com/api/auth/me \
  -H "Authorization: Bearer <firebase_token>" \
  -H "Content-Type: application/json"
```

### Expected Response (200 OK):
```json
{
  "status": 200,
  "message": "User profile",
  "data": {
    "user": {
      "_id": "...",
      "role": "KITCHEN_STAFF",
      ...
    }
  }
}
```

### Current Response (404 Not Found):
```json
{
  "message": "Network error"
}
```

---

## Checklist for Backend Team

- [ ] Verify route is in `auth.routes.js`
- [ ] Check route path matches frontend call
- [ ] Ensure authMiddleware is applied
- [ ] Test endpoint with Postman/curl
- [ ] Check Express app.use() order
- [ ] Verify controller function exists
- [ ] Check for typos in route path
- [ ] Ensure server was restarted after adding route

---

## Quick Fix Options

### Option 1: Use /api/auth/me (Recommended)
If `/api/auth/me` already exists and works, the frontend will automatically use it as fallback.

### Option 2: Fix /api/auth/profile Path
Ensure the route is registered correctly in backend.

### Option 3: Use Different Endpoint
If there's another working endpoint that returns user profile, let me know and I'll update the frontend.

---

## Testing After Backend Fix

1. **Clear app cache** and re-login
2. **Check console logs** for which endpoint succeeds
3. **Verify role** is returned correctly
4. **Test both endpoints** work

### Success Logs:
```
Trying /api/auth/profile...
========== GET PROFILE RESPONSE ==========
Response: { "status": 200, "data": { "user": { "role": "KITCHEN_STAFF" } } }
```

or

```
Trying /api/auth/profile...
⚠️  /api/auth/profile failed, trying /api/auth/me...
========== GET PROFILE RESPONSE ==========
Response: { "status": 200, "data": { "user": { "role": "KITCHEN_STAFF" } } }
```

---

## Status

**Frontend:** ✅ Has fallback mechanism - will work with either endpoint
**Backend:** ⚠️ Needs to verify which endpoint is actually working

The frontend will automatically use whichever endpoint works, so once the backend fixes the path issue, everything will work without any frontend changes needed.

---

**Next Steps:**
1. Backend team to verify endpoint paths
2. Test with curl to confirm which path works
3. Re-login in app to test
4. Check console logs to see which endpoint succeeded
