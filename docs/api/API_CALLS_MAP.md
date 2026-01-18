# API Calls Map - Where APIs Are Called

## Overview

This document shows exactly where each API is called in the codebase.

---

## 📍 Order Status Update API

### API Endpoint
```
PATCH /api/orders/:id/status
```

### Where It's Called

**1. Service Layer** ✅
**File:** [`src/services/orders.service.ts:144-155`](src/services/orders.service.ts#L144)

```typescript
async updateOrderStatus(
  orderId: string,
  params: UpdateOrderStatusParams
): Promise<Order> {
  // 👇 API CALL HERE
  const response = await apiService.patch(
    `/api/orders/${orderId}/status`,
    params
  );

  return response.data.order;
}
```

**Parameters:**
- `orderId`: string - The order ID
- `params`: { status: OrderStatus, notes?: string }

**Used for:** `ACCEPTED` → `PREPARING` → `READY`

---

**2. UI Component** ✅
**File:** [`src/modules/orders/screens/OrderDetailAdminScreen.tsx:140-157`](src/modules/orders/screens/OrderDetailAdminScreen.tsx#L140)

```typescript
// Update status mutation
const updateStatusMutation = useMutation({
  mutationFn: ({status, notes}: {status: OrderStatus; notes?: string}) =>
    // 👇 CALLS THE SERVICE METHOD
    ordersService.updateOrderStatus(orderId, {status, notes}),

  onSuccess: () => {
    // Refresh queries
    queryClient.invalidateQueries({queryKey: ['order', orderId]});
    queryClient.invalidateQueries({queryKey: ['orders']});
    queryClient.invalidateQueries({queryKey: ['orderStats']});
    Alert.alert('Success', 'Order status updated successfully');
    setShowUpdateStatusModal(false);
  },
  onError: (error: any) => {
    Alert.alert('Error', error?.response?.data?.error?.message);
  },
});
```

**Triggered by:** `UpdateStatusModal` component when user selects new status

---

**3. Update Status Modal** ✅
**File:** [`src/modules/orders/components/UpdateStatusModal.tsx`](src/modules/orders/components/UpdateStatusModal.tsx)

```typescript
const handleUpdate = async () => {
  if (!selectedStatus) return;

  try {
    setIsSubmitting(true);
    // 👇 TRIGGERS THE MUTATION
    await onUpdate(selectedStatus, notes || undefined);
    onClose();
  } catch (error) {
    console.error('Error updating status:', error);
  } finally {
    setIsSubmitting(false);
  }
};
```

**User Action:**
1. Admin clicks "Update Status" button
2. Modal opens
3. Admin selects new status (PREPARING or READY)
4. Admin optionally adds notes
5. Admin clicks "Update"
6. Modal calls `onUpdate(status, notes)`
7. Mutation calls `ordersService.updateOrderStatus(orderId, {status, notes})`
8. Service makes API call: `PATCH /api/orders/:id/status`

---

## 📍 All Order APIs - Call Chain

### 1. Get All Orders
```
GET /api/orders/admin/all

Service: ordersService.getOrders()
├─ File: src/services/orders.service.ts:35-57
└─ Called by: src/modules/orders/screens/OrdersScreen.tsx:62
    └─ useQuery hook fetches orders list
```

### 2. Get Order By ID
```
GET /api/orders/:id

Service: ordersService.getOrderById(orderId)
├─ File: src/services/orders.service.ts:63-84
└─ Called by: src/modules/orders/screens/OrderDetailAdminScreen.tsx:84
    └─ useQuery hook fetches single order details
```

### 3. Get Order Statistics
```
GET /api/orders/admin/stats

Service: ordersService.getOrderStatistics()
├─ File: src/services/orders.service.ts:86-131
└─ Called by: src/modules/orders/screens/OrdersScreen.tsx:50
    └─ useQuery hook fetches dashboard stats
```

### 4. Update Order Status (Kitchen)
```
PATCH /api/orders/:id/status

Service: ordersService.updateOrderStatus(orderId, {status, notes})
├─ File: src/services/orders.service.ts:144-155
└─ Called by: src/modules/orders/screens/OrderDetailAdminScreen.tsx:142
    └─ useMutation hook, triggered by UpdateStatusModal
        └─ User clicks "Update Status" button
```

### 5. Cancel Order (Admin)
```
PATCH /api/orders/:id/admin-cancel

Service: ordersService.cancelOrder(orderId, data)
├─ File: src/services/orders.service.ts:157-189
└─ Called by: src/modules/orders/screens/OrderDetailAdminScreen.tsx:187
    └─ useMutation hook, triggered by CancelOrderModal
        └─ User clicks "Cancel Order" button
```

### 6. Accept Order (Kitchen)
```
PATCH /api/orders/:id/accept

Service: ordersService.acceptOrder(orderId, estimatedPrepTime)
├─ File: src/services/orders.service.ts:287-303
└─ Called by: src/modules/orders/screens/OrderDetailAdminScreen.tsx:101
    └─ useMutation hook, triggered by AcceptOrderModal
        └─ User clicks "Accept Order" button
```

### 7. Reject Order (Kitchen)
```
PATCH /api/orders/:id/reject

Service: ordersService.rejectOrder(orderId, reason)
├─ File: src/services/orders.service.ts:305-321
└─ Called by: src/modules/orders/screens/OrderDetailAdminScreen.tsx:121
    └─ useMutation hook, triggered by RejectOrderModal
        └─ User clicks "Reject Order" button
```

### 8. Update Delivery Status (Driver)
```
PATCH /api/orders/:id/delivery-status

Service: ordersService.updateDeliveryStatus(orderId, data)
├─ File: src/services/orders.service.ts:323-345
└─ Called by: src/modules/orders/screens/OrderDetailAdminScreen.tsx:160
    └─ useMutation hook, triggered by DeliveryStatusModal
        └─ User clicks "Delivery Status" button
```

### 9. Track Order
```
GET /api/orders/:id/track

Service: ordersService.trackOrder(orderId)
├─ File: src/services/orders.service.ts:347-386
└─ Called by: src/modules/orders/components/OrderTracking.tsx
    └─ useQuery hook with 30s auto-refresh
        └─ User clicks "Track Order" button
```

### 10. Get Kitchen Orders
```
GET /api/orders/kitchen

Service: ordersService.getKitchenOrders(params)
├─ File: src/services/orders.service.ts:388-420
└─ Called by: src/modules/orders/screens/KitchenOrdersScreen.tsx:74
    └─ useQuery hook fetches kitchen orders
```

---

## 🔄 Request Flow

### Complete Request Chain

```
User Action (UI)
    ↓
Component Event Handler
    ↓
React Query Hook (useMutation/useQuery)
    ↓
Service Method (ordersService.*)
    ↓
API Service (apiService.patch/get/post)
    ↓
HTTP Request with Authorization Header
    ↓
Backend API (https://tiffsy-backend.onrender.com)
    ↓
Response Processing
    ↓
React Query Cache Update
    ↓
UI Re-render
```

### Example: Update Order Status Flow

```
1. User Action
   └─ Admin clicks "Update Status" button on OrderDetailAdminScreen

2. Modal Opens
   └─ UpdateStatusModal component renders

3. User Selects Status
   └─ Admin selects "PREPARING" from dropdown
   └─ Admin adds notes (optional)

4. User Confirms
   └─ Admin clicks "Update" button

5. Component Handler
   └─ UpdateStatusModal.handleUpdate() called

6. Mutation Triggered
   └─ updateStatusMutation.mutateAsync({status, notes})

7. Service Method Called
   └─ ordersService.updateOrderStatus(orderId, {status, notes})

8. API Request Made
   └─ apiService.patch(`/api/orders/${orderId}/status`, {status, notes})

9. HTTP Request Sent
   PATCH https://tiffsy-backend.onrender.com/api/orders/12345/status
   Headers: {
     Authorization: Bearer <token>,
     Content-Type: application/json
   }
   Body: {
     status: "PREPARING",
     notes: "Started preparation"
   }

10. Backend Processes
    └─ Validates token
    └─ Checks permissions
    └─ Updates order in database
    └─ Returns updated order

11. Response Received
    {
      success: true,
      message: "Order status updated",
      data: {
        order: { ...updated order data... }
      }
    }

12. Service Returns
    └─ Returns response.data.order

13. Mutation onSuccess
    └─ Invalidates React Query caches
    └─ Shows success alert
    └─ Closes modal

14. UI Updates
    └─ Order detail screen refreshes
    └─ Status badge updates
    └─ Timeline updates
```

---

## 📋 Quick Reference

### Update Order Status

**Where to find the code:**
```
Service:    src/services/orders.service.ts:144-155
Component:  src/modules/orders/screens/OrderDetailAdminScreen.tsx:140-157
Modal:      src/modules/orders/components/UpdateStatusModal.tsx
```

**How to trigger:**
1. Navigate to order detail screen
2. Click "Update Status" button
3. Select new status
4. Click "Update"

**API Call:**
```typescript
PATCH /api/orders/:id/status
Body: { status: "PREPARING", notes: "Optional notes" }
Headers: { Authorization: "Bearer <token>" }
```

---

## 🐛 Debugging API Calls

### Check API Logs

The API service logs all requests/responses. Look for:

```
========== API SERVICE REQUEST ==========
Endpoint: https://tiffsy-backend.onrender.com/api/orders/123/status
Method: PATCH
Token Retrieved from Storage: YES
Authorization Header Set: Bearer eyJ...
Request Body: {"status":"PREPARING","notes":"..."}
=========================================

========== API SERVICE RESPONSE ==========
Status Code: 200
Status Text: OK
Response OK: true
==========================================
```

### Common Issues

**403 Forbidden:**
- Token missing or invalid
- User doesn't have required role
- Solution: Check FIX_403_FORBIDDEN_ERROR.md

**404 Not Found:**
- Order ID doesn't exist
- Wrong endpoint URL

**400 Bad Request:**
- Invalid status value
- Missing required fields

---

## ✅ Summary

**All API calls flow through:**
1. **UI Components** (Button clicks)
2. **React Query Hooks** (useMutation/useQuery)
3. **Service Layer** (ordersService.*)
4. **API Service** (apiService.*)
5. **Backend API** (https://tiffsy-backend.onrender.com)

**Console logs removed from:**
- ✅ `getOrderById()` method (removed 80+ lines of logs)
- ✅ All methods now have clear documentation comments

**API documentation added:**
- ✅ Clear comments showing endpoint paths
- ✅ Parameter descriptions
- ✅ Return type documentation
