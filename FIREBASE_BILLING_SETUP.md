# Firebase Billing Setup Guide 💳

**Error:** `BILLING_NOT_ENABLED` - Phone Authentication Requires Firebase Blaze Plan

---

## The Issue ⚠️

Firebase Phone Authentication **requires** the **Blaze (Pay-as-you-go)** plan. The free Spark plan does not support phone auth.

**Error you're seeing:**
```
[auth/billing-not] An internal error has occurred. [ BILLING_NOT_ENABLED ]
```

---

## Solutions

### Option 1: Enable Firebase Blaze Plan (Recommended for Production) 💳

#### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com
2. Select your project: **tiffin-dabba-2e3f7**

#### Step 2: Upgrade to Blaze Plan
1. Click **⚙️ Settings** (gear icon) → **Usage and billing**
2. Click **Details & settings** under your current plan
3. Click **Modify plan**
4. Select **Blaze plan** (Pay as you go)
5. Add your billing information (credit/debit card)

#### Step 3: Verify Phone Auth is Enabled
1. Go to **Authentication** → **Sign-in method**
2. Click **Phone** provider
3. Enable it if not already enabled
4. Save

#### Cost Information 💰
Firebase Phone Auth pricing (as of 2026):
- **Free tier:** First 10K verifications/month = FREE
- **After 10K:** ~$0.01 per verification
- **For development:** Practically FREE (unless you're testing thousands of times)

**Total monthly cost for small app:** Usually stays in free tier ($0/month)

---

### Option 2: Use Test Phone Numbers (Development Only) 🧪

If you don't want to upgrade yet, use Firebase's test phone numbers feature:

#### Step 1: Add Test Phone Numbers
1. Go to Firebase Console → **Authentication** → **Sign-in method**
2. Scroll down to **Phone numbers for testing**
3. Click **Add phone number**
4. Add test numbers:
   - Phone: `+919999999999` → Code: `123456`
   - Phone: `+919876543210` → Code: `654321`
5. Save

#### Step 2: Test in App
```
Enter phone: 9999999999
Enter OTP: 123456
✅ Will work without billing!
```

**⚠️ Limitations:**
- Only works with pre-configured test numbers
- Cannot test with real phone numbers
- Not suitable for production

---

### Option 3: Disable Firebase Phone Auth (Quick Fix) 🔧

If you want to continue development without phone auth temporarily:

#### Update App.tsx to skip phone auth:

```typescript
// In App.tsx, replace the render logic with:
return (
  <SafeAreaProvider>
    <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
    {isAuthenticated ? (
      <DashboardScreen onLogout={handleLogout} />
    ) : (
      // Skip phone auth, go directly to admin login
      <AdminLoginScreen
        firebaseToken="development-token-bypass"
        onLoginSuccess={handleLoginSuccess}
      />
    )}
  </SafeAreaProvider>
);
```

**⚠️ Note:**
- Backend must accept dummy token OR you need to modify backend to make Firebase token optional during development
- This is ONLY for development testing
- Re-enable phone auth before production

---

## Recommended Approach for Development 🎯

### For Now (Development):
1. ✅ **Add test phone numbers** (Option 2) - FREE, works immediately
2. ✅ Test your app flow with `+919999999999` / `123456`
3. ✅ Complete your app development

### Before Production:
1. ✅ **Upgrade to Blaze plan** (Option 1)
2. ✅ Remove test phone numbers
3. ✅ Test with real phone numbers
4. ✅ Deploy to production

---

## Quick Fix: Add Test Phone Number Right Now! 🚀

1. **Open:** https://console.firebase.google.com/project/tiffin-dabba-2e3f7/authentication/providers
2. **Scroll to:** "Phone numbers for testing"
3. **Add:**
   - Phone: `+919999999999`
   - Code: `123456`
4. **Click:** Add
5. **Save**

Now in your app:
```
Phone Number: 9999999999
OTP: 123456
✅ Will work!
```

---

## Already Fixed in Code ✅

The deprecated Firebase API warning has been fixed:

**Before:**
```typescript
auth().signInWithPhoneNumber(phone)  // ❌ Deprecated
```

**After:**
```typescript
signInWithPhoneNumber(auth(), phone)  // ✅ Modular API
```

File: [src/screens/admin/PhoneAuthScreen.tsx:78](src/screens/admin/PhoneAuthScreen.tsx#L78)

---

## Summary

**Current Error:** BILLING_NOT_ENABLED

**Quick Fix (5 minutes):**
- Add test phone number `+919999999999` with code `123456`
- Test app immediately
- Development continues!

**Production Fix (when ready):**
- Upgrade to Blaze plan (still mostly free)
- Enable real phone auth
- Deploy!

---

## FAQ

### Q: Will I be charged immediately after upgrading to Blaze?
**A:** No! First 10K verifications/month are FREE. You'll likely stay in free tier during development.

### Q: Can I use test phone numbers in production?
**A:** NO! Test numbers are only for development. They bypass actual SMS sending.

### Q: What if I exceed 10K verifications?
**A:** At ~$0.01 per verification, 1000 extra verifications = ~$10. You'll get email alerts before charges.

### Q: Can I downgrade back to Spark plan?
**A:** Yes, but you'll lose phone auth capability.

---

**Next Steps:**
1. Add test phone number (takes 2 minutes)
2. Test app with `9999999999` / `123456`
3. Continue development
4. Upgrade to Blaze when ready for production

Good luck! 🚀
