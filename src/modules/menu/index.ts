// NEW: Main Container for Menu Management
export { MenuManagementContainer } from './MenuManagementContainer';
export { default as MenuManagementContainerDefault } from './MenuManagementContainer';

// NEW: Menu Management Screens
export { MenuManagementMain } from './screens/MenuManagementMain';
export { MenuListScreenNew } from './screens/MenuListScreenNew';
export { MenuDetailScreen } from './screens/MenuDetailScreen';
export { AddonLibraryScreen } from './screens/AddonLibraryScreen';
export { AddonDetailScreen } from './screens/AddonDetailScreen';
export { DisabledItemsScreen } from './screens/DisabledItemsScreen';

// NEW: Menu Management Components
export { DietaryBadge } from './components/DietaryBadge';
export { StatusBadge } from './components/StatusBadge';
export { MenuItemCard } from './components/MenuItemCard';
export { AddonManagementModal } from './components/AddonManagementModal';

// Legacy Screens (still available)
export { MenuManagementScreen } from './screens';
export { MenuListScreen } from './screens/MenuListScreen';
export { AddEditMenuScreen } from './screens/AddEditMenuScreen';

// Legacy Components
export {
  MenuHeader,
  CityKitchenSelector,
  DateStrip,
  MealToggle,
  SavingIndicator,
  MenuDishItem,
  EmptyMenuState,
  CurrentMenuSection,
  DishCatalogSheet,
} from './components';

// Models & Types
export * from './models/types';

// Storage
export * from './storage/menuStorage';
