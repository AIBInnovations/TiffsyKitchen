# Backend Profile Endpoint Required

**Date:** 2026-01-18
**Status:** ⚠️ WORKAROUND IN PLACE - Backend Fix Required
**Priority:** HIGH

---

## Issue

The frontend is trying to call `/auth/profile` endpoint to get the authenticated user's profile and role, but this endpoint returns **404 Not Found**.

### Error from Frontend:
```
📤 REQUEST: GET https://tiffsy-backend.onrender.com/auth/profile
❌ Response: 404 {
  "message": "Network error"
}
```

### From Backend Logs:
```
[INFO] [HTTP] REQUEST: GET /auth/profile | method:"GET", ip:"::1"
> JWT verification failed, trying Firebase: invalid algorithm
> Firebase verification also failed: Firebase ID token has expired
```

---

## Current Workaround

The frontend now has a **temporary fallback** that defaults to `KITCHEN_STAFF` role when the profile endpoint fails:

### Code in [App.tsx](App.tsx):
```typescript
try {
  userProfile = await authService.getProfile();
  // ... normal flow
} catch (profileError) {
  console.log('========== USING FALLBACK ROLE ==========');
  console.log('Setting default role to KITCHEN_STAFF');
  console.log('⚠️  IMPORTANT: Backend needs /auth/profile endpoint');

  appRole = 'KITCHEN_STAFF'; // Default fallback
  // ... create temporary user object
}
```

### Impact of Workaround:
- ✅ Kitchen staff can log in
- ✅ App functions for kitchen users
- ⚠️ All users default to KITCHEN_STAFF role
- ❌ Admin users cannot access admin features
- ❌ Cannot distinguish between roles

---

## Required Backend Fix

### 1. Add `/auth/profile` Endpoint

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Purpose:** Return authenticated user's profile including role

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "user_id_from_database",
    "phone": "+919876543210",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "role": "KITCHEN_STAFF",  // ← Critical: Must return actual role
    "status": "ACTIVE",
    "isActive": true,
    "isVerified": true,
    "kitchenId": "kitchen_id_if_kitchen_staff",  // Optional
    "createdAt": "2026-01-18T00:00:00.000Z",
    "updatedAt": "2026-01-18T00:00:00.000Z"
  }
}
```

### 2. Implementation Requirements

#### Authentication:
- Accept Firebase ID token in `Authorization: Bearer <token>` header
- Verify token using Firebase Admin SDK
- Extract `uid` from verified token
- Look up user in database by `firebaseUid`

#### Role Mapping:
The backend should return one of these roles:
- `ADMIN` - System administrators
- `KITCHEN_STAFF` - Kitchen employees
- `DRIVER` - Delivery drivers
- `CUSTOMER` - Regular customers

#### Middleware:
```javascript
// Should work with existing auth middleware
router.get('/auth/profile', authMiddleware, async (req, res) => {
  try {
    // req.user should be populated by authMiddleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: user._id,
        phone: user.phone,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,  // CRITICAL: Return actual role
        status: user.status,
        isActive: user.isActive,
        isVerified: user.isVerified,
        kitchenId: user.kitchenId,  // If applicable
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});
```

---

## Testing the Fix

### 1. Test Endpoint Manually

```bash
# Get a Firebase ID token from the app logs
# Look for "Firebase ID Token" in console

curl -X GET https://tiffsy-backend.onrender.com/auth/profile \
  -H "Authorization: Bearer <firebase_id_token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "role": "KITCHEN_STAFF",
    ...
  }
}
```

### 2. Test in App

Once backend endpoint is fixed:

1. **Remove workaround** from App.tsx (optional, it will still work)
2. **Login with kitchen staff account**
3. **Check console logs:**
   ```
   ========== USER PROFILE RECEIVED ==========
   User Role (Backend): KITCHEN_STAFF
   Mapped App Role: KITCHEN_STAFF
   ```
4. **Verify correct dashboard loads**

### 3. Test Both Roles

**Kitchen Staff:**
- Login → Should see Kitchen Dashboard
- Sidebar → Should show 5 menu items

**Admin:**
- Login → Should see Admin Dashboard
- Sidebar → Should show 15 menu items

---

## Alternative: Use Existing Endpoint

If there's already a profile/user endpoint elsewhere, we can update the frontend to use that instead.

**Check for:**
- `/api/users/me`
- `/api/users/profile`
- `/api/auth/me`
- `/users/current`

Let me know if any of these exist and I'll update the frontend accordingly.

---

## Why This Is Critical

Without the `/auth/profile` endpoint:

❌ Cannot distinguish between user roles
❌ Admin users cannot access admin features
❌ All users default to KITCHEN_STAFF
❌ Role-based access control doesn't work properly
❌ Security risk (wrong permissions assigned)

With the endpoint:

✅ Proper role-based access control
✅ Admin and kitchen staff get correct permissions
✅ Security: Users only see what they're allowed to
✅ Correct API endpoints called based on role
✅ Better user experience

---

## Frontend Changes After Backend Fix

Once backend adds the endpoint, the frontend will:

1. ✅ Automatically call `/auth/profile` on login
2. ✅ Extract real role from response
3. ✅ Store role in AsyncStorage
4. ✅ Route user to correct dashboard
5. ✅ Show role-appropriate menu items
6. ✅ Call role-specific API endpoints

No frontend code changes needed - just remove the workaround if desired.

---

## Timeline

**Current Status:** Workaround allows kitchen staff to login

**Required:** Backend needs to add `/auth/profile` endpoint

**Priority:** HIGH - Needed for proper role-based access

**Estimated Backend Work:** 30-60 minutes

---

## Contact

If you have questions about the expected response format or need help implementing the endpoint, please refer to this document or ask for clarification.

---

## Related Files

- [App.tsx](App.tsx) - Contains workaround code (lines 277-317)
- [src/services/auth.service.ts](src/services/auth.service.ts) - Profile fetching logic
- [ROLE_BASED_ACCESS_IMPLEMENTATION.md](ROLE_BASED_ACCESS_IMPLEMENTATION.md) - Full RBAC documentation

---

**Status:** ⚠️ WAITING FOR BACKEND FIX
**Frontend:** ✅ Ready (workaround in place)
**Backend:** ❌ Needs `/auth/profile` endpoint
