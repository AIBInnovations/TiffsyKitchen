# Menu Management - Quick Start Guide

## 🚀 What's Been Implemented

### ✅ Core Services
1. **Menu Management Service** - `src/services/menu-management.service.ts`
2. **Addon Service** - `src/services/addon.service.ts`

### ✅ UI Components
1. **DietaryBadge** - Color-coded dietary type badges
2. **StatusBadge** - Menu item status indicators
3. **MenuItemCard** - Complete menu item display card
4. **AddonManagementModal** - Modal for managing add-ons

### ✅ Screens
1. **MenuListScreenNew** - Main menu listing with filters
2. **MenuDetailScreen** - Create/Edit menu items
3. **AddonManagementModal** - Attach/detach add-ons

### ✅ API Types
- All types updated in `src/types/api.types.ts`

## 🔧 Integration Steps

### Step 1: Update Your Navigation

Add to your navigation stack:

```typescript
// In your App.tsx or navigation file
import { MenuListScreenNew } from './src/modules/menu/screens/MenuListScreenNew';
import { MenuDetailScreen } from './src/modules/menu/screens/MenuDetailScreen';

// Inside your Stack.Navigator
<Stack.Screen
  name="MenuList"
  component={MenuListScreenNew}
  options={{ title: 'Menu Management' }}
/>
<Stack.Screen
  name="MenuDetail"
  component={MenuDetailScreen}
  options={{ title: 'Menu Item' }}
/>
```

### Step 2: Create a Menu Management Container

Create `src/modules/menu/MenuManagementContainer.tsx`:

```typescript
import React, { useState } from 'react';
import { MenuListScreenNew } from './screens/MenuListScreenNew';
import { MenuDetailScreen } from './screens/MenuDetailScreen';
import { AddonManagementModal } from './components/AddonManagementModal';

interface MenuManagementContainerProps {
  kitchenId: string;
  userRole: 'ADMIN' | 'KITCHEN_STAFF';
}

type Screen = 'list' | 'detail' | 'addonManagement';

export const MenuManagementContainer: React.FC<MenuManagementContainerProps> = ({
  kitchenId,
  userRole,
}) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNavigateToDetail = (itemId?: string) => {
    setSelectedItemId(itemId);
    setCurrentScreen('detail');
  };

  const handleNavigateToList = () => {
    setCurrentScreen('list');
    setRefreshKey(prev => prev + 1);
  };

  const handleNavigateToAddonManagement = (itemId: string) => {
    setSelectedItemId(itemId);
    setCurrentScreen('addonManagement');
  };

  const handleSaved = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (currentScreen === 'detail') {
    return (
      <MenuDetailScreen
        itemId={selectedItemId}
        kitchenId={kitchenId}
        userRole={userRole}
        onBack={handleNavigateToList}
        onSaved={handleSaved}
        onNavigateToAddonManagement={handleNavigateToAddonManagement}
      />
    );
  }

  return (
    <>
      <MenuListScreenNew
        key={refreshKey}
        kitchenId={kitchenId}
        userRole={userRole}
        onNavigateToDetail={handleNavigateToDetail}
        onNavigateToCreate={() => handleNavigateToDetail(undefined)}
        onNavigateToAddons={() => {
          // Navigate to addon library (to be implemented)
        }}
      />

      <AddonManagementModal
        visible={currentScreen === 'addonManagement' && !!selectedItemId}
        menuItemId={selectedItemId || ''}
        onClose={() => setCurrentScreen('detail')}
        onSaved={handleSaved}
      />
    </>
  );
};
```

### Step 3: Use in Your App

```typescript
// In your main app or from kitchen management screen
import { MenuManagementContainer } from './src/modules/menu/MenuManagementContainer';

// Usage example:
<MenuManagementContainer
  kitchenId={selectedKitchen._id}
  userRole={currentUser.role}
/>
```

## 📝 Example Usage Patterns

### Creating a Menu Item

```typescript
import { menuManagementService } from './services/menu-management.service';

const createMealItem = async () => {
  try {
    const newItem = await menuManagementService.createMenuItem({
      kitchenId: 'kitchen_id_here',
      name: 'Paneer Thali',
      description: 'Complete meal with paneer curry, dal, rice, roti, salad',
      category: 'MAIN_COURSE',
      menuType: 'MEAL_MENU',
      mealWindow: 'LUNCH',
      price: 150,
      discountedPrice: 120,
      dietaryType: 'VEG',
      isJainFriendly: true,
      spiceLevel: 'MEDIUM',
      images: [],
      includes: ['Paneer Curry', 'Dal', 'Rice', '2 Roti', 'Salad'],
      isAvailable: true,
      displayOrder: 1,
      isFeatured: true,
    });

    console.log('Created:', newItem);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Attaching Add-ons

```typescript
import { menuManagementService } from './services/menu-management.service';

const attachAddonsToItem = async (itemId: string) => {
  try {
    const addonIds = ['addon_id_1', 'addon_id_2', 'addon_id_3'];

    const result = await menuManagementService.updateMenuItemAddons(itemId, addonIds);

    console.log('Updated item:', result.menuItem);
    console.log('Attached addons:', result.addons);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Creating an Add-on

```typescript
import { addonService } from './services/addon.service';

const createAddon = async () => {
  try {
    const newAddon = await addonService.createAddon({
      kitchenId: 'kitchen_id_here',
      name: 'Extra Roti',
      description: 'Freshly made tandoor roti',
      price: 15,
      dietaryType: 'VEG',
      minQuantity: 0,
      maxQuantity: 5,
      isAvailable: true,
      displayOrder: 1,
    });

    console.log('Created addon:', newAddon);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🎨 Customization

### Changing Colors

Edit the badge components to match your brand:

```typescript
// In DietaryBadge.tsx
const DIETARY_CONFIG = {
  VEG: { label: 'Veg', color: '#YOUR_COLOR', bgColor: '#YOUR_BG_COLOR' },
  // ... other types
};
```

### Adding More Filters

In `MenuListScreenNew.tsx`, add more filter states:

```typescript
const [selectedCategory, setSelectedCategory] = useState<MenuItemCategory | 'ALL'>('ALL');

// In useEffect for filtering:
if (selectedCategory !== 'ALL') {
  filtered = filtered.filter(item => item.category === selectedCategory);
}
```

## 🔒 Permission Handling

The components already handle role-based permissions:

- **Kitchen Staff**: Can manage items for their kitchen, toggle availability
- **Admin**: All Kitchen Staff permissions + can disable/enable items

To enforce on backend, the JWT token should include:
```json
{
  "userId": "...",
  "role": "ADMIN" | "KITCHEN_STAFF",
  "kitchenId": "..." // for kitchen staff
}
```

## 🧪 Testing Checklist

```markdown
- [ ] Can view list of menu items
- [ ] Search functionality works
- [ ] Filters work (menu type, meal window)
- [ ] Can create new MEAL_MENU item
- [ ] Can create new ON_DEMAND_MENU item
- [ ] Prevents multiple items for same meal window
- [ ] Can edit existing menu item
- [ ] Can toggle availability
- [ ] Can attach/detach add-ons
- [ ] Can create new add-on
- [ ] Admin can disable item with reason
- [ ] Admin can re-enable disabled item
- [ ] Can delete menu item
- [ ] Pull-to-refresh works
- [ ] Loading states display correctly
- [ ] Error messages are clear
```

## 🐛 Common Issues

### Issue: "Cannot read property '_id' of undefined"
**Fix**: Ensure `kitchenId` is passed correctly to all screens.

### Issue: Filters not working
**Fix**: Check that `useEffect` dependencies include all filter states.

### Issue: Add-ons modal doesn't update
**Fix**: Call `onSaved()` callback after successful save to trigger refresh.

### Issue: Images not displaying
**Fix**: Ensure image URLs are valid. Add placeholder image for missing thumbnails.

## 📚 Next Steps

1. **Implement Addon Library Screen** - Full CRUD for add-ons
2. **Add Image Upload** - Integrate with react-native-image-picker
3. **Add React Query** - For better caching and optimistic updates
4. **Create Disabled Items Screen** - Admin-only view for disabled items
5. **Add Animations** - Use react-native-reanimated for smoother transitions

## 🆘 Need Help?

Check the main documentation: [MENU_MANAGEMENT_INTEGRATION.md](./MENU_MANAGEMENT_INTEGRATION.md)

## 📞 API Endpoints Reference

All endpoints use base URL: `https://tiffsy-backend.onrender.com`

**Menu Items:**
- GET `/api/menu` - List items
- GET `/api/menu/:id` - Get item details
- POST `/api/menu` - Create item
- PUT `/api/menu/:id` - Update item
- DELETE `/api/menu/:id` - Delete item
- PATCH `/api/menu/:id/availability` - Toggle availability
- PATCH `/api/menu/:id/addons` - Update add-ons
- PATCH `/api/menu/:id/disable` - Disable (Admin)
- PATCH `/api/menu/:id/enable` - Enable (Admin)

**Add-ons:**
- GET `/api/addons` - List add-ons
- GET `/api/addons/:id` - Get add-on details
- POST `/api/addons` - Create add-on
- PUT `/api/addons/:id` - Update add-on
- DELETE `/api/addons/:id` - Delete add-on
- PATCH `/api/addons/:id/availability` - Toggle availability
- GET `/api/addons/library/:kitchenId` - Get kitchen's add-on library
- GET `/api/addons/for-menu-item/:menuItemId` - Get add-ons for item

---

**Implementation Progress: 80% Complete**

**Ready to use:**
- ✅ Core services
- ✅ Menu list with filters
- ✅ Menu create/edit
- ✅ Add-on management modal
- ✅ All API integrations

**Still needed:**
- ⏳ Add-on library screen (optional - can use modal)
- ⏳ Disabled items screen (Admin only)
- ⏳ Image upload integration
- ⏳ React Query setup (optional but recommended)
