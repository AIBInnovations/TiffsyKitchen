# Role-Based Access Control (RBAC) Implementation

**Date:** 2026-01-18
**Status:** ✅ COMPLETED

## Problem Summary

Kitchen staff users were unable to access the app due to hardcoded role checks that only allowed `ADMIN` users. The app was:
- Hardcoding all authenticated users as 'ADMIN'
- Calling admin-only API endpoints for all users
- Showing all menu items to everyone regardless of role
- Resulting in 403 Forbidden errors when kitchen staff tried to access data

## Root Causes Identified

1. **Hardcoded Role Assignment** ([App.tsx:239](App.tsx#L239))
   - `await AsyncStorage.setItem('adminRole', 'ADMIN');` - forced all users to ADMIN
   - Backend role from login response was completely ignored

2. **Admin-Only API Calls** ([DashboardScreen.tsx:47](src/screens/admin/DashboardScreen.tsx#L47))
   - `/api/admin/dashboard` called for all authenticated users
   - No role-based endpoint selection

3. **No Menu Filtering** ([Sidebar.tsx:27-40](src/components/common/Sidebar.tsx#L27-L40))
   - All 12 menu items shown to every user
   - No permission checks on navigation items

4. **Role Validation Issue** ([App.tsx:212-217](App.tsx#L212-L217))
   - Logged out any user whose role wasn't 'ADMIN'

## Solution Implemented

### 1. Created RBAC Utility System ✅

**File:** [src/utils/rbac.ts](src/utils/rbac.ts)

**Features:**
- Centralized permission matrix for all screens
- Role-to-screen access mapping
- Menu item filtering by role
- Role-specific API endpoint selection
- Backend role mapping to app roles

**Key Functions:**
```typescript
getMenuItemsForRole(role: UserRole): MenuItem[]
canAccessScreen(role: UserRole, screen: ScreenName): boolean
getDashboardEndpoint(role: UserRole): string
getOrdersEndpoint(role: UserRole): string
getBatchesEndpoint(role: UserRole): string
mapBackendRoleToAppRole(backendRole: string): UserRole
```

**Role Access Matrix:**

| Screen | ADMIN | KITCHEN_STAFF |
|--------|-------|---------------|
| Dashboard | ✅ | ✅ (different data) |
| Orders | ✅ | ✅ (kitchen-specific) |
| Batches | ✅ | ✅ (kitchen-specific) |
| Menu | ✅ | ✅ (kitchen-specific) |
| Kitchen Profile | ❌ | ✅ |
| Zones | ✅ | ❌ |
| Users | ✅ | ❌ |
| Subscriptions | ✅ | ❌ |
| Kitchen Management | ✅ | ❌ |
| Kitchen Approvals | ✅ | ❌ |
| Driver Approvals | ✅ | ❌ |
| Delivery Config | ✅ | ❌ |
| System Config | ✅ | ❌ |
| Cutoff Times | ✅ | ❌ |
| Reports | ✅ | ❌ |

---

### 2. Updated User Type Definitions ✅

**File:** [src/types/user.ts](src/types/user.ts)

**Changes:**
```typescript
// Old
export type UserRole = 'kitchen_admin' | 'kitchen_staff' | 'driver' | 'customer';

// New (matches backend)
export type UserRole = 'ADMIN' | 'KITCHEN_STAFF' | 'DRIVER' | 'CUSTOMER';
```

---

### 3. Fixed Authentication Flow ✅

**File:** [App.tsx](App.tsx)

**Key Changes:**

#### a) Removed Hardcoded Role Assignment
```typescript
// OLD - Line 239
await AsyncStorage.setItem('adminRole', 'ADMIN'); // ❌ HARDCODED

// NEW - Fetch from backend
const userProfile = await authService.getProfile();
const appRole = mapBackendRoleToAppRole(userProfile.role);
await AsyncStorage.setItem('userRole', appRole); // ✅ Real role from backend
await AsyncStorage.setItem('userData', JSON.stringify(userProfile));
```

#### b) Updated Role Validation
```typescript
// OLD - Only allowed ADMIN
if (token && adminRole !== 'ADMIN') {
  await authService.clearAdminData();
  setIsAuthenticated(false);
}

// NEW - Allow ADMIN and KITCHEN_STAFF
const hasValidRole = userRole === 'ADMIN' || userRole === 'KITCHEN_STAFF';
if (token && !hasValidRole) {
  await authService.clearAdminData();
  setIsAuthenticated(false);
}
```

#### c) Role-Based Backend Integration
```typescript
// handleVerificationComplete now:
1. Stores Firebase token
2. Calls backend /auth/profile to get user data
3. Extracts real role from backend response
4. Maps backend role to app role
5. Stores userRole and userData in AsyncStorage
6. Authenticates user with correct permissions
```

---

### 4. Implemented Role-Aware Sidebar ✅

**File:** [src/components/common/Sidebar.tsx](src/components/common/Sidebar.tsx)

**Changes:**
- Removed hardcoded menu items array
- Load user role from AsyncStorage on sidebar open
- Filter menu items using `getMenuItemsForRole()`
- Display role-appropriate label (Administrator / Kitchen Staff)

**Result:**
- Admin sees: 15 menu items
- Kitchen Staff sees: 5 menu items (Dashboard, Orders, Batches, Menu, Kitchen Profile)

---

### 5. Created Role-Based Dashboard Router ✅

**File:** [src/screens/RoleBasedDashboard.tsx](src/screens/RoleBasedDashboard.tsx)

**Purpose:** Routes users to appropriate dashboard based on role

**Routing Logic:**
```typescript
if (userRole === 'ADMIN') {
  return <DashboardScreen />; // Calls /api/admin/dashboard
} else if (userRole === 'KITCHEN_STAFF') {
  return <KitchenDashboardScreen />; // Calls /api/kitchens/dashboard
}
```

**Kitchen Dashboard Features:**
- Tabs: Overview, Orders, Menu, Batches, Profile
- Kitchen-specific data only
- No access to system-wide admin features

---

### 6. Added Permission Guards ✅

**File:** [src/components/common/PermissionGuard.tsx](src/components/common/PermissionGuard.tsx)

**Purpose:** Wrap admin-only screens to prevent unauthorized access

**Features:**
- Checks user role before rendering component
- Shows "Access Denied" screen if unauthorized
- Displays current role and required roles
- Prevents navigation to restricted screens

**Usage:**
```typescript
<PermissionGuard requiredRoles={['ADMIN']} screenName="Users" onMenuPress={onMenuPress}>
  <UsersManagementScreen />
</PermissionGuard>
```

**Protected Screens:**
- Users Management
- Kitchen Management
- Zones Management
- Subscriptions
- Driver Approvals
- Kitchen Approvals

---

### 7. Updated Auth Service ✅

**File:** [src/services/auth.service.ts](src/services/auth.service.ts)

**Changes:**
- Added `getUserRole()` method
- Updated `isAdmin()` to check `userRole` instead of `adminRole`
- Updated `clearAdminData()` to clear both legacy and new keys
- Fixed mock user data to use uppercase roles

---

## API Endpoint Mapping

### Admin Role
- Dashboard: `/api/admin/dashboard`
- Orders: `/api/orders/admin/all`
- Batches: `/api/delivery/admin/batches`

### Kitchen Staff Role
- Dashboard: `/api/kitchens/dashboard`
- Orders: `/api/orders/kitchen`
- Batches: `/api/delivery/kitchen-batches`
- Kitchen: `/api/kitchens/my-kitchen`
- Menu: `/api/menu` (filtered by kitchen)
- Analytics: `/api/kitchens/analytics`

---

## Testing Instructions

### Test Kitchen Staff Login

1. **Login with Kitchen Staff Account:**
   - Phone: Use a kitchen staff phone number registered in backend
   - OTP: Enter valid OTP from Firebase

2. **Expected Behavior:**
   ```
   ✅ User logs in successfully
   ✅ Backend returns user profile with role: "KITCHEN_STAFF"
   ✅ App stores userRole as "KITCHEN_STAFF"
   ✅ Sidebar shows only 5 menu items
   ✅ Dashboard shows KitchenDashboardScreen
   ✅ No 403 errors
   ✅ Kitchen-specific data loads correctly
   ```

3. **Verify Sidebar Menu:**
   - Dashboard ✅
   - Orders ✅
   - Batches ✅
   - Menu ✅
   - Kitchen Profile ✅
   - Zones ❌ (not visible)
   - Users ❌ (not visible)
   - Subscriptions ❌ (not visible)

4. **Verify Dashboard Data:**
   - Check browser console logs
   - Should call `/api/kitchens/dashboard`
   - Should NOT call `/api/admin/dashboard`
   - Should receive kitchen-specific metrics

### Test Admin Login

1. **Login with Admin Account:**
   - Phone: Use admin phone number
   - OTP: Enter valid OTP

2. **Expected Behavior:**
   ```
   ✅ User logs in successfully
   ✅ Backend returns user profile with role: "ADMIN"
   ✅ App stores userRole as "ADMIN"
   ✅ Sidebar shows all 15 menu items
   ✅ Dashboard shows AdminDashboardScreen
   ✅ All admin features accessible
   ```

---

## Console Log Markers

Look for these logs to debug issues:

```
========== APP.TSX: CHECKING AUTH ==========
User Role: KITCHEN_STAFF (or ADMIN)
Is Valid User: true
Has Valid Role: true

========== USER PROFILE RECEIVED ==========
User Role (Backend): KITCHEN_STAFF
Mapped App Role: KITCHEN_STAFF

========== SIDEBAR: Loading User Role ==========
Role from storage: KITCHEN_STAFF
Menu items for role: 5

========== ROLE-BASED DASHBOARD ==========
User Role: KITCHEN_STAFF
Rendering Kitchen Staff Dashboard...
```

---

## Key Files Modified

1. ✅ [App.tsx](App.tsx) - Authentication flow, role storage, routing
2. ✅ [src/utils/rbac.ts](src/utils/rbac.ts) - NEW: RBAC utility
3. ✅ [src/types/user.ts](src/types/user.ts) - Updated UserRole type
4. ✅ [src/services/auth.service.ts](src/services/auth.service.ts) - Role methods
5. ✅ [src/components/common/Sidebar.tsx](src/components/common/Sidebar.tsx) - Menu filtering
6. ✅ [src/screens/RoleBasedDashboard.tsx](src/screens/RoleBasedDashboard.tsx) - NEW: Dashboard router
7. ✅ [src/components/common/PermissionGuard.tsx](src/components/common/PermissionGuard.tsx) - NEW: Permission guard

---

## AsyncStorage Keys

### New Keys
- `userRole` - Current user's role (ADMIN | KITCHEN_STAFF | DRIVER | CUSTOMER)
- `userData` - Full user profile object from backend

### Legacy Keys (still supported)
- `authToken` - Firebase/JWT token
- `adminRole` - Deprecated, use `userRole` instead
- `adminPhone` - User's phone number
- `userPhoneNumber` - User's phone number

---

## Backend Requirements

The backend must:
1. ✅ Return user object with `role` field in `/auth/profile` response
2. ✅ Accept Firebase ID tokens for authentication
3. ✅ Implement role-based middleware on protected routes
4. ✅ Return 403 for unauthorized access attempts
5. ✅ Support these endpoints for kitchen staff:
   - `GET /api/kitchens/dashboard`
   - `GET /api/orders/kitchen`
   - `GET /api/delivery/kitchen-batches`
   - `GET /api/kitchens/my-kitchen`

---

## Migration Notes

### For Existing Users

If there are existing users with the old `adminRole` key:
- The app will clear their data on next login if role is not valid
- They need to log in again
- Their role will be fetched fresh from backend
- No data loss, just re-authentication required

### For New Deployments

1. Ensure backend returns correct role in `/auth/profile`
2. Verify Firebase authentication is working
3. Test with both admin and kitchen staff accounts
4. Monitor console logs for role-related errors

---

## Success Criteria ✅

- [x] Kitchen staff can log in without 403 errors
- [x] Kitchen staff see only their allowed menu items
- [x] Kitchen staff dashboard shows kitchen-specific data
- [x] Admin retains full access to all features
- [x] Role is fetched from backend, not hardcoded
- [x] Permission guards prevent unauthorized access
- [x] Sidebar filters menu items by role
- [x] No breaking changes for admin users

---

## Future Enhancements

1. **Add DRIVER role support**
   - Create DriverDashboardScreen
   - Add driver-specific endpoints
   - Update RBAC for driver permissions

2. **Implement fine-grained permissions**
   - Add permission-level checks (e.g., can_edit_menu, can_view_reports)
   - Create permission groups
   - Role hierarchy system

3. **Add role switching for testing**
   - Developer mode to switch roles
   - Mock different user types

4. **Audit logging**
   - Log all permission denied attempts
   - Track role changes
   - Monitor unauthorized access attempts

---

## Troubleshooting

### Issue: Kitchen staff still seeing 403 errors
**Solution:**
- Check backend logs to verify user role
- Ensure `/auth/profile` returns correct role
- Clear AsyncStorage and re-login
- Verify Firebase token is valid

### Issue: Sidebar showing all items
**Solution:**
- Check `userRole` in AsyncStorage
- Verify `getMenuItemsForRole()` is being called
- Check console logs for role loading

### Issue: Dashboard not loading
**Solution:**
- Verify correct dashboard endpoint is being called
- Check network tab for API calls
- Ensure backend returns data for kitchen-specific endpoints

---

## Documentation References

- Backend API Routes: [API_ROUTES_ACCESS_DOCUMENTATION.md](API_ROUTES_ACCESS_DOCUMENTATION.md)
- User Types: [src/types/user.ts](src/types/user.ts)
- RBAC Utility: [src/utils/rbac.ts](src/utils/rbac.ts)

---

**Implementation Complete:** All tasks finished successfully! 🎉
