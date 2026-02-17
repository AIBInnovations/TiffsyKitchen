# Admin App — Delivery, Route Planning & Driver Management Integration

> **Give this entire file to the Admin App's Claude as context.**
> This is a self-contained integration guide. No other files needed.

## Overview

The backend has a complete delivery management system with route optimization, driver assignment, and live tracking. The admin app needs to:

1. **Configure** route planning, driver assignment, and batch settings
2. **Trigger** auto-batching and dispatch across all kitchens
3. **Monitor** all delivery batches across kitchens and zones
4. **Track** active deliveries (map + timeline views)
5. **Intervene** when needed (reassign drivers, cancel batches, send reminders)
6. **Analyze** delivery statistics and performance

**Base URL:** Your API base (e.g., `https://api.tiffsy.com`)
**Auth:** All endpoints require admin JWT token in `Authorization: Bearer <token>` header.
**All delivery endpoints are under:** `/api/delivery/...`
**All system config endpoints are under:** `/api/admin/...`

---

## SCREEN 1: Route Planning Configuration

**Location:** Settings → Delivery Settings → Route Planning

**Read current:** `GET /api/admin/config` — response includes `routePlanning` object.
**Update:** `PUT /api/admin/config`

### Request Body

```json
{
  "routePlanning": {
    "enabled": true,
    "useOsrm": false,
    "osrmServerUrl": "",
    "clusteringEpsilonMeters": 1500,
    "maxOrdersPerBatch": 8,
    "optimizationAlgorithm": "auto",
    "etaRecalcIntervalSeconds": 60,
    "haversineRoadFactor": 1.4,
    "osrmTimeoutMs": 10000,
    "cacheExpiryMinutes": 60
  }
}
```

### Field Descriptions (for form labels/tooltips)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | boolean | `false` | Master toggle. When OFF, batching uses simple FIFO grouping. |
| `useOsrm` | boolean | `false` | Use external OSRM routing server for real road distances. If OFF, uses haversine (straight-line) estimation. |
| `osrmServerUrl` | string | `""` | OSRM server URL (e.g., `http://router.project-osrm.org`). Only needed if `useOsrm` is true. |
| `clusteringEpsilonMeters` | number | `1500` | Radius in meters for grouping nearby orders into batches. Lower = tighter clusters, more batches. Higher = bigger clusters, fewer batches. Range: 500-5000. |
| `maxOrdersPerBatch` | number | `8` | Maximum orders in a single batch. Range: 3-20. |
| `optimizationAlgorithm` | select | `"auto"` | Options: `"auto"` (recommended), `"brute_force"` (exact, slow for >8), `"two_opt"` (good balance), `"nearest_neighbor"` (fast, less optimal). |
| `etaRecalcIntervalSeconds` | number | `60` | How often to recalculate driver ETAs from GPS. Range: 15-300. |
| `haversineRoadFactor` | number | `1.4` | Multiplier to convert straight-line distance to estimated road distance. 1.4 = 40% longer. Range: 1.1-2.0. |
| `osrmTimeoutMs` | number | `10000` | OSRM request timeout in milliseconds. Range: 3000-30000. |
| `cacheExpiryMinutes` | number | `60` | Distance calculation cache duration. Range: 15-1440. |

### UI Layout

```
Route Planning Settings
═══════════════════════

[Toggle] Enable Route Planning          [ON/OFF]

── Algorithm Settings ──
Optimization Algorithm    [Dropdown: Auto (Recommended) | Brute Force | 2-Opt | Nearest Neighbor]
Max Orders Per Batch      [Number Input: 8]
Clustering Radius (m)     [Slider: 500 ←── 1500 ──→ 5000]

── Distance Calculation ──
Road Distance Factor      [Number Input: 1.4]
ETA Recalculation (sec)   [Number Input: 60]
Cache Duration (min)      [Number Input: 60]

── OSRM (Advanced) ──
[Toggle] Use OSRM Server               [ON/OFF]
OSRM Server URL           [Text Input]  (only shown if OSRM toggle is ON)
OSRM Timeout (ms)         [Number Input: 10000]

                                    [Save Settings]
```

---

## SCREEN 2: Driver Assignment Configuration

**Location:** Settings → Delivery Settings → Driver Assignment

**Read current:** `GET /api/admin/config` — response includes `driverAssignment` object.
**Update:** `PUT /api/admin/config`

### Request Body

```json
{
  "driverAssignment": {
    "enabled": true,
    "mode": "SELF_ACCEPT",
    "broadcastDriverCount": 3,
    "broadcastTimeoutSeconds": 60,
    "scoringWeights": {
      "proximity": 40,
      "completionRate": 25,
      "activeLoad": 20,
      "recency": 15
    },
    "maxDriverSearchRadiusMeters": 10000,
    "autoReassignOnTimeout": true,
    "manualAssignmentEnabled": true
  }
}
```

### Field Descriptions

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enabled` | boolean | `false` | Master toggle for smart driver assignment. When OFF, uses basic SELF_ACCEPT. |
| `mode` | select | `"SELF_ACCEPT"` | `"SELF_ACCEPT"` — drivers browse and accept. `"AUTO_ASSIGNMENT"` — system auto-assigns best driver. `"SMART_BROADCAST"` — notifies top N drivers, first to accept wins. `"MANUAL"` — admin assigns manually. |
| `broadcastDriverCount` | number | `3` | Drivers to notify in SMART_BROADCAST mode. Range: 1-10. |
| `broadcastTimeoutSeconds` | number | `60` | Wait time for driver response before reassigning. Range: 30-300. |
| `scoringWeights` | object | — | Driver scoring weights. **All 4 MUST sum to exactly 100.** |
| `scoringWeights.proximity` | number | `40` | Weight: distance from kitchen (0-10km). |
| `scoringWeights.completionRate` | number | `25` | Weight: historical delivery success rate. |
| `scoringWeights.activeLoad` | number | `20` | Weight: current batch capacity headroom. |
| `scoringWeights.recency` | number | `15` | Weight: time since last delivery. |
| `maxDriverSearchRadiusMeters` | number | `10000` | Max search radius for available drivers. Range: 1000-50000. |
| `autoReassignOnTimeout` | boolean | `true` | Auto-reassign batch if driver doesn't respond. |
| `manualAssignmentEnabled` | boolean | `true` | Allow admin to manually assign any batch. |

### UI Layout

```
Driver Assignment Settings
══════════════════════════

[Toggle] Enable Smart Assignment        [ON/OFF]

── Assignment Mode ──
(○) Self Accept    — Drivers browse and pick batches
(○) Auto Assign    — System picks the best driver automatically
(○) Broadcast      — Notify top drivers, first to accept wins
(○) Manual         — Admin assigns each batch

── Scoring Weights (must sum to 100) ──
Proximity         [Slider: 40] ████████░░
Completion Rate   [Slider: 25] █████░░░░░
Active Load       [Slider: 20] ████░░░░░░
Recency           [Slider: 15] ███░░░░░░░
                  Total: 100 ✓

── Broadcast Settings ── (only shown for SMART_BROADCAST mode)
Drivers to Notify          [Number Input: 3]
Response Timeout (sec)     [Number Input: 60]
[Toggle] Auto-Reassign on Timeout      [ON/OFF]

── General ──
Driver Search Radius (m)   [Number Input: 10000]
[Toggle] Allow Manual Assignment        [ON/OFF]

                                    [Save Settings]
```

**Validation:** Scoring weights must sum to exactly 100. Show real-time sum and error if not 100.

---

## SCREEN 3: Batch Configuration

**Location:** Settings → Delivery Settings → Batch Settings

This is a separate config from route planning. Controls basic batch behavior.

**Read current:** `GET /api/delivery/config`
**Update:** `PUT /api/delivery/config`

### Request Body

```json
{
  "maxBatchSize": 15,
  "failedOrderPolicy": "NO_RETURN",
  "autoDispatchDelay": 0
}
```

### Field Descriptions

| Field | Type | Default | Range | Description |
|-------|------|---------|-------|-------------|
| `maxBatchSize` | number | `15` | 1-30 | Maximum orders in a single batch (FIFO mode). |
| `failedOrderPolicy` | select | `"NO_RETURN"` | — | `"NO_RETURN"` — failed orders stay with driver. `"RETURN_TO_KITCHEN"` — driver returns failed orders. |
| `autoDispatchDelay` | number | `0` | 0-60 | Minutes to wait after cutoff before auto-dispatching. 0 = manual dispatch only. |

### Response

```json
{
  "success": true,
  "data": {
    "config": {
      "maxBatchSize": 15,
      "failedOrderPolicy": "NO_RETURN",
      "autoDispatchDelay": 0
    }
  }
}
```

---

## SCREEN 4: Auto-Batch Orders (Admin Trigger)

**Location:** Delivery → Actions → "Batch Orders"

Admin can trigger batching for any kitchen and meal window.

**Endpoint:** `POST /api/delivery/auto-batch`

### Request Body

```json
{
  "mealWindow": "LUNCH",
  "kitchenId": "64abc123def456..."
}
```

Both fields are optional. Omit `kitchenId` to batch ALL kitchens. Omit `mealWindow` to batch both LUNCH and DINNER.

### Response

```json
{
  "success": true,
  "message": "Auto-batching complete",
  "data": {
    "batchesCreated": 3,
    "batchesUpdated": 1,
    "ordersProcessed": 18,
    "optimized": true,
    "batches": [
      {
        "batchId": "...",
        "batchNumber": "BATCH-20260214-L-KIT1-Z2-001",
        "orderCount": 5,
        "zone": "zone_id",
        "kitchen": "kitchen_id"
      }
    ]
  }
}
```

If route planning is enabled, response includes `"optimized": true` and batches are geographically clustered with optimized routes.

---

## SCREEN 5: Dispatch Batches (Admin Trigger)

**Location:** Delivery → Actions → "Dispatch"

Moves COLLECTING batches to READY_FOR_DISPATCH and notifies drivers.

**Endpoint:** `POST /api/delivery/dispatch`

### Request Body

```json
{
  "mealWindow": "LUNCH",
  "kitchenId": "64abc123def456...",
  "forceDispatch": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mealWindow` | string | **Yes** | `"LUNCH"` or `"DINNER"` |
| `kitchenId` | string | **Yes** | Kitchen to dispatch for |
| `forceDispatch` | boolean | No | Default `false`. Set `true` to dispatch before cutoff time (admin override). |

### Response

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
  "message": "Cannot dispatch LUNCH batches yet. Meal window ends in 12:45 PM (cutoff: 1:00 PM). Use forceDispatch=true to override (Admin only)."
}
```

**UI:** Show "Dispatch" button with kitchen + meal window selector. If cutoff hasn't passed, show warning with "Force Dispatch" toggle.

---

## SCREEN 6: Send Kitchen Reminder

**Location:** Delivery → Actions → "Send Reminder"

Sends push notification to kitchen staff about pending orders before cutoff.

**Endpoint:** `POST /api/delivery/kitchen-reminder`

### Request Body

```json
{
  "mealWindow": "LUNCH",
  "kitchenId": "64abc123def456..."
}
```

`kitchenId` is optional. Omit to remind ALL kitchens with pending orders.

### Response

```json
{
  "success": true,
  "data": {
    "kitchensNotified": 3,
    "details": [
      {
        "kitchenId": "...",
        "kitchenName": "Sunrise Kitchen",
        "orderCount": 7,
        "staffNotified": 2
      }
    ]
  }
}
```

---

## SCREEN 7: Batch Monitoring Dashboard

**Location:** Delivery → Batches

### List All Batches

**Endpoint:** `GET /api/delivery/admin/batches`

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter: `COLLECTING`, `READY_FOR_DISPATCH`, `DISPATCHED`, `IN_PROGRESS`, `COMPLETED`, `PARTIAL_COMPLETE`, `CANCELLED` |
| `kitchenId` | string | Filter by kitchen ObjectId |
| `zoneId` | string | Filter by zone ObjectId |
| `driverId` | string | Filter by driver ObjectId |
| `dateFrom` | string | Start date filter (ISO date) |
| `dateTo` | string | End date filter (ISO date) |
| `page` | number | Pagination page (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |

### Response Shape (per batch)

```typescript
interface Batch {
  _id: string;
  batchNumber: string;              // e.g. "BATCH-20260214-L-KIT1-Z2-001"
  status: "COLLECTING" | "READY_FOR_DISPATCH" | "DISPATCHED" | "IN_PROGRESS" | "COMPLETED" | "PARTIAL_COMPLETE" | "CANCELLED";

  kitchenId: { _id: string; name: string };
  zoneId: { _id: string; name: string };
  mealWindow: "LUNCH" | "DINNER";
  batchDate: string;                // ISO date
  orderIds: string[];               // Array of order IDs

  driverId: {                       // null if not yet assigned
    _id: string;
    name: string;
    phone: string;
  } | null;
  driverAssignedAt: string | null;

  // ROUTE OPTIMIZATION (null if route planning disabled)
  routeOptimization: {
    algorithm: "BRUTE_FORCE" | "NEAREST_NEIGHBOR" | "TWO_OPT" | "OSRM_TRIP" | "NONE";
    totalDistanceMeters: number;
    totalDurationSeconds: number;
    improvementPercent: number;      // e.g. 23.5 = "23.5% shorter than FIFO"
    optimizedAt: string;
    fifoDistanceMeters: number;      // Original unoptimized distance
  } | null;

  // OPTIMIZED DELIVERY SEQUENCE
  optimizedSequence: Array<{
    orderId: string;
    sequenceNumber: number;
    estimatedArrival: string;
    estimatedDurationFromPrevSeconds: number;
    distanceFromPrevMeters: number;
    coordinates: { latitude: number; longitude: number };
  }>;

  // HOW DRIVER WAS ASSIGNED
  assignmentStrategy: {
    mode: "SELF_ACCEPT" | "AUTO_ASSIGNMENT" | "SMART_BROADCAST" | "MANUAL";
    assignedScore: number;           // Driver's score (0-100)
    broadcastedTo: Array<{
      driverId: string;
      broadcastedAt: string;
      respondedAt: string | null;
      response: "ACCEPTED" | "DECLINED" | "EXPIRED";
      score: number;
    }>;
    manualAssignedBy: string | null;
    manualAssignmentReason: string | null;
  };

  // TIMING
  windowEndTime: string;
  dispatchedAt: string | null;
  pickedUpAt: string | null;
  completedAt: string | null;

  // STATS
  totalDelivered: number;
  totalFailed: number;
}
```

### UI Layout

```
Delivery Batches
════════════════

Filters: [Status ▼] [Kitchen ▼] [Zone ▼] [Driver ▼] [Date Range]

┌─────────────────────────────────────────────────────────────┐
│ BATCH-20260214-L-KIT1-Z2-001              [IN_PROGRESS] 🟣  │
│ Sunrise Kitchen → Zone 2 • LUNCH • 5 orders                │
│                                                              │
│ Driver: Rajesh K. (Score: 87)  •  Assigned via AUTO_ASSIGN  │
│                                                              │
│ Route: TWO_OPT • 4.2 km • ~28 min • 23% optimized          │
│                                                              │
│ Delivered: 2/5  Failed: 0  Pending: 3                       │
│                                                    [View →] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ BATCH-20260214-D-KIT3-Z1-002          [READY_FOR_DISPATCH] 🟠│
│ Royal Kitchen → Zone 1 • DINNER • 3 orders                  │
│                                                              │
│ Driver: Not assigned yet                                     │
│                                                              │
│ Route: BRUTE_FORCE • 2.1 km • ~15 min • 31% optimized      │
│                                                    [View →] │
└─────────────────────────────────────────────────────────────┘
```

**Status badge colors:**
- `COLLECTING` — Blue
- `READY_FOR_DISPATCH` — Orange
- `DISPATCHED` — Teal
- `IN_PROGRESS` — Purple
- `COMPLETED` — Green
- `PARTIAL_COMPLETE` — Yellow
- `CANCELLED` — Red/Gray

---

## SCREEN 8: Batch Detail

When admin taps a batch from the list.

### Get Single Batch

**Endpoint:** `GET /api/delivery/batches/:batchId`

### Response

```typescript
{
  success: true;
  data: {
    batch: Batch;                    // Full batch object (same as list response)
    orders: Array<{                  // All orders in the batch
      _id: string;
      orderNumber: string;
      status: string;
      deliveryAddress: {
        addressLine1: string;
        landmark: string;
        locality: string;
        city: string;
        pincode: string;
        contactName: string;
        contactPhone: string;
        coordinates: { latitude: number; longitude: number };
      };
      items: Array<{ name: string; quantity: number }>;
    }>;
    assignments: Array<{             // Delivery assignments per order
      _id: string;
      orderId: string;
      driverId: string;
      status: string;                // ASSIGNED, EN_ROUTE, ARRIVED, DELIVERED, FAILED
      assignedAt: string;
      deliveredAt: string | null;
      failedAt: string | null;
      failureReason: string | null;
      etaTracking: {
        currentEtaSeconds: number;
        distanceRemainingMeters: number;
        etaStatus: "EARLY" | "ON_TIME" | "LATE" | "CRITICAL";
      };
      proofOfDelivery: {
        type: "OTP" | "SIGNATURE" | "PHOTO";
        otpVerified: boolean;
        verifiedAt: string | null;
      };
    }>;
  }
}
```

**UI:** Show batch header info + expandable list of orders with status, address, items, and assignment details.

### Live Tracking (Tab on Batch Detail)

**Endpoint:** `GET /api/delivery/batches/:batchId/tracking`

**Poll every 10-15 seconds** when batch is `DISPATCHED` or `IN_PROGRESS`.

```typescript
interface BatchTracking {
  batchId: string;
  batchNumber: string;
  batchStatus: string;
  kitchenId: string;                   // Raw ObjectId (not populated)

  driver: {                            // null if no driver assigned or no location yet
    driverId: string;
    name: string;
    latitude: number;
    longitude: number;
    updatedAt: string;                 // ISO — show "last seen X sec ago"
    driverStatus: string;              // e.g. "AVAILABLE", "ON_DELIVERY"
  } | null;

  routeOptimization: {                 // null if route planning disabled
    algorithm: string;
    totalDistanceMeters: number;
    totalDurationSeconds: number;
    improvementPercent: number;
    optimizedAt: string;
  } | null;

  totalOrders: number;
  deliveredCount: number;
  failedCount: number;

  deliveries: Array<{
    orderId: string;
    orderNumber: string;
    orderStatus: string;               // Order status (PLACED, ACCEPTED, etc.)
    deliveryStatus: string | null;     // Assignment status (ASSIGNED, EN_ROUTE, DELIVERED, FAILED)
    coordinates: {                     // From order.deliveryAddress.coordinates
      latitude: number;
      longitude: number;
    } | null;
    distanceFromDriverMeters: number | null;
    etaSeconds: number | null;
    etaStatus: "EARLY" | "ON_TIME" | "LATE" | "CRITICAL" | null;
    sequence: {                        // null if no sequence set
      sequenceNumber: number;
      totalInBatch: number;
      source: "OPTIMIZED" | "MANUAL";
    } | null;
  }>;
}
```

**Two tabs on batch detail:**

**Tab 1: Map View**
- Use `react-native-maps` `MapView`
- **Driver marker:** Blue car icon at `driver.latitude`, `driver.longitude`. Update position on each poll. Show "last seen X sec ago" from `driver.updatedAt`.
- **Delivery markers:** Numbered pins using `deliveries[].sequence.sequenceNumber`. Color by `deliveryStatus`:
  - `null` / ASSIGNED: Gray (pending)
  - EN_ROUTE / ARRIVED: Yellow (active)
  - DELIVERED: Green
  - FAILED: Red
- **Route line:** Polyline connecting `deliveries[].coordinates` in `sequence.sequenceNumber` order
- **Callout on tap:** Order number, ETA (`etaSeconds`), distance (`distanceFromDriverMeters`)

**Tab 2: Timeline View**

```
Timeline
────────

1:02 PM   Batch created (5 orders)
1:15 PM   Route optimized — TWO_OPT, 4.2 km total
1:20 PM   Dispatched — Notified 3 drivers
1:21 PM   Rajesh K. accepted (Score: 87)
1:35 PM   Picked up from Sunrise Kitchen

── Deliveries ──

1:42 PM   ✅ Order #T-1234 — Rahul S. (DELIVERED)
1:51 PM   ✅ Order #T-1235 — Priya M. (DELIVERED)
1:58 PM   → Order #T-1236 — Amit K. (EN_ROUTE, ETA ~6 min)
  ----    ○ Order #T-1237 — Sneha R. (Pending)
  ----    ○ Order #T-1238 — Vikas T. (Pending)
```

---

## SCREEN 9: Manual Driver Reassignment

**When:** Batch is `DISPATCHED` or `IN_PROGRESS` and admin wants to change driver.

**Endpoint:** `PATCH /api/delivery/batches/:batchId/reassign`

### Request Body

```json
{
  "driverId": "new_driver_object_id",
  "reason": "Driver reported vehicle breakdown"
}
```

Both fields are **required**. `reason` must be 5-200 characters.

### Response

```json
{
  "success": true,
  "message": "Batch reassigned successfully",
  "data": { "batch": { /* updated batch object */ } }
}
```

**UI:** Button on batch detail → opens driver picker + reason text input → confirm → API call.

To get list of available drivers: `GET /api/admin/users?role=DRIVER&status=ACTIVE`.

---

## SCREEN 10: Cancel Batch

**When:** Batch needs to be cancelled (kitchen issues, all orders cancelled, etc.).

**Endpoint:** `PATCH /api/delivery/batches/:batchId/cancel`

### Request Body

```json
{
  "reason": "Kitchen unable to fulfill orders due to gas issue"
}
```

`reason` is **required**, 5-200 characters.

### Response

```json
{ "success": true, "message": "Batch cancelled" }
```

**UI:** Red "Cancel Batch" button → confirmation dialog with reason text input (min 5 chars) → API call.

---

## SCREEN 11: Delivery Statistics

**Location:** Delivery → Statistics / Reports

**Endpoint:** `GET /api/delivery/admin/stats`

### Query Params

| Param | Type | Description |
|-------|------|-------------|
| `dateFrom` | string | Start date (ISO) |
| `dateTo` | string | End date (ISO) |
| `zoneId` | string | Filter by zone |
| `driverId` | string | Filter by driver |

### Response

```json
{
  "success": true,
  "data": {
    "totalBatches": 156,
    "totalDeliveries": 847,
    "successRate": 94,
    "totalFailed": 52,
    "byZone": [
      {
        "_id": "zone_id",
        "zone": "Koramangala",
        "deliveries": 234,
        "successRate": 96
      },
      {
        "_id": "zone_id",
        "zone": "Indiranagar",
        "deliveries": 189,
        "successRate": 92
      }
    ]
  }
}
```

**UI:** Summary cards at top (total batches, deliveries, success rate, failed). Table/chart of per-zone performance below. Date range picker for filtering.

---

## DASHBOARD ADDITIONS

On the main admin dashboard, add a "Delivery Overview" card using the stats endpoint:

```
Today's Deliveries
══════════════════
Total Batches:    12
Total Deliveries: 47
Success Rate:     94%
Failed:            3
── By Zone ──
Koramangala:      18 deliveries (96%)
Indiranagar:      15 deliveries (92%)
HSR Layout:       14 deliveries (95%)
```

Use `GET /api/delivery/admin/stats?dateFrom=<today>&dateTo=<today>` to get today's data.

---

## ALL ADMIN ENDPOINTS REFERENCE

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/admin/config` | Read system config (routePlanning + driverAssignment) |
| `PUT` | `/api/admin/config` | Update system config |
| `GET` | `/api/delivery/config` | Read batch config (maxBatchSize, failedOrderPolicy) |
| `PUT` | `/api/delivery/config` | Update batch config |
| `POST` | `/api/delivery/auto-batch` | Trigger auto-batching |
| `POST` | `/api/delivery/dispatch` | Dispatch batches to drivers |
| `POST` | `/api/delivery/kitchen-reminder` | Send reminder to kitchen staff |
| `GET` | `/api/delivery/admin/batches` | List all batches with filters |
| `GET` | `/api/delivery/admin/stats` | Delivery statistics |
| `GET` | `/api/delivery/batches/:batchId` | Get single batch detail |
| `GET` | `/api/delivery/batches/:batchId/tracking` | Live tracking for a batch |
| `PATCH` | `/api/delivery/batches/:batchId/reassign` | Reassign driver (requires reason) |
| `PATCH` | `/api/delivery/batches/:batchId/cancel` | Cancel batch (requires reason) |

---

## IMPLEMENTATION ORDER

| Priority | Screen | Effort |
|----------|--------|--------|
| 1 | Route Planning Config (Screen 1) | Low (form with toggles/inputs) |
| 2 | Driver Assignment Config (Screen 2) | Low (form with sliders) |
| 3 | Batch Config (Screen 3) | Low (3 fields) |
| 4 | Auto-Batch + Dispatch (Screens 4-5) | Low (2 buttons with selectors) |
| 5 | Batch Monitoring List (Screen 7) | Medium (list with filters) |
| 6 | Batch Detail + Timeline (Screen 8) | Medium (detail + formatted list) |
| 7 | Batch Detail Map View (Screen 8) | Medium (map + markers + polling) |
| 8 | Delivery Statistics (Screen 11) | Medium (charts + date range) |
| 9 | Manual Reassignment (Screen 9) | Low (button + picker) |
| 10 | Cancel Batch (Screen 10) | Low (button + confirm dialog) |
| 11 | Kitchen Reminder (Screen 6) | Low (button + selector) |
| 12 | Dashboard delivery cards | Low (summary cards) |
