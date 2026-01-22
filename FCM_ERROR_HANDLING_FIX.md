# FCM Error Handling Fix

## Issue

The FCM token registration is failing with:
```
FCM: Error registering token: SyntaxError: JSON Parse error: Unexpected character: <
```

This means the backend endpoint `/api/auth/fcm-token` is not implemented yet, or is returning HTML instead of JSON.

## Solution

The app will continue to work normally, but push notifications won't be received until the backend implements the FCM endpoints.

### Option 1: Graceful Degradation (Recommended for now)

Add better error handling to make it clear this is expected:

**File: `src/services/fcm.service.ts`**

Change the `registerToken` method error handling from:

```typescript
} catch (error) {
  console.error('FCM: Error registering token:', error);
  return false;
}
```

To:

```typescript
} catch (error: any) {
  console.error('FCM: Error registering token:', error);

  // Check if it's a network or endpoint issue
  if (error?.message?.includes('JSON Parse error')) {
    console.warn('⚠️  FCM: Backend endpoint may not be implemented yet. This is expected if backend is not ready.');
    console.warn('⚠️  FCM: Notifications will work once backend implements /auth/fcm-token endpoint');
    console.warn('⚠️  FCM: The app will continue to work normally, but push notifications will not be received.');
  }

  return false;
}
```

And change the `removeToken` method DELETE request from:

```typescript
const response = await apiService.delete('/auth/fcm-token', {
  fcmToken: token,
});
```

To:

```typescript
const response = await apiService.delete(`/auth/fcm-token?fcmToken=${encodeURIComponent(token)}`);
```

### Option 2: Disable FCM Until Backend is Ready

**File: `App.tsx`**

Comment out the FCM initialization:

```typescript
// Initialize FCM if authenticated
if (isValidUser) {
  console.log('Initializing FCM service...');
  // await fcmService.initialize(); // TODO: Enable when backend is ready
}
```

And in `handleVerificationComplete`:

```typescript
// Initialize FCM and register token
console.log('Initializing FCM service...');
// await fcmService.initialize(); // TODO: Enable when backend is ready
```

### Option 3: Mock FCM for Development

Create a development flag to skip FCM registration:

**File: `src/services/fcm.service.ts`**

Add at the top:

```typescript
const ENABLE_FCM = false; // Set to true when backend is ready

async registerToken(): Promise<boolean> {
  if (!ENABLE_FCM) {
    console.log('FCM: Disabled in development mode');
    return true; // Return true to prevent errors
  }

  // ... rest of the method
}
```

## Backend Implementation Required

When ready to implement push notifications, the backend needs these endpoints:

### 1. Register FCM Token

```
POST /api/auth/fcm-token
Content-Type: application/json
Authorization: Bearer <token>

Body:
{
  "fcmToken": "string",
  "deviceType": "ANDROID" | "IOS",
  "deviceId": "string"
}

Response:
{
  "success": true,
  "message": "FCM token registered"
}
```

### 2. Remove FCM Token

```
DELETE /api/auth/fcm-token?fcmToken=<token>
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "FCM token removed"
}
```

### 3. Send Menu Announcement (Kitchen Staff)

```
POST /api/menu/my-kitchen/announcement
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "title": "string",
  "message": "string"
}

Response:
{
  "success": true,
  "message": "Announcement sent successfully",
  "data": {
    "subscribersNotified": 47,
    "title": "Special Paneer Dish Today!",
    "message": "..."
  }
}
```

### 4. Send Kitchen Batch Reminder (Admin)

```
POST /api/delivery/kitchen-reminder
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "mealWindow": "BREAKFAST" | "LUNCH" | "DINNER",
  "kitchenId": "string" (optional)
}

Response:
{
  "success": true,
  "message": "Kitchen reminders sent",
  "data": {
    "kitchensNotified": 3,
    "mealWindow": "LUNCH",
    "minutesUntilCutoff": 45,
    "cutoffTime": "11:00",
    "details": [...]
  }
}
```

### 5. Send Admin Push Notification

```
POST /api/admin/push-notification
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "title": "string",
  "body": "string",
  "targetType": "ALL_CUSTOMERS" | "ACTIVE_SUBSCRIBERS" | "SPECIFIC_USERS" | "ROLE",
  "targetIds": ["string"] (optional),
  "targetRole": "DRIVER" | "KITCHEN_STAFF" | "CUSTOMER" (optional),
  "data": {} (optional)
}

Response:
{
  "success": true,
  "message": "Push notification sent",
  "data": {
    "targetType": "ALL_CUSTOMERS",
    "usersNotified": 1247
  }
}
```

## Current Status

✅ **Frontend Implementation**: Complete
❌ **Backend Endpoints**: Not implemented yet
⚠️ **Current Behavior**: App works normally, FCM registration fails silently

## Recommendation

Use **Option 1 (Graceful Degradation)** - add better error messages so developers know this is expected behavior. The app will function perfectly for all other features, and push notifications will automatically start working once the backend endpoints are implemented.

The in-app notification UI, screens, and components all work perfectly. Only the actual FCM push delivery is pending backend implementation.
