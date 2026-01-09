# Quick Start Guide - Admin Authentication

This guide will help you get the admin authentication flow running quickly.

## Prerequisites

- Node.js (v20+)
- Android Studio
- React Native development environment set up
- Google account for Firebase

## Step 1: Install Dependencies ✅ (Already Done)

The required npm packages have already been installed:
- @react-native-firebase/app
- @react-native-firebase/auth
- axios

## Step 2: Firebase Configuration (Required - Do This First!)

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select existing project
3. Enter project name: "TiffsyKitchen"
4. Follow setup wizard

### 2.2 Enable Phone Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started** (if first time)
3. Go to **Sign-in method** tab
4. Click on **Phone** provider
5. Toggle **Enable** switch
6. Click **Save**

### 2.3 Register Android App

1. Click the Android icon in Firebase project overview
2. Enter these details:
   - **Package name**: `com.tiffsykitchen`
   - **App nickname**: TiffsyKitchen (optional)
   - **SHA-1**: Get it by running:
   ```bash
   cd android
   ./gradlew signingReport
   ```
   Copy the SHA-1 from "Variant: debug" section

3. Click **Register app**

### 2.4 Download Configuration File

1. Download `google-services.json`
2. Move it to:
   ```
   android/app/google-services.json
   ```

⚠️ **IMPORTANT**: Without this file, the app will not build!

### 2.5 Add Test Phone Number (Optional but Recommended)

For testing without using real SMS:

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Scroll to **Phone numbers for testing**
3. Add a test number:
   - Phone: `+919999999999`
   - Code: `123456`
4. Click **Add**

## Step 3: Build and Run

### 3.1 Clean Build

```bash
cd android
./gradlew clean
cd ..
```

### 3.2 Run the App

```bash
npx react-native run-android
```

Or if you have npm issues, use:

```bash
source /opt/homebrew/opt/nvm/nvm.sh
npx react-native run-android
```

## Step 4: Test the Flow

### 4.1 Phone Number Screen

1. App opens with phone number input
2. Enter a 10-digit Indian phone number (e.g., `9876543210`)
3. Click **Send OTP**

**For Testing**: Use the test number you added: `9999999999`

### 4.2 OTP Verification Screen

1. Enter the 6-digit OTP received
2. Click **Verify OTP**

**For Testing**: Use the test code: `123456`

### 4.3 Admin Login Screen

1. Enter your admin username
2. Enter your admin password
3. Click **Sign In**

The login will call: `POST https://tiffsy-backend.onrender.com/api/auth/admin/login`

## What Happens Behind the Scenes?

### 1. Phone Auth Flow
```
User enters phone number
    ↓
Firebase sends OTP to phone
    ↓
User enters OTP
    ↓
Firebase verifies OTP
    ↓
Firebase returns ID Token
    ↓
Token stored in app state
```

### 2. Login Flow
```
User enters credentials
    ↓
App sends to backend:
  - Username
  - Password
  - Firebase Token (in Authorization header)
    ↓
Backend validates everything
    ↓
Backend returns auth token
    ↓
Token saved in AsyncStorage
    ↓
Navigate to Dashboard
```

## Common Issues and Solutions

### Issue 1: "google-services.json not found"

**Solution**:
- Download the file from Firebase Console
- Place it exactly at: `android/app/google-services.json`
- Run `cd android && ./gradlew clean`

### Issue 2: "This app is not authorized to use Firebase Authentication"

**Solution**:
- Make sure you added SHA-1 fingerprint to Firebase
- Run: `cd android && ./gradlew signingReport`
- Copy SHA-1 and add it in Firebase Console
- Rebuild the app

### Issue 3: "OTP not received"

**Solutions**:
- Use test phone numbers (see Step 2.5)
- Check phone number format (+91 is auto-added)
- Verify Firebase Phone Auth is enabled
- For production: Firebase needs Blaze (pay-as-you-go) plan

### Issue 4: "Network request failed" on login

**Solutions**:
- Check internet connection
- Verify backend URL: `https://tiffsy-backend.onrender.com`
- Check if backend server is running
- Verify Firebase token is valid

### Issue 5: Build fails with "Execution failed for task ':app:processDebugGoogleServices'"

**Solution**:
- Ensure `google-services.json` is in correct location
- Check that file is valid JSON
- Run: `cd android && ./gradlew clean`

## Project Structure

```
TiffsyKitchen/
├── android/
│   └── app/
│       └── google-services.json    ← Add this file!
├── src/
│   ├── screens/
│   │   └── admin/
│   │       ├── PhoneAuthScreen.tsx
│   │       └── AdminLoginScreen.tsx
│   └── services/
│       └── api.service.ts
└── App.tsx
```

## API Endpoint

**Base URL**: `https://tiffsy-backend.onrender.com`

**Admin Login Endpoint**: `/api/auth/admin/login`

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <firebase_token>
```

**Body**:
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

## Testing Credentials

Contact your backend team for test admin credentials.

## Need Help?

1. Check [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed Firebase setup
2. Check [ADMIN_AUTH_SETUP_SUMMARY.md](ADMIN_AUTH_SETUP_SUMMARY.md) for complete documentation
3. Review console logs for error messages
4. Verify all steps in this guide are completed

## Checklist

Before testing, ensure:

- [ ] Firebase project created
- [ ] Phone authentication enabled in Firebase
- [ ] Android app registered in Firebase
- [ ] SHA-1 fingerprint added to Firebase
- [ ] `google-services.json` downloaded
- [ ] `google-services.json` placed in `android/app/`
- [ ] Test phone number added (optional)
- [ ] Dependencies installed (`npm install`)
- [ ] Clean build completed (`cd android && ./gradlew clean`)
- [ ] Backend API is accessible

## Next Steps After Setup

1. Test with real phone numbers
2. Coordinate with backend team for API testing
3. Test error scenarios
4. Verify token storage and session persistence
5. Test logout flow
6. Implement additional security features

---

**Quick Reference Commands**

```bash
# Get SHA-1 for Firebase
cd android && ./gradlew signingReport

# Clean build
cd android && ./gradlew clean && cd ..

# Run app
npx react-native run-android

# Check logs
npx react-native log-android

# Install dependencies
npm install

# Start Metro bundler
npx react-native start
```

Good luck with your setup! 🚀
