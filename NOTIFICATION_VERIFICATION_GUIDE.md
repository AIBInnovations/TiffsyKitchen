# 🔔 Notification System Verification Guide

This guide will help you verify that push notifications are working correctly for Kitchen Staff and Admin users.

## ✅ What We've Fixed

1. ✅ Added `POST_NOTIFICATIONS` permission for Android 13+
2. ✅ Created notification channel configuration (kitchen_channel, delivery_channel)
3. ✅ Added vibration support for all notifications
4. ✅ Enhanced logging throughout FCM service
5. ✅ Better error handling with descriptive messages

## 📋 Verification Checklist

### Step 1: Check User FCM Tokens in Database

Run this MongoDB query to check if users have FCM tokens registered:

```javascript
// For Kitchen Staff
db.users.find({
  role: "KITCHEN_STAFF",
  status: "ACTIVE"
}, {
  name: 1,
  phone: 1,
  role: 1,
  status: 1,
  kitchenId: 1,
  fcmTokens: 1,
  "fcmTokens.token": 1,
  "fcmTokens.deviceType": 1,
  "fcmTokens.updatedAt": 1
}).pretty()
```

**What to look for:**
- ✅ `status` should be `"ACTIVE"`
- ✅ `fcmTokens` array should have at least one token
- ✅ Token should have been updated recently (within last few days)
- ✅ `deviceType` should be `"ANDROID"` or `"IOS"`

```javascript
// For Admin Users
db.users.find({
  role: "ADMIN",
  status: "ACTIVE"
}, {
  name: 1,
  phone: 1,
  role: 1,
  status: 1,
  fcmTokens: 1,
  "fcmTokens.token": 1,
  "fcmTokens.deviceType": 1,
  "fcmTokens.updatedAt": 1
}).pretty()
```

**If fcmTokens is empty:**
1. User needs to log in to the mobile app
2. App will automatically request notification permissions
3. Token will be registered with backend
4. Check app logs for FCM registration success

### Step 2: Check App Logs for FCM Initialization

When the app starts and user logs in, you should see these logs:

```
==========================================
🚀 FCM: INITIALIZING SERVICE...
==========================================
FCM: Setting up notification channels for Android...
FCM: Notification channels configured: {
  kitchenChannel: 'kitchen_channel',
  deliveryChannel: 'delivery_channel',
  generalChannel: 'default_channel'
}
==========================================
📝 FCM: REGISTERING TOKEN WITH BACKEND
==========================================
Device Type: ANDROID
Device ID: 1737879123456-abc123def456
Token (first 30 chars): dG6xK8b9QR...
Endpoint: POST /api/auth/fcm-token
==========================================
✅ FCM: TOKEN REGISTERED SUCCESSFULLY
==========================================
Backend Response: FCM token registered successfully
Your device can now receive push notifications!
==========================================
✅ FCM: SERVICE INITIALIZED SUCCESSFULLY
==========================================
```

**If you see errors:**

#### Error: "JSON Parse error: Unexpected character"
```
⚠️  ============================================
⚠️  FCM: Backend endpoint not implemented yet
⚠️  ============================================
```
**Solution:** Backend endpoint `/api/auth/fcm-token` needs to be fixed

#### Error: "Server error"
```
⚠️  ============================================
⚠️  FCM: Backend returned error: Server error
⚠️  This is a backend issue that needs investigation
⚠️  ============================================
```
**Solution:** Check backend logs for the actual error

### Step 3: Test Order Creation Notification

1. **Place a test order** (as a customer)
2. **Check backend logs** for notification sent:
   ```
   > FCM sent successfully: {
       messageId: '...',
       deviceType: 'ANDROID',
       type: 'NEW_MANUAL_ORDER',
       channelId: 'kitchen_channel'
     }
   > Notification sent: {
       userId: '...',
       type: 'NEW_MANUAL_ORDER',
       successCount: 1,
       totalTokens: 1
     }
   > Sending to role: {
       role: 'KITCHEN_STAFF',
       userCount: 2,
       type: 'NEW_MANUAL_ORDER',
       kitchenId: '...'
     }
   ```

3. **Check kitchen staff device** for notification

#### Foreground (App Open):
You should see in app logs:
```
==========================================
🔔 FCM: FOREGROUND NOTIFICATION RECEIVED
==========================================
Title: New Order Received
Body: Order #ORD-20260126-ABC123 placed
Data: { type: 'NEW_MANUAL_ORDER', orderId: '...' }
Type: NEW_MANUAL_ORDER
Channel ID: kitchen_channel
Order ID: 507f1f77bcf86cd799439011
Order Number: ORD-20260126-ABC123
==========================================
FCM: ✅ Vibration triggered
FCM: ✅ Notification passed to callback
```

**Expected behavior:**
- ✅ Popup notification appears in app
- ✅ Device vibrates (pattern: 300ms, 250ms, 300ms)
- ✅ Notification appears in notification list
- ✅ Unread count increments

#### Background (App Not Open):
You should see:
```
FCM: Background notification received: { ... }
FCM: Notification data: { type: 'NEW_MANUAL_ORDER', ... }
FCM: Notification type: NEW_MANUAL_ORDER
FCM: Channel ID: kitchen_channel
FCM: Vibration triggered for background notification
```

**Expected behavior:**
- ✅ System notification appears in notification tray
- ✅ Device vibrates
- ✅ Notification has correct title and body
- ✅ Tapping opens app to order details

### Step 4: Test Batch Assignment Notification (Drivers)

1. **Assign a batch to a driver**
2. **Check driver's device** for notification

Expected logs:
```
==========================================
🔔 FCM: FOREGROUND NOTIFICATION RECEIVED
==========================================
Title: Batch Assigned
Body: You have been assigned batch #BATCH-123
Type: BATCH_ASSIGNED
Channel ID: delivery_channel
==========================================
```

### Step 5: Manual Notification Test

Use this API endpoint to send a test notification:

```bash
POST {{BASE_URL}}/api/notification/send-to-role
Content-Type: application/json
Authorization: Bearer {{ADMIN_TOKEN}}

{
  "role": "KITCHEN_STAFF",
  "kitchenId": "YOUR_KITCHEN_ID",
  "type": "CUSTOM",
  "title": "🧪 Test Notification",
  "body": "If you see this, notifications are working!"
}
```

**Expected:**
- ✅ All active kitchen staff receive notification
- ✅ Vibration triggers
- ✅ Notification appears in app/system tray

## 🐛 Troubleshooting

### Issue: No notifications received

**Check 1: User has FCM token?**
```javascript
db.users.findOne({ _id: ObjectId("USER_ID") }, { fcmTokens: 1 })
```
If empty → User needs to login again

**Check 2: User is active?**
```javascript
db.users.findOne({ _id: ObjectId("USER_ID") }, { status: 1 })
```
If not "ACTIVE" → Update user status

**Check 3: Kitchen staff linked to kitchen?**
```javascript
db.users.findOne({
  role: "KITCHEN_STAFF"
}, {
  kitchenId: 1,
  name: 1
})
```
If null → Assign kitchen to staff

**Check 4: Backend notification code triggered?**
Check backend logs for:
- "Sending to role:"
- "FCM sent successfully"
- "Notification sent:"

If missing → Notification trigger not working

**Check 5: FCM credentials valid?**
Check backend Firebase Admin SDK configuration:
- Service account key valid?
- Project ID correct?
- FCM API enabled?

### Issue: Notifications work in foreground but not background

**Problem:** Background handler not registered properly

**Solution:**
1. Background handler must be registered at root level
2. Check that `setupBackgroundHandler()` is called in `initialize()`
3. Verify no errors in background handler

### Issue: Vibration not working

**Check Android Manifest:**
```xml
<uses-permission android:name="android.permission.VIBRATE" />
```

**Check Do Not Disturb:**
- Phone must not be in Do Not Disturb mode
- Sound/vibration must be enabled in phone settings

### Issue: No sound on notifications

**Note:** Sound implementation requires additional setup:

1. Install notifee:
   ```bash
   npm install @notifee/react-native
   cd ios && pod install
   ```

2. Create notification channels with sound (see fcm.service.ts comments)

3. Add sound files to:
   - Android: `android/app/src/main/res/raw/notification.mp3`
   - iOS: Configure in Xcode

## 📱 Platform-Specific Notes

### Android

**Required:**
- ✅ POST_NOTIFICATIONS permission (Android 13+)
- ✅ INTERNET permission
- ✅ VIBRATE permission
- ✅ Notification channels created
- ✅ google-services.json file

**Optional (for enhanced notifications):**
- Sound files in `res/raw/`
- Custom notification icons in `res/drawable/`
- Notifee package for advanced features

### iOS

**Required:**
- Notification permission requested via `messaging().requestPermission()`
- APNs certificate configured in Firebase Console
- Background modes enabled (remote notifications)

**Optional:**
- Custom notification sounds
- Rich notifications with images
- Notification actions

## 🔄 Testing Workflow

### Complete End-to-End Test

1. **Setup Phase:**
   - [ ] Kitchen staff user created with ACTIVE status
   - [ ] User assigned to a kitchen
   - [ ] User has logged into mobile app
   - [ ] FCM token registered (check database)

2. **Order Flow Test:**
   - [ ] Customer places order
   - [ ] Backend logs show "Sending to role: KITCHEN_STAFF"
   - [ ] Backend logs show "FCM sent successfully"
   - [ ] Kitchen staff receives notification
   - [ ] Notification appears with correct title/body
   - [ ] Device vibrates
   - [ ] Tapping notification opens app

3. **Status Update Test:**
   - [ ] Kitchen staff updates order status
   - [ ] Customer receives notification
   - [ ] Admin receives notification (if configured)

4. **Batch Assignment Test:**
   - [ ] Batch assigned to driver
   - [ ] Driver receives notification
   - [ ] Notification uses delivery_channel
   - [ ] Device vibrates

## 📊 Success Metrics

✅ **All checks passed if:**
- FCM tokens present in database for all active users
- Backend logs show successful FCM sends
- Devices receive notifications in foreground
- Devices receive notifications in background
- Devices receive notifications when app is closed
- Vibration works on notification arrival
- Tapping notification navigates to correct screen

## 🚨 Common Issues Summary

| Issue | Cause | Solution |
|-------|-------|----------|
| No tokens in DB | User not logged in | User must login to register token |
| Parse error on registration | Backend endpoint broken | Fix `/api/auth/fcm-token` endpoint |
| Notifications not sent | Backend trigger missing | Check `order.controller.js:751-773` |
| No vibration | Permission missing | Check AndroidManifest.xml |
| Background not working | Handler not registered | Check `initialize()` method |
| Wrong channel ID | Mismatch with backend | Sync `kitchen_channel` naming |

## 📝 Next Steps

After verification:

1. **If notifications working:**
   - ✅ Monitor logs for any errors
   - ✅ Test on multiple devices
   - ✅ Test different Android versions
   - ✅ Consider adding sound files
   - ✅ Consider installing notifee for advanced features

2. **If notifications not working:**
   - ❌ Check all items in troubleshooting section
   - ❌ Review backend logs for errors
   - ❌ Verify Firebase configuration
   - ❌ Test with manual notification endpoint
   - ❌ Check user permissions and status

## 📞 Support

If notifications still don't work after following this guide:

1. Collect these logs:
   - App initialization logs (FCM setup)
   - Token registration logs
   - Backend notification send logs
   - User database records

2. Verify:
   - Firebase project configuration
   - Backend service account credentials
   - Network connectivity
   - Device settings (DND, battery optimization)

---

**Last Updated:** January 26, 2026
**Version:** 1.0
**Status:** Complete
