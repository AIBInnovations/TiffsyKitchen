#!/bin/bash

echo "=========================================="
echo "Clearing React Native / Metro Cache"
echo "=========================================="
echo ""

echo "1. Stopping Metro bundler..."
# Kill any running Metro processes
pkill -f "react-native" || true
pkill -f "metro" || true

echo "2. Clearing npm cache..."
npm cache clean --force

echo "3. Clearing Metro bundler cache..."
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*

echo "4. Clearing React Native cache..."
rm -rf node_modules/.cache

echo "5. Clearing watchman cache..."
watchman watch-del-all 2>/dev/null || true

echo "6. Clearing Android build cache..."
cd android
./gradlew clean 2>/dev/null || true
cd ..

echo ""
echo "=========================================="
echo "Cache cleared successfully!"
echo "=========================================="
echo ""
echo "To start the app again, run:"
echo "  npm start -- --reset-cache"
echo "  npm run android"
echo ""
