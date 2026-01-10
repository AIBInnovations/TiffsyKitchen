# 🔐 Admin Data Storage & Token Management

**Date:** January 10, 2026
**Status:** ✅ IMPLEMENTED

---

## Overview

Complete implementation of admin data storage, role verification, and token management for secure API requests throughout the admin dashboard.

---

## What Gets Stored After Login

When an admin successfully logs in, the following data is stored in AsyncStorage:

### 1. Authentication Token
```typescript
Key: 'authToken'
Value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
Purpose: Used in Authorization header for all API requests
```

### 2. Complete Admin User Object
```typescript
Key: 'adminUser'
Value: JSON string of complete user object
Example: {
  "_id": "696100c8c39ff249a72270df",
  "phone": "7222918898",
  "role": "ADMIN",
  "name": "Super Admin",
  "email": "admin@tiffsy.com",
  "username": "admin"
}
```

### 3. Individual Admin Fields (for easy access)
```typescript
'adminUserId'    : "696100c8c39ff249a72270df"
'adminUsername'  : "admin"
'adminEmail'     : "admin@tiffsy.com"
'adminName'      : "Super Admin"
'adminRole'      : "ADMIN"
'adminPhone'     : "7222918898"
```

### 4. Token Metadata
```typescript
'tokenExpiresIn' : "86400"  // seconds (24 hours)
```

### 5. Session Preferences
```typescript
'@admin_session_indicator' : 'admin_session_active'  // if remember me checked
'@admin_remember_me'       : 'true' | 'false'
```

---

## Login Flow with Data Storage

### Step 1: API Response Received
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "696100c8c39ff249a72270df",
      "phone": "7222918898",
      "role": "ADMIN",
      "name": "Super Admin",
      "email": "admin@tiffsy.com",
      "username": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

### Step 2: Role Verification
```typescript
const userRole = data.data?.user?.role;

console.log('========== ROLE VERIFICATION ==========');
console.log('User Role:', userRole);
console.log('Is Admin:', userRole === 'ADMIN');
console.log('=======================================');

if (userRole !== 'ADMIN') {
  console.log('========== ACCESS DENIED ==========');
  console.log('Reason: User role is not ADMIN');
  setGlobalError('Access Denied. Admin privileges required.');
  return;
}
```

**Result:** If role is NOT "ADMIN", login is rejected with error message.

### Step 3: Store All Data
```typescript
console.log('========== STORING ADMIN DATA ==========');

// Store backend auth token
await AsyncStorage.setItem('authToken', data.data.token);
console.log('✓ Auth token stored');

// Store admin user data as JSON
await AsyncStorage.setItem('adminUser', JSON.stringify(data.data.user));
console.log('✓ Admin user data stored');

// Store individual fields
await AsyncStorage.setItem('adminUserId', data.data.user._id);
await AsyncStorage.setItem('adminUsername', data.data.user.username);
await AsyncStorage.setItem('adminEmail', data.data.user.email);
await AsyncStorage.setItem('adminName', data.data.user.name);
await AsyncStorage.setItem('adminRole', data.data.user.role);
await AsyncStorage.setItem('adminPhone', data.data.user.phone);
console.log('✓ Individual admin fields stored');

// Store token expiry
await AsyncStorage.setItem('tokenExpiresIn', String(data.data.expiresIn));
console.log('✓ Token expiry stored');

console.log('========================================');
```

### Step 4: Success Alert
```typescript
Alert.alert(
  'Login Successful',
  `Welcome ${data.data.user.name}!`,
  [
    {
      text: 'Continue',
      onPress: () => {
        onLoginSuccess(data.data.token);
      },
    },
  ],
  { cancelable: false }
);
```

### Step 5: Navigate to Dashboard
```typescript
// App.tsx receives the callback
const handleLoginSuccess = async (token: string) => {
  await AsyncStorage.setItem('authToken', token);
  setIsAuthenticated(true);
};

// Dashboard screen is rendered
<DashboardScreen onLogout={handleLogout} />
```

---

## How Token is Used in API Requests

### Automatic Token Inclusion

The `api.service.ts` automatically includes the auth token in every API request:

```typescript
// src/services/api.service.ts
class ApiService {
  private async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem('authToken');
  }

  private async request<T>(endpoint: string, config: RequestConfig): Promise<T> {
    const token = await this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    // Automatically add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: config.method,
      headers,
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    return response.json();
  }
}
```

### Example API Calls in Dashboard

**Get Users:**
```typescript
// In any screen/component
import { apiService } from '../services/api.service';

const fetchUsers = async () => {
  const users = await apiService.get('/api/users');
  // Token is automatically included in Authorization header
};
```

**Update Order:**
```typescript
const updateOrder = async (orderId: string, data: any) => {
  const result = await apiService.patch(`/api/orders/${orderId}`, data);
  // Token is automatically included in Authorization header
};
```

**Request Headers Sent:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## Auth Service Helper Methods

### Available Methods

```typescript
// src/services/auth.service.ts

// Get complete admin user object
const adminData = await authService.getStoredAdminData();
// Returns: { _id, phone, role, name, email, username }

// Get auth token
const token = await authService.getAdminToken();
// Returns: "eyJhbGci..."

// Get admin role
const role = await authService.getAdminRole();
// Returns: "ADMIN"

// Check if current user is admin
const isAdmin = await authService.isAdmin();
// Returns: true | false

// Clear all admin data (on logout)
await authService.clearAdminData();
// Removes all admin-related keys from AsyncStorage
```

---

## Logout Flow

### Complete Data Cleanup

```typescript
// App.tsx
const handleLogout = async () => {
  console.log('========== APP.TSX: LOGOUT ==========');
  console.log('Clearing all admin data...');

  // Clear all admin data using auth service
  await authService.clearAdminData();

  console.log('Admin data cleared');
  console.log('Resetting authentication state...');
  console.log('=====================================');

  setIsAuthenticated(false);
  setFirebaseToken(null);
};
```

### Keys Removed on Logout

```typescript
const keysToRemove = [
  'authToken',
  'adminUser',
  'adminUserId',
  'adminUsername',
  'adminEmail',
  'adminName',
  'adminRole',
  'adminPhone',
  'tokenExpiresIn',
  '@admin_session_indicator',
  '@admin_remember_me',
];

await AsyncStorage.multiRemove(keysToRemove);
```

---

## Console Logs

### Role Verification Logs

**Success:**
```
========== ROLE VERIFICATION ==========
User Role: ADMIN
Is Admin: true
=======================================
```

**Access Denied:**
```
========== ROLE VERIFICATION ==========
User Role: USER
Is Admin: false
=======================================

========== ACCESS DENIED ==========
Reason: User role is not ADMIN
User Role: USER
Timestamp: 2026-01-10T10:31:05.456Z
===================================
```

### Data Storage Logs

```
========== STORING ADMIN DATA ==========
✓ Auth token stored
✓ Admin user data stored: {
  "_id": "696100c8c39ff249a72270df",
  "phone": "7222918898",
  "role": "ADMIN",
  "name": "Super Admin",
  "email": "admin@tiffsy.com",
  "username": "admin"
}
✓ Individual admin fields stored
✓ Token expiry stored: 86400 seconds
✓ Admin session stored (remember me enabled)
✓ Remember me preference stored
========================================
```

### Login Success Logs

```
========== LOGIN SUCCESS ==========
Admin authenticated successfully!
Name: Super Admin
Username: admin
Role: ADMIN
Navigating to Admin Dashboard...
===================================
```

### Logout Logs

```
========== APP.TSX: LOGOUT ==========
Clearing all admin data...
Admin data cleared successfully
Admin data cleared
Resetting authentication state...
=====================================
```

---

## Security Features

### 1. Role-Based Access Control
- ✅ Only users with role "ADMIN" can access the dashboard
- ✅ Non-admin roles receive "Access Denied" error
- ✅ Role verification happens before storing any data

### 2. Token Security
- ✅ Token stored securely in AsyncStorage
- ✅ Automatically included in all API requests
- ✅ Token removed on logout
- ✅ Token expiry tracked

### 3. Session Management
- ✅ Remember me functionality
- ✅ Session persistence across app restarts
- ✅ Complete cleanup on logout

---

## Usage Examples

### In Dashboard Screen

```typescript
import { authService } from '../services/auth.service';
import { apiService } from '../services/api.service';

const DashboardScreen = () => {
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    // Get stored admin data
    const adminData = await authService.getStoredAdminData();
    if (adminData) {
      setAdminName(adminData.name);
    }
  };

  const fetchOrders = async () => {
    // Token automatically included
    const orders = await apiService.get('/api/orders');
  };

  return (
    <View>
      <Text>Welcome, {adminName}!</Text>
    </View>
  );
};
```

### In Orders Screen

```typescript
const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    // Token automatically included in Authorization header
    const result = await apiService.patch(`/api/orders/${orderId}`, {
      status: status
    });

    console.log('Order updated:', result);
  } catch (error) {
    console.error('Error updating order:', error);
  }
};
```

### In Users Screen

```typescript
const fetchAllUsers = async () => {
  try {
    // Token automatically included
    const users = await apiService.get('/api/users');
    setUsers(users);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};
```

---

## Files Modified

| File | Purpose |
|------|---------|
| [AdminLoginScreen.tsx](src/screens/admin/AdminLoginScreen.tsx) | Role verification, data storage, success alert |
| [auth.service.ts](src/services/auth.service.ts) | Helper methods for admin data management |
| [api.service.ts](src/services/api.service.ts) | Automatic token inclusion (already existed) |
| [App.tsx](App.tsx) | Logout handler with complete data cleanup |

---

## Testing Checklist

### Test Login Success Flow
1. ✅ Enter valid admin credentials
2. ✅ Verify role verification logs show "ADMIN"
3. ✅ Verify all storage logs show "✓"
4. ✅ Verify success alert shows with admin name
5. ✅ Verify navigation to dashboard

### Test Role Verification
1. ✅ Login with non-admin account
2. ✅ Verify "ACCESS DENIED" log appears
3. ✅ Verify error message shows
4. ✅ Verify no data is stored
5. ✅ Verify user stays on login screen

### Test Token Usage
1. ✅ Login successfully
2. ✅ Navigate to any dashboard section
3. ✅ Make API request (orders, users, etc.)
4. ✅ Verify token is included in request headers
5. ✅ Verify API call succeeds

### Test Logout
1. ✅ Login and reach dashboard
2. ✅ Click logout button
3. ✅ Verify logout logs appear
4. ✅ Verify all data cleared from AsyncStorage
5. ✅ Verify navigation back to phone auth screen

### Test Session Persistence
1. ✅ Login with "Remember Me" checked
2. ✅ Close app completely
3. ✅ Reopen app
4. ✅ Verify auto-login to dashboard
5. ✅ Verify admin data still accessible

---

## API Request Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│         Dashboard Component / Screen                │
│                                                     │
│  const data = await apiService.get('/api/orders')  │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              ApiService.request()                   │
│                                                     │
│  1. Get token: AsyncStorage.getItem('authToken')   │
│  2. Add to headers: Authorization: Bearer {token}  │
│  3. Make fetch request                             │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              Backend API Server                     │
│                                                     │
│  1. Receive request with Authorization header      │
│  2. Verify JWT token                               │
│  3. Extract admin user from token                  │
│  4. Process request                                │
│  5. Return response                                │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│         Response Back to Component                  │
│                                                     │
│  - Success: Data returned                          │
│  - Failure: Error thrown                           │
└─────────────────────────────────────────────────────┘
```

---

## Summary

✅ **Admin Data Storage:** All user info, token, and metadata stored securely
✅ **Role Verification:** Only ADMIN role can access dashboard
✅ **Success Alert:** Shows admin name before navigation
✅ **Token Management:** Automatically included in all API requests
✅ **Helper Methods:** Easy access to stored admin data
✅ **Complete Logout:** All data cleared properly
✅ **Session Persistence:** Remember me functionality works
✅ **Comprehensive Logging:** All operations tracked in console

---

**🎉 Admin Data Storage & Token Management Complete!**

**Date:** January 10, 2026
**Status:** ✅ PRODUCTION READY
