# How to Disable Firebase / Skip Phone Authentication

This guide explains how to temporarily disable Firebase phone authentication and go directly to the admin login screen. This is useful when:
- You don't have the correct `google-services.json` file yet
- You want to test the app without OTP verification
- You're focusing on backend API integration first

## Quick Steps to Disable Firebase

### Step 1: Update App.tsx (Skip Phone Auth Screen)

**File:** `App.tsx`

**Change from:**
```typescript
import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneAuthScreen } from './src/screens/admin/PhoneAuthScreen';
import { AdminLoginScreen } from './src/screens/admin/AdminLoginScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null);

  const handleVerificationComplete = (token: string) => {
    setFirebaseToken(token);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {!firebaseToken ? (
        <PhoneAuthScreen onVerificationComplete={handleVerificationComplete} />
      ) : (
        <AdminLoginScreen firebaseToken={firebaseToken} />
      )}
    </SafeAreaProvider>
  );
}
```

**Change to:**
```typescript
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdminLoginScreen } from './src/screens/admin/AdminLoginScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AdminLoginScreen />
    </SafeAreaProvider>
  );
}
```

**What this does:**
- Removes phone auth state management
- Removes PhoneAuthScreen import
- Shows AdminLoginScreen directly when app opens

---

### Step 2: Make Firebase Token Optional in AdminLoginScreen

**File:** `src/screens/admin/AdminLoginScreen.tsx`

**Line ~45-49, Change from:**
```typescript
interface AdminLoginScreenProps {
  firebaseToken: string;
}

const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ firebaseToken }) => {
```

**Change to:**
```typescript
interface AdminLoginScreenProps {
  firebaseToken?: string;  // Add ? to make it optional
}

const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ firebaseToken }) => {
```

**Line ~168-180, Change from:**
```typescript
try {
  // Make API call to backend with Firebase token
  const response = await fetch('https://tiffsy-backend.onrender.com/api/auth/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${firebaseToken}`,
    },
    body: JSON.stringify({
      username: username.trim(),
      password: password,
    }),
  });
```

**Change to:**
```typescript
try {
  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add Firebase token if available
  if (firebaseToken) {
    headers['Authorization'] = `Bearer ${firebaseToken}`;
  }

  // Make API call to backend
  const response = await fetch('https://tiffsy-backend.onrender.com/api/auth/admin/login', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      username: username.trim(),
      password: password,
    }),
  });
```

**What this does:**
- Makes `firebaseToken` prop optional
- Only adds Authorization header if Firebase token exists
- Allows login to work without Firebase token

---

### Step 3: Disable Firebase Build Plugin

**File:** `android/app/build.gradle`

**Line ~122-125, Change from:**
```gradle
// React Native Vector Icons
apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")

// Google Services Plugin (Firebase)
apply plugin: 'com.google.gms.google-services'
```

**Change to:**
```gradle
// React Native Vector Icons
apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")

// Google Services Plugin (Firebase) - Temporarily disabled
// Uncomment when google-services.json is configured correctly
// apply plugin: 'com.google.gms.google-services'
```

**What this does:**
- Comments out the Google Services plugin
- Prevents build from looking for `google-services.json`
- Allows app to build without Firebase configuration

---

### Step 4: Clean and Rebuild

After making the above changes, clean and rebuild:

```bash
# Clean build cache
cd android
./gradlew clean
cd ..

# Run the app
npm run android
```

---

## How to Re-Enable Firebase

When you're ready to add Firebase back:

### Step 1: Re-enable Firebase Build Plugin

**File:** `android/app/build.gradle`

```gradle
// React Native Vector Icons
apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")

// Google Services Plugin (Firebase)
apply plugin: 'com.google.gms.google-services'
```

### Step 2: Add correct google-services.json

Place your configured `google-services.json` file in:
```
android/app/google-services.json
```

### Step 3: Restore Phone Auth Flow in App.tsx

```typescript
import React, { useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneAuthScreen } from './src/screens/admin/PhoneAuthScreen';
import { AdminLoginScreen } from './src/screens/admin/AdminLoginScreen';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null);

  const handleVerificationComplete = (token: string) => {
    setFirebaseToken(token);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {!firebaseToken ? (
        <PhoneAuthScreen onVerificationComplete={handleVerificationComplete} />
      ) : (
        <AdminLoginScreen firebaseToken={firebaseToken} />
      )}
    </SafeAreaProvider>
  );
}

export default App;
```

### Step 4: Clean and Rebuild

```bash
cd android && ./gradlew clean && cd ..
npm run android
```

---

## Complete Flow Comparison

### WITH Firebase (Full Authentication Flow)

```
User Opens App
    ↓
PhoneAuthScreen (Enter phone number)
    ↓
Firebase sends OTP
    ↓
OTP Verification Screen (Enter 6-digit code)
    ↓
Firebase verifies OTP
    ↓
Firebase returns ID token
    ↓
AdminLoginScreen (Username + Password)
    ↓
Backend API call with Firebase token
    ↓
Dashboard
```

### WITHOUT Firebase (Simplified Flow)

```
User Opens App
    ↓
AdminLoginScreen (Username + Password)
    ↓
Backend API call without Firebase token
    ↓
Dashboard
```

---

## Files Modified

When disabling Firebase, these files are changed:

1. **App.tsx**
   - Removed PhoneAuthScreen logic
   - Direct render of AdminLoginScreen

2. **src/screens/admin/AdminLoginScreen.tsx**
   - Made firebaseToken prop optional
   - Conditional Firebase token in API headers

3. **android/app/build.gradle**
   - Commented out Google Services plugin

4. **No changes needed to:**
   - `google-services.json` (can stay in place or be removed)
   - `src/screens/admin/PhoneAuthScreen.tsx` (kept for future use)
   - Firebase npm packages (kept installed)

---

## Benefits of This Approach

✅ **Quick Testing** - Skip phone auth during development
✅ **No Firebase Config Needed** - Work without `google-services.json`
✅ **Easy to Restore** - All Firebase code remains in place
✅ **Backend Integration** - Focus on API integration first
✅ **No Package Removal** - Keep Firebase packages installed

---

## Troubleshooting

### Issue: App still asks for google-services.json

**Solution:** Make sure you commented out this line in `android/app/build.gradle`:
```gradle
// apply plugin: 'com.google.gms.google-services'
```

Then clean and rebuild:
```bash
cd android && ./gradlew clean && cd ..
```

### Issue: AdminLoginScreen shows TypeScript error

**Solution:** Ensure you added `?` to make firebaseToken optional:
```typescript
interface AdminLoginScreenProps {
  firebaseToken?: string;  // The ? is important!
}
```

### Issue: Login API fails

**Solution:** Check that your backend accepts requests without Firebase token, or update backend to make Firebase token optional.

---

## Production Checklist

Before deploying to production, ensure:

- [ ] Firebase is re-enabled (uncomment plugin)
- [ ] Correct `google-services.json` is in place
- [ ] Phone authentication flow is restored in App.tsx
- [ ] Firebase token is being sent to backend
- [ ] Backend validates Firebase token properly
- [ ] Test phone numbers removed from Firebase Console

---

## Related Documentation

- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Complete Firebase setup guide
- [QUICK_START.md](QUICK_START.md) - Quick start instructions
- [ADMIN_AUTH_SETUP_SUMMARY.md](ADMIN_AUTH_SETUP_SUMMARY.md) - Full authentication documentation

---

**Last Updated:** January 9, 2026
**Status:** Firebase temporarily disabled for development
**Next Step:** Re-enable when correct google-services.json is available
