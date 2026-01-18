# Orders Management Implementation

## Overview

Comprehensive orders management system for the Tiffsy Kitchen admin dashboard with full CRUD operations, status management, delivery tracking, and real-time statistics.

## Features Implemented

### 1. **Order Service API Integration** ✅
Located: [`src/services/orders.service.ts`](src/services/orders.service.ts)

- ✅ Get all orders with filters (status, kitchen, zone, date, menuType)
- ✅ Get order by ID
- ✅ Get order statistics
- ✅ Cancel order (admin) with refund options
- ✅ Accept order (kitchen)
- ✅ Reject order (kitchen)
- ✅ Update order status
- ✅ Update delivery status
- ✅ Track order

### 2. **Order Action Modals** ✅

#### Accept Order Modal
[`src/modules/orders/components/AcceptOrderModal.tsx`](src/modules/orders/components/AcceptOrderModal.tsx)
- Kitchen can accept order
- Enter estimated preparation time (minutes)
- Quick select buttons: 15, 30, 45, 60 minutes
- Input validation

#### Reject Order Modal
[`src/modules/orders/components/RejectOrderModal.tsx`](src/modules/orders/components/RejectOrderModal.tsx)
- Kitchen can reject order
- Common rejection reasons (out of stock, capacity full, etc.)
- Custom reason input
- Confirmation dialog

#### Update Status Modal
[`src/modules/orders/components/UpdateStatusModal.tsx`](src/modules/orders/components/UpdateStatusModal.tsx)
- Update order preparation status
- Only shows valid next statuses in flow
- Optional notes field
- Status flow: PLACED → ACCEPTED → PREPARING → READY → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED

#### Delivery Status Modal
[`src/modules/orders/components/DeliveryStatusModal.tsx`](src/modules/orders/components/DeliveryStatusModal.tsx)
- Update delivery status (PICKED_UP, OUT_FOR_DELIVERY, DELIVERED)
- OTP verification for delivered status
- Optional delivery notes

### 3. **Enhanced Order Detail Screen** ✅
[`src/modules/orders/screens/OrderDetailAdminScreen.tsx`](src/modules/orders/screens/OrderDetailAdminScreen.tsx)

**New Features:**
- Dynamic action buttons based on order status
- Accept/Reject buttons for PLACED orders
- Update Status button for ACCEPTED/PREPARING/READY orders
- Delivery Status button for READY/PICKED_UP/OUT_FOR_DELIVERY orders
- Cancel button for cancellable orders
- Menu type badge (Meal Menu vs On-Demand)

**Action Buttons Show When:**
- **Accept Order**: Status = PLACED
- **Reject Order**: Status = PLACED
- **Update Status**: Status = ACCEPTED, PREPARING, or READY
- **Delivery Status**: Status = READY, PICKED_UP, or OUT_FOR_DELIVERY
- **Cancel Order**: Status = PLACED, ACCEPTED, PREPARING, or READY

### 4. **Order Statistics Dashboard** ✅
[`src/modules/orders/components/OrderStatsDashboard.tsx`](src/modules/orders/components/OrderStatsDashboard.tsx)

**Statistics Displayed:**
- Total orders today (prominent card)
- Orders by status (PLACED, ACCEPTED, PREPARING, READY, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED, CANCELLED)
- Orders by menu type (MEAL_MENU vs ON_DEMAND_MENU)
- Orders by meal window (LUNCH vs DINNER)
- Revenue today
- Average order value
- Refresh functionality

### 5. **Existing Orders Screen** ✅
[`src/modules/orders/screens/OrdersScreen.tsx`](src/modules/orders/screens/OrdersScreen.tsx)

Already has:
- Order listing with pagination
- Status filters
- Statistics cards
- Pull to refresh
- Navigation to order details

## Status Flow

### MEAL_MENU & ON_DEMAND_MENU:
```
PLACED → ACCEPTED → PREPARING → READY → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
```

### Alternate Paths:
- **PLACED → REJECTED** (by kitchen)
- **Any status before PICKED_UP → CANCELLED** (by admin)
- **DELIVERED** (completed)
- **Any → FAILED** (system error)

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/orders/admin/all` | GET | Fetch all orders with filters |
| `/api/orders/:id` | GET | Get order details |
| `/api/orders/admin/stats` | GET | Get order statistics |
| `/api/orders/:id/admin-cancel` | PATCH | Cancel order (admin) |
| `/api/orders/:id/accept` | PATCH | Accept order (kitchen) |
| `/api/orders/:id/reject` | PATCH | Reject order (kitchen) |
| `/api/orders/admin/:id/status` | PATCH | Update order status |
| `/api/orders/:id/delivery-status` | PATCH | Update delivery status |
| `/api/orders/:id/track` | GET | Track order |

## Usage Guide

### Admin Flow

#### 1. View All Orders
```tsx
// OrdersScreen already implements this
- See all orders with statistics
- Filter by status, menu type, date
- View order cards with key info
```

#### 2. View Order Details
```tsx
// Navigate to OrderDetailAdminScreen
- Click any order card
- See full order information
- Customer, delivery address, items, pricing, etc.
```

#### 3. Accept Order (if PLACED)
```tsx
1. Click "Accept Order" button
2. Enter estimated prep time (or use quick select)
3. Click "Accept Order" to confirm
4. Order status changes to ACCEPTED
```

#### 4. Reject Order (if PLACED)
```tsx
1. Click "Reject Order" button
2. Select reason or enter custom reason
3. Confirm rejection
4. Customer notified, refund initiated
```

#### 5. Update Order Status
```tsx
1. Click "Update Status" button (visible for ACCEPTED/PREPARING/READY)
2. Select next status in flow
3. Add optional notes
4. Click "Update Status"
```

#### 6. Update Delivery Status
```tsx
1. Click "Delivery Status" button (visible for READY/PICKED_UP/OUT_FOR_DELIVERY)
2. Select delivery status
3. For DELIVERED: enter OTP
4. Add optional notes
5. Click "Update Status"
```

#### 7. Cancel Order
```tsx
1. Click "Cancel Order" button (visible before PICKED_UP)
2. Enter cancellation reason
3. Choose refund options:
   - Issue Refund (toggle)
   - Restore Vouchers (toggle, if applicable)
4. Click "Confirm Cancellation"
5. Refund processed automatically
```

### Kitchen Staff Flow

For kitchen staff (separate kitchen app/portal):
1. See PLACED orders
2. Accept or reject based on capacity
3. Update status as food is prepared
4. Mark as READY when done

### Delivery Driver Flow

For delivery drivers (separate driver app):
1. See READY orders
2. Mark as PICKED_UP when collected
3. Mark as OUT_FOR_DELIVERY when en route
4. Enter OTP and mark as DELIVERED

## Components Structure

```
src/modules/orders/
├── components/
│   ├── AcceptOrderModal.tsx       ← NEW
│   ├── RejectOrderModal.tsx       ← NEW
│   ├── UpdateStatusModal.tsx      ← NEW
│   ├── DeliveryStatusModal.tsx    ← NEW
│   ├── OrderStatsDashboard.tsx    ← NEW
│   ├── CancelOrderModal.tsx       ← Existing (updated)
│   ├── OrderStatsCard.tsx         ← Existing
│   ├── StatusTimeline.tsx         ← Existing
│   └── index.ts                   ← Updated exports
├── screens/
│   ├── OrderDetailAdminScreen.tsx ← ENHANCED (action buttons)
│   └── OrdersScreen.tsx           ← Existing (already comprehensive)
└── services/
    └── orders.service.ts          ← ENHANCED (new methods)
```

## Status Colors

| Status | Color | Icon |
|--------|-------|------|
| PLACED | Blue (#007AFF) | receipt |
| ACCEPTED | Cyan (#00C7BE) | check-circle |
| PREPARING | Yellow (#FFCC00) | restaurant |
| READY | Orange (#FF9500) | done-all |
| PICKED_UP | Purple (#AF52DE) | local-shipping |
| OUT_FOR_DELIVERY | Indigo (#5856D6) | directions-bike |
| DELIVERED | Green (#34C759) | home |
| CANCELLED | Red (#FF3B30) | close |
| REJECTED | Red (#FF3B30) | cancel |
| FAILED | Dark Red (#8B0000) | error |

## Query Keys (React Query)

```tsx
['order', orderId]          // Single order
['orders', status, page]    // Order list with filters
['orderStats']              // Order statistics
```

## Error Handling

All mutations include proper error handling:
- Display user-friendly error messages
- Log errors for debugging
- Fallback to generic messages
- No silent failures

## Testing Checklist

- [ ] Accept order flow works
- [ ] Reject order flow works
- [ ] Status update flow works (all transitions)
- [ ] Delivery status update works
- [ ] Cancel order with refund works
- [ ] Cancel order with voucher restore works
- [ ] Statistics load correctly
- [ ] Filters work properly
- [ ] Pagination works
- [ ] Refresh works
- [ ] Navigation between screens works
- [ ] Error handling works
- [ ] Loading states display correctly
- [ ] Action buttons show/hide based on status
- [ ] OTP validation works for delivery

## Future Enhancements

1. **Real-time Updates**
   - WebSocket integration for live order status
   - Push notifications for new orders

2. **Bulk Operations**
   - Bulk accept orders
   - Bulk status updates

3. **Advanced Filters**
   - Date range picker
   - Multiple status selection
   - Kitchen selection
   - Zone selection

4. **Analytics**
   - Order trends chart
   - Peak hours analysis
   - Kitchen performance metrics

5. **Export**
   - Export orders to CSV/Excel
   - Generate reports

## Notes

- All modal components use proper loading states
- Mutations invalidate relevant queries for data consistency
- Components follow the existing design system
- TypeScript types are properly defined
- Error handling is comprehensive
- Components are reusable and maintainable

## Support

For issues or questions, contact the development team or refer to the API documentation.
