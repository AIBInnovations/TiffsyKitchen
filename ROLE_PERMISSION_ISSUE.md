# Role Permission Issue - Track Order & Reject Order

## Current Problem

The track order and reject order features are returning **403 Forbidden** errors due to role-based access control restrictions on the backend.

---

## Error Details

### Error 1: Track Order

**Console Output:**
```
📤 REQUEST: GET https://tiffsy-backend.onrender.com/api/orders/6963b6c35eef8e3f62d4ff23/track
❌ Response: 403 {
  "message": "Forbidden",
  "data": null,
  "error": "Access denied. Required role: CUSTOMER"
}
```

**Issue:**
- Endpoint: `GET /api/orders/:id/track`
- Required Role: `CUSTOMER`
- Current User Role: `ADMIN`
- Result: **Access Denied**

---

### Error 2: Reject Order

**Console Output:**
```
📤 REQUEST: PATCH https://tiffsy-backend.onrender.com/api/orders/6963b6c35eef8e3f62d4ff23/reject
❌ Response: 403 {
  "message": "Forbidden",
  "data": null,
  "error": "Access denied. Required role: KITCHEN_STAFF"
}
```

**Issue:**
- Endpoint: `PATCH /api/orders/:id/reject`
- Required Role: `KITCHEN_STAFF`
- Current User Role: `ADMIN`
- Result: **Access Denied**

---

## Root Cause Analysis

The backend API implements **strict role-based access control (RBAC)** where:

1. **Each endpoint has specific role requirements**
2. **ADMIN role is NOT automatically granted access to all endpoints**
3. **Some endpoints are designed for specific user types only**

### Current Role Restrictions

| Endpoint | Required Role | Admin Access | Status |
|----------|---------------|--------------|--------|
| `/api/orders/admin/all` | ADMIN | ✅ Yes | Working |
| `/api/orders/admin/stats` | ADMIN | ✅ Yes | Working |
| `/api/orders/:id` | ADMIN | ✅ Yes | Working |
| `/api/orders/:id/status` | KITCHEN_STAFF or ADMIN | ✅ Yes | Working |
| `/api/orders/:id/admin-cancel` | ADMIN | ✅ Yes | Working |
| `/api/orders/:id/accept` | KITCHEN_STAFF | ⚠️ Unknown | Need to test |
| `/api/orders/:id/reject` | KITCHEN_STAFF | ❌ **No** | **403 Error** |
| `/api/orders/:id/track` | CUSTOMER | ❌ **No** | **403 Error** |
| `/api/orders/:id/delivery-status` | DRIVER | ⚠️ Unknown | Need to test |
| `/api/orders/kitchen` | KITCHEN_STAFF | ⚠️ Unknown | Need to test |

---

## Why This Is a Problem

### 1. Admin Cannot Track Orders
- Admins need to track orders for customer support
- Cannot view real-time order status
- Cannot see driver location or delivery ETA
- Cannot help customers with "Where is my order?" queries

### 2. Admin Cannot Reject Orders
- Admins need to reject orders on behalf of kitchen staff
- If kitchen is overwhelmed or closed
- For emergency situations
- For quality control

### 3. Admin Functionality Limited
- The admin app becomes less useful
- Defeats the purpose of having an admin dashboard
- Requires switching to kitchen staff account to access features

---

## Solutions

### ✅ Option 1: Update Backend Role Permissions (RECOMMENDED)

**What needs to change:** Backend API middleware should allow ADMIN role to access all endpoints.

**Implementation:** Backend team updates role checks to include ADMIN as a superuser.

**Example Backend Changes:**

```javascript
// BEFORE: Only CUSTOMER can track orders
router.get('/api/orders/:id/track',
  requireRole('CUSTOMER'),
  trackOrder
);

// AFTER: CUSTOMER or ADMIN can track orders
router.get('/api/orders/:id/track',
  requireRole(['CUSTOMER', 'ADMIN']),
  trackOrder
);

// BEFORE: Only KITCHEN_STAFF can reject orders
router.patch('/api/orders/:id/reject',
  requireRole('KITCHEN_STAFF'),
  rejectOrder
);

// AFTER: KITCHEN_STAFF or ADMIN can reject orders
router.patch('/api/orders/:id/reject',
  requireRole(['KITCHEN_STAFF', 'ADMIN']),
  rejectOrder
);
```

**Pros:**
- ✅ No frontend changes needed
- ✅ Admin gets full access as expected
- ✅ Maintains existing functionality for other roles
- ✅ Simple and clean solution

**Cons:**
- None (this is the correct approach)

---

### ⚠️ Option 2: Create Admin-Specific Endpoints

**What needs to change:** Backend creates duplicate endpoints specifically for admin access.

**New Endpoints:**
```
GET  /api/orders/admin/:id/track
PATCH /api/orders/admin/:id/reject
PATCH /api/orders/admin/:id/delivery-status
GET  /api/orders/admin/kitchen
```

**Frontend Changes Required:**
```typescript
// In orders.service.ts

// Track order - use admin endpoint
async trackOrder(orderId: string): Promise<OrderTracking> {
  const response = await apiService.get<{
    success: boolean;
    data: OrderTracking;
  }>(`/api/orders/admin/${orderId}/track`);  // Changed to admin endpoint

  return response.data;
}

// Reject order - use admin endpoint
async rejectOrder(orderId: string, reason: string): Promise<Order> {
  const response = await apiService.patch<{
    success: boolean;
    message: string;
    data: { order: Order };
  }>(`/api/orders/admin/${orderId}/reject`, { reason });  // Changed to admin endpoint

  return response.data.order;
}
```

**Pros:**
- Separate admin logic from role-specific logic
- Better audit logging (can track admin actions separately)
- Can implement different business rules for admin operations

**Cons:**
- Requires frontend code changes
- Code duplication on backend
- More endpoints to maintain
- More complex API structure

---

### ❌ Option 3: Frontend Workaround (NOT RECOMMENDED)

**What to do:** Hide features based on user role.

**Implementation:**
```typescript
// In OrderDetailAdminScreen.tsx

const userRole = await AsyncStorage.getItem('adminRole');

// Only show Track Order if user is CUSTOMER
{userRole === 'CUSTOMER' && (
  <TouchableOpacity onPress={() => setShowTracking(!showTracking)}>
    <MaterialIcons name="location-on" size={20} />
    <Text>Track Order</Text>
  </TouchableOpacity>
)}

// Only show Reject Order if user is KITCHEN_STAFF
{userRole === 'KITCHEN_STAFF' && (
  <TouchableOpacity onPress={() => setShowRejectModal(true)}>
    <MaterialIcons name="cancel" size={20} />
    <Text>Reject Order</Text>
  </TouchableOpacity>
)}
```

**Why NOT Recommended:**
- ❌ Admin loses important functionality
- ❌ Defeats purpose of admin dashboard
- ❌ Poor user experience
- ❌ Doesn't solve the underlying problem
- ❌ Admin would need to switch accounts to access features

---

## Recommended Solution

### ✅ Option 1: Update Backend Role Permissions

This is the correct architectural approach because:

1. **ADMIN should be a superuser role** with access to all operations
2. **No code duplication** - uses existing endpoints
3. **No frontend changes required** - works immediately after backend update
4. **Maintains clean API design** - single endpoint per operation
5. **Expected behavior** - admins have full access

---

## Request to Backend Team

**Subject:** Update Role Permissions for Admin Access

**Message:**
```
Hi Backend Team,

We need to update role-based access control to allow ADMIN role to access the following endpoints:

1. GET /api/orders/:id/track
   Current: CUSTOMER only
   Required: CUSTOMER or ADMIN
   Reason: Admins need to track orders for customer support

2. PATCH /api/orders/:id/reject
   Current: KITCHEN_STAFF only
   Required: KITCHEN_STAFF or ADMIN
   Reason: Admins need to reject orders in emergency situations

3. PATCH /api/orders/:id/delivery-status (if restricted)
   Required: DRIVER or ADMIN
   Reason: Admins need to update delivery status for issue resolution

4. GET /api/orders/kitchen (if restricted)
   Required: KITCHEN_STAFF or ADMIN
   Reason: Admins need visibility into kitchen operations

ADMIN should function as a superuser role with access to all order operations.

Technical Implementation:
- Update requireRole middleware to accept role arrays
- Add ADMIN to allowed roles for the endpoints above
- No other business logic changes needed

Example:
requireRole('CUSTOMER') → requireRole(['CUSTOMER', 'ADMIN'])

This change allows admins to perform all operations necessary for support and management.
```

---

## Testing After Backend Fix

Once backend updates role permissions, test the following:

### Test 1: Track Order
1. Login as ADMIN user
2. Navigate to Order Detail screen
3. Click "Track Order" button
4. **Expected:** Should see tracking info without 403 error
5. **Verify:** Can see driver location, ETA, status timeline

### Test 2: Reject Order
1. Login as ADMIN user
2. Find an order with status PLACED or ACCEPTED
3. Click "Reject Order" button
4. Enter rejection reason
5. **Expected:** Order should be rejected without 403 error
6. **Verify:** Order status changes to REJECTED

### Test 3: Kitchen Orders View
1. Login as ADMIN user
2. Navigate to Kitchen Orders screen
3. **Expected:** Should see kitchen orders without 403 error
4. **Verify:** Can filter by meal window and date

### Test 4: Delivery Status Update
1. Login as ADMIN user
2. Find an order with status OUT_FOR_DELIVERY
3. Try to update delivery status
4. **Expected:** Should update without 403 error
5. **Verify:** Status updates successfully

---

## Current Status

**Frontend Implementation:** ✅ Complete
- OrderTracking component created
- Track Order button added to Order Detail screen
- Reject Order modal and functionality implemented
- All UI components ready to use

**Backend Permissions:** ❌ Blocking Issue
- ADMIN role lacks access to certain endpoints
- Frontend cannot use implemented features
- Waiting for backend role permission updates

**Impact:**
- High priority features are non-functional
- Admin dashboard is incomplete
- Customer support operations limited

---

## Summary

**Problem:** ADMIN role does not have access to CUSTOMER and KITCHEN_STAFF specific endpoints.

**Root Cause:** Backend RBAC does not treat ADMIN as a superuser role.

**Solution:** Backend team needs to update role checks to include ADMIN for all endpoints.

**Action Required:** Contact backend team with the request above.

**Timeline:** Once backend is updated, frontend features will work immediately with no code changes needed.

**Priority:** High - This blocks essential admin functionality.

---

## Files Affected (Frontend - Already Implemented)

These files are already correctly implemented and will work once backend permissions are fixed:

- [src/modules/orders/components/OrderTracking.tsx](src/modules/orders/components/OrderTracking.tsx) - Track order UI
- [src/modules/orders/screens/OrderDetailAdminScreen.tsx](src/modules/orders/screens/OrderDetailAdminScreen.tsx) - Integration point
- [src/services/orders.service.ts](src/services/orders.service.ts) - API calls
- [src/modules/orders/components/UpdateStatusModal.tsx](src/modules/orders/components/UpdateStatusModal.tsx) - Status update UI

**No frontend code changes needed** - just waiting for backend permissions update.
