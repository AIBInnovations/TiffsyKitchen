/**
 * Role-Based Access Control (RBAC) Utility
 *
 * This module defines permissions and access control for different user roles
 * in the Tiffsy Kitchen Admin App.
 */

import { UserRole } from '../types/user';

// Define available screens in the app
export type ScreenName =
  | 'Dashboard'
  | 'Orders'
  | 'OrdersList'
  | 'KitchenOrders'
  | 'Batches'
  | 'MenuManagement' // Changed from 'Menu' to match NavigationContext
  | 'Addons'
  | 'KitchenProfile'
  | 'Zones'
  | 'Users'
  | 'Subscriptions'
  | 'Kitchens' // Changed from 'KitchenManagement' to match NavigationContext
  | 'KitchenApprovals'
  | 'DriverApprovals'
  | 'DeliveryConfig'
  | 'SystemConfig'
  | 'CutoffTimes'
  | 'Reports'
  | 'BatchManagement'; // Added to match NavigationContext

// Define menu items structure
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  screen: ScreenName;
  roles: UserRole[]; // Which roles can access this screen
}

// All menu items with their role permissions
export const ALL_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    label: 'Dashboard',
    icon: 'dashboard',
    screen: 'Dashboard',
    roles: ['ADMIN', 'KITCHEN_STAFF'], // Both can access dashboard (but different data)
  },
  {
    id: '2',
    label: 'Orders',
    icon: 'inventory-2',
    screen: 'Orders',
    roles: ['ADMIN', 'KITCHEN_STAFF'], // Both can manage orders
  },
  {
    id: '3',
    label: 'Batches',
    icon: 'local-shipping',
    screen: 'BatchManagement',
    roles: ['ADMIN', 'KITCHEN_STAFF'], // Both can view batches
  },
  {
    id: '4',
    label: 'Menu',
    icon: 'restaurant-menu',
    screen: 'MenuManagement',
    roles: ['ADMIN', 'KITCHEN_STAFF'], // Both can manage menu
  },
  {
    id: '5',
    label: 'Kitchen Profile',
    icon: 'store',
    screen: 'KitchenProfile',
    roles: ['KITCHEN_STAFF'], // Kitchen staff can view their kitchen profile
  },
  {
    id: '6',
    label: 'Zones',
    icon: 'location-on',
    screen: 'Zones',
    roles: ['ADMIN'], // Admin only
  },
  {
    id: '7',
    label: 'Users',
    icon: 'people',
    screen: 'Users',
    roles: ['ADMIN'], // Admin only
  },
  {
    id: '8',
    label: 'Subscriptions',
    icon: 'credit-card',
    screen: 'Subscriptions',
    roles: ['ADMIN'], // Admin only
  },
  {
    id: '9',
    label: 'Kitchen Management',
    icon: 'store',
    screen: 'Kitchens',
    roles: ['ADMIN'], // Admin only
  },
  {
    id: '10',
    label: 'Kitchen Approvals',
    icon: 'approval',
    screen: 'KitchenApprovals',
    roles: ['ADMIN'], // Admin only
  },
  {
    id: '11',
    label: 'Driver Approvals',
    icon: 'directions-car',
    screen: 'DriverApprovals',
    roles: ['ADMIN'], // Admin only
  },
  {
    id: '12',
    label: 'Delivery Config',
    icon: 'settings',
    screen: 'DeliveryConfig',
    roles: ['ADMIN'], // Admin only
  },
  {
    id: '13',
    label: 'System Config',
    icon: 'settings-applications',
    screen: 'SystemConfig',
    roles: ['ADMIN'], // Admin only
  },
  {
    id: '14',
    label: 'Cutoff Times',
    icon: 'schedule',
    screen: 'CutoffTimes',
    roles: ['ADMIN'], // Admin only
  },
  {
    id: '15',
    label: 'Reports',
    icon: 'assessment',
    screen: 'Reports',
    roles: ['ADMIN'], // Admin only
  },
];

/**
 * Get menu items accessible by a specific role
 */
export const getMenuItemsForRole = (role: UserRole | null): MenuItem[] => {
  if (!role) return [];

  return ALL_MENU_ITEMS.filter(item => item.roles.includes(role));
};

/**
 * Check if a user role has permission to access a screen
 */
export const canAccessScreen = (role: UserRole | null, screen: ScreenName): boolean => {
  if (!role) return false;

  const menuItem = ALL_MENU_ITEMS.find(item => item.screen === screen);
  return menuItem ? menuItem.roles.includes(role) : false;
};

/**
 * Get the default screen for a role (first accessible screen)
 */
export const getDefaultScreenForRole = (role: UserRole | null): ScreenName => {
  if (!role) return 'Dashboard';

  const menuItems = getMenuItemsForRole(role);
  return menuItems.length > 0 ? menuItems[0].screen : 'Dashboard';
};

/**
 * Check if role is admin
 */
export const isAdmin = (role: UserRole | null): boolean => {
  return role === 'ADMIN';
};

/**
 * Check if role is kitchen staff
 */
export const isKitchenStaff = (role: UserRole | null): boolean => {
  return role === 'KITCHEN_STAFF';
};

/**
 * Get appropriate API endpoint based on role
 */
export const getDashboardEndpoint = (role: UserRole | null): string => {
  if (role === 'ADMIN') {
    return '/api/admin/dashboard';
  } else if (role === 'KITCHEN_STAFF') {
    return '/api/kitchens/dashboard';
  }
  return '/api/admin/dashboard'; // Fallback (will fail if not authorized)
};

/**
 * Get appropriate orders endpoint based on role
 */
export const getOrdersEndpoint = (role: UserRole | null): string => {
  if (role === 'ADMIN') {
    return '/api/orders/admin/all';
  } else if (role === 'KITCHEN_STAFF') {
    return '/api/orders/kitchen';
  }
  return '/api/orders/kitchen'; // Fallback
};

/**
 * Get appropriate batches endpoint based on role
 */
export const getBatchesEndpoint = (role: UserRole | null): string => {
  if (role === 'ADMIN') {
    return '/api/delivery/admin/batches';
  } else if (role === 'KITCHEN_STAFF') {
    return '/api/delivery/kitchen-batches';
  }
  return '/api/delivery/kitchen-batches'; // Fallback
};

/**
 * Map backend role strings to app UserRole type
 */
export const mapBackendRoleToAppRole = (backendRole: string): UserRole | null => {
  const roleMap: Record<string, UserRole> = {
    'ADMIN': 'ADMIN',
    'admin': 'ADMIN',
    'KITCHEN_STAFF': 'KITCHEN_STAFF',
    'kitchen_staff': 'KITCHEN_STAFF',
    'DRIVER': 'DRIVER',
    'driver': 'DRIVER',
    'CUSTOMER': 'CUSTOMER',
    'customer': 'CUSTOMER',
  };

  return roleMap[backendRole] || null;
};
