# Integration Plan - Connect Enhanced API to Existing Screens

## Current Situation

✅ **What Exists:**
- Complete module structure (orders, kitchen, menu, plans, cutoff)
- UI components for all modules
- AdminLoginScreen with navigation to all sections
- Mock data implementations
- Dashboard with mock data

✅ **What We Built:**
- Enhanced API service (auto-retry, caching, token refresh)
- TypeScript types matching real API
- Custom hooks (useApi, useMutation, useInfiniteScroll)
- Enhanced Dashboard with real API integration

## Goal

Replace mock data with real API calls across all existing screens using our enhanced API service.

---

## Phase 1: Dashboard (✅ COMPLETE)

Dashboard is already integrated with real API.

---

## Phase 2: Orders Module (NEXT)

### Current State
- Uses `mockOrders` from `src/modules/orders/models/mockOrders.ts`
- Full UI with filters, search, sorting
- Order details modal

### Migration Steps

#### 1. Update Order Types
**File:** `src/modules/orders/models/types.ts`

Current types → Update to match `src/types/api.types.ts`
- Ensure Order interface matches API response
- Add any missing fields

#### 2. Replace Mock Data with API
**File:** `src/modules/orders/screens/OrdersListScreen.tsx`

```typescript
// BEFORE (mock data)
import { mockOrders } from '../models/mockOrders';

// AFTER (real API)
import { useInfiniteScroll } from '../../../hooks/useApi';
import { Order } from '../../../types/api.types';

const { data: orders, loading, error, loadMore, hasMore, refresh } =
  useInfiniteScroll<Order>('/api/admin/orders', { limit: 20 });
```

#### 3. Update Order Details
**File:** `src/modules/orders/screens/OrderDetailScreen.tsx`

```typescript
// BEFORE
const order = mockOrders.find(o => o.id === orderId);

// AFTER
import { useApi } from '../../../hooks/useApi';

const { data: order, loading, error } = useApi<Order>(
  `/api/admin/orders/${orderId}`
);
```

#### 4. Add Status Update
**File:** `src/modules/orders/screens/OrderDetailScreen.tsx`

```typescript
import { useMutation } from '../../../hooks/useApi';

const { mutate: updateStatus, loading: updating } = useMutation(
  `/api/admin/orders/${orderId}/status`,
  'PATCH'
);

const handleStatusUpdate = async (newStatus: OrderStatus) => {
  const result = await updateStatus({ status: newStatus });
  if (result) {
    // Show success message
    refresh(); // Refresh order data
  }
};
```

---

## Phase 3: Users Module

### Current State
- UsersScreen with mock data
- User details screen
- Filter and search UI

### Migration Steps

#### 1. Update Users List
**File:** `src/screens/admin/UsersScreen.tsx`

```typescript
import { useInfiniteScroll } from '../../hooks/useApi';
import { User } from '../../types/api.types';

const { data: users, loading, error, loadMore, hasMore, refresh } =
  useInfiniteScroll<User>('/api/admin/users', { limit: 20 });
```

#### 2. Update User Details
**File:** `src/screens/admin/UserDetailsScreen.tsx`

```typescript
import { useApi, useMutation } from '../../hooks/useApi';
import { UserDetailsResponse } from '../../types/api.types';

const { data, loading, error } = useApi<UserDetailsResponse>(
  `/api/admin/users/${userId}`
);

const { mutate: suspendUser } = useMutation(
  `/api/admin/users/${userId}/suspend`,
  'PATCH'
);
```

---

## Phase 4: Kitchen Module

### Current State
- Kitchen management screen with mock data
- Staff assignment
- Menu management

### Migration Steps

#### 1. Update Kitchen List
**File:** `src/modules/kitchen/screens/KitchenManagementScreen.tsx`

```typescript
import { useInfiniteScroll } from '../../../hooks/useApi';
import { Kitchen } from '../../../types/api.types';

const { data: kitchens, loading, error, loadMore, hasMore, refresh } =
  useInfiniteScroll<Kitchen>('/api/admin/kitchens', { limit: 20 });
```

#### 2. Kitchen Approval
```typescript
import { useMutation } from '../../../hooks/useApi';

const { mutate: approveKitchen } = useMutation(
  `/api/admin/kitchens/${kitchenId}/approve`,
  'PATCH'
);
```

---

## Phase 5: Other Modules

### Plans Module
- Update to fetch from `/api/admin/plans`
- Add create/edit functionality

### Menu Module
- Update to fetch from kitchen's menu endpoint
- Real-time menu item updates

### Cutoff Times Module
- Fetch system configuration
- Update cutoff times

---

## Implementation Strategy

### Step-by-Step Approach

**Week 1: Orders Module**
1. Day 1: Update Order types to match API
2. Day 2: Replace OrdersList with real API
3. Day 3: Update OrderDetails with real API
4. Day 4: Add status update functionality
5. Day 5: Test and fix issues

**Week 2: Users + Kitchen**
1. Day 1-2: Users module migration
2. Day 3-4: Kitchen module migration
3. Day 5: Integration testing

**Week 3: Remaining Modules**
1. Day 1-2: Plans module
2. Day 3: Menu module
3. Day 4: Cutoff times
4. Day 5: Final testing and polish

---

## Migration Checklist (Per Module)

For each module, complete these steps:

### 1. Type Alignment
- [ ] Compare existing types with `src/types/api.types.ts`
- [ ] Update or remove mock types
- [ ] Ensure compatibility

### 2. Replace Mock Data
- [ ] Identify all `mock*` imports
- [ ] Replace with `useApi` or `useInfiniteScroll`
- [ ] Update component props if needed

### 3. Add Mutations
- [ ] Identify create/update/delete operations
- [ ] Use `useMutation` hook
- [ ] Add proper error handling

### 4. Test
- [ ] Test loading state
- [ ] Test error state
- [ ] Test successful data display
- [ ] Test create/update operations
- [ ] Test refresh functionality

### 5. Remove Mock Files
- [ ] Delete mock data files (after confirming API works)
- [ ] Remove unused utility functions
- [ ] Clean up imports

---

## Code Patterns to Follow

### Pattern 1: List with Infinite Scroll
```typescript
const { data, loading, error, loadMore, hasMore, refresh } =
  useInfiniteScroll<ItemType>('/api/endpoint', {
    limit: 20,
    initialParams: { status: 'ACTIVE' } // Optional filters
  });

// In FlatList
<FlatList
  data={data}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  refreshControl={
    <RefreshControl refreshing={loading && data.length > 0} onRefresh={refresh} />
  }
/>
```

### Pattern 2: Single Item Fetch
```typescript
const { data, loading, error, refresh } = useApi<ItemType>(
  `/api/endpoint/${itemId}`,
  { cache: 30000 } // 30 second cache
);

// Show loading/error/data
{loading ? <Loading /> : error ? <Error /> : <DataView data={data} />}
```

### Pattern 3: Create/Update/Delete
```typescript
const { mutate, loading, error } = useMutation<ItemType>(
  '/api/endpoint',
  'POST' // or 'PUT', 'PATCH', 'DELETE'
);

const handleSubmit = async (formData) => {
  const result = await mutate(formData);
  if (result) {
    // Success - show message, navigate back, etc.
  } else {
    // Error - show error message
  }
};
```

---

## Benefits of This Approach

✅ **Keeps Existing UI** - No need to rebuild screens
✅ **Gradual Migration** - One module at a time
✅ **Production Ready** - Uses enhanced API service (retry, caching, etc.)
✅ **Type Safe** - TypeScript ensures correctness
✅ **Testable** - Each module can be tested independently

---

## Next Immediate Steps

1. **Test Dashboard** - Ensure our enhanced integration works
2. **Start with Orders** - Highest priority, most critical
3. **Document Results** - Track what works, what needs adjustment
4. **Continue Module by Module** - Systematic approach

---

Ready to start? Let's begin with the Orders module! 🚀
