# Dashboard API Response Format

## What We're Getting from Backend

Based on your error logs, the backend at `/api/admin/dashboard` is currently returning:

```json
{
  "message": false,
  "data": "Failed to retrieve dashboard",
  "error": null
}
```

**Status Code:** 500 (Internal Server Error)

This indicates the backend is encountering an error when trying to retrieve dashboard data.

## What the Frontend Expects

The frontend is designed to handle **3 different response formats**:

### Format 1: Backend Success Format (with "error" field containing data)
```json
{
  "message": true,
  "error": {
    "overview": {
      "totalOrders": 1250,
      "totalRevenue": 125000,
      "activeCustomers": 450,
      "activeKitchens": 8
    },
    "today": {
      "orders": 45,
      "revenue": 4500,
      "newCustomers": 5
    },
    "pendingActions": {
      "pendingOrders": 3,
      "pendingRefunds": 1,
      "pendingKitchenApprovals": 2
    },
    "recentActivity": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "action": "CREATE",
        "entityType": "ORDER",
        "createdAt": "2025-01-10T10:30:00.000Z"
      }
    ]
  },
  "data": null
}
```

**How it's parsed:** Frontend extracts data from the `error` field.

### Format 2: Standard Success Format
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "overview": {
      "totalOrders": 1250,
      "totalRevenue": 125000,
      "activeCustomers": 450,
      "activeKitchens": 8
    },
    "today": {
      "orders": 45,
      "revenue": 4500,
      "newCustomers": 5
    },
    "pendingActions": {
      "pendingOrders": 3,
      "pendingRefunds": 1,
      "pendingKitchenApprovals": 2
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

**How it's parsed:** Frontend extracts data from the `data` field.

### Format 3: Error Format (Current Issue)
```json
{
  "message": false,  // or a string error message
  "data": "Failed to retrieve dashboard",  // error message as string
  "error": null
}
```

**How it's parsed:** Frontend treats this as an error and displays the error message to the user.

## Required Data Structure

When the backend successfully returns data, it must include these fields:

### `overview` (required)
```typescript
{
  totalOrders: number;      // Total orders count
  totalRevenue: number;     // Total revenue in currency units
  activeCustomers: number;  // Number of active customers
  activeKitchens: number;   // Number of active kitchens
}
```

### `today` (required)
```typescript
{
  orders: number;           // Today's order count
  revenue: number;          // Today's revenue
  newCustomers: number;     // New customers today
}
```

### `pendingActions` (required)
```typescript
{
  pendingOrders: number;              // Orders awaiting action
  pendingRefunds: number;             // Refunds awaiting approval
  pendingKitchenApprovals: number;    // Kitchens awaiting approval
}
```

### `recentActivity` (optional, can be empty array)
```typescript
[
  {
    _id: string;
    action: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT";
    entityType: "USER" | "ORDER" | "KITCHEN" | "REFUND" | "ZONE";
    createdAt: string;  // ISO date string
  }
]
```

**Note:** The `performedBy` field has been removed as it's not supported by the backend.

## What Needs to be Fixed on Backend

Your backend `/api/admin/dashboard` endpoint is currently failing with a 500 error. You need to:

1. **Check backend logs** to see what's causing the error
2. **Fix the database query** or aggregation that's failing
3. **Ensure proper data structure** matches one of the formats above
4. **Return 200 status** with the proper success format

Common issues:
- Database connection problems
- Missing collections or documents
- Incorrect aggregation pipelines
- Auth/permission issues
- Missing or null values in data

## Testing

After fixing the backend, test with:

```bash
curl -X GET \
  'https://tiffsy-backend.onrender.com/api/admin/dashboard' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json'
```

The response should be 200 OK with data in one of the success formats above.
