# Backend Fix Guide - Dashboard 500 Error

## Current Error

```
Error: Cannot populate path 'performedBy' because it is not in your schema
Set the strictPopulate option to false to override
```

**Location:** `/api/admin/dashboard` endpoint
**Status Code:** 500

## Root Cause

Your backend code is trying to populate a `performedBy` field that doesn't exist in your MongoDB schema.

## Quick Fix (5 minutes)

### Step 1: Find the Dashboard Endpoint

Look for this file in your backend:
```
backend/
├── routes/
│   └── admin.routes.js (or dashboard.routes.js)
├── controllers/
│   └── admin.controller.js (or dashboard.controller.js)
```

### Step 2: Find the Problematic Code

Search for:
```javascript
.populate('performedBy')
```

You'll likely find something like:
```javascript
// In your dashboard controller/route
const recentActivity = await AuditLog.find()
  .populate('performedBy', 'name role')  // ← This line is causing the error
  .sort({ createdAt: -1 })
  .limit(10);
```

### Step 3: Apply the Fix

**Option A: Remove populate (Simplest)**
```javascript
const recentActivity = await AuditLog.find()
  // .populate('performedBy', 'name role')  // ← Comment out or remove
  .sort({ createdAt: -1 })
  .limit(10);
```

**Option B: Make populate optional**
```javascript
const recentActivity = await AuditLog.find()
  .populate({
    path: 'performedBy',
    strictPopulate: false  // ← Add this
  })
  .sort({ createdAt: -1 })
  .limit(10);
```

### Step 4: Test

```bash
# Restart your backend server
npm start

# Test the endpoint
curl -X GET \
  'https://tiffsy-backend.onrender.com/api/admin/dashboard' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json'
```

**Expected:** Status 200 with dashboard data

## Long-Term Solution (Optional)

If you want to track who performed each action:

### 1. Update AuditLog Schema

```javascript
// models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    required: true
  },
  entityId: {
    type: String,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Make it optional for backwards compatibility
  },
  details: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
```

### 2. Populate with Error Handling

```javascript
const recentActivity = await AuditLog.find()
  .populate({
    path: 'performedBy',
    select: 'name role email',
    strictPopulate: false
  })
  .sort({ createdAt: -1 })
  .limit(10)
  .lean();

// Filter out activities without valid performedBy if needed
const validActivities = recentActivity.map(activity => ({
  _id: activity._id,
  action: activity.action,
  entityType: activity.entityType,
  performedBy: activity.performedBy ? {
    name: activity.performedBy.name,
    role: activity.performedBy.role
  } : undefined,
  createdAt: activity.createdAt
}));
```

### 3. Update Audit Log Creation

When creating new audit logs, include performedBy:

```javascript
// When an action is performed
const auditLog = await AuditLog.create({
  action: 'CREATE',
  entityType: 'ORDER',
  entityId: orderId,
  performedBy: req.user._id,  // From authenticated user
  details: { /* additional info */ },
  createdAt: new Date()
});
```

## Common Backend File Locations

Search in these files for `.populate('performedBy')`:

```bash
# From your backend directory
grep -r "populate.*performedBy" .

# Common locations:
# - routes/admin.routes.js
# - controllers/admin.controller.js
# - controllers/dashboard.controller.js
# - services/dashboard.service.js
```

## Verification Checklist

After applying the fix:

- [ ] Backend starts without errors
- [ ] `/api/admin/dashboard` returns 200 status
- [ ] Response includes `recentActivity` array
- [ ] Frontend dashboard loads without errors
- [ ] Recent activity section displays correctly

## Example Working Response

After the fix, your backend should return:

```json
{
  "message": true,
  "error": {
    "overview": {
      "totalOrders": 150,
      "totalRevenue": 45000,
      "activeCustomers": 75,
      "activeKitchens": 5
    },
    "today": {
      "orders": 12,
      "revenue": 3600,
      "newCustomers": 3
    },
    "pendingActions": {
      "pendingOrders": 2,
      "pendingRefunds": 0,
      "pendingKitchenApprovals": 1
    },
    "recentActivity": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "action": "CREATE",
        "entityType": "ORDER",
        "createdAt": "2025-01-10T10:30:00.000Z"
      }
    ]
  }
}
```

**Note:** The frontend will work with or without the `performedBy` field, so you don't need to worry about including it immediately.

## Need Help?

If you can't find the file or the error persists:

1. Check your backend logs for the full stack trace
2. Look for any `.populate()` calls in your dashboard-related code
3. Ensure your AuditLog model is properly defined
4. Verify the endpoint is using the correct model

The quickest solution is **Option A** - just remove the populate call entirely. The frontend is ready to handle it!
