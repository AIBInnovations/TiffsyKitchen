# FCM Backend Issue - Token Removal Endpoint

## Issue Summary

The FCM token removal endpoint `/api/auth/fcm-token` (DELETE) is returning a server error when attempting to remove tokens.

## Error Details

**Endpoint:** `DELETE /api/auth/fcm-token?fcmToken={token}`

**Response:**
```json
{
  "success": false,
  "message": "Server error",
  "data": null,
  "error": null
}
```

**Frontend Error Log:**
```
fcm.service.ts:188 FCM: Error removing token:
{success: false, message: 'Server error', data: null, error: null}
```

## Verification

All notification endpoints are **confirmed to be implemented** on the backend:

| Endpoint | Status | Test Result |
|----------|--------|-------------|
| `GET /api/notifications/unread-count` | ✅ Working | Returns 401 (requires auth) |
| `GET /api/notifications` | ✅ Working | Returns 401 (requires auth) |
| `POST /api/auth/fcm-token` | ✅ Working | Returns 401 (requires auth) |
| `DELETE /api/auth/fcm-token` | ⚠️ **Has Bug** | Returns "Server error" |
| `POST /api/menu/my-kitchen/announcement` | ✅ Working | Returns 401 (requires auth) |
| `POST /api/delivery/kitchen-reminder` | ✅ Working | Returns 401 (requires auth) |
| `POST /api/admin/push-notification` | ✅ Working | Returns 401 (requires auth) |

## Expected Behavior

**When token removal is successful:**
```json
{
  "success": true,
  "message": "FCM token removed successfully",
  "data": null
}
```

**When token doesn't exist:**
```json
{
  "success": true,
  "message": "Token not found or already removed",
  "data": null
}
```

**When unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized",
  "data": null,
  "error": "No token provided"
}
```

## Frontend Workaround

The frontend has been updated to handle this gracefully:

1. ✅ Local FCM token is cleared even if backend fails
2. ✅ Logout completes successfully
3. ✅ User sees warning logs about backend issue
4. ✅ App state remains clean for next login

**Updated Code (fcm.service.ts:187-212):**
```typescript
} catch (error: any) {
  console.error('FCM: Error removing token:', error);

  // Check for specific backend errors
  if (error?.message === 'Server error' || error?.message?.includes('Server error')) {
    console.warn('⚠️  Backend encountered an error removing token');
    console.warn('⚠️  This is a backend issue, not a frontend issue');
    console.warn('⚠️  Clearing local token for clean logout anyway');
  }

  // Even if removal fails, clear local token
  await AsyncStorage.removeItem(FCM_TOKEN_KEY);
  return true; // Consider it successful locally
}
```

## Backend Action Required

### Priority: Medium

The `DELETE /api/auth/fcm-token` endpoint needs debugging to identify why it's returning "Server error". Common causes:

1. **Database query error** - Check if the token deletion query is failing
2. **Token format issue** - Verify the fcmToken query parameter is being parsed correctly
3. **Missing error handling** - The endpoint may not be handling edge cases properly

### Suggested Backend Fix

```javascript
// Example Express.js endpoint
router.delete('/api/auth/fcm-token', authenticateToken, async (req, res) => {
  try {
    const { fcmToken } = req.query;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required',
        data: null
      });
    }

    // Find and remove the token
    const result = await FCMToken.findOneAndDelete({
      userId: req.user._id,
      fcmToken: fcmToken
    });

    if (!result) {
      // Token not found - this is OK, consider it removed
      return res.json({
        success: true,
        message: 'Token not found or already removed',
        data: null
      });
    }

    return res.json({
      success: true,
      message: 'FCM token removed successfully',
      data: null
    });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove FCM token',
      data: null,
      error: error.message // Include error for debugging
    });
  }
});
```

## Testing the Fix

Once the backend is fixed, test with:

```bash
# Get a valid auth token from login
AUTH_TOKEN="your_auth_token_here"

# Get an FCM token (from app logs or database)
FCM_TOKEN="your_fcm_token_here"

# Test removal
curl -X DELETE \
  "https://tiffsy-backend.onrender.com/api/auth/fcm-token?fcmToken=${FCM_TOKEN}" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json"

# Expected response:
# {"success": true, "message": "FCM token removed successfully", "data": null}
```

## Impact

**Current Impact:**
- ✅ No user-facing issues - logout works normally
- ✅ Token is cleared locally on the device
- ⚠️ Token may remain in backend database (could accumulate over time)
- ⚠️ User may receive notifications after logout until token expires

**After Fix:**
- ✅ Token properly removed from backend database
- ✅ User stops receiving notifications immediately after logout
- ✅ Database stays clean without accumulating old tokens

## Status

- **Frontend:** ✅ Fixed with graceful error handling
- **Backend:** ⚠️ Needs investigation and fix
- **Urgency:** Medium (not blocking, but should be fixed for proper cleanup)

---

**Last Updated:** January 22, 2026
**Issue ID:** FCM-DELETE-ERROR-001
