# Kitchen Assignment Required for Kitchen Staff

**Date:** 2026-01-18
**Issue:** Kitchen staff user not assigned to a kitchen
**Status:** ⚠️ Backend Configuration Required

---

## Problem

Kitchen staff user successfully authenticated but getting "Forbidden - Access denied to this kitchen" error when trying to access the kitchen dashboard.

### Error from Backend:
```json
{
  "success": false,
  "message": "Forbidden",
  "data": null,
  "error": "Access denied to this kitchen"
}
```

### What This Means:
The backend's `kitchenAccessMiddleware` is rejecting the request because the authenticated user doesn't have a `kitchenId` assigned in the database.

---

## Root Cause

The test user with phone `+919800000001` has:
- ✅ Role set to `KITCHEN_STAFF`
- ✅ Can authenticate successfully
- ❌ **No `kitchenId` assigned in user document**

---

## Solution

The user document in the backend database needs to have a `kitchenId` field.

### Option 1: Assign Existing User to Kitchen (Recommended)

Update the user in MongoDB:

```javascript
// Using MongoDB shell or admin panel
db.users.updateOne(
  { phone: "+919800000001" },
  {
    $set: {
      kitchenId: ObjectId("your_kitchen_id_here"),
      role: "KITCHEN_STAFF"
    }
  }
)
```

### Option 2: Create New Kitchen Staff User

Use the backend admin panel or API to create a kitchen staff user:

```javascript
POST /api/admin/users
{
  "phone": "+919800000002",
  "name": "Kitchen Staff Test User",
  "role": "KITCHEN_STAFF",
  "kitchenId": "your_kitchen_id_here",
  "status": "ACTIVE"
}
```

### Option 3: Assign User via Backend Admin UI

If there's an admin UI:
1. Login as admin
2. Go to Users Management
3. Find the user (+919800000001)
4. Assign them to a kitchen
5. Save changes

---

## How Backend Validates Kitchen Access

According to the API documentation, the `kitchenAccessMiddleware`:

1. Extracts `kitchenId` from request parameters or user profile
2. Checks if user role is `KITCHEN_STAFF`
3. If yes, verifies `user.kitchenId` matches the requested kitchen
4. If no match, returns 403 Forbidden

### Required User Fields:
```json
{
  "_id": "user_id",
  "phone": "+919800000001",
  "role": "KITCHEN_STAFF",
  "kitchenId": "kitchen_id_here",  // ← REQUIRED!
  "status": "ACTIVE"
}
```

---

## Verification Steps

### 1. Check User Document

```javascript
// In MongoDB
db.users.findOne({ phone: "+919800000001" })

// Should return:
{
  "_id": ObjectId("..."),
  "phone": "+919800000001",
  "role": "KITCHEN_STAFF",
  "kitchenId": ObjectId("..."),  // ← Check if this exists
  ...
}
```

### 2. Check Kitchen Exists

```javascript
// Verify the kitchen exists
db.kitchens.findOne({ _id: ObjectId("kitchen_id") })
```

### 3. Test API Endpoint

```bash
# After assigning kitchen, test the endpoint
curl -X GET https://tiffsy-backend.onrender.com/api/kitchens/dashboard \
  -H "Authorization: Bearer <firebase_token>" \
  -H "Content-Type: application/json"

# Should return 200 with kitchen stats
```

---

## Expected Backend Behavior

### Without kitchenId (Current):
```
User login → Role = KITCHEN_STAFF
Call /api/kitchens/dashboard
Backend checks: user.kitchenId → undefined
Result: 403 Forbidden ❌
```

### With kitchenId (After Fix):
```
User login → Role = KITCHEN_STAFF, kitchenId = "123"
Call /api/kitchens/dashboard
Backend checks: user.kitchenId → "123"
Backend filters: Only return data for kitchen "123"
Result: 200 OK with kitchen data ✅
```

---

## Frontend Handling

The frontend is correctly:
- ✅ Authenticating user
- ✅ Storing KITCHEN_STAFF role
- ✅ Routing to Kitchen Dashboard
- ✅ Showing only 5 menu items
- ✅ Calling kitchen-specific endpoints

The issue is purely backend configuration - the user needs a kitchen assignment.

---

## Testing After Fix

Once the user has a `kitchenId`:

### Expected Console Logs:
```
📊 Fetching kitchen dashboard stats from: /api/kitchens/dashboard
📊 Dashboard stats response: {
  "success": true,
  "data": {
    "todayOrders": 15,
    "todayRevenue": 2500,
    "pendingOrders": 5,
    ...
  }
}
```

### Expected UI:
- Kitchen Dashboard loads successfully
- Shows kitchen-specific metrics
- Orders tab shows kitchen's orders
- Menu tab shows kitchen's menu items
- Batches tab shows kitchen's batches

---

## Database Query Examples

### Find All Kitchen Staff Without Assignment:
```javascript
db.users.find({
  role: "KITCHEN_STAFF",
  kitchenId: { $exists: false }
})
```

### Assign All Test Users to Default Kitchen:
```javascript
// First, get a kitchen ID
const kitchen = db.kitchens.findOne({ status: "ACTIVE" });

// Then assign users
db.users.updateMany(
  {
    role: "KITCHEN_STAFF",
    kitchenId: { $exists: false }
  },
  {
    $set: { kitchenId: kitchen._id }
  }
)
```

---

## API Endpoints Affected

These endpoints require kitchen assignment:

- `GET /api/kitchens/dashboard` - Kitchen dashboard stats
- `GET /api/orders/kitchen` - Kitchen orders
- `GET /api/delivery/kitchen-batches` - Kitchen batches
- `GET /api/kitchens/my-kitchen` - Kitchen profile
- `GET /api/menu/my-kitchen/stats` - Menu statistics
- `POST /api/menu` - Create menu item (for assigned kitchen)
- `PUT /api/menu/:id` - Update menu item (only for own kitchen)

All of these will fail with 403 if user has no `kitchenId`.

---

## Quick Fix Command

If you have MongoDB access:

```javascript
// Replace with actual IDs
db.users.updateOne(
  { phone: "+919800000001" },
  {
    $set: {
      kitchenId: ObjectId("6964fc42071ba5846960bd71"), // Use an actual kitchen ID
      role: "KITCHEN_STAFF"
    }
  }
)

// Verify
db.users.findOne(
  { phone: "+919800000001" },
  { phone: 1, role: 1, kitchenId: 1 }
)
```

---

## Summary

**Issue:** User has KITCHEN_STAFF role but no kitchen assignment

**Impact:** Cannot access any kitchen-specific data or features

**Solution:** Assign user to a kitchen in the database

**Priority:** HIGH - Blocking kitchen staff from using the app

**Owner:** Backend team / Database admin

---

**Status:** ⚠️ Waiting for backend to assign kitchenId to user
**Blocker:** Cannot proceed with testing until user has kitchen assignment
**Next Step:** Backend team to assign kitchen to user +919800000001
