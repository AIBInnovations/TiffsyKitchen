# 📝 Logging Guide - Request/Response Tracking

**Updated:** January 10, 2026

---

## Overview

Complete console logging implemented for Firebase OTP authentication and Admin API login. All requests and responses are logged with detailed information for debugging.

---

## Firebase OTP Logging

### Location
[src/screens/admin/PhoneAuthScreen.tsx](src/screens/admin/PhoneAuthScreen.tsx)

### 1. OTP Send Request

**When:** User clicks "Send OTP" button

**Log Format:**
```
========== FIREBASE OTP REQUEST ==========
Phone Number: +919876543210
Timestamp: 2026-01-10T10:30:45.123Z
==========================================
```

**Success Response:**
```
========== FIREBASE OTP RESPONSE ==========
Status: SUCCESS
Confirmation Result: [Object]
Verification ID: abc123xyz...
Timestamp: 2026-01-10T10:30:46.456Z
===========================================
```

**Error Response:**
```
========== FIREBASE OTP ERROR ==========
Status: FAILED
Error Code: auth/invalid-phone-number
Error Message: The phone number format is incorrect
Full Error: [Error Object]
Timestamp: 2026-01-10T10:30:46.456Z
========================================
```

### 2. OTP Verification

**When:** User enters OTP and clicks "Verify OTP"

**Verification Request:**
```
========== FIREBASE OTP VERIFY REQUEST ==========
OTP Code: 123456
Verification ID: abc123xyz...
Timestamp: 2026-01-10T10:31:00.789Z
=================================================
```

**Success Response:**
```
========== FIREBASE OTP VERIFY RESPONSE ==========
Status: SUCCESS
User ID: firebase_user_uid_123
Phone Number: +919876543210
Timestamp: 2026-01-10T10:31:01.234Z
==================================================
```

**Firebase ID Token:**
```
========== FIREBASE ID TOKEN ==========
Token Length: 1024
Token (first 50 chars): eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5ZmU1Y...
Timestamp: 2026-01-10T10:31:01.567Z
=======================================
```

**Error Response:**
```
========== FIREBASE OTP VERIFY ERROR ==========
Status: FAILED
Error Code: auth/invalid-verification-code
Error Message: The verification code is invalid
Full Error: [Error Object]
Timestamp: 2026-01-10T10:31:01.234Z
===============================================
```

---

## Admin Login API Logging

### Location
[src/screens/admin/AdminLoginScreen.tsx](src/screens/admin/AdminLoginScreen.tsx)

### Login API Request

**When:** User enters credentials and submits login form

**Request Log:**
```
========== ADMIN LOGIN API REQUEST ==========
Endpoint: https://tiffsy-backend.onrender.com/api/auth/admin/login
Method: POST
Headers: {
  Content-Type: application/json,
  Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtp...
}
Request Body: {
  username: admin@tiffsy.com,
  password: ***HIDDEN***
}
Timestamp: 2026-01-10T10:31:05.123Z
=============================================
```

**Success Response:**
```
========== ADMIN LOGIN API RESPONSE ==========
Status Code: 200
Status Text: OK
Success: true
Message: Login successful
Response Data: {
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "backend_auth_token_xyz...",
    "user": {
      "_id": "user123",
      "username": "admin@tiffsy.com",
      "role": "ADMIN",
      "name": "Admin User"
    }
  }
}
Timestamp: 2026-01-10T10:31:05.456Z
==============================================
```

**Failed Login:**
```
========== ADMIN LOGIN FAILED ==========
Reason: Invalid credentials
Status Code: 401
Timestamp: 2026-01-10T10:31:05.456Z
========================================
```

**Network Error:**
```
========== ADMIN LOGIN ERROR ==========
Error Type: TypeError
Error Message: Network request failed
Full Error: [Error Object]
Timestamp: 2026-01-10T10:31:05.456Z
=======================================
```

---

## How to View Logs

### React Native Metro Bundler

**Console Output:**
```bash
# Run the app
npm run android

# Logs will appear in Metro bundler terminal
# Look for the bordered log sections with "======"
```

### Android Logcat

**Using ADB:**
```bash
# View all logs
adb logcat

# Filter React Native logs only
adb logcat | grep ReactNativeJS

# Filter specific logs
adb logcat | grep "FIREBASE OTP"
adb logcat | grep "ADMIN LOGIN"
```

### Chrome DevTools

**React Native Debugger:**
1. Shake device/emulator
2. Select "Debug" from menu
3. Open Chrome DevTools (http://localhost:8081/debugger-ui/)
4. Check Console tab
5. All logs will appear there

---

## Log Categories

### 1. Firebase OTP Logs

| Log Type | Identifier | Contains |
|----------|-----------|----------|
| OTP Send Request | `FIREBASE OTP REQUEST` | Phone number, timestamp |
| OTP Send Success | `FIREBASE OTP RESPONSE` | Verification ID, confirmation result |
| OTP Send Error | `FIREBASE OTP ERROR` | Error code, error message |
| OTP Verify Request | `FIREBASE OTP VERIFY REQUEST` | OTP code, verification ID |
| OTP Verify Success | `FIREBASE OTP VERIFY RESPONSE` | User ID, phone number |
| ID Token | `FIREBASE ID TOKEN` | Token length, token preview |
| OTP Verify Error | `FIREBASE OTP VERIFY ERROR` | Error code, error message |

### 2. Admin Login Logs

| Log Type | Identifier | Contains |
|----------|-----------|----------|
| Login Request | `ADMIN LOGIN API REQUEST` | Endpoint, headers, body |
| Login Success | `ADMIN LOGIN API RESPONSE` | Status, data, token |
| Login Failed | `ADMIN LOGIN FAILED` | Reason, status code |
| Login Error | `ADMIN LOGIN ERROR` | Error type, message |

---

## Common Error Codes

### Firebase Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `auth/invalid-phone-number` | Phone format incorrect | Check format: +919876543210 |
| `auth/too-many-requests` | Rate limit exceeded | Wait and try again |
| `auth/invalid-verification-code` | Wrong OTP entered | Re-enter correct OTP |
| `auth/code-expired` | OTP expired | Request new OTP |
| `auth/billing-not-enabled` | Firebase Blaze plan needed | Enable test phone or upgrade |

### API Errors

| Status Code | Description | Solution |
|-------------|-------------|----------|
| 400 | Bad Request | Check request body format |
| 401 | Unauthorized | Check credentials |
| 403 | Forbidden | Check Firebase token |
| 404 | Not Found | Check endpoint URL |
| 500 | Server Error | Backend issue, try again |
| Network Failed | No connection | Check internet |

---

## Debugging Workflow

### Step 1: OTP Not Sending

**Check logs for:**
```
========== FIREBASE OTP REQUEST ==========
Phone Number: +919876543210
```

**If error appears:**
```
========== FIREBASE OTP ERROR ==========
Error Code: auth/billing-not-enabled
```

**Solution:** Setup test phone numbers or enable Blaze plan

### Step 2: OTP Verification Failing

**Check logs for:**
```
========== FIREBASE OTP VERIFY REQUEST ==========
OTP Code: 123456
```

**If error appears:**
```
========== FIREBASE OTP VERIFY ERROR ==========
Error Code: auth/invalid-verification-code
```

**Solution:** Check if OTP is correct or expired

### Step 3: Admin Login Failing

**Check logs for:**
```
========== ADMIN LOGIN API REQUEST ==========
Endpoint: https://tiffsy-backend.onrender.com/api/auth/admin/login
```

**Check response:**
```
========== ADMIN LOGIN API RESPONSE ==========
Status Code: 401
Message: Invalid credentials
```

**Solution:** Verify username/password or check backend

---

## Security Notes

### What's Hidden in Logs

✅ **Password:** Always shown as `***HIDDEN***`
✅ **Firebase Token:** Only first 30 characters shown
✅ **Backend Token:** Only shown in success response

### What's Visible

⚠️ **Phone Numbers:** Logged in full for debugging
⚠️ **Username:** Logged in full
⚠️ **Error Messages:** Logged in full

**Important:** In production, consider reducing log verbosity or removing sensitive data.

---

## Testing Logs

### Test Firebase OTP Flow

1. **Start app:** `npm run android`
2. **Enter phone:** +919876543210
3. **Click "Send OTP"**
4. **Check logs:** Look for `FIREBASE OTP REQUEST` and `FIREBASE OTP RESPONSE`
5. **Enter OTP:** 123456
6. **Click "Verify OTP"**
7. **Check logs:** Look for `FIREBASE OTP VERIFY REQUEST` and response

### Test Admin Login

1. **After OTP success**
2. **Enter username and password**
3. **Click "Sign In"**
4. **Check logs:** Look for `ADMIN LOGIN API REQUEST` and `ADMIN LOGIN API RESPONSE`

---

## Example Complete Flow Logs

### Successful Login Flow

```
========== FIREBASE OTP REQUEST ==========
Phone Number: +919876543210
Timestamp: 2026-01-10T10:30:00.000Z
==========================================

========== FIREBASE OTP RESPONSE ==========
Status: SUCCESS
Verification ID: abc123
Timestamp: 2026-01-10T10:30:01.000Z
===========================================

========== FIREBASE OTP VERIFY REQUEST ==========
OTP Code: 123456
Verification ID: abc123
Timestamp: 2026-01-10T10:30:30.000Z
=================================================

========== FIREBASE OTP VERIFY RESPONSE ==========
Status: SUCCESS
User ID: firebase_uid_123
Phone Number: +919876543210
Timestamp: 2026-01-10T10:30:31.000Z
==================================================

========== FIREBASE ID TOKEN ==========
Token Length: 1024
Token (first 50 chars): eyJhbGci...
Timestamp: 2026-01-10T10:30:31.100Z
=======================================

========== ADMIN LOGIN API REQUEST ==========
Endpoint: https://tiffsy-backend.onrender.com/api/auth/admin/login
Method: POST
Headers: { Content-Type: application/json, Authorization: Bearer eyJ... }
Request Body: { username: admin, password: ***HIDDEN*** }
Timestamp: 2026-01-10T10:30:45.000Z
=============================================

========== ADMIN LOGIN API RESPONSE ==========
Status Code: 200
Success: true
Message: Login successful
Response Data: {...}
Timestamp: 2026-01-10T10:30:46.000Z
==============================================
```

---

## Summary

✅ **Complete request/response logging implemented**
✅ **Timestamps for tracking request duration**
✅ **Error codes and messages for debugging**
✅ **Sensitive data hidden (passwords)**
✅ **Easy to spot logs with border format**
✅ **All authentication flows covered**

**Files Modified:**
- ✅ [PhoneAuthScreen.tsx](src/screens/admin/PhoneAuthScreen.tsx) - Firebase OTP logging
- ✅ [AdminLoginScreen.tsx](src/screens/admin/AdminLoginScreen.tsx) - API login logging

---

**📝 All logs ready for debugging authentication flow!**

**Date:** January 10, 2026
**Status:** ✅ COMPLETE
