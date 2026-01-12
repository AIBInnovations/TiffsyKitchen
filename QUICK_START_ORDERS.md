# Quick Start Guide - Orders Management

## 🚀 Getting Started

All orders APIs are now fully integrated with UI components. Here's how to use them:

---

## 📱 Available Screens

### 1. Orders Management (Admin View)
**Component:** `OrdersScreen`
**Path:** `src/modules/orders/screens/OrdersScreen.tsx`

**Features:**
- View all orders across all kitchens
- Filter by status (ALL, PLACED, ACCEPTED, PREPARING, READY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED)
- Real-time statistics dashboard
- Pull to refresh
- Pagination

**Usage:**
```tsx
import { OrdersScreen } from './src/modules/orders/screens';

<OrdersScreen
  onMenuPress={() => navigation.openDrawer()}
  navigation={navigation}
/>
```

---

### 2. Order Detail (Admin View)
**Component:** `OrderDetailAdminScreen`
**Path:** `src/modules/orders/screens/OrderDetailAdminScreen.tsx`

**Features:**
- Complete order details
- Customer information with call button
- Delivery address
- Kitchen information
- Order items with addons
- Pricing breakdown
- Voucher usage info
- Status timeline
- **NEW: Track Order section** (collapsible)

**Available Actions:**
- ✅ Accept Order (Kitchen)
- ❌ Reject Order (Kitchen)
- 🔄 Update Status (Kitchen)
- 🚚 Update Delivery Status (Driver)
- 🚫 Cancel Order (Admin)

**Usage:**
```tsx
import { OrderDetailAdminScreen } from './src/modules/orders/screens';

<OrderDetailAdminScreen
  route={{ params: { orderId: 'order-id-here' }}}
  navigation={navigation}
/>
```

---

### 3. Kitchen Orders (Kitchen Staff View)
**Component:** `KitchenOrdersScreen`
**Path:** `src/modules/orders/screens/KitchenOrdersScreen.tsx`

**Features:**
- Simplified kitchen-focused view
- Date selector (Previous | Today | Next)
- Filter by Meal Window (Lunch/Dinner)
- Filter by Status (Placed/Accepted/Preparing/Ready)
- Highlights special instructions
- Shows order items clearly
- Shows delivery location

**Perfect For:**
- Kitchen staff managing daily orders
- Preparation workflow
- Quick status updates

**Usage:**
```tsx
import { KitchenOrdersScreen } from './src/modules/orders/screens';

<KitchenOrdersScreen
  onMenuPress={() => navigation.openDrawer()}
  navigation={navigation}
/>
```

---

## 🎯 Components

### Order Tracking Component
**Component:** `OrderTracking`
**Path:** `src/modules/orders/components/OrderTracking.tsx`

**Features:**
- Real-time order tracking (auto-refresh every 30s)
- Current status with color badge
- Estimated delivery time countdown
- Driver information with call button
- Delivery address
- Status timeline

**Usage:**
```tsx
import { OrderTracking } from './src/modules/orders/components';

<OrderTracking orderId="order-id-here" />
```

**Auto-Refresh:**
- Refreshes every 30 seconds automatically
- No manual refresh needed
- Perfect for live tracking

---

## 🎨 Status Color Reference

Use these colors for consistency:

```tsx
const STATUS_COLORS = {
  PLACED: '#007AFF',          // Blue
  ACCEPTED: '#00C7BE',        // Cyan
  PREPARING: '#FFCC00',       // Yellow
  READY: '#FF9500',           // Orange
  PICKED_UP: '#AF52DE',       // Purple
  OUT_FOR_DELIVERY: '#5856D6', // Indigo
  DELIVERED: '#34C759',       // Green
  CANCELLED: '#FF3B30',       // Red
  REJECTED: '#FF3B30',        // Red
  FAILED: '#8B0000',          // Dark Red
};
```

---

## 📋 Common Tasks

### Task 1: View Today's Orders
```tsx
// Navigate to Orders Screen
navigation.navigate('Orders');

// Orders are automatically loaded
// Pull down to refresh
```

### Task 2: Accept an Order (Kitchen)
```tsx
// 1. Navigate to order detail
navigation.navigate('OrderDetail', { orderId: 'xyz' });

// 2. Tap "Accept Order" button
// 3. Enter estimated prep time (in minutes)
// 4. Confirm

// Order status changes: PLACED → ACCEPTED
```

### Task 3: Update Order to Ready (Kitchen)
```tsx
// 1. Open order detail
// 2. Tap "Update Status" button
// 3. Select "READY" from dropdown
// 4. Add optional notes
// 5. Confirm

// Status flow: ACCEPTED → PREPARING → READY
```

### Task 4: Mark Order as Delivered (Driver)
```tsx
// 1. Open order detail
// 2. Tap "Delivery Status" button
// 3. Select "DELIVERED"
// 4. Enter OTP or take proof photo
// 5. Confirm

// Status flow: PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
```

### Task 5: Cancel Order with Refund (Admin)
```tsx
// 1. Open order detail
// 2. Tap "Cancel Order" button
// 3. Enter cancellation reason
// 4. Check "Issue Refund" if refunding
// 5. Check "Restore Vouchers" if order used vouchers
// 6. Confirm

// Refund is initiated automatically if selected
// Vouchers are restored to customer account
```

### Task 6: Track Order Live
```tsx
// 1. Open order detail
// 2. Tap "Track Order" button (expands tracking section)
// 3. View real-time status, driver info, and timeline
// 4. Component auto-refreshes every 30 seconds

// Driver info includes call button
// Shows estimated delivery time countdown
```

### Task 7: View Kitchen Orders for Lunch
```tsx
// 1. Navigate to Kitchen Orders Screen
// 2. Select "Lunch" from Meal Window filter
// 3. (Optional) Select date using date selector
// 4. (Optional) Filter by status (Placed, Preparing, etc.)

// Shows simplified view with items and special instructions
```

---

## 🔧 API Service Methods

All available in `ordersService`:

```tsx
import { ordersService } from './src/services/orders.service';

// Admin Operations
await ordersService.getOrders({ status, page, limit });
await ordersService.getOrderById(orderId);
await ordersService.getOrderStatistics();
await ordersService.cancelOrder(orderId, { reason, issueRefund, restoreVouchers });

// Kitchen Operations
await ordersService.getKitchenOrders({ status, mealWindow, date, page });
await ordersService.acceptOrder(orderId, estimatedPrepTime);
await ordersService.rejectOrder(orderId, reason);
await ordersService.updateOrderStatus(orderId, { status, notes });

// Driver Operations
await ordersService.updateDeliveryStatus(orderId, {
  status: 'DELIVERED',
  proofOfDelivery: { type: 'OTP', value: '1234' }
});

// Customer/Tracking
await ordersService.trackOrder(orderId);
```

---

## 🎯 Navigation Setup

Add these routes to your navigation stack:

```tsx
import {
  OrdersScreen,
  OrderDetailAdminScreen,
  KitchenOrdersScreen,
} from './src/modules/orders/screens';

const Stack = createStackNavigator();

function OrdersNavigator() {
  return (
    <Stack.Navigator>
      {/* Admin View - All Orders */}
      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ headerShown: false }}
      />

      {/* Order Detail */}
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailAdminScreen}
        options={{ headerShown: false }}
      />

      {/* Kitchen Staff View */}
      <Stack.Screen
        name="KitchenOrders"
        component={KitchenOrdersScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
```

---

## 💡 Pro Tips

1. **Auto-Refresh**: Order tracking refreshes every 30s automatically
2. **Pull-to-Refresh**: All list screens support pull-to-refresh
3. **Pagination**: Lists automatically load more as you scroll
4. **Filters**: Combine multiple filters for precise results
5. **Kitchen View**: Use date selector to prep for future orders
6. **Special Instructions**: Highlighted in yellow for visibility
7. **Call Actions**: Tap phone numbers to call directly
8. **Status Flow**: Follow the proper status sequence for smooth operations

---

## 🐛 Troubleshooting

### Orders not loading?
- Check internet connection
- Pull to refresh
- Check API token validity

### Can't accept order?
- Only PLACED orders can be accepted
- Check if you have kitchen permissions

### Can't cancel order?
- Orders can only be cancelled before PICKED_UP status
- Check if you have admin permissions

### Tracking not updating?
- Component auto-refreshes every 30s
- Check if order is in active delivery status
- Verify driver assignment

---

## 📊 Order Status Flow

```
PLACED
  ↓
ACCEPTED (Kitchen)
  ↓
PREPARING (Kitchen)
  ↓
READY (Kitchen)
  ↓
PICKED_UP (Driver)
  ↓
OUT_FOR_DELIVERY (Driver)
  ↓
DELIVERED (Driver)

Alternate Paths:
- PLACED → REJECTED (Kitchen declines)
- Any → CANCELLED (Before pickup, Admin/Customer)
- Any → FAILED (System error)
```

---

## 📝 Example Workflow

### Complete Order Flow Example

```tsx
// 1. Order is placed by customer → Status: PLACED
// Kitchen staff sees new order in Kitchen Orders Screen

// 2. Kitchen accepts order
navigation.navigate('OrderDetail', { orderId });
// Tap "Accept Order" → Enter prep time → Status: ACCEPTED

// 3. Kitchen starts preparation
// Tap "Update Status" → Select PREPARING → Status: PREPARING

// 4. Food is ready
// Tap "Update Status" → Select READY → Status: READY

// 5. Driver picks up order
// Tap "Delivery Status" → Select PICKED_UP → Status: PICKED_UP

// 6. Driver is on the way
// Tap "Delivery Status" → Select OUT_FOR_DELIVERY → Status: OUT_FOR_DELIVERY

// 7. Order delivered
// Tap "Delivery Status" → Select DELIVERED → Enter OTP → Status: DELIVERED

// 8. Customer can track throughout
// OrderTracking component shows real-time updates
```

---

## ✅ Checklist for Implementation

- [ ] Import required screens into navigation
- [ ] Add route configurations
- [ ] Test admin orders view
- [ ] Test kitchen orders view
- [ ] Test order detail screen
- [ ] Test order tracking component
- [ ] Verify all action buttons work
- [ ] Test filters and pagination
- [ ] Verify status colors match
- [ ] Test pull-to-refresh
- [ ] Test real-time tracking updates

---

## 🎉 You're Ready!

All orders APIs are integrated and working. The UI is production-ready with:
- ✅ Complete admin dashboard
- ✅ Kitchen staff workflow
- ✅ Driver delivery management
- ✅ Customer order tracking
- ✅ Real-time updates
- ✅ Error handling
- ✅ Loading states

**Happy coding!** 🚀
