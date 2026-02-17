# Kitchen App - Backend Integration Guide

> **Purpose:** This document covers all APIs the Kitchen App uses, including kitchen profile management, order management (accept/reject/status updates), delivery batching & dispatch, menu management, and kitchen dashboard/analytics. The backend was recently restructured — the ordering system was split into **2 services** (Direct Orders + Scheduling) and a new `orderSource` field was added. Kitchen-facing APIs themselves had **minimal changes**, but order objects now include new fields the kitchen app should be aware of.

---

## Table of Contents

1. [Impact Summary](#1-impact-summary)
2. [Authentication](#2-authentication)
3. [Kitchen Profile](#3-kitchen-profile)
4. [Order Management](#4-order-management)
5. [Delivery Batching & Dispatch](#5-delivery-batching--dispatch)
6. [Menu Management](#6-menu-management)
7. [Dashboard & Analytics](#7-dashboard--analytics)
8. [New `orderSource` Field](#8-new-ordersource-field)
9. [FCM Notifications](#9-fcm-notifications)
10. [Error Handling Reference](#10-error-handling-reference)

---

## 1. Impact Summary

### What Changed (from Ordering Refactoring)

| Area | Change | Kitchen Impact |
|------|--------|----------------|
| **Order schema** | New `orderSource` enum field (`DIRECT`, `SCHEDULED`, `AUTO_ORDER`) | Display badge on order cards |
| **Legacy flags** | `isAutoOrder` / `isScheduledMeal` auto-synced from `orderSource` | Can use either field |
| **New order status** | `SCHEDULED` status added to schema | Won't see these — they're promoted to `PLACED` before reaching kitchen |
| **Auto-order addon payments** | Some auto-orders have `paymentStatus: "PENDING"` | Cannot accept orders with pending payment |
| **Auto-accept orders** | Voucher-only meal orders auto-accept within operating hours | Kitchen gets `NEW_AUTO_ACCEPTED_ORDER` notification (skip accept, start prep) |

### What Did NOT Change

- Kitchen profile APIs (`/api/kitchens/*`)
- Order accept/reject/status workflow (`/api/orders/*`)
- Delivery batching & dispatch (`/api/delivery/my-kitchen/*`)
- Menu management APIs (`/api/menu/*`)
- Dashboard & analytics endpoints
- All kitchen FCM notification types

---

## 2. Authentication

All kitchen staff endpoints use:
1. `adminAuthMiddleware` — Validates Firebase auth token
2. `roleMiddleware(["KITCHEN_STAFF", "ADMIN"])` — Verifies user role is KITCHEN_STAFF or ADMIN

Send the Firebase token in the `Authorization` header:
```
Authorization: Bearer <firebase_id_token>
```

**Kitchen access control:** Kitchen staff can only access data for their own kitchen (enforced via `req.user.kitchenId`). Admins can access any kitchen.

---

## 3. Kitchen Profile

### 3.1 Get My Kitchen

`GET /api/kitchens/my-kitchen`

Returns the kitchen assigned to the authenticated staff member, with live order counts.

**Response:**
```json
{
  "success": true,
  "message": "My kitchen",
  "data": {
    "kitchen": {
      "_id": "...",
      "name": "Kitchen Alpha",
      "code": "KIT-A3B2C",
      "type": "TIFFSY",
      "status": "ACTIVE",
      "isAcceptingOrders": true,
      "logo": "https://...",
      "coverImage": "https://...",
      "description": "Authentic home-style meals",
      "cuisineTypes": ["North Indian", "South Indian"],
      "address": {
        "addressLine1": "123 Kitchen Street",
        "locality": "Sector 15",
        "city": "Delhi",
        "pincode": "110001",
        "coordinates": { "latitude": 28.6139, "longitude": 77.2090 }
      },
      "operatingHours": {
        "lunch": { "startTime": "10:00", "endTime": "14:00" },
        "dinner": { "startTime": "18:00", "endTime": "22:00" }
      },
      "zonesServed": [
        { "_id": "...", "name": "Zone 1", "code": "Z1", "city": "Delhi" }
      ],
      "contactPhone": "9876543210",
      "contactEmail": "kitchen@example.com",
      "averageRating": 4.5,
      "totalRatings": 120,
      "deliveryConfig": {
        "avgPrepTimeMinutes": 30,
        "maxDeliveryRadiusKm": 10,
        "maxBatchSize": 8,
        "dispatchBufferMinutes": 10
      }
    },
    "pendingOrders": 3,
    "todaysOrders": 25
  }
}
```

**Key fields:**
- `pendingOrders` — Orders with status `PLACED` or `CONFIRMED` awaiting action
- `todaysOrders` — Total orders created today
- `zonesServed` — Populated with zone name, code, and city

### 3.2 Update My Kitchen Details

`PUT /api/kitchens/my-kitchen`

Kitchen staff can update their kitchen's basic information.

**Request Body:**
```json
{
  "name": "Kitchen Alpha Updated",
  "description": "Best home-style meals in Delhi",
  "cuisineTypes": ["North Indian", "South Indian", "Chinese"],
  "operatingHours": {
    "lunch": { "startTime": "10:30", "endTime": "14:30" },
    "dinner": { "startTime": "18:00", "endTime": "22:00" }
  },
  "contactPhone": "9876543210",
  "contactEmail": "kitchen@example.com"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | String | No | 2-100 chars |
| `description` | String | No | Max 1000 chars, allows null/"" |
| `cuisineTypes` | String[] | No | Array of cuisine type strings (max 50 chars each) |
| `address` | Object | No | `addressLine1`, `addressLine2`, `locality`, `city`, `state`, `pincode`, `coordinates` |
| `operatingHours` | Object | No | `lunch`/`dinner`/`onDemand` with `startTime`/`endTime` (HH:mm format) |
| `contactPhone` | String | No | 10-15 digit phone number, allows null/"" |
| `contactEmail` | String | No | Valid email, allows null/"" |
| `logo` | String | No | Valid URL, allows null/"" |
| `coverImage` | String | No | Valid URL, allows null/"" |

> **Note:** Kitchen staff **cannot** update `type`, `authorizedFlag`, `premiumFlag`, `gourmetFlag`, `zonesServed`, or `status`. These are admin-only fields.

**Response:**
```json
{
  "success": true,
  "message": "Kitchen updated successfully",
  "data": {
    "kitchen": { "...full kitchen object with populated zonesServed..." }
  }
}
```

### 3.3 Update Kitchen Images

`PATCH /api/kitchens/my-kitchen/images`

**Request Body:**
```json
{
  "logo": "https://storage.example.com/kitchen-logo.jpg",
  "coverImage": "https://storage.example.com/kitchen-cover.jpg"
}
```

Both fields are optional — send only the one(s) you want to update.

**Response:**
```json
{
  "success": true,
  "message": "Kitchen images updated",
  "data": {
    "logo": "https://storage.example.com/kitchen-logo.jpg",
    "coverImage": "https://storage.example.com/kitchen-cover.jpg"
  }
}
```

### 3.4 Toggle Order Acceptance

`PATCH /api/kitchens/my-kitchen/accepting-orders`

Pause or resume accepting orders for the kitchen.

**Request Body:**
```json
{
  "isAcceptingOrders": false
}
```

| Field | Type | Required |
|-------|------|----------|
| `isAcceptingOrders` | Boolean | Yes |

**Response:**
```json
{
  "success": true,
  "message": "Order acceptance updated",
  "data": {
    "isAcceptingOrders": false
  }
}
```

> **Note:** The response contains only the updated `isAcceptingOrders` boolean, not the full kitchen object.

> When `isAcceptingOrders` is `false`, new orders for this kitchen will be rejected at placement time.

**Additional constraint:** Cannot enable order acceptance if kitchen status is not `ACTIVE` (returns `400` with "Cannot accept orders while kitchen is not active").

---

## 4. Order Management

### Order Lifecycle (Kitchen Perspective)

```
PLACED ──→ ACCEPTED ──→ PREPARING ──→ READY ──→ (picked up by driver)
  │
  ├──→ REJECTED (with reason, from PLACED only)
  │
  └──→ CANCELLED (from ACCEPTED/PREPARING, with reason)
```

**Auto-accepted orders** skip PLACED and arrive as:
```
ACCEPTED ──→ PREPARING ──→ READY ──→ (picked up by driver)
```

### 4.1 Get Kitchen Orders

`GET /api/orders/kitchen`

Lists orders assigned to the authenticated staff's kitchen.

**Query Parameters:**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `status` | String | (all) | Any order status: `PLACED`, `ACCEPTED`, `PREPARING`, `READY`, etc. |
| `mealWindow` | String | (all) | `LUNCH` or `DINNER` |
| `date` | Date | (all dates) | Filter by specific date. If omitted, returns orders across all dates |
| `page` | Number | 1 | Page number |
| `limit` | Number | 50 | Items per page (max 100) |

**Response:**
```json
{
  "success": true,
  "message": "Kitchen orders retrieved",
  "data": {
    "orders": [
      {
        "_id": "...",
        "orderNumber": "ORD-ABC123",
        "status": "PLACED",
        "orderSource": "DIRECT",
        "menuType": "MEAL_MENU",
        "mealWindow": "LUNCH",
        "items": [
          {
            "menuItemId": "...",
            "name": "Paneer Thali",
            "quantity": 1,
            "price": 120,
            "totalPrice": 120,
            "addons": []
          }
        ],
        "grandTotal": 165,
        "paymentStatus": "PAID",
        "userId": {
          "_id": "...",
          "name": "Customer Name",
          "phone": "+919876543210"
        },
        "deliveryAddress": { "..." },
        "placedAt": "2026-02-15T10:00:00.000Z"
      }
    ],
    "summary": {
      "pending": 3,
      "accepted": 2,
      "preparing": 4,
      "ready": 1
    },
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 10,
      "pages": 1
    }
  }
}
```

> **Note:** The `summary` counts respect the current query filters (status, mealWindow, date). Use them to show status badges on the order list tabs.

### 4.2 Accept Order

`PATCH /api/orders/:id/accept`

Accept a new order and begin preparation. Automatically transitions through ACCEPTED to `PREPARING`.

**Request Body:**
```json
{
  "estimatedPrepTime": 30
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `estimatedPrepTime` | Number | No | Minutes (5-120). Sets estimated preparation time |

**Response:**
```json
{
  "success": true,
  "message": "Order accepted",
  "data": {
    "order": { "...order with status PREPARING..." }
  }
}
```

**Side effects:**
- Status transitions: `PLACED` → `ACCEPTED` → `PREPARING` (both happen automatically)
- FCM `ORDER_ACCEPTED` notification sent to customer
- `estimatedPrepTime` stored on the order if provided

**Constraints:**
- Order must be in `PLACED` status
- Order must belong to your kitchen
- Cannot accept orders with `paymentStatus: "PENDING"` (returns `400`)

### 4.3 Reject Order

`PATCH /api/orders/:id/reject`

Reject an order before accepting it. Triggers refund and voucher restoration.

**Request Body:**
```json
{
  "reason": "Kitchen is too busy to prepare this order right now"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `reason` | String | Yes | 5-500 chars |

**Response:**
```json
{
  "success": true,
  "message": "Order rejected",
  "data": {
    "order": { "...order with status REJECTED..." },
    "refundInitiated": true,
    "vouchersRestored": 2
  }
}
```

**Side effects:**
- Status: `PLACED` → `REJECTED`
- Vouchers restored to customer's balance
- Coupon usage reversed
- Refund initiated if payment was made
- FCM `ORDER_REJECTED` notification sent to customer with rejection reason

**Constraints:**
- Order must be in `PLACED` status
- Order must belong to your kitchen

### 4.4 Cancel Order

`PATCH /api/orders/:id/cancel`

Cancel an already accepted/preparing order. Triggers refund and voucher restoration.

**Request Body:**
```json
{
  "reason": "Key ingredient unavailable, unable to prepare the order"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `reason` | String | Yes | 5-500 chars |

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled",
  "data": {
    "order": { "...order with status CANCELLED..." },
    "refundInitiated": true,
    "vouchersRestored": 2
  }
}
```

**Side effects:**
- Status: `ACCEPTED`/`PREPARING` → `CANCELLED`
- Vouchers restored, coupons reversed, refund initiated
- FCM `ORDER_CANCELLED` notification sent to customer

**Constraints:**
- Order must be in `ACCEPTED` or `PREPARING` status
- Order must belong to your kitchen

### 4.5 Update Order Status

`PATCH /api/orders/:id/status`

Progress an order through preparation stages.

**Request Body:**
```json
{
  "status": "READY",
  "notes": "All items packed and ready for pickup"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `status` | String | Yes | `PREPARING` or `READY` only |
| `notes` | String | No | Max 200 chars, allows null/"" |

**Valid Status Transitions (Kitchen Staff):**

```
ACCEPTED ──→ PREPARING
PREPARING ──→ READY
```

> Admin can bypass transition validation and set any status.

**Response:**
```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "order": { "...order with updated status..." }
  }
}
```

**Side effects:**
- FCM notification sent to customer for both `READY` and `PREPARING` status changes
- Status timeline entry added to order

---

## 5. Delivery Batching & Dispatch

Kitchen staff can create delivery batches from ready orders and dispatch them for driver pickup.

### 5.1 Auto-Batch Orders

`POST /api/delivery/my-kitchen/auto-batch`

Groups unbatched orders (ACCEPTED/PREPARING/READY) by zone + meal window into delivery batches.

**Request Body:**
```json
{
  "mealWindow": "LUNCH"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `mealWindow` | String | No | `LUNCH` or `DINNER`. If omitted, batches all meal windows |

**Response:**
```json
{
  "success": true,
  "message": "Auto-batching complete",
  "data": {
    "batchesCreated": 2,
    "batchesUpdated": 1,
    "ordersProcessed": 8,
    "batches": [
      {
        "batchId": "...",
        "batchNumber": "BATCH-20260215-Z1-A3B2C",
        "orderCount": 5,
        "zone": "zone_id",
        "mealWindow": "LUNCH"
      }
    ]
  }
}
```

> If route planning is enabled, batches are created with optimized delivery sequences and the response includes `"optimized": true`.

### 5.2 Dispatch Batches

`POST /api/delivery/my-kitchen/dispatch`

Dispatches all COLLECTING batches for a meal window, making them available for drivers to accept.

**Request Body:**
```json
{
  "mealWindow": "LUNCH",
  "forceDispatch": false
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `mealWindow` | String | Yes | `LUNCH` or `DINNER` |
| `forceDispatch` | Boolean | No | Default `false`. Set `true` to dispatch before cutoff time |

**Response:**
```json
{
  "success": true,
  "message": "Batches dispatched",
  "data": {
    "batchesDispatched": 2,
    "batches": [
      {
        "batchId": "...",
        "batchNumber": "BATCH-20260215-Z1-A3B2C",
        "status": "READY_FOR_DISPATCH",
        "orderCount": 5
      }
    ]
  }
}
```

**Side effects:**
- Batch status: `COLLECTING` → `READY_FOR_DISPATCH`
- FCM `BATCH_READY` notification sent to all active drivers

**Constraints:**
- Cannot dispatch before meal window cutoff time unless `forceDispatch: true`
- Returns `400` with message showing cutoff time and current time if dispatching too early
- Kitchen staff get a message suggesting to "contact admin for force dispatch"; admin can use `forceDispatch: true` directly

### 5.3 Get Kitchen Batches

`GET /api/delivery/kitchen-batches`

Lists delivery batches for the kitchen staff's kitchen.

**Query Parameters:**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `status` | String | (all) | Batch status filter |
| `mealWindow` | String | (all) | `LUNCH` or `DINNER` |
| `date` | Date | today | Filter by date |
| `page` | Number | 1 | Page number |
| `limit` | Number | 20 | Items per page (max 100) |

**Response:**
```json
{
  "success": true,
  "message": "Kitchen batches retrieved",
  "data": {
    "batches": [
      {
        "_id": "...",
        "batchNumber": "BATCH-20260215-Z1-A3B2C",
        "status": "IN_PROGRESS",
        "mealWindow": "LUNCH",
        "orderIds": ["...", "...", "..."],
        "orderCount": 5,
        "driverId": {
          "_id": "...",
          "name": "Ravi Kumar",
          "phone": "+919876543210"
        },
        "zoneId": {
          "_id": "...",
          "name": "Zone 1"
        },
        "totalDelivered": 3,
        "totalFailed": 0,
        "createdAt": "2026-02-15T10:00:00.000Z"
      }
    ],
    "summary": {
      "collecting": 1,
      "dispatched": 0,
      "inProgress": 2,
      "completed": 5
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "pages": 1
    }
  }
}
```

> The `summary` counts reflect the filtered date/meal window. `completed` includes both `COMPLETED` and `PARTIAL_COMPLETE` batches. `dispatched` counts `DISPATCHED` status only (not `READY_FOR_DISPATCH`).

---

## 6. Menu Management

Kitchen staff can manage their kitchen's menu items, toggle availability, and manage add-ons.

### 6.1 Create Menu Item

`POST /api/menu`

**Request Body:**
```json
{
  "name": "Paneer Butter Masala Thali",
  "description": "Rich paneer curry with naan, rice, dal, and salad",
  "menuType": "MEAL_MENU",
  "mealWindow": "LUNCH",
  "price": 120,
  "images": ["https://storage.example.com/paneer-thali.jpg"],
  "thumbnailImage": "https://storage.example.com/paneer-thali-thumb.jpg",
  "addonIds": ["addon_id_1", "addon_id_2"],
  "includes": ["2 Roti", "Rice", "Dal"],
  "isAvailable": true
}
```

> **Kitchen staff:** `kitchenId` is **auto-set** from `req.user.kitchenId` — do NOT include it in the request body. **Admin:** must provide `kitchenId` in the body.
>
> **MEAL_MENU constraint:** Each kitchen can have only one menu item per meal window (LUNCH/DINNER). Attempting to create a second returns `400` with the existing item name.

**Response:**
```json
{
  "success": true,
  "message": "Menu item created",
  "data": {
    "menuItem": { "...full menu item object..." }
  }
}
```

### 6.2 Update Menu Item

`PUT /api/menu/:id`

Updates an existing menu item. Most fields from create are accepted, all optional.

> **Cannot update after creation:** `menuType`, `mealWindow`, `category`, and `kitchenId`. Only the following fields are updatable: `name`, `description`, `price`, `discountedPrice`, `portionSize`, `preparationTime`, `dietaryType`, `isJainFriendly`, `spiceLevel`, `images`, `thumbnailImage`, `addonIds`, `includes`, `displayOrder`, `isFeatured`.

### 6.3 Toggle Item Availability

`PATCH /api/menu/:id/availability`

Quick toggle to mark items as available/unavailable (e.g., ingredient ran out).

**Request Body:**
```json
{
  "isAvailable": false
}
```

### 6.4 Update Add-ons

`PATCH /api/menu/:id/addons`

Replace the add-on list for a menu item. Add-ons must be pre-created via the Addon API — this endpoint accepts addon IDs, not inline objects.

**Request Body:**
```json
{
  "addonIds": ["addon_object_id_1", "addon_object_id_2"]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `addonIds` | String[] | Yes | Array of addon ObjectId strings (24-char hex). Must belong to the same kitchen and be active |

**Response:**
```json
{
  "success": true,
  "message": "Add-ons updated",
  "data": {
    "menuItem": { "...menu item with updated addonIds..." },
    "addons": [ { "...addon details..." } ]
  }
}
```

### 6.5 Delete Menu Item

`DELETE /api/menu/:id`

Soft-deletes a menu item (sets status to `INACTIVE`).

### 6.6 Get Kitchen Menu Stats

`GET /api/menu/my-kitchen/stats`

Returns menu statistics for the kitchen staff's kitchen.

**Response:**
```json
{
  "success": true,
  "message": "Menu statistics retrieved",
  "data": {
    "totalItems": 15,
    "activeItems": 12,
    "availableItems": 10,
    "inactiveItems": 3,
    "byCategory": { "MAIN_COURSE": 8, "SIDE": 4, "BEVERAGE": 3 },
    "byMenuType": { "MEAL_MENU": 6, "ON_DEMAND_MENU": 9 },
    "mealMenuStatus": {
      "lunch": { "exists": true, "item": { "...item details..." }, "isAvailable": true },
      "dinner": { "exists": false }
    }
  }
}
```

> `mealMenuStatus` shows whether LUNCH/DINNER meal window slots are filled and whether the item is available (active + isAvailable).

### 6.7 Send Menu Announcement

`POST /api/menu/my-kitchen/announcement`

Send a notification to all active subscribers about menu changes.

**Request Body:**
```json
{
  "title": "New Dish Alert!",
  "message": "Try our new Paneer Butter Masala Thali - available for lunch today!"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | String | Yes | Max 100 chars |
| `message` | String | Yes | Max 500 chars |
| `kitchenId` | String | No | Required for admin. Auto-set for kitchen staff |

---

## 7. Dashboard & Analytics

### 7.1 Kitchen Dashboard

`GET /api/kitchens/dashboard`

Aggregated real-time stats for the current day. Kitchen staff automatically get their own kitchen's data.

**Query Parameters:**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `date` | Date | today | View dashboard for a specific date |
| `kitchenId` | String | (auto) | Only used by admin. Kitchen staff uses own kitchen |

**Response:**
```json
{
  "success": true,
  "message": "Kitchen dashboard data retrieved",
  "data": {
    "kitchen": {
      "_id": "...",
      "name": "Kitchen Alpha",
      "code": "KIT-A3B2C",
      "type": "TIFFSY",
      "status": "ACTIVE",
      "logo": "https://...",
      "coverImage": "https://...",
      "isAcceptingOrders": true,
      "operatingHours": { "..." },
      "zonesServed": [{ "..." }]
    },
    "todayStats": {
      "ordersCount": 45,
      "ordersRevenue": 6750.50,
      "pendingOrders": 3,
      "acceptedOrders": 2,
      "preparingOrders": 5,
      "readyOrders": 1,
      "completedOrders": 30,
      "cancelledOrders": 4,
      "lunchOrders": 28,
      "lunchRevenue": 4200.00,
      "dinnerOrders": 17,
      "dinnerRevenue": 2550.50
    },
    "batchStats": {
      "collectingBatches": 1,
      "readyBatches": 0,
      "dispatchedBatches": 2,
      "inProgressBatches": 1,
      "completedBatches": 5
    },
    "menuStats": {
      "totalMenuItems": 15,
      "activeMenuItems": 12,
      "unavailableItems": 3
    },
    "recentActivity": [
      {
        "orderNumber": "ORD-ABC123",
        "status": "DELIVERED",
        "placedAt": "2026-02-15T12:30:00.000Z",
        "grandTotal": 165,
        "mealWindow": "LUNCH",
        "menuType": "MEAL_MENU"
      }
    ]
  }
}
```

**Key fields:**
- `todayStats.cancelledOrders` — Sum of CANCELLED + REJECTED orders
- `batchStats.completedBatches` — Sum of COMPLETED + PARTIAL_COMPLETE batches
- `batchStats.readyBatches` — Count of `READY_FOR_DISPATCH` batches
- `recentActivity` — Last 10 orders for the day (fields: `orderNumber`, `status`, `placedAt`, `grandTotal`, `mealWindow`, `menuType`)

### 7.2 Kitchen Analytics

`GET /api/kitchens/analytics`

Historical performance analytics with configurable date range and grouping.

**Query Parameters:**

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `dateFrom` | Date | 7 days ago | Start of date range |
| `dateTo` | Date | today | End of date range |
| `groupBy` | String | `day` | `day`, `week`, or `month` |
| `kitchenId` | String | (auto) | Only for admin |

**Constraints:**
- Maximum date range is 90 days

**Response:**
```json
{
  "success": true,
  "message": "Kitchen analytics retrieved",
  "data": {
    "period": {
      "from": "2026-02-08",
      "to": "2026-02-15",
      "groupBy": "day"
    },
    "summary": {
      "totalOrders": 315,
      "totalRevenue": 47250.00,
      "averageOrderValue": 150.00,
      "completionRate": 92.1,
      "cancelRate": 5.7
    },
    "timeline": [
      {
        "period": "2026-02-08",
        "orders": 42,
        "revenue": 6300.00,
        "completed": 39,
        "cancelled": 2
      }
    ],
    "topItems": [
      {
        "_id": "menu_item_id",
        "name": "Paneer Thali",
        "ordersCount": 85,
        "revenue": 10200.00
      }
    ]
  }
}
```

**Key fields:**
- `summary.completionRate` — `(completed / totalOrders) * 100`, rounded to 1 decimal
- `summary.cancelRate` — `(cancelled / totalOrders) * 100`, rounded to 1 decimal
- `topItems` — Top 10 menu items by order count (only from DELIVERED orders)
- `timeline` — Grouped by the specified `groupBy` parameter

---

## 8. New `orderSource` Field

### What Changed

Orders now have an `orderSource` field indicating how they were created:

```
orderSource: "DIRECT" | "SCHEDULED" | "AUTO_ORDER"
```

- `DIRECT` — Customer placed order manually for same-day delivery
- `SCHEDULED` — Customer scheduled order for a future date (promoted to PLACED before reaching kitchen)
- `AUTO_ORDER` — System created order from auto-ordering subscription

### Legacy Compatibility

| `orderSource` | `isAutoOrder` | `isScheduledMeal` |
|---------------|--------------|-------------------|
| `DIRECT` | `false` | `false` |
| `SCHEDULED` | `false` | `true` |
| `AUTO_ORDER` | `true` | `false` |

Both fields are present in all API responses. **Prefer `orderSource`** going forward.

### Display Recommendations

| `orderSource` | Badge | Color |
|---------------|-------|-------|
| `DIRECT` | "Direct" | Default/Gray |
| `SCHEDULED` | "Scheduled" | Blue |
| `AUTO_ORDER` | "Auto" | Purple |

### Auto-Accept Flow

When a voucher-only meal order is placed within operating hours, the system auto-accepts it:
1. Order created with status `PLACED`
2. System auto-accepts → `ACCEPTED` → `PREPARING`
3. Kitchen receives `NEW_AUTO_ACCEPTED_ORDER` notification
4. Kitchen staff should **start preparation immediately** (no need to manually accept)

> Regular orders receive `NEW_MANUAL_ORDER` notification and require manual acceptance via the `PATCH /:id/accept` endpoint.

---

## 9. FCM Notifications

### Notifications the Kitchen Receives

| Type | Title | When |
|------|-------|------|
| `NEW_MANUAL_ORDER` | "New Order Received!" | New order placed that requires manual acceptance |
| `NEW_AUTO_ORDER` | "New Auto Order" | Auto-order created by system subscription |
| `NEW_AUTO_ACCEPTED_ORDER` | "Auto-Accepted Order #ORD-XXX" | Voucher order auto-accepted — start prep immediately |
| `BATCH_DISPATCHED` | "Batch Dispatched" | Batch dispatched for delivery with order count |

### FCM Data Payload

Notifications include a `data` object for deep linking:

```json
{
  "data": {
    "orderId": "order_object_id",
    "orderNumber": "ORD-ABC123",
    "mealWindow": "LUNCH",
    "kitchenId": "kitchen_object_id"
  }
}
```

> All values in the `data` payload are strings (Firebase requirement).

---

## 10. Error Handling Reference

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description here",
  "data": null
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (new kitchen, menu item) |
| 400 | Validation error / Bad request / Invalid state transition |
| 401 | Unauthorized (invalid/missing Firebase token) |
| 403 | Forbidden (wrong role, order not from your kitchen, not associated with kitchen) |
| 404 | Resource not found |
| 500 | Server error |

### Common Kitchen-Specific Errors

| Error | Status | When |
|-------|--------|------|
| "Not associated with a kitchen" | 403 | Staff user has no `kitchenId` assigned |
| "No kitchen assigned to your account" | 404 | Staff user has no kitchen |
| "Order does not belong to your kitchen" | 403 | Trying to act on another kitchen's order |
| "Can only accept orders with PLACED status" | 400 | Accepting non-PLACED order |
| "Cannot accept order with pending payment. Payment status: PENDING" | 400 | Accepting order with `paymentStatus: "PENDING"` |
| "Can only reject orders with PLACED status" | 400 | Rejecting non-PLACED order |
| "Can only cancel orders that are ACCEPTED or PREPARING" | 400 | Cancelling order in wrong status |
| "Cannot transition from X to Y" | 400 | Invalid order status transition |
| "Cannot dispatch LUNCH batches yet..." | 400 | Dispatching before meal window cutoff |
| "No orders to batch" | 200 | Auto-batching with no unbatched orders (success with 0 results) |
| "Cannot accept orders while kitchen is not active" | 400 | Enabling order acceptance when kitchen status is not ACTIVE |
| "Kitchen not found" | 404 | Kitchen ID doesn't exist |
| "Access denied to this kitchen" | 403 | Accessing another kitchen's dashboard/analytics |
| "Access denied to this menu item" | 403 | Kitchen staff accessing another kitchen's menu item |
| "Invalid or inactive addon IDs: ..." | 400 | Addon IDs don't belong to kitchen or are inactive |
| "Kitchen already has a LUNCH menu item: ..." | 400 | Creating duplicate MEAL_MENU item for same meal window |
| "Maximum date range is 90 days" | 400 | Analytics date range exceeds limit |

---

## Quick Reference: All Kitchen Staff Routes

### `/api/kitchens/` (Kitchen Module)

```
GET    /my-kitchen                            Get my kitchen + order counts
PUT    /my-kitchen                            Update kitchen details
PATCH  /my-kitchen/images                     Update logo and cover image
PATCH  /my-kitchen/accepting-orders           Toggle order acceptance
GET    /dashboard                             Get dashboard stats (today)
GET    /analytics                             Get historical analytics
```

### `/api/orders/` (Order Module)

```
GET    /kitchen                               List orders for my kitchen
PATCH  /:id/accept                            Accept order (→ PREPARING)
PATCH  /:id/reject                            Reject order (with reason)
PATCH  /:id/cancel                            Cancel accepted/preparing order
PATCH  /:id/status                            Update status (PREPARING/READY)
```

### `/api/delivery/` (Delivery Module)

```
POST   /my-kitchen/auto-batch                 Create delivery batches from orders
POST   /my-kitchen/dispatch                   Dispatch batches for driver pickup
GET    /kitchen-batches                        List batches for my kitchen
```

### `/api/menu/` (Menu Module)

```
POST   /                                      Create menu item
PUT    /:id                                   Update menu item
PATCH  /:id/availability                      Toggle item availability
PATCH  /:id/addons                            Update item add-ons
DELETE /:id                                   Delete menu item (soft delete)
GET    /my-kitchen/stats                       Get menu statistics
POST   /my-kitchen/announcement                Send menu announcement
```
