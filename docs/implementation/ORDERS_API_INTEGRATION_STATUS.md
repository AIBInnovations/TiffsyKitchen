# Orders API Integration Status

## ✅ Fully Integrated APIs

| # | Endpoint | Method | Purpose | Status |
|---|----------|--------|---------|--------|
| 1 | `/api/orders/admin/all` | GET | List all orders with filters | ✅ Integrated |
| 2 | `/api/orders/:id` | GET | Get order details | ✅ Integrated |
| 3 | `/api/orders/admin/stats` | GET | Get order statistics | ✅ Integrated |
| 4 | `/api/orders/:id/admin-cancel` | PATCH | Admin cancel order | ✅ Integrated |
| 5 | `/api/orders/:id/accept` | PATCH | Kitchen accept order | ✅ Integrated |
| 6 | `/api/orders/:id/reject` | PATCH | Kitchen reject order | ✅ Integrated |
| 7 | `/api/orders/:id/delivery-status` | PATCH | Driver update delivery status | ✅ Integrated |
| 8 | `/api/orders/:id/track` | GET | Track order status | ✅ Integrated |

## ❌ Missing APIs (Not in UI)

| # | Endpoint | Method | Purpose | Impact |
|---|----------|--------|---------|--------|
| 1 | `/api/orders/kitchen` | GET | Get orders for kitchen staff | **HIGH** - Kitchen staff view missing |

### API #1: Kitchen Orders Endpoint

**Documentation Says:**
```
GET /api/orders/kitchen?status=PLACED&mealWindow=LUNCH&date=2025-01-10
```

**What it does:**
- Get orders specifically for kitchen staff
- Filters by status, mealWindow, date
- Shows simplified order view (no full customer details)
- Paginated results

**Why it's missing:**
- Current implementation uses admin endpoint for everything
- No dedicated kitchen staff screen

**Recommendation:**
- Create a `KitchenOrdersScreen.tsx` component
- Use this endpoint instead of admin endpoint for kitchen views
- Shows only relevant info for kitchen (items, instructions, address locality)

## ⚠️ API Implementation Issues

### Issue 1: Wrong Endpoint in `updateOrderStatus`

**File:** `src/services/orders.service.ts:220`

**Current Code:**
```typescript
async updateOrderStatus(
  orderId: string,
  params: UpdateOrderStatusParams
): Promise<Order> {
  const response = await apiService.patch<{
    success: boolean;
    message: string;
    data: { order: Order };
  }>(`/api/orders/admin/${orderId}/status`, params);  // ❌ WRONG

  return response.data.order;
}
```

**Documentation Says:**
```
PATCH /api/orders/:id/status  // ✅ CORRECT
```

**Fix Required:**
```typescript
async updateOrderStatus(
  orderId: string,
  params: UpdateOrderStatusParams
): Promise<Order> {
  const response = await apiService.patch<{
    success: boolean;
    message: string;
    data: { order: Order };
  }>(`/api/orders/${orderId}/status`, params);  // ✅ FIXED

  return response.data.order;
}
```

## 📊 Feature Completeness

### Admin Dashboard ✅
- [x] View all orders
- [x] Filter by status, kitchen, zone, date, menuType
- [x] View order details
- [x] Cancel orders with refund
- [x] Order statistics dashboard
- [x] Status timeline view

### Kitchen View ❌
- [ ] Dedicated kitchen orders endpoint
- [x] Accept/Reject orders
- [x] Update preparation status
- [ ] Simplified kitchen-focused UI

### Driver View ✅
- [x] Update delivery status
- [x] Mark as picked up
- [x] Mark as delivered with proof

### Customer View ✅
- [x] Track order status
- [x] View status timeline
- [x] See driver info

## 🎯 Recommendations

### High Priority
1. **Fix endpoint URL** in `updateOrderStatus` method
2. **Add Kitchen Orders Screen** using `/api/orders/kitchen` endpoint

### Medium Priority
3. Add real-time order updates (WebSocket/Polling)
4. Add order assignment to staff feature

### Low Priority
5. Add bulk order operations
6. Add order export functionality

## Implementation Guide

### Fix #1: Correct updateOrderStatus Endpoint

**File to edit:** `src/services/orders.service.ts`

**Line:** 220

**Change:**
```diff
- }>(`/api/orders/admin/${orderId}/status`, params);
+ }>(`/api/orders/${orderId}/status`, params);
```

### Fix #2: Add Kitchen Orders Feature

**New file:** `src/modules/orders/screens/KitchenOrdersScreen.tsx`

**API Method to add:**
```typescript
// In orders.service.ts
async getKitchenOrders(params?: {
  status?: OrderStatus;
  mealWindow?: 'LUNCH' | 'DINNER';
  date?: string;
  page?: number;
  limit?: number;
}): Promise<OrderListResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/orders/kitchen${queryString ? `?${queryString}` : ''}`;

  const response = await apiService.get<{
    success: boolean;
    data: OrderListResponse;
  }>(endpoint);

  return response.data;
}
```

## Testing Checklist

After implementing fixes:

- [ ] Test updateOrderStatus with PREPARING → READY
- [ ] Test kitchen orders endpoint with filters
- [ ] Verify response structure matches documentation
- [ ] Test pagination in kitchen view
- [ ] Test meal window filters (LUNCH/DINNER)
- [ ] Test date filters for kitchen orders

## Summary

**Overall Integration: 89% Complete**

- ✅ 8 out of 9 endpoints integrated
- ⚠️ 1 endpoint URL incorrect
- ❌ 1 endpoint not used in UI

**Action Required:**
1. Fix endpoint URL (5 minutes)
2. Add kitchen orders screen (2-3 hours)
3. Test all functionality (30 minutes)
