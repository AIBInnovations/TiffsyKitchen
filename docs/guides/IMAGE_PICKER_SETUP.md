# Image Picker Setup Instructions

Before using the Menu Add/Edit screen, you need to install and configure react-native-image-picker.

## Installation

```bash
npm install react-native-image-picker
```

## Android Configuration

### 1. Update AndroidManifest.xml

Add these permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### 2. Rebuild the App

```bash
cd android && ./gradlew clean && cd ..
npm run android
```

## iOS Configuration (if needed)

Update `ios/TiffsyKitchen/Info.plist`:

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>$(PRODUCT_NAME) would like access to your photo gallery</string>
<key>NSCameraUsageDescription</key>
<string>$(PRODUCT_NAME) would like to use your camera</string>
<key>NSMicrophoneUsageDescription</key>
<string>$(PRODUCT_NAME) would like to use your microphone</string>
```

## Usage in Code

The AddEditMenuScreen already imports and uses it:

```typescript
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
```

Once installed and configured, the image picker will work automatically!
