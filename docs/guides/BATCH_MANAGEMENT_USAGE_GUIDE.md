# Batch Management Feature - Usage Guide

## Overview

The Batch Management feature has been successfully integrated into the admin app. Admin users can create and dispatch delivery batches for meal orders from any kitchen.

## Location

### Primary Access:
**Path:** Sidebar Menu → "Batch Management"

This opens the Batch Management Landing Screen where you can:
1. View all active kitchens
2. Search for kitchens by name or code
3. Select a kitchen to manage its delivery batches
4. Once a kitchen is selected, you can:
   - Choose meal window (Lunch or Dinner)
   - Create batches automatically using "Batch Orders"
   - Dispatch batches to drivers using "Dispatch to Drivers" (time-restricted)

### Alternative Access:
**Path:** Kitchens → Select a Kitchen → Delivery Batches Section → "Manage Delivery Batches" button

Alternatively: **Kitchens → Kitchen Detail Screen → Delivery Batches → Manage Delivery Batches**

## Features

### 1. **Auto-Batch Orders**
Groups unbatched orders into delivery batches automatically.

**How to Use:**
1. Navigate to Kitchen Management → Batches tab
2. Select meal window (LUNCH or DINNER)
3. Click **"Batch Orders"** button
4. Confirm the action
5. System will show how many batches were created and orders processed

**API Endpoint:** `POST /api/delivery/auto-batch`

**Request Body:**
```json
{
  "mealWindow": "LUNCH",
  "kitchenId": "your-kitchen-id"
}
```

### 2. **Dispatch Batches to Drivers**
Makes batches visible to drivers for acceptance and delivery.

**How to Use:**
1. Navigate to Kitchen Management → Batches tab
2. Select meal window (LUNCH or DINNER)
3. Click **"Dispatch to Drivers"** button
4. System checks if dispatch is allowed (must be after meal window end time)
5. Confirm the action
6. System will show how many batches were dispatched

**Important Timing:**
The dispatch timing is based on each kitchen's **operating hours** from their `operatingHours` configuration:
- **LUNCH:** Can only dispatch after the lunch `endTime` (e.g., 2:00 PM for a kitchen with lunch 11:00-14:00)
- **DINNER:** Can only dispatch after the dinner `endTime` (e.g., 10:00 PM for a kitchen with dinner 7:00-22:00)

The button will be disabled and show remaining time if it's too early to dispatch. Times are dynamically calculated based on each kitchen's specific operating hours.

**API Endpoint:** `POST /api/delivery/dispatch`

**Request Body:**
```json
{
  "mealWindow": "LUNCH"
}
```

### 3. **View Batches**
See all batches with filtering options.

**Features:**
- Real-time batch list with status badges
- Filter by status (ALL, COLLECTING, READY_FOR_DISPATCH, DISPATCHED, IN_PROGRESS, COMPLETED)
- Pull-to-refresh to update batch list
- View batch details (order count, driver assignment, creation time)

**Status Colors:**
- 🔵 **COLLECTING:** Blue - Orders being added, not visible to drivers
- 🟡 **READY_FOR_DISPATCH:** Yellow - Waiting for driver to accept
- 🌸 **DISPATCHED:** Pink - Driver accepted
- 🟣 **IN_PROGRESS:** Purple - Driver picked up, delivering
- 🟢 **COMPLETED:** Green - All orders delivered
- 🟠 **PARTIAL_COMPLETE:** Orange - Some orders delivered
- 🔴 **CANCELLED:** Red - Batch cancelled

## Components Added

### Files Created:
1. **`src/modules/kitchens/screens/BatchManagementScreen.tsx`**
   - Standalone batch management screen
   - Handles batch operations (create, dispatch, view)
   - Full-featured UI with filters and status badges

2. **`src/modules/kitchen/components/BatchManagementTab.tsx`** *(Legacy)*
   - Tab-based batch management component
   - Not currently in use but available for integration

### Files Modified:
3. **`src/services/delivery.service.ts`**
   - Added `autoBatchOrders()` method
   - Added `dispatchBatches()` method
   - Added `getBatches()` method for fetching batch list

4. **`src/modules/kitchens/screens/KitchenDetailScreen.tsx`**
   - Added "Delivery Batches" section
   - Added "Manage Delivery Batches" button with navigation

5. **`src/modules/kitchens/screens/index.ts`**
   - Exported `BatchManagementScreen`
   - Exported `BatchManagementLandingScreen`

6. **`src/context/NavigationContext.tsx`**
   - Added 'BatchManagement' to ScreenName type
   - Enables custom navigation system to route to batch management

7. **`src/components/common/Sidebar.tsx`**
   - Added "Batch Management" menu item to sidebar
   - Icon: 'local-shipping'
   - Position: After Kitchens, before Zones

8. **`App.tsx`**
   - Imported BatchManagementLandingScreen
   - Added 'BatchManagement' case to MainContent switch
   - Routes sidebar selection to BatchManagementLandingScreen

9. **`src/modules/kitchens/screens/BatchManagementLandingScreen.tsx`**
   - Updated to support both React Navigation and custom navigation
   - Added `onMenuPress` prop for custom navigation system
   - Header button switches between menu icon and back arrow based on navigation type

## API Integration Status

✅ **Service Methods Created:**
- `deliveryService.autoBatchOrders()` - Create batches
- `deliveryService.dispatchBatches()` - Dispatch batches to drivers
- `deliveryService.getBatches()` - Fetch batch list (for future implementation)

⚠️ **Note:** The `getBatches()` method is prepared but not yet connected in the UI. Currently the batch list shows an empty state. Once the backend API is available, uncomment the fetch logic in `BatchManagementTab.tsx` line ~88.

## Next Steps

### For Backend Integration:
1. Ensure these API endpoints are available and working:
   - `POST /api/delivery/auto-batch`
   - `POST /api/delivery/dispatch`
   - `GET /api/delivery/admin/batches`

2. Uncomment the batch fetching logic in `BatchManagementScreen.tsx` line ~110:
   ```typescript
   const loadBatches = async () => {
     setIsLoading(true);
     try {
       const result = await deliveryService.getBatches({
         kitchenId,
         status: filterStatus === 'ALL' ? undefined : filterStatus,
       });
       setBatches(result.batches);
     } catch (error) {
       console.error('Error loading batches:', error);
       Alert.alert('Error', 'Failed to load batches');
     } finally {
       setIsLoading(false);
       setIsRefreshing(false);
     }
   };
   ```

3. The `kitchenId` is automatically passed via navigation params, no manual configuration needed!

### For Testing:
1. Navigate to Kitchen Management screen
2. Click on the "Batches" tab
3. Try creating batches for LUNCH window
4. Wait until after 1:00 PM to test dispatch functionality
5. Verify error messages and disabled states work correctly

## Troubleshooting

**Issue:** "Kitchen ID is required for batching"
- **Solution:** Update the kitchenId prop in KitchenManagementScreen.tsx

**Issue:** "Cannot Dispatch Yet" message
- **Solution:** This is expected behavior before meal window end times. Wait until after 1 PM for LUNCH or 10 PM for DINNER.

**Issue:** Empty batch list
- **Solution:** The getBatches API integration needs to be completed. Currently showing empty state by design.

## UI Screenshots Reference

### Batch Management Tab Layout:
```
┌─────────────────────────────────────┐
│ Kitchen Management                  │
├─────────────────────────────────────┤
│ [Overview] [→Batches←] [Inventory]  │
├─────────────────────────────────────┤
│ Batch Operations                    │
│ ┌─────────┐ ┌─────────┐            │
│ │ ☀ Lunch │ │ ☾ Dinner│            │
│ └─────────┘ └─────────┘            │
│                                     │
│ [🔧 Batch Orders]                   │
│ [🚚 Dispatch to Drivers]            │
│                                     │
│ ℹ️ Dispatch available after 1:00 PM │
├─────────────────────────────────────┤
│ Filter: [All] [Collecting] [Ready]  │
├─────────────────────────────────────┤
│ Batches (0)                         │
│                                     │
│ 📦 No batches found                 │
│    Create batches by clicking       │
│    "Batch Orders"                   │
└─────────────────────────────────────┘
```

## Key Validation Rules

✅ **Auto-Batch:**
- Requires kitchenId
- Requires mealWindow selection
- Groups orders by zone automatically
- Max 15 orders per batch (configured in backend)

✅ **Dispatch:**
- Requires mealWindow selection
- Only works after meal window end time
- Changes batch status from COLLECTING → READY_FOR_DISPATCH
- Makes batches visible to drivers

## Support

For issues or questions, refer to:
- API documentation: `admin-batch-management-api.md`
- Backend endpoints: `/api/delivery/*`
