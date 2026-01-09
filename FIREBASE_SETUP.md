# Firebase Setup Instructions

This guide will help you set up Firebase Authentication for phone number verification in the Tiffsy Kitchen Admin app.

## Prerequisites

- A Google account
- Access to the Firebase Console (https://console.firebase.google.com)

## Steps to Configure Firebase

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select an existing project
3. Enter your project name (e.g., "TiffsyKitchen")
4. Follow the prompts to create the project

### 2. Enable Phone Authentication

1. In the Firebase Console, select your project
2. Go to **Authentication** > **Sign-in method**
3. Click on **Phone** in the Sign-in providers list
4. Toggle the **Enable** switch to ON
5. Click **Save**

### 3. Add Android App to Firebase

1. In the Firebase Console, click the **Android icon** to add an Android app
2. Fill in the following details:
   - **Android package name**: `com.tiffsykitchen` (or your actual package name from AndroidManifest.xml)
   - **App nickname** (optional): TiffsyKitchen
   - **Debug signing certificate SHA-1** (required for phone auth):
     - Run this command in your terminal:
       ```bash
       cd android
       ./gradlew signingReport
       ```
     - Copy the SHA-1 fingerprint from the output (look for "SHA1:" under "debug" variant)
     - Paste it into the Firebase Console
3. Click **Register app**

### 4. Download google-services.json

1. After registering, Firebase will provide a `google-services.json` file
2. Click **Download google-services.json**
3. Move this file to your project's Android app module root directory:
   ```
   TiffsyKitchen/android/app/google-services.json
   ```

### 5. Update Android Build Configuration

The following changes have already been made to support Firebase:

#### android/build.gradle
Add Google services plugin to dependencies:
```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

#### android/app/build.gradle
Add at the bottom of the file:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### 6. Install Dependencies

Run the following command to link Firebase native modules:

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### 7. Enable Phone Authentication Test Mode (Optional for Development)

For testing without actually sending SMS:

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Scroll down to **Phone numbers for testing**
3. Add test phone numbers with their verification codes
   - Example: Phone: +919999999999, Code: 123456

## Verification

To verify Firebase is set up correctly:

1. Run the app on an Android device or emulator
2. Enter a phone number on the Phone Auth screen
3. Check that OTP is sent successfully
4. Enter the OTP and verify it works

## Troubleshooting

### Error: "This app is not authorized to use Firebase Authentication"

- Make sure you've added the SHA-1 fingerprint to Firebase Console
- Rebuild the app after adding the SHA-1

### Error: "Missing google-services.json"

- Download the file from Firebase Console
- Place it in `android/app/` directory
- Run `./gradlew clean` and rebuild

### Error: "Phone authentication not enabled"

- Go to Firebase Console > Authentication > Sign-in method
- Enable Phone authentication

### SMS not received

- Check your Firebase project billing (Blaze plan may be required for production)
- Use test phone numbers for development
- Check phone number format (+91 for India)

## Security Notes

- Never commit `google-services.json` to a public repository
- Add it to `.gitignore` if needed
- Use Firebase Security Rules in production
- Enable App Check for additional security

## Support

For more information, visit:
- [Firebase Phone Auth Documentation](https://firebase.google.com/docs/auth/android/phone-auth)
- [React Native Firebase Documentation](https://rnfirebase.io/)
