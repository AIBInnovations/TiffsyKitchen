# Orders Management Setup Guide

This guide will help you set up and use the Orders Management module in the TiffsyKitchen admin app.

## Prerequisites

Make sure you have the following dependencies installed:

```bash
npm install @tanstack/react-query date-fns
# or
yarn add @tanstack/react-query date-fns
```

## File Structure

```
src/
├── modules/
│   └── orders/
│       ├── screens/
│       │   ├── OrdersScreen.tsx           # Main orders list with stats and filters
│       │   └── OrderDetailAdminScreen.tsx # Order detail view
│       └── components/
│           ├── OrderCardAdmin.tsx         # Order card component
│           ├── OrderStatsCard.tsx         # Stats card component
│           ├── StatusTimeline.tsx         # Status timeline component
│           └── CancelOrderModal.tsx       # Cancel order modal
├── services/
│   └── orders.service.ts                  # Updated with new API methods
├── types/
│   └── api.types.ts                       # Updated with Order types
└── navigation/
    └── OrdersNavigator.tsx                # Updated navigation
```

## Setup Steps

### 1. Verify API Configuration

Ensure your API base URL is correctly set in `src/services/api.service.ts`:

```typescript
// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:5000/api';

// For iOS Simulator
const API_BASE_URL = 'http://localhost:5000/api';

// For Physical Device (replace with your local IP)
const API_BASE_URL = 'http://192.168.1.100:5000/api';
```

### 2. Verify React Query Setup

Make sure React Query is set up in your app's root component (usually `App.tsx`):

```typescript
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app content */}
    </QueryClientProvider>
  );
}
```

### 3. Navigation Setup

The navigation is already configured in [OrdersNavigator.tsx](src/navigation/OrdersNavigator.tsx). It includes:

- **OrdersList** → OrdersScreen (main list with stats)
- **OrderDetail** → OrderDetailAdminScreen (detail view)

Make sure the navigator is included in your drawer/tab navigator:

```typescript
import OrdersNavigator from './OrdersNavigator';

// In your DrawerNavigator or TabNavigator
<Drawer.Screen name="Orders" component={OrdersNavigator} />
```

### 4. Testing Backend Connection

Before testing the UI, verify your backend is running and accessible:

```bash
# Test from command line
curl http://10.0.2.2:5000/api/orders/admin/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

You should receive a response with order statistics.

## Usage

### Viewing Orders

1. Navigate to the **Orders** screen from the drawer/tab menu
2. You'll see:
   - Statistics cards at the top (scrollable)
   - Status filter tabs
   - List of orders

### Filtering Orders

- **By Status**: Tap on status tabs (All, Placed, Preparing, etc.)
- **Pull to Refresh**: Pull down to refresh the list
- **Infinite Scroll**: Scroll to bottom to load more orders

### Viewing Order Details

1. Tap on any order card
2. You'll see:
   - Customer information (tap phone to call)
   - Delivery address
   - Kitchen details
   - Order items with addons
   - Pricing breakdown
   - Voucher usage (if applicable)
   - Special instructions
   - Status timeline

### Cancelling an Order

1. Open order details
2. Tap **"Cancel Order"** button (visible for cancellable orders)
3. In the modal:
   - Enter cancellation reason (required)
   - Toggle "Issue Refund" if needed
   - Toggle "Restore Vouchers" if order used vouchers
4. Tap **"Confirm Cancellation"**
5. Order will be cancelled and list will refresh

**Note**: Orders can only be cancelled if they are in PLACED, ACCEPTED, PREPARING, or READY status.

## Customization

### Changing Colors

Status badge colors are defined in both `OrderCardAdmin.tsx` and `OrderDetailAdminScreen.tsx`:

```typescript
const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    PLACED: '#007AFF',      // Blue
    ACCEPTED: '#00C7BE',    // Cyan
    PREPARING: '#FFCC00',   // Yellow
    READY: '#FF9500',       // Orange
    // ... etc
  };
  return colors[status] || '#8E8E93';
};
```

### Changing Stats Displayed

Edit [OrdersScreen.tsx](src/modules/orders/screens/OrdersScreen.tsx) in the `renderStatsSection` function:

```typescript
<OrderStatsCard
  label="Your Custom Stat"
  value={statsData.yourValue}
  color="#YOUR_COLOR"
/>
```

### Adding More Filters

To add additional filters (e.g., by kitchen, zone, date range):

1. Add state for the filter
2. Update the `ordersService.getOrders()` call with new parameters
3. Add UI controls (dropdowns, date pickers, etc.)

## Troubleshooting

### Orders Not Loading

**Problem**: Orders list shows loading forever or error

**Solutions**:
1. Check API base URL configuration
2. Verify JWT token is valid and not expired
3. Check network connectivity
4. Inspect API response in network logs

```typescript
// Enable React Query DevTools for debugging
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <YourApp />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Cancel Order Not Working

**Problem**: Cancel order button doesn't appear or cancellation fails

**Solutions**:
1. Check if order status is cancellable (PLACED, ACCEPTED, PREPARING, READY)
2. Verify API endpoint `/api/orders/:id/admin-cancel` is correct
3. Check if reason is provided
4. Inspect error response from API

### Status Timeline Not Showing

**Problem**: Timeline appears empty

**Solutions**:
1. Verify `order.statusTimeline` array exists and has data
2. Check timestamp format is valid
3. Ensure `date-fns` is installed

### Phone Call Not Working

**Problem**: Tapping phone number doesn't open dialer

**Solutions**:
1. Check if phone number exists in order data
2. Verify Linking is imported from React Native
3. On Android, ensure CALL_PHONE permission if needed

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/orders/admin/all` | GET | List orders with filters |
| `/api/orders/:id` | GET | Get order details |
| `/api/orders/admin/stats` | GET | Get order statistics |
| `/api/orders/:id/admin-cancel` | PATCH | Cancel order |

### Query Parameters for List Endpoint

- `status` - Filter by OrderStatus
- `menuType` - MEAL_MENU or ON_DEMAND_MENU
- `dateFrom` - ISO date string
- `dateTo` - ISO date string
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `kitchenId` - Filter by kitchen
- `zoneId` - Filter by zone
- `userId` - Filter by customer

## Performance Tips

1. **Pagination**: Don't set limit too high (recommended: 20-50)
2. **Caching**: React Query caches data automatically
3. **Stale Time**: Adjust if needed:
   ```typescript
   useQuery({
     queryKey: ['orders'],
     queryFn: fetchOrders,
     staleTime: 5 * 60 * 1000, // 5 minutes
   });
   ```

4. **Background Refresh**: Orders will refresh in background automatically

## Security Considerations

1. **JWT Token**: Ensure token is securely stored in AsyncStorage
2. **Token Refresh**: Implement token refresh logic if tokens expire
3. **Sensitive Data**: Don't log sensitive customer information
4. **Cancel Permissions**: Only admins should be able to cancel orders

## Future Enhancements

Consider adding:
- [ ] Search by order number or customer name
- [ ] Date range filter with date picker
- [ ] Kitchen and zone filters
- [ ] Export orders to CSV
- [ ] Real-time updates via WebSocket
- [ ] Push notifications for new orders
- [ ] Order assignment to staff
- [ ] Bulk actions (cancel multiple orders)
- [ ] Order notes/comments

## Support

For issues or questions:
1. Check [ORDERS_IMPLEMENTATION.md](./ORDERS_IMPLEMENTATION.md) for detailed implementation info
2. Review API documentation in [orders-management-api.md](./orders-management-api.md)
3. Inspect network requests in React Native Debugger
4. Check console logs for errors

## Version History

- **v1.0.0** - Initial implementation
  - Orders list with stats and filters
  - Order detail view with timeline
  - Cancel order functionality
  - Voucher restoration support
