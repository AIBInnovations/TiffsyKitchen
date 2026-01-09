# Test Credentials & Quick Start

## Admin Login Credentials

**Username:** `admin`
**Password:** `admin` (based on the hash, typical test password)

**User Details:**
- Name: Super Admin
- Email: admin@tiffsy.com
- Phone: 9999999999
- Role: ADMIN
- Status: ACTIVE

---

## Quick Test Steps

### 1. Start the App
```bash
# Terminal 1 - Start Metro
npm start

# Terminal 2 - Run app
npm run android
# or
npm run ios
```

### 2. Login
1. Enter username: `admin`
2. Enter password: `admin` (or the password you set)
3. Click "Sign In"

### 3. Test Dashboard
Once logged in, you should see:
- **Overview Section**: Total Orders, Revenue, Customers, Kitchens
- **Today's Stats**: Orders, Revenue, New Customers
- **Pending Actions**: Pending Orders, Refunds, Kitchen Approvals
- **Recent Activity**: Latest admin actions

### 4. Test Features
- ✅ **Pull to Refresh**: Pull down on dashboard to refresh data
- ✅ **Logout**: Click logout icon (top-right) to logout
- ✅ **Menu**: Click menu icon (top-left) to open sidebar

---

## What to Check

### Dashboard Data Loading
- [ ] Loading spinner appears initially
- [ ] Data loads from `/api/admin/dashboard`
- [ ] All metrics display correctly
- [ ] No errors in console

### Pull to Refresh
- [ ] Pull down gesture works
- [ ] Refresh indicator shows
- [ ] Data updates after refresh

### Caching
- [ ] Close app
- [ ] Reopen within 30 seconds
- [ ] Dashboard shows instantly (cached data)
- [ ] Wait 40 seconds, reopen
- [ ] Loading spinner shows (cache expired)

### Error Handling
- [ ] Turn off internet
- [ ] Pull to refresh
- [ ] Error message appears
- [ ] Retry button works

### Logout
- [ ] Click logout icon
- [ ] Returns to login screen
- [ ] Token cleared
- [ ] Reopen app → shows login screen

---

## Expected API Calls

When dashboard loads, it should call:
```
GET https://tiffsy-backend.onrender.com/api/admin/dashboard
Headers: {
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

---

## Troubleshooting

### "Session expired" error
- Token might be invalid
- Try logging in again

### "Network error"
- Check if backend is running
- Verify URL: https://tiffsy-backend.onrender.com
- Check internet connection

### "Unable to Load Dashboard"
- Check if `/api/admin/dashboard` endpoint exists
- Verify response format matches `DashboardData` type
- Check backend logs

### App crashes on login
- Check Metro console for errors
- Verify all dependencies installed
- Try: `npm start -- --reset-cache`

---

## Backend Verification

Test the endpoint directly:
```bash
# Login to get token
curl -X POST https://tiffsy-backend.onrender.com/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Use token to get dashboard
curl https://tiffsy-backend.onrender.com/api/admin/dashboard \
  -H "Authorization: Bearer <TOKEN_FROM_LOGIN>"
```

---

## Next Steps After Testing

Once dashboard works:

1. **Orders Module**
   - Complete migration with adapter functions
   - Test orders list with real API

2. **Users Module**
   - Create enhanced version
   - Test user management

3. **Other Modules**
   - Kitchen Management
   - Plans & Pricing
   - Settings

---

**Ready to test?** Run: `npm start` then `npm run android` 🚀
