# Integration Guide for Admin Dashboard

## Quick Start

Follow these steps to integrate the new admin dashboard and analytics features into your application.

## Step 1: Update App.tsx

Replace your current dashboard and add new screens to the router.

### Import the new screens:

```typescript
// Add these imports at the top of App.tsx
import EnhancedDashboardScreen from './src/screens/admin/EnhancedDashboardScreen';
import {
  ReportsScreen,
  AuditLogsScreen,
  SystemConfigScreen,
  DeliveryConfigScreen,
} from './src/modules';
```

### Update the MainContent component:

Find your `MainContent` component and update the screen rendering logic:

```typescript
const MainContent: React.FC<{ onMenuPress: () => void }> = ({ onMenuPress }) => {
  const { currentScreen, navigate } = useNavigation();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard':
        return (
          <EnhancedDashboardScreen
            onMenuPress={onMenuPress}
            onNavigate={navigate}
          />
        );

      case 'Orders':
        return <OrdersScreen />;

      case 'Kitchens':
        return <KitchensManagementScreen />;

      case 'Zones':
        return <ZonesManagementScreen />;

      case 'MenuManagement':
        return <MenuListScreen />;

      case 'Subscriptions':
        return <SubscriptionsScreen />;

      case 'Users':
        return <UsersScreen />;

      case 'Reports':
        return <ReportsScreen />;

      case 'AuditLogs':
        return <AuditLogsScreen />;

      case 'SystemConfig':
        return <SystemConfigScreen />;

      case 'DeliveryConfig':
        return <DeliveryConfigScreen />;

      default:
        return (
          <EnhancedDashboardScreen
            onMenuPress={onMenuPress}
            onNavigate={navigate}
          />
        );
    }
  };

  return <View style={{ flex: 1 }}>{renderScreen()}</View>;
};
```

## Step 2: Update Sidebar.tsx

Update the sidebar menu to include new navigation items.

### Find the menuItems array and update it:

```typescript
const menuItems = [
  {
    name: 'Dashboard',
    icon: 'dashboard',
    screen: 'Dashboard' as ScreenName
  },
  {
    name: 'Orders',
    icon: 'shopping-cart',
    screen: 'Orders' as ScreenName
  },
  {
    name: 'Kitchens',
    icon: 'restaurant',
    screen: 'Kitchens' as ScreenName
  },
  {
    name: 'Zones',
    icon: 'location-on',
    screen: 'Zones' as ScreenName
  },
  {
    name: 'Menu',
    icon: 'menu-book',
    screen: 'MenuManagement' as ScreenName
  },
  {
    name: 'Subscriptions',
    icon: 'repeat',
    screen: 'Subscriptions' as ScreenName
  },
  {
    name: 'Users',
    icon: 'people',
    screen: 'Users' as ScreenName
  },
  {
    name: 'Reports',
    icon: 'insert-chart',
    screen: 'Reports' as ScreenName
  },
  {
    name: 'Audit Logs',
    icon: 'history',
    screen: 'AuditLogs' as ScreenName
  },
  {
    name: 'System Config',
    icon: 'settings',
    screen: 'SystemConfig' as ScreenName
  },
  {
    name: 'Delivery Config',
    icon: 'local-shipping',
    screen: 'DeliveryConfig' as ScreenName
  },
];
```

## Step 3: Test the Integration

### 1. Start your development server:

```bash
npm start
```

### 2. Run on Android:

```bash
npm run android
```

### 3. Run on iOS:

```bash
npm run ios
```

## Step 4: Verify Features

Test each feature to ensure everything is working:

### ✅ Dashboard
- [ ] Dashboard loads with overview tab
- [ ] Can switch between tabs (Overview, Orders, Delivery, Vouchers, Refunds)
- [ ] Pull-to-refresh works
- [ ] Charts display correctly
- [ ] Navigation to Orders and Kitchens works

### ✅ Reports
- [ ] Can select report type
- [ ] Can segment by Kitchen/Zone
- [ ] Date range picker works
- [ ] Data displays correctly
- [ ] Export button is visible

### ✅ Audit Logs
- [ ] Logs load with pagination
- [ ] Can filter by action type
- [ ] Can filter by entity type
- [ ] Infinite scroll loads more logs
- [ ] Tapping a log shows details modal

### ✅ System Config
- [ ] Configuration loads
- [ ] Can edit cutoff times
- [ ] Can edit fees
- [ ] Save button updates configuration
- [ ] Success message shows on save

### ✅ Delivery Config
- [ ] Configuration loads
- [ ] Slider adjusts max batch size
- [ ] Can select failed order policy
- [ ] Can set auto dispatch delay
- [ ] Save button updates configuration

## Step 5: Configure API URL (if needed)

If your backend API is running on a different URL, update it in:

`src/services/api.enhanced.service.ts`

```typescript
const API_BASE_URL = 'https://your-backend-api.com'; // Update this
```

Or use environment variables:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://tiffsy-backend.onrender.com';
```

## Optional Enhancements

### Add Settings Menu

If you want to group System Config and Delivery Config under a Settings submenu:

1. Create a Settings screen that lists both options
2. Update navigation to have a Settings parent screen
3. Add navigation logic to drill down into specific config screens

### Add Date Range Presets

Add quick date range selection in Reports and Analytics:

```typescript
const presets = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 3 months', days: 90 },
];
```

### Add Export Notifications

Show a notification when export is complete:

```typescript
import { PermissionsAndroid, Platform } from 'react-native';
// ... implement file download with notification
```

## Troubleshooting

### Issue: "Cannot find module"

**Solution**: Ensure all imports are correct and run:
```bash
npm install
cd android && ./gradlew clean && cd ..
npm start --reset-cache
```

### Issue: Charts not rendering

**Solution**:
1. Verify react-native-svg is installed:
   ```bash
   npm install react-native-svg
   ```
2. Rebuild the app:
   ```bash
   npm run android
   ```

### Issue: Type errors in navigation

**Solution**: Ensure NavigationContext.tsx includes all screen types:
```typescript
export type ScreenName =
  | 'Dashboard'
  | 'Orders'
  // ... all other screens
  | 'Reports'
  | 'AuditLogs'
  | 'SystemConfig'
  | 'DeliveryConfig';
```

### Issue: API calls failing

**Solution**:
1. Check if backend is running
2. Verify API URL is correct
3. Check authentication token in AsyncStorage
4. Review network logs in React Native Debugger

## Support

For questions or issues:
1. Check DASHBOARD_IMPLEMENTATION.md for detailed documentation
2. Review the API documentation provided
3. Examine the TypeScript types in admin-dashboard.service.ts

## Next Steps

After successful integration:

1. **Test with real data**: Connect to your backend API
2. **Customize styling**: Adjust colors and spacing to match your brand
3. **Add features**: Implement additional analytics or reports
4. **Optimize performance**: Add pagination where needed
5. **Add tests**: Write unit and integration tests
6. **Deploy**: Build production APK/IPA

---

**Congratulations!** 🎉 You've successfully integrated the comprehensive admin dashboard and analytics features into your Tiffsy Kitchen admin application.
