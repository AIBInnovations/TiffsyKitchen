# Debug Authentication Issues

## Check Current Authentication State

Add this code temporarily to your app to debug:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this button somewhere in your app
const debugAuth = async () => {
  console.log('========== AUTH DEBUG ==========');

  const token = await AsyncStorage.getItem('authToken');
  const role = await AsyncStorage.getItem('adminRole');
  const user = await AsyncStorage.getItem('adminUser');

  console.log('Token exists:', !!token);
  console.log('Token value:', token?.substring(0, 50) + '...');
  console.log('Admin role:', role);
  console.log('User data:', user);

  console.log('================================');
};

// Or check in console:
await AsyncStorage.getItem('authToken')
await AsyncStorage.getItem('adminRole')
```

## Expected Values for Admin Access

For orders admin endpoints to work, you need:

```
authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." (real JWT token)
adminRole: "ADMIN"
```

## Common 403 Forbidden Causes

### 1. Mock Login Still Active ✅ FIXED
- ~~USE_MOCK_LOGIN = true~~
- ✅ Now: USE_MOCK_LOGIN = false

### 2. Not Logged In
- No token in AsyncStorage
- **Solution**: Login through the app first

### 3. Wrong Role
- Token exists but role is not "ADMIN"
- Roles: ADMIN, KITCHEN_STAFF, DRIVER, CUSTOMER
- **Solution**: Login with admin credentials

### 4. Token Expired
- Token exists but expired
- **Solution**: Logout and login again

### 5. Wrong Backend URL
- Pointing to wrong server
- Current: `https://tiffsy-backend.onrender.com`
- **Solution**: Verify backend URL is correct

## Test Steps

### Step 1: Verify Mock Login is Disabled
```bash
# Check the file
cat src/services/auth.service.ts | grep "USE_MOCK_LOGIN"

# Should show:
# const USE_MOCK_LOGIN = false;
```

### Step 2: Login with Admin Account
1. Open the app
2. Logout if already logged in
3. Login with admin credentials
4. Check console for token storage

### Step 3: Test API Call
```tsx
// Make a test API call
import { ordersService } from './src/services/orders.service';

try {
  const stats = await ordersService.getOrderStatistics();
  console.log('✅ Success:', stats);
} catch (error) {
  console.error('❌ Error:', error);
}
```

## Check Backend Logs

If you still get 403, check backend logs:

```bash
# Backend should log:
# - Token received: ✅/❌
# - Token valid: ✅/❌
# - User role: ADMIN/KITCHEN_STAFF/etc
# - Permission check: ✅/❌
```

## Backend API Requirements

According to the documentation, these endpoints require ADMIN role:

| Endpoint | Required Role | Notes |
|----------|---------------|-------|
| `/api/orders/admin/all` | ADMIN | List all orders |
| `/api/orders/admin/stats` | ADMIN | Order statistics |
| `/api/orders/:id/admin-cancel` | ADMIN | Cancel order |
| `/api/orders/:id` | ADMIN or KITCHEN_STAFF | View order details |
| `/api/orders/:id/accept` | KITCHEN_STAFF | Accept order |
| `/api/orders/:id/reject` | KITCHEN_STAFF | Reject order |
| `/api/orders/:id/status` | KITCHEN_STAFF | Update status |
| `/api/orders/:id/delivery-status` | DRIVER | Update delivery |
| `/api/orders/:id/track` | ANY (CUSTOMER) | Track order |
| `/api/orders/kitchen` | KITCHEN_STAFF | Kitchen orders |

## Solution Checklist

- [x] Disable USE_MOCK_LOGIN
- [ ] Login with admin account
- [ ] Verify token is stored in AsyncStorage
- [ ] Verify adminRole is "ADMIN"
- [ ] Clear app data and login again (if needed)
- [ ] Test API call
- [ ] Check backend is running
- [ ] Check network connectivity

## If Still Not Working

1. **Clear app data:**
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

2. **Restart app**

3. **Login again with admin credentials**

4. **Check console logs** for detailed API request/response

5. **Contact backend team** if token is valid but still getting 403
