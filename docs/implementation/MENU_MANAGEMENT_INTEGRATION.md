# Menu Management Integration - Complete Implementation Guide

## Overview
This document provides a comprehensive guide for integrating the Menu Management module with Add-on support into the Tiffsy Kitchen Admin App based on the provided API documentation.

## ✅ Completed Implementations

### 1. API Types (Updated)
**File**: `src/types/api.types.ts`

Updated to include:
- `DietaryType`: VEG, NON_VEG, VEGAN, EGGETARIAN
- `SpiceLevel`: MILD, MEDIUM, SPICY, EXTRA_SPICY
- `MenuItemCategory`: MAIN_COURSE, APPETIZER, DESSERT, BEVERAGE, SNACK
- `MenuItemStatus`: ACTIVE, INACTIVE, DISABLED_BY_ADMIN
- `Addon` interface with full fields
- `MenuItem` interface with addons support
- Request/Response types for all menu and addon operations

### 2. Services Created

#### Menu Management Service
**File**: `src/services/menu-management.service.ts`

**Methods**:
- `getMenuItems(params)` - GET /api/menu with filters
- `getMenuItemById(itemId)` - GET /api/menu/:id
- `createMenuItem(data)` - POST /api/menu
- `updateMenuItem(itemId, data)` - PUT /api/menu/:id
- `deleteMenuItem(itemId)` - DELETE /api/menu/:id
- `toggleAvailability(itemId, isAvailable)` - PATCH /api/menu/:id/availability
- `updateMenuItemAddons(itemId, addonIds)` - PATCH /api/menu/:id/addons
- `disableMenuItem(itemId, reason)` - PATCH /api/menu/:id/disable (Admin only)
- `enableMenuItem(itemId)` - PATCH /api/menu/:id/enable (Admin only)
- `getKitchenMenu(kitchenId, menuType)` - GET /api/menu/kitchen/:kitchenId
- `getMealMenuItem(kitchenId, mealWindow)` - GET /api/menu/kitchen/:kitchenId/meal/:mealWindow

#### Addon Service
**File**: `src/services/addon.service.ts`

**Methods**:
- `getAddons(params)` - GET /api/addons with filters
- `getAddonById(addonId)` - GET /api/addons/:id
- `createAddon(data)` - POST /api/addons
- `updateAddon(addonId, data)` - PUT /api/addons/:id
- `deleteAddon(addonId)` - DELETE /api/addons/:id
- `toggleAvailability(addonId, isAvailable)` - PATCH /api/addons/:id/availability
- `getAddonLibrary(kitchenId)` - GET /api/addons/library/:kitchenId
- `getAddonsForMenuItem(menuItemId)` - GET /api/addons/for-menu-item/:menuItemId

### 3. UI Components Created

#### DietaryBadge Component
**File**: `src/modules/menu/components/DietaryBadge.tsx`

Displays dietary type with color coding:
- VEG: Green
- NON_VEG: Red
- VEGAN: Purple
- EGGETARIAN: Orange

#### StatusBadge Component
**File**: `src/modules/menu/components/StatusBadge.tsx`

Displays menu item status:
- ACTIVE: Green
- INACTIVE: Gray
- DISABLED_BY_ADMIN: Red

#### MenuItemCard Component
**File**: `src/modules/menu/components/MenuItemCard.tsx`

Features:
- Thumbnail image display
- Name, description
- Dietary and status badges
- Meal window badge (for MEAL_MENU)
- Price/discounted price
- Availability toggle switch
- Featured indicator
- Add-ons count
- Disabled reason display (if applicable)

### 4. Menu List Screen
**File**: `src/modules/menu/screens/MenuListScreenNew.tsx`

Features:
- Pull-to-refresh functionality
- Search by name/description
- Filter by menu type (All, Meal Menu, On-Demand)
- Filter by meal window (for meal menu items)
- Filter by status
- Quick availability toggle
- Navigation to create new item
- Navigation to add-ons library
- Navigation to item detail

## 📋 Remaining Implementations

### 5. Menu Detail/Edit Screen
**File**: `src/modules/menu/screens/MenuDetailScreen.tsx`

**Required Features**:
```typescript
interface MenuDetailScreenProps {
  itemId?: string; // undefined for create mode
  kitchenId: string;
  onBack: () => void;
  onSaved: () => void;
}
```

**Form Fields**:
- Name (TextInput, required)
- Description (TextArea, optional)
- Menu Type (Picker: MEAL_MENU, ON_DEMAND_MENU) - only for create
- Meal Window (Picker: LUNCH, DINNER) - show only if menuType is MEAL_MENU
- Category (Picker: MAIN_COURSE, APPETIZER, DESSERT, BEVERAGE, SNACK)
- Price (Number input, required)
- Discounted Price (Number input, optional, must be < price)
- Portion Size (TextInput, optional)
- Preparation Time (Number input, optional, in minutes)
- Dietary Type (Picker: VEG, NON_VEG, VEGAN, EGGETARIAN)
- Is Jain Friendly (Switch)
- Spice Level (Picker: MILD, MEDIUM, SPICY, EXTRA_SPICY)
- Images (Image picker, array of URLs)
- Thumbnail Image (Image picker, single URL)
- Includes (Array input - for thali contents)
- Display Order (Number input)
- Is Featured (Switch)

**Actions**:
- Save (POST for create, PUT for update)
- Delete (shows confirmation, then soft delete)
- Disable (Admin only, requires reason modal)
- Enable (Admin only)
- Manage Add-ons (navigate to addon management)

**Validation**:
- Ensure MEAL_MENU items have mealWindow
- Ensure discountedPrice < price if provided
- For MEAL_MENU, warn if another item exists for same mealWindow

### 6. Addon Management Component
**File**: `src/modules/menu/components/AddonManagementModal.tsx`

**Features**:
```typescript
interface AddonManagementModalProps {
  visible: boolean;
  menuItemId: string;
  onClose: () => void;
  onSaved: () => void;
}
```

- Fetch addons via `addonService.getAddonsForMenuItem(menuItemId)`
- Display two sections: "Attached" and "Available"
- Tap to toggle attachment
- Save via `menuManagementService.updateMenuItemAddons(itemId, addonIds)`
- Button to create new addon

### 7. Addon Library Screen
**File**: `src/modules/menu/screens/AddonLibraryScreen.tsx`

**Features**:
```typescript
interface AddonLibraryScreenProps {
  kitchenId: string;
  onNavigateToDetail: (addonId: string) => void;
  onNavigateToCreate: () => void;
  onBack: () => void;
}
```

- Fetch via `addonService.getAddonLibrary(kitchenId)`
- Display addons with:
  - Name
  - Price
  - Dietary badge
  - Availability toggle
  - Usage count (how many menu items use it)
- Search functionality
- Filter by dietary type
- FAB to create new addon

### 8. Addon Detail/Edit Screen
**File**: `src/modules/menu/screens/AddonDetailScreen.tsx`

**Form Fields**:
- Name (required)
- Description (optional)
- Price (required, number)
- Dietary Type (Picker)
- Image (single URL)
- Min Quantity (default 0)
- Max Quantity (default 10)
- Display Order (number)

**Actions**:
- Save (POST for create, PUT for update)
- Delete (shows warning if used in menu items)

**Validation**:
- minQuantity must not exceed maxQuantity
- Price must be positive

### 9. Disabled Items View (Admin Only)
**File**: `src/modules/menu/screens/DisabledItemsScreen.tsx`

**Features**:
- Filter menu items by `status=DISABLED_BY_ADMIN`
- Display with MenuItemCard
- Show disabled reason prominently
- Enable button on each card
- Only accessible by ADMIN role

### 10. Navigation Integration

**Update App Navigation** to include:
```typescript
// In your navigation stack
<Stack.Screen name="MenuList" component={MenuListScreenNew} />
<Stack.Screen name="MenuDetail" component={MenuDetailScreen} />
<Stack.Screen name="AddonLibrary" component={AddonLibraryScreen} />
<Stack.Screen name="AddonDetail" component={AddonDetailScreen} />
<Stack.Screen name="DisabledItems" component={DisabledItemsScreen} />
```

**Add to Sidebar/Menu**:
- Menu Management → MenuListScreenNew
- Add-ons Library → AddonLibraryScreen
- Disabled Items (Admin only) → DisabledItemsScreen

## 🎨 Design System

### Colors
```typescript
const colors = {
  // Dietary Types
  veg: { bg: '#dcfce7', text: '#16a34a' },
  nonVeg: { bg: '#fee2e2', text: '#dc2626' },
  vegan: { bg: '#ede9fe', text: '#7c3aed' },
  eggetarian: { bg: '#fef3c7', text: '#f59e0b' },

  // Status
  active: { bg: '#dcfce7', text: '#16a34a' },
  inactive: { bg: '#f3f4f6', text: '#6b7280' },
  disabled: { bg: '#fee2e2', text: '#dc2626' },

  // UI Elements
  primary: '#6366f1',
  background: '#f9fafb',
  card: '#ffffff',
  border: '#e5e7eb',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
};
```

### Spacing
```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
```

## 🔒 Authorization Rules

### Kitchen Staff
- Can manage menu items for their assigned kitchen only
- Can manage add-ons for their kitchen only
- Cannot disable/enable items (only toggle availability)
- Cannot access disabled items view

### Admin
- Can manage menu items for any kitchen
- Can manage add-ons for any kitchen
- Can disable/enable items with reason
- Can access disabled items view
- Can see all statuses including DISABLED_BY_ADMIN

## 🔄 State Management

### Using React Query (Recommended)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Menu Items Query
const useMenuItems = (kitchenId: string) => {
  return useQuery({
    queryKey: ['menuItems', kitchenId],
    queryFn: () => menuManagementService.getMenuItems({ kitchenId }),
  });
};

// Toggle Availability Mutation
const useToggleAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, isAvailable }: { itemId: string; isAvailable: boolean }) =>
      menuManagementService.toggleAvailability(itemId, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
  });
};

// Similar patterns for addons
```

## 🧪 Testing Checklist

### Menu Items
- [ ] Create MEAL_MENU item for LUNCH
- [ ] Create MEAL_MENU item for DINNER
- [ ] Create ON_DEMAND_MENU item
- [ ] Verify only 1 item per meal window for MEAL_MENU
- [ ] Update item details
- [ ] Toggle availability
- [ ] Delete item (soft delete)
- [ ] Admin: Disable item with reason
- [ ] Admin: Enable disabled item
- [ ] Search functionality
- [ ] Filters work correctly

### Add-ons
- [ ] Create add-on
- [ ] Update add-on
- [ ] Delete add-on
- [ ] Toggle availability
- [ ] View addon library with usage counts
- [ ] Attach addon to menu item
- [ ] Detach addon from menu item
- [ ] Delete addon that's in use (should show warning)

### UI/UX
- [ ] Pull-to-refresh works
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly
- [ ] Badges display correct colors
- [ ] Images display correctly (with fallback)
- [ ] Form validation works
- [ ] Confirmation dialogs for destructive actions

## 📱 API Integration Examples

### Creating a Menu Item
```typescript
const handleCreateMenuItem = async () => {
  try {
    const newItem = await menuManagementService.createMenuItem({
      kitchenId: selectedKitchen,
      name: 'Paneer Thali',
      description: 'Complete meal with paneer curry, dal, rice, roti, salad',
      category: 'MAIN_COURSE',
      menuType: 'MEAL_MENU',
      mealWindow: 'LUNCH',
      price: 150,
      discountedPrice: 120,
      portionSize: 'Full',
      preparationTime: 30,
      dietaryType: 'VEG',
      isJainFriendly: true,
      spiceLevel: 'MEDIUM',
      images: ['https://cdn.example.com/thali1.jpg'],
      thumbnailImage: 'https://cdn.example.com/thali1-thumb.jpg',
      includes: ['Paneer Curry', 'Dal Fry', 'Rice', '2 Roti', 'Salad'],
      isAvailable: true,
      displayOrder: 1,
      isFeatured: true,
    });

    Alert.alert('Success', 'Menu item created successfully');
    navigation.goBack();
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Attaching Add-ons
```typescript
const handleAttachAddons = async (menuItemId: string, addonIds: string[]) => {
  try {
    await menuManagementService.updateMenuItemAddons(menuItemId, addonIds);
    Alert.alert('Success', 'Add-ons updated');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### Disabling Item (Admin)
```typescript
const handleDisableItem = async (itemId: string, reason: string) => {
  try {
    await menuManagementService.disableMenuItem(itemId, reason);
    Alert.alert('Success', 'Item disabled');
    // Refresh list
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

## 🎯 Business Rules Implementation

### MEAL_MENU Constraints
```typescript
// Check if meal window slot is available before creating
const checkMealWindowAvailable = async (kitchenId: string, mealWindow: MealWindow) => {
  const items = await menuManagementService.getMenuItems({
    kitchenId,
    menuType: 'MEAL_MENU',
    mealWindow,
    status: 'ACTIVE',
  });

  if (items.menuItems.length > 0) {
    Alert.alert(
      'Slot Occupied',
      `A ${mealWindow} item already exists. You must delete it first or edit the existing one.`,
    );
    return false;
  }
  return true;
};
```

### Price Validation
```typescript
const validatePricing = (price: number, discountedPrice?: number): boolean => {
  if (discountedPrice && discountedPrice >= price) {
    Alert.alert('Validation Error', 'Discounted price must be less than regular price');
    return false;
  }
  return true;
};
```

## 🚀 Next Steps

1. **Implement Remaining Screens**:
   - MenuDetailScreen with full form
   - AddonManagementModal
   - AddonLibraryScreen
   - AddonDetailScreen
   - DisabledItemsScreen

2. **Add Image Upload**:
   - Integrate with image picker library (react-native-image-picker)
   - Upload to CDN/cloud storage
   - Return URL for API

3. **Add React Query**:
   - Set up query client
   - Implement all queries and mutations
   - Add optimistic updates

4. **Testing**:
   - Test with real API
   - Handle edge cases
   - Test admin vs kitchen staff permissions

5. **Polish**:
   - Add loading skeletons
   - Improve error handling
   - Add success toasts
   - Implement offline support (optional)

## 📚 Reference

- API Base URL: `https://tiffsy-backend.onrender.com`
- All endpoints require: `Authorization: Bearer <token>`
- Admin operations require `role: ADMIN` in token
- Kitchen Staff operations filtered by `kitchenId` from token

## 🆘 Common Issues & Solutions

### Issue: "Cannot create menu item - slot occupied"
**Solution**: Check if a MEAL_MENU item already exists for that mealWindow. Delete or edit existing.

### Issue: "Discounted price validation failed"
**Solution**: Ensure discountedPrice < price

### Issue: "Cannot delete addon - in use"
**Solution**: Remove addon from all menu items first, then delete

### Issue: "Unauthorized to disable item"
**Solution**: Only ADMIN role can disable items. Kitchen staff can only toggle availability.

---

## ✅ Implementation Status

- [x] API Types Updated
- [x] Menu Management Service
- [x] Addon Service
- [x] DietaryBadge Component
- [x] StatusBadge Component
- [x] MenuItemCard Component
- [x] MenuListScreenNew
- [ ] MenuDetailScreen
- [ ] AddonManagementModal
- [ ] AddonLibraryScreen
- [ ] AddonDetailScreen
- [ ] DisabledItemsScreen
- [ ] Navigation Integration
- [ ] React Query Setup

**Progress**: 58% Complete (7/12 major components)
