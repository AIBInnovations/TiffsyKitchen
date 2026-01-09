# Navigation Setup Guide

## Step 1: Install Dependencies

Run these commands:

```bash
# Core navigation
npm install @react-navigation/native @react-navigation/drawer @react-navigation/stack

# Required dependencies
npm install react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context @react-native-community/masked-view

# iOS only (if using iOS)
cd ios && pod install && cd ..
```

## Step 2: Configure react-native-reanimated

Add this to `babel.config.js`:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'], // Add this line
};
```

## Step 3: Configure gesture handler

Add this to the **TOP** of `index.js`:

```javascript
import 'react-native-gesture-handler';
```

## Step 4: After Installation

1. Stop Metro bundler (Ctrl+C)
2. Clear cache: `npm start -- --reset-cache`
3. Rebuild app: `npm run android` or `npm run ios`

---

**Then let me know when installation is complete, and I'll create the navigation structure!**
