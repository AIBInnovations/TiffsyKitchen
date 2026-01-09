# Phase 2 Implementation Plan - Admin Screens

## Overview

After testing the Dashboard, we'll implement the core admin management screens following the same production-grade architecture we established in Phase 1.

## Implementation Order (Priority-Based)

### Priority 1: Orders Management ⭐⭐⭐
**Why First:** Most critical for daily operations, high frequency of use

**Screens to Build:**
1. Orders List Screen (with filters and "Action Needed" tab)
2. Order Details Screen
3. Order Status Update Component

**API Endpoints:**
- `GET /api/admin/orders` - List orders with pagination
- `GET /api/admin/orders/:id` - Order details
- `PATCH /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/orders/statistics` - Order stats

**Features:**
- Infinite scroll list
- Filters: status, date range, kitchen, zone
- "Action Needed" tab (PLACED orders, rejected)
- Real-time status updates
- Search by order ID or customer name
- Bulk actions (future)

**Estimated Complexity:** Medium-High

---

### Priority 2: Users Management ⭐⭐
**Why Second:** Need to manage admins, kitchen staff, drivers

**Screens to Build:**
1. Users List Screen (with role filters)
2. User Details Screen
3. Create/Edit User Form
4. Suspend/Activate User Dialog

**API Endpoints:**
- `GET /api/admin/users` - List users with pagination
- `GET /api/admin/users/:id` - User details
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/:id` - Update user
- `PATCH /api/admin/users/:id/suspend` - Suspend user
- `PATCH /api/admin/users/:id/activate` - Activate user

**Features:**
- Filter by role (ADMIN, KITCHEN_STAFF, DRIVER, CUSTOMER)
- Filter by status (ACTIVE, SUSPENDED, INACTIVE)
- Search by name, phone, email
- User activity history
- Two-step confirmation for suspend/delete
- Form validation

**Estimated Complexity:** Medium

---

### Priority 3: Kitchens Management ⭐⭐
**Why Third:** Core to the business, manage kitchen approvals

**Screens to Build:**
1. Kitchens List Screen
2. Kitchen Details Screen
3. Kitchen Approval Screen
4. Edit Kitchen Form

**API Endpoints:**
- `GET /api/admin/kitchens` - List kitchens
- `GET /api/admin/kitchens/:id` - Kitchen details
- `POST /api/admin/kitchens` - Create kitchen
- `PATCH /api/admin/kitchens/:id` - Update kitchen
- `PATCH /api/admin/kitchens/:id/approve` - Approve kitchen
- `PATCH /api/admin/kitchens/:id/suspend` - Suspend kitchen

**Features:**
- Filter by type (TIFFSY, PARTNER)
- Filter by status (ACTIVE, PENDING_APPROVAL, SUSPENDED)
- Kitchen statistics (orders, ratings)
- Staff management (assign kitchen staff)
- Operating hours configuration
- Zones served management

**Estimated Complexity:** Medium-High

---

### Priority 4: Navigation System ⭐⭐⭐
**Why Critical:** Connect all screens together

**Implementation:**
1. Side Drawer Navigation
2. Stack Navigator for screen flow
3. Bottom Tabs (optional, for quick access)

**Screens to Connect:**
- Dashboard
- Orders
- Users
- Kitchens
- Zones
- Coupons
- Plans
- Settings

**Libraries Needed:**
```bash
npm install @react-navigation/native @react-navigation/drawer @react-navigation/stack
npm install react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context @react-native-community/masked-view
```

**Estimated Complexity:** Low-Medium

---

### Priority 5: Zones Management ⭐
**Why Lower:** Less frequent changes, simpler operations

**Screens to Build:**
1. Zones List Screen
2. Zone Details Screen
3. Create/Edit Zone Form

**API Endpoints:**
- `GET /api/admin/zones` - List zones
- `GET /api/admin/zones/:id` - Zone details
- `POST /api/admin/zones` - Create zone
- `PATCH /api/admin/zones/:id` - Update zone

**Features:**
- List all zones with status
- Enable/disable zones
- View kitchens serving each zone
- Pincode management

**Estimated Complexity:** Low

---

### Priority 6: Coupons Management ⭐
**Why Lower:** Marketing tool, less critical for daily ops

**Screens to Build:**
1. Coupons List Screen
2. Coupon Details Screen (with usage stats)
3. Create/Edit Coupon Form

**API Endpoints:**
- `GET /api/admin/coupons` - List coupons
- `GET /api/admin/coupons/:id` - Coupon details
- `POST /api/admin/coupons` - Create coupon
- `PATCH /api/admin/coupons/:id` - Update coupon
- `DELETE /api/admin/coupons/:id` - Delete coupon

**Features:**
- Filter by status (ACTIVE, EXPIRED, EXHAUSTED)
- Coupon usage statistics
- Date range validation
- Discount type handling (PERCENTAGE, FLAT, FREE_DELIVERY)
- Target user type selection

**Estimated Complexity:** Low-Medium

---

## Phase 2 Architecture Principles

### 1. Reusable Components
Create shared components for:
- List items (OrderListItem, UserListItem, KitchenListItem)
- Status badges
- Filter components
- Search bars
- Action buttons
- Empty states
- Loading skeletons

### 2. Consistent Patterns
Follow Dashboard patterns:
- Use `useApi` for GET requests
- Use `useMutation` for POST/PUT/PATCH/DELETE
- Use `useInfiniteScroll` for lists
- 30-second cache for lists
- Pull-to-refresh on all list screens
- Error handling with retry

### 3. Performance Optimizations
- Virtual lists for large datasets (FlatList with optimization)
- Image lazy loading (for kitchen logos)
- Debounced search (500ms)
- Optimistic updates (show change immediately, revert if fails)
- Background data prefetching

### 4. UX Enhancements
- Loading skeletons (better than spinners)
- Empty states with helpful messages
- Error states with clear actions
- Success toasts (brief confirmation)
- Two-step confirmations for destructive actions
- Form validation with clear error messages

---

## Implementation Strategy

### Week 1: Orders Management
**Day 1-2:**
- Orders List Screen
- Infinite scroll
- Filters (status, date)
- "Action Needed" tab

**Day 3-4:**
- Order Details Screen
- Status update functionality
- Order timeline
- Integration testing

**Day 5:**
- Polish UI
- Error handling
- Performance optimization

### Week 2: Users Management + Navigation
**Day 1-2:**
- Users List Screen
- User Details Screen
- Filters and search

**Day 3:**
- Create/Edit User Form
- Validation

**Day 4-5:**
- Navigation system (Drawer)
- Connect Dashboard, Orders, Users
- Test navigation flow

### Week 3: Kitchens + Zones
**Day 1-3:**
- Kitchens Management
- Kitchen approval flow
- Staff assignment

**Day 4-5:**
- Zones Management
- Connect to navigation
- Integration testing

### Week 4: Polish + Additional Features
**Day 1-2:**
- Coupons Management
- Refunds Management

**Day 3-4:**
- Reports and Analytics
- Settings screen

**Day 5:**
- Final testing
- Bug fixes
- Performance optimization

---

## Success Criteria

### For Each Screen:
✅ Fetches data from real API
✅ Displays loading state
✅ Handles errors gracefully
✅ Supports manual refresh
✅ Has proper TypeScript types
✅ Follows design system
✅ Performs well (no lag)
✅ Passes all test cases

### For Navigation:
✅ Smooth transitions
✅ Proper back navigation
✅ State preservation
✅ Deep linking support (future)

### For Overall App:
✅ No memory leaks
✅ No crashes
✅ Fast response times (<300ms UI)
✅ Works offline (cached data)
✅ Accessible (proper labels)

---

## Tech Stack Additions

### For Navigation:
```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/drawer": "^6.x",
  "@react-navigation/stack": "^6.x",
  "react-native-reanimated": "^3.x",
  "react-native-gesture-handler": "^2.x",
  "react-native-screens": "^3.x"
}
```

### For Enhanced UI:
```json
{
  "react-native-skeleton-content": "^1.x",  // Loading skeletons
  "react-native-toast-message": "^2.x",     // Toast notifications
  "react-native-modal": "^13.x",            // Modals/dialogs
  "react-native-date-picker": "^4.x"        // Date range filters
}
```

---

## Next Immediate Steps

1. **Test Current Implementation** (use TESTING_GUIDE.md)
2. **Document Test Results**
3. **Choose First Screen to Implement** (recommend: Orders List)
4. **Set up Navigation Structure**
5. **Build Orders Management**

---

Ready to proceed? Let's test the dashboard first, then we'll tackle Orders Management! 🚀
