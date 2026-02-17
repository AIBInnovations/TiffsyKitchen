# Kitchen App — Delivery & Batch Management Integration

> **Give this entire file to the Kitchen App's Claude as context.**
> This is a self-contained integration guide. No other files needed.

## Overview

Kitchen staff can manage the delivery batching process for their own kitchen. The kitchen app needs to:

1. **View** today's delivery batches and their statuses
2. **Trigger** auto-batching of ready orders into delivery batches
3. **Dispatch** batches to make them available for drivers
4. **Monitor** batch progress (which batches are out for delivery, completed, etc.)
5. **View** individual batch details with order lists

**Base URL:** Your API base (e.g., `https://api.tiffsy.com`)
**Auth:** All endpoints require admin JWT token in `Authorization: Bearer <token>` header. The logged-in user must have role `KITCHEN_STAFF` and be associated with a kitchen (`kitchenId` on user profile).
**All delivery endpoints are under:** `/api/delivery/...`

**Important:** Kitchen staff endpoints automatically scope to the user's own kitchen — no `kitchenId` parameter needed in request bodies.

---

## SCREEN 1: Kitchen Delivery Dashboard

**Location:** Home → Delivery / Batches tab

This is the main screen kitchen staff sees for delivery management. Shows today's batches with status summary and action buttons.

### Get Kitchen Batches

**Endpoint:** `GET /api/delivery/kitchen-batches`

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | — | Filter: `COLLECTING`, `READY_FOR_DISPATCH`, `DISPATCHED`, `IN_PROGRESS`, `COMPLETED`, `PARTIAL_COMPLETE`, `CANCELLED` |
| `mealWindow` | string | — | Filter: `"LUNCH"` or `"DINNER"` |
| `date` | string | today | ISO date string. Defaults to today if omitted. |
| `page` | number | `1` | Pagination page |
| `limit` | number | `20` | Items per page (max: 100) |

### Response

```json
{
  "success": true,
  "data": {
    "batches": [
      {
        "_id": "batch_id",
        "batchNumber": "BATCH-20260214-L-KIT1-Z2-001",
        "status": "COLLECTING",
        "mealWindow": "LUNCH",
        "batchDate": "2026-02-14T00:00:00.000Z",
        "orderIds": ["order_id_1", "order_id_2"],
        "driverId": null,
        "driverAssignedAt": null,
        "zoneId": { "_id": "zone_id", "name": "Koramangala" },
        "routeOptimization": null,
        "optimizedSequence": [],
        "totalDelivered": 0,
        "totalFailed": 0,
        "windowEndTime": "2026-02-14T07:30:00.000Z",
        "createdAt": "2026-02-14T05:30:00.000Z"
      }
    ],
    "summary": {
      "collecting": 2,
      "dispatched": 1,
      "inProgress": 1,
      "completed": 3
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 7,
      "pages": 1
    }
  }
}
```

### UI Layout

```
My Kitchen — Deliveries
═══════════════════════

[LUNCH ▼] [Today ▼]

── Summary ──
Collecting: 2  |  Dispatched: 1  |  In Progress: 1  |  Completed: 3

── Action Buttons ──
[🔄 Batch Orders]     [📦 Dispatch Batches]

── Batches ──
┌──────────────────────────────────────────────┐
│ BATCH-...-L-Z2-001           [COLLECTING] 🔵  │
│ Zone: Koramangala • 5 orders • LUNCH          │
│ Driver: Not assigned                           │
│                                      [View →] │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ BATCH-...-L-Z1-002          [IN_PROGRESS] 🟣  │
│ Zone: Indiranagar • 3 orders • LUNCH          │
│ Driver: Rajesh K.                              │
│ Delivered: 1/3                                 │
│                                      [View →] │
└──────────────────────────────────────────────┘
```

**Important — Summary counts:**
The `summary` object counts 4 categories: `collecting` (COLLECTING), `dispatched` (DISPATCHED, i.e. driver assigned), `inProgress` (IN_PROGRESS), `completed` (COMPLETED + PARTIAL_COMPLETE). Note that `READY_FOR_DISPATCH` batches (dispatched by kitchen, waiting for driver) are **not** in any summary bucket. To show a "Ready for Pickup" count, count batches from the list where `status === "READY_FOR_DISPATCH"`, or calculate it as `total - collecting - dispatched - inProgress - completed`.

**Status badge colors:**
- `COLLECTING` — Blue (orders being added)
- `READY_FOR_DISPATCH` — Orange (waiting for driver to accept)
- `DISPATCHED` — Teal (driver assigned, heading to kitchen)
- `IN_PROGRESS` — Purple (driver delivering)
- `COMPLETED` — Green
- `PARTIAL_COMPLETE` — Yellow
- `CANCELLED` — Red/Gray

---

## SCREEN 2: Auto-Batch Orders

**Location:** Kitchen Dashboard → "Batch Orders" button

Groups all ready/accepted orders in this kitchen into delivery batches by zone.

**Endpoint:** `POST /api/delivery/my-kitchen/auto-batch`

### Request Body

```json
{
  "mealWindow": "LUNCH"
}
```

`mealWindow` is optional. Omit to batch both LUNCH and DINNER.

### Response

```json
{
  "success": true,
  "message": "Auto-batching complete",
  "data": {
    "batchesCreated": 2,
    "batchesUpdated": 1,
    "ordersProcessed": 12,
    "batches": [
      {
        "batchId": "...",
        "batchNumber": "BATCH-20260214-L-KIT1-Z2-001",
        "orderCount": 5,
        "zone": "zone_id",
        "mealWindow": "LUNCH"
      },
      {
        "batchId": "...",
        "batchNumber": "BATCH-20260214-L-KIT1-Z1-002",
        "orderCount": 7,
        "zone": "zone_id",
        "mealWindow": "LUNCH"
      }
    ]
  }
}
```

**Notes:**
- `batchesCreated` = new batches created. `batchesUpdated` = existing COLLECTING batches that got more orders added.
- If route planning is enabled on the backend, the response includes an additional `optimized: true` field, and each batch summary gains extra fields: `kitchen`, `clusterId`, `algorithm`, `improvementPercent`, `totalDistanceMeters`. You can safely ignore these extra fields.
- If no orders are ready: returns `batchesCreated: 0, ordersProcessed: 0`.

### UI Flow

```
[Batch Orders] button tapped
  ↓
Show meal window picker: [LUNCH] [DINNER] [Both]
  ↓
Call API
  ↓
Success → Show toast: "12 orders batched into 3 batches"
  ↓
Refresh kitchen batches list
```

---

## SCREEN 3: Dispatch Batches

**Location:** Kitchen Dashboard → "Dispatch" button

Moves COLLECTING batches to READY_FOR_DISPATCH and notifies drivers.

**Endpoint:** `POST /api/delivery/my-kitchen/dispatch`

### Request Body

```json
{
  "mealWindow": "LUNCH",
  "forceDispatch": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mealWindow` | string | **Yes** | `"LUNCH"` or `"DINNER"` |
| `forceDispatch` | boolean | No | Default `false`. Set `true` to dispatch before cutoff. |

### Response (Success)

```json
{
  "success": true,
  "data": {
    "batchesDispatched": 2,
    "batches": [
      {
        "batchId": "...",
        "batchNumber": "BATCH-20260214-L-KIT1-Z2-001",
        "status": "READY_FOR_DISPATCH",
        "orderCount": 5
      }
    ]
  }
}
```

### Error: Before Cutoff Time

```json
{
  "success": false,
  "message": "Cannot dispatch LUNCH batches yet. Meal window ends at 13:00 (current: 12:45). Wait for cutoff or contact admin for force dispatch."
}
```

### UI Flow

```
[Dispatch] button tapped
  ↓
Show meal window picker: [LUNCH] [DINNER]
  ↓
Call API
  ↓
If error (before cutoff) → Show warning with cutoff time
  ↓
If success → Show toast: "2 batches dispatched, drivers notified"
  ↓
Refresh kitchen batches list
```

**Important:** Kitchen staff typically dispatch AFTER cutoff time (when no more orders are expected). The `forceDispatch` flag is mainly for admin use — kitchen staff can use it but show a confirmation dialog first.

---

## SCREEN 4: Batch Detail

When kitchen staff taps a batch from the list.

**Endpoint:** `GET /api/delivery/batches/:batchId`

### Response

```json
{
  "success": true,
  "data": {
    "batch": {
      "_id": "batch_id",
      "batchNumber": "BATCH-20260214-L-KIT1-Z2-001",
      "status": "IN_PROGRESS",
      "mealWindow": "LUNCH",
      "batchDate": "2026-02-14T00:00:00.000Z",
      "orderIds": ["order1", "order2", "order3"],
      "kitchenId": { "_id": "kitchen_id", "name": "Sunrise Kitchen", "address": "...", "phone": "..." },
      "zoneId": { "_id": "zone_id", "name": "Koramangala", "city": "Bangalore" },
      "driverId": { "_id": "driver_id", "name": "Rajesh K.", "phone": "9876543210" },
      "driverAssignedAt": "2026-02-14T07:21:00.000Z",
      "routeOptimization": {
        "algorithm": "TWO_OPT",
        "totalDistanceMeters": 4200,
        "totalDurationSeconds": 1680,
        "improvementPercent": 23.5,
        "optimizedAt": "2026-02-14T07:15:00.000Z"
      },
      "totalDelivered": 1,
      "totalFailed": 0,
      "dispatchedAt": "2026-02-14T07:20:00.000Z",
      "pickedUpAt": "2026-02-14T07:35:00.000Z",
      "completedAt": null
    },
    "orders": [
      {
        "_id": "order_id",
        "orderNumber": "T-1234",
        "status": "DELIVERED",
        "deliveryAddress": {
          "addressLine1": "123 Main St",
          "landmark": "Near Park",
          "locality": "Koramangala 4th Block",
          "city": "Bangalore",
          "pincode": "560034",
          "contactName": "Rahul S.",
          "contactPhone": "9876543210",
          "coordinates": { "latitude": 12.9352, "longitude": 77.6245 }
        },
        "items": [
          { "name": "Lunch Thali", "quantity": 1 }
        ]
      }
    ],
    "assignments": [
      {
        "_id": "assignment_id",
        "orderId": "order_id",
        "driverId": "driver_id",
        "status": "DELIVERED",
        "assignedAt": "2026-02-14T07:21:00.000Z",
        "deliveredAt": "2026-02-14T07:42:00.000Z",
        "failedAt": null,
        "failureReason": null,
        "etaTracking": {
          "currentEtaSeconds": 0,
          "distanceRemainingMeters": 0,
          "etaStatus": "ON_TIME"
        },
        "proofOfDelivery": {
          "type": "OTP",
          "otpVerified": true,
          "verifiedAt": "2026-02-14T07:42:00.000Z"
        }
      }
    ]
  }
}
```

### UI Layout

```
Batch Detail
═══════════

BATCH-...-L-Z2-001              [IN_PROGRESS] 🟣
Koramangala • LUNCH • 3 orders

Driver: Rajesh K. (9876543210)
Assigned at: 1:21 PM
Picked up at: 1:35 PM

Route: TWO_OPT • 4.2 km • ~28 min • 23% optimized

── Orders ──

✅ #T-1234 — Rahul S.  [DELIVERED]
   123 Main St, Koramangala
   Lunch Thali × 1

→  #T-1235 — Priya M.  [EN_ROUTE]
   456 Oak Ave, Koramangala
   Lunch Thali × 2
   ETA: ~6 min

○  #T-1236 — Amit K.   [ASSIGNED]
   789 Elm Rd, Koramangala
   Lunch Thali × 1
```

**Access Control:** Kitchen staff can only view batches belonging to their own kitchen. The backend enforces this — a 403 error is returned if the batch belongs to a different kitchen.

---

## WORKFLOW: Typical Kitchen Delivery Flow

```
1. Orders come in → Kitchen prepares food
                     ↓
2. Kitchen staff taps "Batch Orders" → Orders grouped into batches by zone
                     ↓
3. After cutoff time → Kitchen staff taps "Dispatch"
                     ↓
4. Batches move to READY_FOR_DISPATCH → Drivers get notified
                     ↓
5. Driver accepts and picks up → Kitchen sees batch go to IN_PROGRESS
                     ↓
6. Deliveries complete → Kitchen sees final status (COMPLETED / PARTIAL_COMPLETE)
```

### When to Batch

- **Before cutoff:** Batch orders periodically as they come in. New orders joining existing batches.
- **At/after cutoff:** Final batch + dispatch. No new orders expected.

### When to Dispatch

- **After meal window cutoff** (e.g., after 1:00 PM for LUNCH) — this is the normal flow.
- **Before cutoff with `forceDispatch`** — only if admin has instructed early dispatch.

---

## NOTIFICATIONS (Push — Incoming to Kitchen App)

The backend sends push notifications to kitchen staff. Handle these in the app:

| Notification Type | When | Action on Tap |
|-------------------|------|---------------|
| `BATCH_REMINDER` | Admin sends reminder about pending orders near cutoff | Navigate to delivery dashboard |
| `BATCH_READY` | Orders are ready for batching (system trigger) | Navigate to delivery dashboard |

---

## ALL KITCHEN ENDPOINTS REFERENCE

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/delivery/kitchen-batches` | List batches for my kitchen (with filters + summary) |
| `POST` | `/api/delivery/my-kitchen/auto-batch` | Batch ready orders for my kitchen |
| `POST` | `/api/delivery/my-kitchen/dispatch` | Dispatch batches for my kitchen |
| `GET` | `/api/delivery/batches/:batchId` | Get single batch detail (orders + assignments) |

---

## IMPLEMENTATION ORDER

| Priority | Screen | Effort |
|----------|--------|--------|
| 1 | Kitchen Delivery Dashboard (Screen 1) | Medium (list + summary + filters) |
| 2 | Auto-Batch button + flow (Screen 2) | Low (button + meal window picker) |
| 3 | Dispatch button + flow (Screen 3) | Low (button + meal window picker + error handling) |
| 4 | Batch Detail (Screen 4) | Medium (batch info + order list + assignment status) |
