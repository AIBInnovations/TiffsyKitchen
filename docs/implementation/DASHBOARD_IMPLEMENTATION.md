# Admin Dashboard & Analytics Implementation

## Overview

This document describes the comprehensive admin dashboard and analytics implementation for the Tiffsy Kitchen admin application.

## Features Implemented

### 1. Enhanced Dashboard (EnhancedDashboardScreen.tsx)

The main dashboard integrates all analytics in a tabbed interface:

#### Tabs:
- **Overview**: Main dashboard with KPIs, today's stats, pending actions, and recent activity
- **Orders**: Order analytics with status breakdown and menu type distribution
- **Delivery**: Delivery performance with zone-wise success rates
- **Vouchers**: Voucher statistics with redemption rates and meal window analysis
- **Refunds**: Refund analytics with status breakdown and top reasons

#### Key Features:
- Pull-to-refresh functionality
- Real-time data from API
- Interactive charts using react-native-chart-kit
- Responsive layout with NativeWind styling
- Navigation to other screens (Orders, Kitchens, Reports)

### 2. Reports Screen (ReportsScreen.tsx)

Generate and export detailed reports:

#### Features:
- Report type selection: Orders, Revenue, Vouchers, Refunds
- Segment by: Kitchen or Zone
- Date range filtering
- Export to CSV functionality
- Detailed data display with totals and averages

#### Location:
`src/modules/reports/screens/ReportsScreen.tsx`

### 3. Audit Logs Screen (AuditLogsScreen.tsx)

Complete audit trail with filtering:

#### Features:
- Infinite scroll pagination
- Filter by action type (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
- Filter by entity type (ORDER, USER, KITCHEN, MENU, VOUCHER, REFUND)
- Detailed log view modal
- User role and timestamp display

#### Location:
`src/modules/audit/screens/AuditLogsScreen.tsx`

### 4. System Configuration Screen (SystemConfigScreen.tsx)

Configure system-wide settings:

#### Settings Available:
- **Cutoff Times**: Lunch and dinner order cutoff times
- **Fees**: Delivery, service, packaging, handling, and tax rates
- **Cancellation Policy**: Window minutes and voucher order settings
- **Refund Settings**: Max retries and auto-process delay

#### Location:
`src/modules/settings/screens/SystemConfigScreen.tsx`

### 5. Delivery Configuration Screen (DeliveryConfigScreen.tsx)

Manage delivery batch settings:

#### Settings Available:
- **Max Batch Size**: Slider control (5-25 orders)
- **Failed Order Policy**: No Return, Return to Kitchen, Retry Delivery
- **Auto Dispatch Delay**: Minutes before automatic batch dispatch

#### Location:
`src/modules/settings/screens/DeliveryConfigScreen.tsx`

### 6. Admin Dashboard Service (admin-dashboard.service.ts)

Centralized API service with all endpoints:

#### Methods:
- `getDashboard()`: Main dashboard data
- `getReports()`: Generate reports with filters
- `getOrderStats()`: Order statistics
- `getDeliveryStats()`: Delivery performance
- `getVoucherStats()`: Voucher analytics
- `getRefundStats()`: Refund statistics
- `getAuditLogs()`: Paginated audit logs
- `getSystemConfig()`: System configuration
- `updateSystemConfig()`: Update system settings
- `getDeliveryConfig()`: Delivery configuration
- `updateDeliveryConfig()`: Update delivery settings
- `getUsers()`: User management
- `exportReport()`: Export reports to CSV/XLSX

#### Location:
`src/services/admin-dashboard.service.ts`

## Installation & Setup

### 1. Dependencies Installed

```bash
npm install react-native-chart-kit react-native-svg @react-native-community/slider
```

### 2. Navigation Updates

Updated `NavigationContext.tsx` to include new screen types:

```typescript
export type ScreenName =
  | 'Dashboard'
  | 'Orders'
  | 'Kitchens'
  | 'Zones'
  | 'MenuManagement'
  | 'Subscriptions'
  | 'Users'
  | 'Reports'
  | 'AuditLogs'
  | 'SystemConfig'
  | 'DeliveryConfig';
```

### 3. Usage in App.tsx

To use the enhanced dashboard, replace the existing DashboardScreen with:

```typescript
import EnhancedDashboardScreen from './src/screens/admin/EnhancedDashboardScreen';
import {
  ReportsScreen,
  AuditLogsScreen,
  SystemConfigScreen,
  DeliveryConfigScreen,
} from './src/modules';

// In your router/MainContent component:
case 'Dashboard':
  return <EnhancedDashboardScreen onMenuPress={toggleSidebar} onNavigate={navigate} />;
case 'Reports':
  return <ReportsScreen />;
case 'AuditLogs':
  return <AuditLogsScreen />;
case 'SystemConfig':
  return <SystemConfigScreen />;
case 'DeliveryConfig':
  return <DeliveryConfigScreen />;
```

### 4. Sidebar Menu Updates

Add menu items for new screens in `Sidebar.tsx`:

```typescript
const menuItems = [
  { name: 'Dashboard', icon: 'dashboard', screen: 'Dashboard' },
  { name: 'Orders', icon: 'shopping-cart', screen: 'Orders' },
  { name: 'Kitchens', icon: 'restaurant', screen: 'Kitchens' },
  { name: 'Zones', icon: 'location-on', screen: 'Zones' },
  { name: 'Menu', icon: 'menu-book', screen: 'MenuManagement' },
  { name: 'Subscriptions', icon: 'repeat', screen: 'Subscriptions' },
  { name: 'Users', icon: 'people', screen: 'Users' },
  { name: 'Reports', icon: 'insert-chart', screen: 'Reports' },
  { name: 'Audit Logs', icon: 'history', screen: 'AuditLogs' },
  { name: 'System Config', icon: 'settings', screen: 'SystemConfig' },
  { name: 'Delivery Config', icon: 'local-shipping', screen: 'DeliveryConfig' },
];
```

## API Integration

All screens use TanStack React Query for data fetching with:
- Automatic caching (30s - 1 minute stale time)
- Pull-to-refresh support
- Loading and error states
- Optimistic updates for configuration changes

### Example API Call:

```typescript
const { data, isLoading, refetch } = useQuery({
  queryKey: ['dashboard'],
  queryFn: () => adminDashboardService.getDashboard(),
  staleTime: 30000, // 30 seconds
});
```

## Chart Visualizations

### Charts Used:

1. **PieChart**: Order status breakdown
2. **BarChart**: Menu type distribution, meal window comparison
3. **ProgressChart**: Voucher redemption and expiry rates
4. **Custom Tables**: Zone-wise performance, refund reasons, audit logs

### Chart Configuration:

All charts use consistent theming:
- Primary color: `#f97316` (Orange)
- Success: `#22c55e` (Green)
- Error: `#ef4444` (Red)
- Warning: `#eab308` (Yellow)
- Info: `#3b82f6` (Blue)

## State Management

- **TanStack React Query**: Server state management
- **React State**: Local UI state (tabs, filters, modals)
- **AsyncStorage**: User preferences and filters (future enhancement)

## Error Handling

All screens include:
- Loading states with ActivityIndicator
- Error boundaries (implicit via React Query)
- Retry functionality
- Toast notifications for success/error actions
- Fallback UI for empty states

## Styling

- **NativeWind**: Tailwind CSS for React Native
- **Consistent Spacing**: 4px base unit
- **Typography**: System fonts with defined hierarchy
- **Colors**: Theme-based color system from `src/theme/colors.ts`

## Mobile Responsive

- Flexible grid layouts
- Horizontal scroll for filter chips
- Adaptive chart widths
- Touch-friendly tap targets (min 44x44)

## Performance Optimizations

1. **Query Caching**: Reduces API calls
2. **Infinite Scroll**: For audit logs (loads 20 items at a time)
3. **Lazy Loading**: Charts render only when tab is active
4. **Memoization**: Used in chart data transformations

## Testing Recommendations

1. Test with slow network (throttling)
2. Test pull-to-refresh functionality
3. Test filter combinations
4. Test pagination in audit logs
5. Verify configuration updates persist
6. Test export functionality

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live data
2. **Push Notifications**: For pending actions
3. **Advanced Filters**: Date range presets (Today, Last 7 days, Last 30 days)
4. **Downloadable Reports**: PDF export
5. **Dashboard Customization**: User-configurable widgets
6. **Dark Mode**: Theme switching
7. **Accessibility**: Screen reader support
8. **Offline Support**: Local data caching

## Troubleshooting

### Charts not displaying:
- Ensure react-native-svg is linked properly
- Check data format matches chart requirements
- Verify screen width calculation

### API errors:
- Check authentication token in AsyncStorage
- Verify backend API is running
- Check network connectivity
- Review API endpoint URLs

### Navigation not working:
- Ensure NavigationContext is properly updated
- Check ScreenName types match
- Verify MainContent router includes all cases

## File Structure

```
src/
├── services/
│   └── admin-dashboard.service.ts       # API service
├── screens/admin/
│   └── EnhancedDashboardScreen.tsx      # Main dashboard
├── modules/
│   ├── analytics/screens/
│   │   ├── OrderAnalyticsScreen.tsx
│   │   ├── DeliveryAnalyticsScreen.tsx
│   │   ├── VoucherAnalyticsScreen.tsx
│   │   └── RefundAnalyticsScreen.tsx
│   ├── reports/screens/
│   │   └── ReportsScreen.tsx
│   ├── audit/screens/
│   │   └── AuditLogsScreen.tsx
│   ├── settings/screens/
│   │   ├── SystemConfigScreen.tsx
│   │   └── DeliveryConfigScreen.tsx
│   └── index.ts                          # Module exports
└── context/
    └── NavigationContext.tsx             # Navigation setup
```

## Conclusion

This implementation provides a comprehensive admin dashboard with:
- Real-time analytics and monitoring
- Flexible reporting and export
- Complete audit trail
- Configurable system settings
- Modern, responsive UI
- Production-ready code

The dashboard is ready for integration into the main app and can be extended with additional features as needed.
