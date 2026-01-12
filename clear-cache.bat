@echo off
echo ==========================================
echo Clearing React Native / Metro Cache
echo ==========================================
echo.

echo 1. Clearing Metro bundler cache...
if exist "%TEMP%\react-*" rd /s /q "%TEMP%\react-*" 2>nul
if exist "%TEMP%\metro-*" rd /s /q "%TEMP%\metro-*" 2>nul
if exist "%TEMP%\haste-map-*" rd /s /q "%TEMP%\haste-map-*" 2>nul

echo 2. Clearing React Native cache...
if exist "node_modules\.cache" rd /s /q "node_modules\.cache" 2>nul

echo 3. Clearing Watchman cache...
call watchman watch-del-all 2>nul

echo 4. Clearing Android build cache...
cd android
call gradlew clean 2>nul
cd ..

echo.
echo ==========================================
echo Cache cleared successfully!
echo ==========================================
echo.
echo To start the app again, run:
echo   npm start -- --reset-cache
echo   npm run android
echo.
pause
