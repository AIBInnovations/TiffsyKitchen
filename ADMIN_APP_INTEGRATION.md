# Admin App - Backend Integration Guide

> **Purpose:** This document covers all changes the Admin App needs to integrate after the ordering system refactoring. The backend was restructured into **2 ordering services** (Direct Orders + Scheduling), with auto-order cron triggers and logs moved to a dedicated cron module.

---

## Table of Contents

1. [Impact Summary](#1-impact-summary)
2. [Route Migration Map](#2-route-migration-map)
3. [System Configuration](#3-system-configuration)
4. [Order Management](#4-order-management)
5. [Subscription & Plan Management](#5-subscription--plan-management)
6. [Cron Job Management](#6-cron-job-management)
7. [Auto-Order Monitoring](#7-auto-order-monitoring)
8. [Dashboard & Reports](#8-dashboard--reports)
9. [User & Approval Management](#9-user--approval-management)
10. [Push Notifications](#10-push-notifications)
11. [Audit Logs](#11-audit-logs)
12. [New `orderSource` Field](#12-new-ordersource-field)
13. [Error Handling Reference](#13-error-handling-reference)

---

## 1. Impact Summary

### What Changed

| Area | Change | Impact |
|------|--------|--------|
| **Order schema** | New `orderSource` enum field (`DIRECT`, `SCHEDULED`, `AUTO_ORDER`) | Order list/detail screens need to display this |
| **Auto-order cron triggers** | Moved from `/api/subscriptions/*` to `/api/admin/cron/*` | Update all cron trigger API calls |
| **Auto-order logs** | Moved from `/api/subscriptions/*` to `/api/admin/cron/*` | Update log viewer API calls |
| **Auto-order settings** | Moved from `/api/subscriptions/*` to `/api/scheduling/*` | No admin impact (customer-facing only) |
| **Skip/Pause/Resume** | Moved from `/api/subscriptions/*` to `/api/scheduling/*` | No admin impact (customer-facing only) |
| **New cron endpoint** | `POST /api/admin/cron/auto-cancel-unpaid` | New button/trigger needed |
| **New cron endpoint** | `POST /api/admin/cron/promote-scheduled-meals` | New button/trigger needed |
| **System config** | New `autoOrder.addonPaymentWindowMinutes` key | Config editor needs this field |
| **Subscription controller** | Slimmed down - only plan CRUD + subscriptions remain | No API changes for existing admin flows |

### What Did NOT Change

- Dashboard API (`GET /api/admin/dashboard`)
- System config API (`GET/PUT /api/admin/config`)
- User management APIs (`/api/admin/users/*`)
- Driver/Kitchen approval APIs (`/api/admin/drivers/*`, `/api/admin/kitchens/*`)
- Order admin APIs (`/api/orders/admin/*`)
- Subscription plan CRUD (`/api/subscriptions/plans/*`)
- Admin subscription management (`/api/subscriptions/admin/*`)
- Reports & Audit logs (`/api/admin/reports/*`, `/api/admin/audit-logs/*`)
- Push notifications (`POST /api/admin/push-notification`)
- Guidelines (`/api/admin/guidelines`)

---

## 2. Route Migration Map

### Moved Routes (BREAKING)

| Old Route | New Route | Notes |
|-----------|-----------|-------|
| `POST /api/subscriptions/trigger-auto-orders` | `POST /api/admin/cron/auto-orders` | Body: `{ mealWindow, dryRun }` |
| `POST /api/subscriptions/cron/lunch` | `POST /api/admin/cron/auto-orders/lunch` | Body: `{ dryRun }` |
| `POST /api/subscriptions/cron/dinner` | `POST /api/admin/cron/auto-orders/dinner` | Body: `{ dryRun }` |
| `GET /api/subscriptions/auto-order-logs` | `GET /api/admin/cron/auto-order-logs` | Same query params |
| `GET /api/subscriptions/auto-order-logs/summary` | `GET /api/admin/cron/auto-order-logs/summary` | Same query params |

### New Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/cron/promote-scheduled-meals` | POST | Promote SCHEDULED orders to PLACED |
| `/api/admin/cron/auto-cancel-unpaid` | POST | Cancel unpaid auto-order addon orders |
| `/api/admin/cron/status` | GET | Get cron job status overview |
| `/api/admin/cron/history` | GET | Get cron execution history |
| `/api/admin/cron/voucher-expiry` | POST | Manually trigger voucher expiry |

### Removed from Subscription Routes

These endpoints no longer exist on `/api/subscriptions/*`:
- `PUT /api/subscriptions/:id/auto-order-settings` (moved to `/api/scheduling/auto-order/settings`)
- `POST /api/subscriptions/:id/pause` (moved to `/api/scheduling/auto-order/pause`)
- `POST /api/subscriptions/:id/resume` (moved to `/api/scheduling/auto-order/resume`)
- `POST /api/subscriptions/:id/skip-meal` (moved to `/api/scheduling/auto-order/skip-meal`)
- `POST /api/subscriptions/:id/unskip-meal` (moved to `/api/scheduling/auto-order/unskip-meal`)

> **Note:** These are customer-facing endpoints and should not affect the admin app unless you had admin screens that called them directly.

---

## 3. System Configuration

### `GET /api/admin/config`

**Auth:** `adminAuthMiddleware` + `adminMiddleware`

**Response:**
```json
{
  "success": true,
  "message": "System configuration",
  "data": {
    "config": {
      "cutoffTimes": {
        "LUNCH": "11:00",
        "DINNER": "21:00"
      },
      "cancellation": {
        "nonVoucherWindowMinutes": 10,
        "allowAfterAccepted": false
      },
      "fees": {
        "deliveryFee": 30,
        "serviceFee": 5,
        "packagingFee": 10,
        "handlingFee": 0,
        "taxRate": 0.05
      },
      "autoOrder": {
        "lunchCronTime": "10:00",
        "dinnerCronTime": "19:00",
        "enabled": true,
        "autoAcceptOrders": true,
        "addonPaymentWindowMinutes": 30
      },
      "scheduledMeals": {
        "enabled": true,
        "maxScheduledMeals": 14,
        "maxScheduleDaysAhead": 7
      },
      "routePlanning": {
        "enabled": false,
        "useOsrm": false,
        "osrmServerUrl": "",
        "clusteringEpsilonMeters": 500,
        "maxOrdersPerBatch": 15,
        "optimizationAlgorithm": "auto",
        "etaRecalcIntervalSeconds": 60,
        "haversineRoadFactor": 1.4,
        "osrmTimeoutMs": 5000,
        "cacheExpiryMinutes": 30
      },
      "driverAssignment": {
        "enabled": false,
        "mode": "SELF_ACCEPT",
        "broadcastDriverCount": 3,
        "broadcastTimeoutSeconds": 60,
        "scoringWeights": {
          "proximity": 40,
          "completionRate": 25,
          "activeLoad": 25,
          "recency": 10
        },
        "maxDriverSearchRadiusMeters": 10000,
        "autoReassignOnTimeout": true,
        "manualAssignmentEnabled": true
      },
      "batching": {
        "maxBatchSize": 15,
        "failedOrderPolicy": "NO_RETURN",
        "autoDispatchDelay": 0
      },
      "taxes": [
        { "name": "GST", "rate": 5, "enabled": true }
      ],
      "refund": {
        "maxRetries": 3,
        "autoProcessDelay": 0
      },
      "branding": {
        "tiffsyLabel": "By Tiffsy",
        "badges": ["POPULAR", "BESTSELLER", "NEW"]
      }
    }
  }
}
```

### `PUT /api/admin/config`

**Auth:** `adminAuthMiddleware` + `adminMiddleware`

Send only the sections you want to update. Each section is merged with existing values.

**New field to add to config editor:**

```json
{
  "autoOrder": {
    "addonPaymentWindowMinutes": 30
  }
}
```

This controls how long auto-order customers have to pay for addon charges before the order is auto-cancelled. Default: 30 minutes.

**Full updatable sections:**

| Section | Key Fields |
|---------|-----------|
| `cutoffTimes` | `LUNCH` (HH:mm), `DINNER` (HH:mm) |
| `cancellation` | `nonVoucherWindowMinutes`, `allowAfterAccepted`, `feeTiers` |
| `fees` | `deliveryFee`, `serviceFee`, `packagingFee`, `handlingFee`, `taxRate` (decimal 0-1) |
| `autoOrder` | `lunchCronTime`, `dinnerCronTime`, `enabled`, `autoAcceptOrders`, `addonPaymentWindowMinutes` |
| `scheduledMeals` | `enabled`, `maxScheduledMeals`, `maxScheduleDaysAhead` |
| `routePlanning` | `enabled`, `useOsrm`, `osrmServerUrl`, `clusteringEpsilonMeters`, etc. |
| `driverAssignment` | `enabled`, `mode`, `broadcastDriverCount`, `scoringWeights`, etc. |
| `batching` | `maxBatchSize`, `failedOrderPolicy`, `autoDispatchDelay` |
| `taxes` | Array of `{ name, rate, enabled }` |
| `refund` | `maxRetries`, `autoProcessDelay` |

---

## 4. Order Management

### 4.1 Get All Orders (Admin)

`GET /api/orders/admin/all`

**Auth:** `adminAuthMiddleware` + `adminMiddleware`

**Query Params:**

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `userId` | ObjectId | No | Filter by customer |
| `kitchenId` | ObjectId | No | Filter by kitchen |
| `zoneId` | ObjectId | No | Filter by zone |
| `status` | String | No | One of: `PLACED`, `ACCEPTED`, `REJECTED`, `PREPARING`, `READY`, `PICKED_UP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `FAILED` |
| `menuType` | String | No | `MEAL_MENU` or `ON_DEMAND_MENU` |
| `dateFrom` | Date | No | Filter by placedAt >= |
| `dateTo` | Date | No | Filter by placedAt <= |
| `page` | Number | No | Default: 1 |
| `limit` | Number | No | Default: 20, max: 100 |

> **Note:** There is currently no `orderSource` query filter. To filter by order type (DIRECT/SCHEDULED/AUTO_ORDER), you would need to filter client-side from the results. The `orderSource` field IS present on each order object in the response.

> **Note:** The `SCHEDULED` status exists in the Order schema but is NOT included in the order validation `ORDER_STATUSES` array. This means: (1) You cannot filter admin orders by `status=SCHEDULED` via the API, and (2) Admin cannot set an order to `SCHEDULED` status via the admin update status endpoint. `SCHEDULED` orders are created internally by the scheduling module and promoted to `PLACED` by the cron job. They are visible in the admin order list but only filterable client-side.

**Response:**
```json
{
  "success": true,
  "message": "All orders retrieved",
  "data": {
    "orders": [
      {
        "_id": "...",
        "orderNumber": "ORD-ABC123",
        "orderSource": "AUTO_ORDER",
        "status": "PLACED",
        "menuType": "MEAL_MENU",
        "mealWindow": "LUNCH",
        "items": [...],
        "subtotal": 120,
        "grandTotal": 165,
        "paymentStatus": "PAID",
        "paymentMethod": "VOUCHER_ONLY",
        "voucherUsage": {
          "voucherCount": 1,
          "voucherIds": ["..."],
          "voucherCoverage": 80
        },
        "charges": {
          "deliveryFee": 30,
          "serviceFee": 5,
          "packagingFee": 10,
          "taxAmount": 6
        },
        "isAutoOrder": true,
        "isScheduledMeal": false,
        "placedAt": "2026-02-14T10:00:00.000Z",
        "userId": { "_id": "...", "name": "John", "phone": "+919..." },
        "kitchenId": { "_id": "...", "name": "Kitchen A", "code": "KA01" },
        "zoneId": { "_id": "...", "name": "Zone 1" },
        "user": {
          "_id": "...",
          "name": "John",
          "phone": "+919...",
          "zone": "Zone 1",
          "totalOrders": 45,
          "ordersPlaced": 2
        },
        "kitchen": {
          "_id": "...",
          "name": "Kitchen A",
          "code": "KA01"
        },
        "zone": {
          "_id": "...",
          "name": "Zone 1"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

**Key fields to display:**
- `orderSource` - Shows whether order is `DIRECT`, `SCHEDULED`, or `AUTO_ORDER`
- `isAutoOrder` / `isScheduledMeal` - Legacy boolean flags (auto-synced from `orderSource`)
- `user.totalOrders` / `user.ordersPlaced` - Enriched user stats per order
- `voucherUsage.voucherCount` - Number of vouchers used
- `paymentStatus` - `PAID`, `PENDING`, `REFUNDED`, `FAILED`

### 4.2 Get Order Statistics (Admin)

`GET /api/orders/admin/stats`

**Auth:** `adminAuthMiddleware` + `adminMiddleware`

**Query Params:**

| Param | Type | Required |
|-------|------|----------|
| `dateFrom` | Date | No |
| `dateTo` | Date | No |
| `kitchenId` | ObjectId | No |
| `zoneId` | ObjectId | No |

**Response:**
```json
{
  "success": true,
  "message": "Order statistics",
  "data": {
    "totalOrders": 1500,
    "totalRevenue": 225000.50,
    "totalVouchersUsed": 890,
    "avgOrderValue": 150.00,
    "byStatus": {
      "PLACED": 25,
      "ACCEPTED": 10,
      "PREPARING": 5,
      "DELIVERED": 1400,
      "CANCELLED": 60
    },
    "byMenuType": {
      "MEAL_MENU": 1200,
      "ON_DEMAND_MENU": 300
    }
  }
}
```

### 4.3 Admin Update Order Status

`PATCH /api/orders/admin/:id/status`

**Auth:** `adminAuthMiddleware` + `adminMiddleware`

Admin can set ANY valid order status (unrestricted).

**Request Body:**
```json
{
  "status": "PREPARING",
  "notes": "Force-updated by admin",
  "reason": "Customer requested re-processing"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `status` | String | Yes | Any of: `PLACED`, `ACCEPTED`, `REJECTED`, `PREPARING`, `READY`, `PICKED_UP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `FAILED` |
| `notes` | String | No | Max 500 chars |
| `reason` | String | No | Max 500 chars |

**Response:**
```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "order": { "...full order object..." },
    "previousStatus": "PLACED",
    "newStatus": "PREPARING"
  }
}
```

Sends FCM notification to customer about the status change automatically.

### 4.4 Admin Cancel Order

`PATCH /api/orders/:id/admin-cancel`

**Auth:** `adminAuthMiddleware` + `adminMiddleware`

**Request Body:**
```json
{
  "reason": "Customer requested cancellation via support call",
  "issueRefund": true,
  "restoreVouchers": true
}
```

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `reason` | String | Yes | - | Min 10 chars, max 500 chars |
| `issueRefund` | Boolean | No | `true` | Whether to process refund for paid amount |
| `restoreVouchers` | Boolean | No | `true` | Whether to restore vouchers used |

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled by admin",
  "data": {
    "order": { "...full order object with status CANCELLED..." },
    "refundInitiated": true,
    "vouchersRestored": 1
  }
}
```

**Business logic:**
- Calls `processOrderCancellation()` which handles: voucher restoration, coupon usage reversal, bonus voucher cancellation, refund processing
- Creates audit log entry
- Order must pass `canBeCancelled()` check (not already DELIVERED/CANCELLED/FAILED)

---

## 5. Subscription & Plan Management

### What's Still Here (Unchanged)

All subscription plan CRUD and subscription admin endpoints remain unchanged:

#### Plan CRUD

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/subscriptions/plans` | Create plan |
| `GET` | `/api/subscriptions/plans` | List plans (admin view with subscriber count) |
| `GET` | `/api/subscriptions/plans/:id` | Get plan details |
| `PUT` | `/api/subscriptions/plans/:id` | Update plan |
| `PATCH` | `/api/subscriptions/plans/:id/activate` | Activate plan |
| `PATCH` | `/api/subscriptions/plans/:id/deactivate` | Deactivate plan |
| `PATCH` | `/api/subscriptions/plans/:id/archive` | Archive plan |

#### Create Plan

`POST /api/subscriptions/plans`

**Request Body:**
```json
{
  "name": "30-Day Meal Plan",
  "description": "Daily lunch and dinner for 30 days",
  "durationDays": 30,
  "vouchersPerDay": 2,
  "voucherValidityDays": 90,
  "price": 2999,
  "originalPrice": 3999,
  "coverageRules": { "...optional..." },
  "applicableZoneIds": ["zone_id_1", "zone_id_2"],
  "displayOrder": 1,
  "badge": "POPULAR",
  "features": ["Free delivery", "2 meals/day"],
  "status": "INACTIVE",
  "validFrom": "2026-01-01T00:00:00.000Z",
  "validTill": "2026-12-31T23:59:59.999Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription plan created",
  "data": {
    "plan": { "...full plan object..." },
    "totalVouchers": 60
  }
}
```

#### Update Plan

`PUT /api/subscriptions/plans/:id`

**Important:** If plan has active subscribers, only these fields can be updated: `name`, `description`, `badge`, `features`, `displayOrder`. Price and duration fields are locked.

**Response includes warning:**
```json
{
  "success": true,
  "message": "Plan updated",
  "data": {
    "plan": { "..." },
    "warning": "Plan has 15 active subscribers. Some fields are locked."
  }
}
```

#### Subscription Admin

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/subscriptions/admin/all` | List all subscriptions |
| `POST` | `/api/subscriptions/:id/admin-cancel` | Admin cancel subscription |

#### Get All Subscriptions

`GET /api/subscriptions/admin/all`

**Query Params:**

| Param | Type | Required |
|-------|------|----------|
| `userId` | ObjectId | No |
| `planId` | ObjectId | No |
| `status` | String | No (`ACTIVE`, `EXPIRED`, `CANCELLED`) |
| `dateFrom` | Date | No |
| `dateTo` | Date | No |
| `page` | Number | No (default: 1) |
| `limit` | Number | No (default: 20) |

**Response:**
```json
{
  "success": true,
  "message": "All subscriptions",
  "data": {
    "subscriptions": [
      {
        "_id": "...",
        "userId": { "_id": "...", "name": "John", "phone": "+919...", "email": "..." },
        "planId": { "_id": "...", "name": "30-Day Plan", "durationDays": 30, "price": 2999 },
        "status": "ACTIVE",
        "purchaseDate": "...",
        "startDate": "...",
        "endDate": "...",
        "totalVouchersIssued": 60,
        "vouchersUsed": 12,
        "amountPaid": 2999,
        "autoOrderingEnabled": true,
        "defaultKitchenId": "...",
        "defaultAddressId": "...",
        "weeklySchedule": {
          "monday": { "lunch": true, "dinner": false },
          "tuesday": { "lunch": true, "dinner": true }
        },
        "skippedSlots": [
          {
            "date": "2026-02-15T00:00:00.000Z",
            "mealWindow": "LUNCH",
            "reason": "Customer skipped",
            "skippedAt": "2026-02-13T08:00:00.000Z"
          }
        ],
        "defaultAddons": [
          { "addonId": "...", "quantity": 2 }
        ]
      }
    ],
    "pagination": { "total": 100, "page": 1, "limit": 20, "pages": 5 }
  }
}
```

**New fields on subscription (from refactoring):**
- `defaultAddons` - Array of `{ addonId, quantity }` for auto-order addon preferences
- `autoOrderingEnabled`, `weeklySchedule`, `skippedSlots` - Auto-ordering config (just for visibility)

> **Note:** `weeklySchedule` is a Map type with lowercase keys (`lunch`, `dinner`), NOT uppercase. `skippedSlots` entries include `reason` and `skippedAt` timestamp fields alongside `date` and `mealWindow`.

#### Admin Cancel Subscription

`POST /api/subscriptions/:id/admin-cancel`

**Request Body:**
```json
{
  "reason": "Fraud detected on this account",
  "issueRefund": true,
  "refundAmount": 2000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled by admin",
  "data": {
    "subscription": { "...status: CANCELLED..." },
    "vouchersCancelled": 48,
    "refundIssued": true,
    "refundAmount": 2000
  }
}
```

### What Was Removed from Subscriptions

These endpoints NO LONGER exist on `/api/subscriptions`:
- Auto-order settings update
- Pause/resume subscription
- Skip/unskip meal
- Cron triggers (auto-orders lunch/dinner)
- Auto-order logs and failure summary

See [Section 2 Route Migration Map](#2-route-migration-map) for new locations.

---

## 6. Cron Job Management

All cron endpoints are under `/api/admin/cron/` with `adminAuthMiddleware` + `adminMiddleware`.

### 6.1 Get Cron Status

`GET /api/admin/cron/status`

**Response:**
```json
{
  "success": true,
  "message": "Cron job status",
  "data": {
    "jobs": {
      "voucherExpiry": {
        "schedule": "Daily at 8:00 AM IST (2:30 AM UTC)",
        "cronExpression": "30 2 * * *",
        "timezone": "UTC",
        "status": "scheduled",
        "description": "Expires vouchers and sends notifications",
        "lastRun": null,
        "nextRun": "2026-02-15T02:30:00.000Z"
      }
    }
  }
}
```

### 6.2 Get Cron History

`GET /api/admin/cron/history`

**Response:**
```json
{
  "success": true,
  "message": "Cron execution history",
  "data": {
    "message": "Cron execution history would be fetched from logs",
    "note": "Check application logs for detailed execution history"
  }
}
```

### 6.3 Trigger Voucher Expiry

`POST /api/admin/cron/voucher-expiry`

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Voucher expiry cron completed",
  "data": {
    "duration": "2.5s",
    "stats": { "...expiry stats..." }
  }
}
```

### 6.4 Promote Scheduled Meals (NEW)

`POST /api/admin/cron/promote-scheduled-meals`

Promotes `SCHEDULED` orders to `PLACED` status for today's meal window.

**Request Body:**
```json
{
  "mealWindow": "LUNCH"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `mealWindow` | String | Yes | `LUNCH` or `DINNER` |

**Response:**
```json
{
  "success": true,
  "message": "Scheduled meals promotion completed",
  "data": {
    "mealWindow": "LUNCH",
    "processedDate": "2026-02-14T00:00:00.000Z",
    "total": 25,
    "promoted": 23,
    "failed": 2,
    "errors": [
      {
        "orderId": "...",
        "orderNumber": "ORD-XYZ",
        "reason": "Kitchen unavailable"
      }
    ]
  }
}
```

**Business logic:**
- Finds all orders where `status: "SCHEDULED"`, `paymentStatus: "PAID"`, `scheduledFor: today`, matching `mealWindow`
- Verifies kitchen is active and accepting orders
- Promotes to `PLACED` and pushes to `statusTimeline`
- Sends FCM notifications to kitchen (`NEW_SCHEDULED_ORDER`) and customer (`SCHEDULED_MEAL_PLACED`)
- If kitchen unavailable: fails that order and sends `SCHEDULED_MEAL_ISSUE` notification to customer

### 6.5 Trigger Auto-Orders

`POST /api/admin/cron/auto-orders`

Triggers auto-order batch processing for a specific meal window.

**Headers:** `x-cron-secret: <CRON_SECRET>` (optional, validated if `process.env.CRON_SECRET` is set)

**Request Body:**
```json
{
  "mealWindow": "LUNCH",
  "dryRun": false
}
```

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `mealWindow` | String | Yes | - | `LUNCH` or `DINNER` |
| `dryRun` | Boolean | No | `false` | If true, simulates without creating orders |

**Response:**
```json
{
  "success": true,
  "message": "Auto-ordering complete",
  "data": {
    "mealWindow": "LUNCH",
    "dryRun": false,
    "cronRunId": "auto-LUNCH-1707900000000",
    "processedDate": "2026-02-14",
    "startedAt": "2026-02-14T10:00:00.000Z",
    "completedAt": "2026-02-14T10:00:15.000Z",
    "totalEligible": 50,
    "processed": 50,
    "ordersCreated": 45,
    "skipped": 3,
    "failed": 2,
    "addonPaymentPending": 5,
    "errors": [
      {
        "subscriptionId": "...",
        "userId": "...",
        "failureCategory": "NO_KITCHEN",
        "failureReason": "No kitchen serving this zone"
      }
    ]
  }
}
```

**Checks before running:**
- Validates `autoOrder.enabled` in system config
- Returns `{ disabled: true }` if auto-ordering is globally disabled

### 6.6 Trigger Lunch/Dinner Auto-Orders (Dedicated)

`POST /api/admin/cron/auto-orders/lunch`
`POST /api/admin/cron/auto-orders/dinner`

Same as above but with hardcoded meal window. Designed for external cron services (e.g., cron-job.org) that call these on schedule.

**Headers:** `x-cron-secret: <CRON_SECRET>` (optional)

**Request Body:**
```json
{
  "dryRun": false
}
```

**Response:** Same shape as Section 6.5.

### 6.7 Auto-Cancel Unpaid Auto-Orders (NEW)

`POST /api/admin/cron/auto-cancel-unpaid`

Finds `AUTO_ORDER` orders with `paymentStatus: "PENDING"` past the configured payment window and cancels them with voucher restoration.

**Request Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Auto-cancel unpaid orders complete",
  "data": {
    "windowMinutes": 30,
    "cutoffTime": "2026-02-14T09:30:00.000Z",
    "found": 3,
    "cancelled": 3,
    "errors": []
  }
}
```

**Business logic:**
- Uses `autoOrder.addonPaymentWindowMinutes` from system config (default: 30)
- Finds orders where: `orderSource: "AUTO_ORDER"`, `paymentStatus: "PENDING"`, `status: "PLACED"`, `placedAt < now - windowMinutes`
- For each: cancels order, restores vouchers via `processOrderCancellation`, sends `AUTO_ORDER_CANCELLED` FCM notification
- Logs each cancellation with `createLogger("CronController")`

---

## 7. Auto-Order Monitoring

### 7.1 Get Auto-Order Logs

`GET /api/admin/cron/auto-order-logs`

**Query Params:**

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `subscriptionId` | ObjectId | No | Filter by subscription |
| `userId` | ObjectId | No | Filter by customer |
| `status` | String | No | `SUCCESS`, `SKIPPED`, `FAILED` |
| `mealWindow` | String | No | `LUNCH` or `DINNER` |
| `failureCategory` | String | No | See failure categories below |
| `cronRunId` | String | No | Filter by specific cron run |
| `dateFrom` | Date | No | Filter by processedDate >= |
| `dateTo` | Date | No | Filter by processedDate <= |
| `page` | Number | No | Default: 1 |
| `limit` | Number | No | Default: 50 |

**Response:**
```json
{
  "success": true,
  "message": "Auto-order logs",
  "data": {
    "logs": [
      {
        "_id": "...",
        "userId": { "_id": "...", "name": "John", "phone": "+919..." },
        "subscriptionId": { "_id": "...", "planId": "...", "status": "ACTIVE" },
        "orderId": { "_id": "...", "orderNumber": "ORD-AUTO-123", "status": "PLACED" },
        "mealWindow": "LUNCH",
        "status": "SUCCESS",
        "cronRunId": "auto-LUNCH-1707900000000",
        "processedDate": "2026-02-14",
        "createdAt": "2026-02-14T10:00:00.000Z"
      },
      {
        "_id": "...",
        "userId": { "_id": "...", "name": "Jane", "phone": "+919..." },
        "subscriptionId": { "_id": "...", "planId": "...", "status": "ACTIVE" },
        "orderId": null,
        "mealWindow": "LUNCH",
        "status": "FAILED",
        "failureCategory": "NO_VOUCHERS",
        "failureReason": "No available vouchers for this subscription",
        "cronRunId": "auto-LUNCH-1707900000000",
        "processedDate": "2026-02-14",
        "createdAt": "2026-02-14T10:00:00.000Z"
      }
    ],
    "stats": {
      "success": 45,
      "skipped": 3,
      "failed": 2
    },
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 50,
      "pages": 1
    }
  }
}
```

### 7.2 Auto-Order Failure Summary

`GET /api/admin/cron/auto-order-logs/summary`

**Query Params:**

| Param | Type | Required | Default |
|-------|------|----------|---------|
| `dateFrom` | Date | No | 7 days ago |
| `dateTo` | Date | No | Now |

**Response:**
```json
{
  "success": true,
  "message": "Auto-order failure summary",
  "data": {
    "summary": {
      "NO_VOUCHERS": { "total": 15, "LUNCH": 10, "DINNER": 5 },
      "NO_KITCHEN": { "total": 3, "LUNCH": 2, "DINNER": 1 },
      "NO_ADDRESS": { "total": 1, "LUNCH": 1, "DINNER": 0 },
      "NO_MENU": { "total": 2, "LUNCH": 0, "DINNER": 2 },
      "ORDER_CREATION_FAILED": { "total": 1, "LUNCH": 1, "DINNER": 0 },
      "KITCHEN_NOT_SERVING_ZONE": { "total": 0, "LUNCH": 0, "DINNER": 0 }
    },
    "overallStats": {
      "success": 320,
      "skipped": 15,
      "failed": 22,
      "total": 357
    },
    "dateRange": {
      "from": "2026-02-07T00:00:00.000Z",
      "to": "2026-02-14T23:59:59.999Z"
    }
  }
}
```

### Failure Categories

| Category | Description |
|----------|-------------|
| `NO_VOUCHERS` | Customer has no available vouchers |
| `NO_ADDRESS` | Customer has no default address set |
| `NO_ZONE` | Customer's pincode is not serviceable |
| `NO_KITCHEN` | No active kitchen serving the customer's zone |
| `NO_MENU` | No menu items available for the meal window |
| `ORDER_CREATION_FAILED` | Order creation threw an unexpected error |
| `KITCHEN_NOT_SERVING_ZONE` | Kitchen exists but is not assigned to serve the customer's zone |

---

## 8. Dashboard & Reports

### 8.1 Dashboard

`GET /api/admin/dashboard`

**Response:**
```json
{
  "success": true,
  "message": "Dashboard retrieved",
  "data": {
    "overview": {
      "totalOrders": 5000,
      "totalRevenue": 750000,
      "activeCustomers": 1200,
      "activeKitchens": 5
    },
    "today": {
      "orders": 85,
      "revenue": 12750,
      "newCustomers": 3
    },
    "pendingActions": {
      "pendingOrders": 12,
      "pendingRefunds": 2,
      "pendingKitchenApprovals": 1
    },
    "recentActivity": [
      {
        "_id": "...",
        "action": "CANCEL",
        "entityType": "ORDER",
        "userId": { "name": "Admin User", "role": "ADMIN" },
        "createdAt": "2026-02-14T10:30:00.000Z"
      }
    ]
  }
}
```

### 8.2 Reports

`GET /api/admin/reports`

**Query Params:**

| Param | Type | Required | Values |
|-------|------|----------|--------|
| `type` | String | Yes | `ORDERS`, `REVENUE`, `VOUCHERS`, `REFUNDS` |
| `segmentBy` | String | No | `CITY`, `ZONE`, `KITCHEN` |
| `dateFrom` | Date | No | - |
| `dateTo` | Date | No | - |
| `kitchenId` | ObjectId | No | - |
| `zoneId` | ObjectId | No | - |

### 8.3 Export Reports

`GET /api/admin/reports/export`

**Query Params:**

| Param | Type | Required | Values |
|-------|------|----------|--------|
| `type` | String | Yes | `ORDERS`, `REVENUE`, `VOUCHERS`, `REFUNDS` |
| `segmentBy` | String | No | `CITY`, `ZONE`, `KITCHEN` |
| `dateFrom` | Date | No | - |
| `dateTo` | Date | No | - |
| `format` | String | No | `CSV` (default), `EXCEL` |

---

## 9. User & Approval Management

### 9.1 User CRUD

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/admin/users` | Create user (KITCHEN_STAFF, DRIVER, ADMIN) |
| `GET` | `/api/admin/users` | List users with filters |
| `GET` | `/api/admin/users/:id` | Get user detail with activity stats |
| `PUT` | `/api/admin/users/:id` | Update user |
| `DELETE` | `/api/admin/users/:id` | Soft delete user |
| `PATCH` | `/api/admin/users/:id/activate` | Activate user |
| `PATCH` | `/api/admin/users/:id/deactivate` | Deactivate user |
| `PATCH` | `/api/admin/users/:id/suspend` | Suspend user (requires reason) |
| `POST` | `/api/admin/users/:id/reset-password` | Reset admin password |

#### Create User

**Request Body:**
```json
{
  "phone": "9876543210",
  "role": "KITCHEN_STAFF",
  "name": "Kitchen Manager",
  "email": "kitchen@example.com",
  "kitchenId": "kitchen_object_id"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `phone` | String | Yes | 10-digit Indian mobile |
| `role` | String | Yes | `KITCHEN_STAFF`, `DRIVER`, `ADMIN` |
| `name` | String | Yes | 2-100 chars |
| `email` | String | No | - |
| `kitchenId` | ObjectId | Yes for KITCHEN_STAFF | Forbidden for other roles |
| `username` | String | No | Only for ADMIN role |
| `password` | String | No | Only for ADMIN role, min 8 chars |

#### Get Users

**Query Params:**

| Param | Type | Values |
|-------|------|--------|
| `role` | String | `CUSTOMER`, `KITCHEN_STAFF`, `DRIVER`, `ADMIN` |
| `status` | String | `ACTIVE`, `INACTIVE`, `SUSPENDED`, `DELETED` |
| `kitchenId` | ObjectId | - |
| `search` | String | Searches name and phone |
| `page` | Number | Default: 1 |
| `limit` | Number | Default: 20, max: 100 |

**Response includes:**
```json
{
  "data": {
    "users": [...],
    "counts": {
      "total": 500,
      "active": 450,
      "inactive": 50,
      "byRole": {
        "CUSTOMER": 400,
        "DRIVER": 50,
        "KITCHEN_STAFF": 30,
        "ADMIN": 5
      }
    },
    "pagination": { "..." }
  }
}
```

### 9.2 Driver Approvals

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/admin/drivers/pending` | List pending driver registrations |
| `PATCH` | `/api/admin/drivers/:id/approve` | Approve driver |
| `PATCH` | `/api/admin/drivers/:id/reject` | Reject driver (requires reason in body) |

**Reject driver body:** `{ "reason": "Incomplete documents" }`

> **Note:** Driver reject has no Joi validation schema (unlike kitchen reject which enforces min 10 chars). The reason field is only checked via `if (!reason)` in the controller, so any non-empty string is accepted. Ensure the admin UI collects a meaningful reason.

### 9.3 Kitchen Approvals

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/admin/kitchens/pending` | List pending kitchen registrations |
| `PATCH` | `/api/admin/kitchens/:id/approve` | Approve kitchen |
| `PATCH` | `/api/admin/kitchens/:id/reject` | Reject kitchen (requires reason, min 10 chars) |

---

## 10. Push Notifications

`POST /api/admin/push-notification`

**Request Body:**
```json
{
  "title": "Weekend Special!",
  "body": "Get 20% off on all orders this weekend",
  "targetType": "ALL_CUSTOMERS",
  "data": {
    "screen": "OFFERS",
    "offerId": "..."
  }
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | String | Yes | Max 100 chars |
| `body` | String | Yes | Max 500 chars |
| `targetType` | String | Yes | See target types below |
| `targetIds` | Array | If `SPECIFIC_USERS` | Array of user ObjectIds |
| `targetRole` | String | If `ROLE` | `CUSTOMER`, `DRIVER`, `KITCHEN_STAFF`, `ADMIN` |
| `data` | Object | No | Custom payload for deep linking |

**Target Types:**

| Type | Description |
|------|-------------|
| `SPECIFIC_USERS` | Send to specific user IDs (requires `targetIds`) |
| `ROLE` | Send to all users with a specific role (requires `targetRole`) |
| `ALL_CUSTOMERS` | Send to all active customers with FCM tokens |
| `ACTIVE_SUBSCRIBERS` | Send to customers with active subscriptions and remaining vouchers |

**Response:**
```json
{
  "success": true,
  "message": "Notification queued",
  "data": {
    "sentCount": 450
  }
}
```

---

## 11. Audit Logs

### Get Audit Logs

`GET /api/admin/audit-logs`

**Query Params:**

| Param | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | Filter by who performed the action |
| `action` | String | e.g., `CREATE`, `UPDATE`, `DELETE`, `CANCEL`, `APPROVE_DRIVER`, `PUSH_NOTIFICATION` |
| `entityType` | String | e.g., `ORDER`, `USER`, `SUBSCRIPTION_PLAN`, `SYSTEM_CONFIG`, `NOTIFICATION` |
| `entityId` | ObjectId | - |
| `dateFrom` | Date | - |
| `dateTo` | Date | - |
| `page` | Number | Default: 1 |
| `limit` | Number | Default: 50, max: 100 |

### Get Audit Log by ID

`GET /api/admin/audit-logs/:id`

---

## 12. New `orderSource` Field

### Schema

Orders now have an `orderSource` field:

```
orderSource: "DIRECT" | "SCHEDULED" | "AUTO_ORDER"
```

- `DIRECT` - Customer placed order manually for same-day delivery
- `SCHEDULED` - Customer scheduled order for a future date
- `AUTO_ORDER` - System created order from auto-ordering subscription

### Legacy Compatibility

The order schema has a pre-save hook that syncs `orderSource` with legacy boolean flags:

| `orderSource` | `isAutoOrder` | `isScheduledMeal` |
|---------------|--------------|-------------------|
| `DIRECT` | `false` | `false` |
| `SCHEDULED` | `false` | `true` |
| `AUTO_ORDER` | `true` | `false` |

Both the new field and legacy fields are present in all API responses, so you can use either. **Prefer `orderSource`** going forward.

### Display Recommendations

| `orderSource` | Suggested Badge | Color |
|---------------|----------------|-------|
| `DIRECT` | "Direct" | Default/Gray |
| `SCHEDULED` | "Scheduled" | Blue |
| `AUTO_ORDER` | "Auto" | Purple |

### Auto-Order Payment States

Auto-orders with addons can have `paymentStatus: "PENDING"`:

| State | Meaning | Admin Action |
|-------|---------|--------------|
| `paymentStatus: "PAID"`, `paymentMethod: "VOUCHER_ONLY"` | No addons, fully covered by voucher | None needed |
| `paymentStatus: "PENDING"` | Has addons, waiting for customer to pay | Monitor; auto-cancels after window |
| `paymentStatus: "PAID"`, `paymentMethod: "UPI"` (etc.) | Customer paid for addon charges | None needed |

---

## 13. Error Handling Reference

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
| 201 | Created |
| 400 | Validation error / Bad request |
| 401 | Unauthorized (invalid/missing auth token) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 500 | Server error |

### Validation Errors

All request body/query/params are validated with Joi schemas. Validation errors return 400 with the specific field error.

### Auth Requirements

All admin endpoints require two middleware:
1. `adminAuthMiddleware` - Validates JWT token
2. `adminMiddleware` - Verifies `role === "ADMIN"`

Send the JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

### Cron Secret (Optional)

Auto-order cron endpoints optionally check `x-cron-secret` header against `process.env.CRON_SECRET`. If `CRON_SECRET` is not set in env, the check is skipped.

---

## Quick Reference: All Admin Routes

### `/api/admin/` (Admin Module)

```
GET    /dashboard                           Dashboard overview
GET    /config                              Get system config
PUT    /config                              Update system config
GET    /guidelines                          Get guidelines
PUT    /guidelines                          Update guidelines
GET    /reports                             Generate reports
GET    /reports/export                      Export reports
GET    /audit-logs                          List audit logs
GET    /audit-logs/:id                      Get audit log detail
POST   /users                               Create user
GET    /users                               List users
GET    /users/:id                           Get user detail
PUT    /users/:id                           Update user
DELETE /users/:id                           Delete user (soft)
PATCH  /users/:id/activate                  Activate user
PATCH  /users/:id/deactivate               Deactivate user
PATCH  /users/:id/suspend                   Suspend user
POST   /users/:id/reset-password            Reset admin password
GET    /drivers/pending                     Pending drivers
PATCH  /drivers/:id/approve                 Approve driver
PATCH  /drivers/:id/reject                  Reject driver
GET    /kitchens/pending                    Pending kitchens
PATCH  /kitchens/:id/approve                Approve kitchen
PATCH  /kitchens/:id/reject                 Reject kitchen
POST   /push-notification                   Send push notification
```

### `/api/admin/cron/` (Cron Module)

```
GET    /status                              Cron job status
GET    /history                             Cron execution history
POST   /voucher-expiry                      Trigger voucher expiry
POST   /promote-scheduled-meals             Promote scheduled -> placed
POST   /auto-orders                         Trigger auto-orders (any meal)
POST   /auto-orders/lunch                   Trigger LUNCH auto-orders
POST   /auto-orders/dinner                  Trigger DINNER auto-orders
GET    /auto-order-logs                     Auto-order execution logs
GET    /auto-order-logs/summary             Auto-order failure summary
POST   /auto-cancel-unpaid                  Cancel unpaid auto-orders
```

### `/api/orders/` (Order Module - Admin)

```
GET    /admin/all                           List all orders
GET    /admin/stats                         Order statistics
PATCH  /admin/:id/status                    Update any order status
PATCH  /:id/admin-cancel                    Admin cancel order
```

### `/api/subscriptions/` (Subscription Module - Admin)

```
POST   /plans                               Create plan
GET    /plans                               List plans (admin view)
GET    /plans/:id                           Get plan details
PUT    /plans/:id                           Update plan
PATCH  /plans/:id/activate                  Activate plan
PATCH  /plans/:id/deactivate               Deactivate plan
PATCH  /plans/:id/archive                   Archive plan
GET    /admin/all                           List all subscriptions
POST   /:id/admin-cancel                    Admin cancel subscription
```
