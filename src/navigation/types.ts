/**
 * Navigation Type Definitions
 *
 * Provides type safety for navigation throughout the app
 */

import { DrawerNavigationProp } from '@react-navigation/drawer';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Main Drawer Navigator Routes
export type DrawerParamList = {
  Dashboard: undefined;
  Orders: undefined;
  BatchManagement: undefined;
  DriverDeliveries: undefined;
  DriverOrdersBatches: undefined;
  Users: undefined;
  Drivers: undefined;
  Kitchens: undefined;
  Zones: undefined;
  Subscriptions: undefined;
  Coupons: undefined;
  Settings: undefined;
};

// Orders Stack Navigator Routes
export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetails: { orderId: string };
};

// Users Stack Navigator Routes
export type UsersStackParamList = {
  UsersList: undefined;
  UserDetails: { userId: string };
  UserCreate: undefined;
  UserEdit: { userId: string };
};

// Kitchens Stack Navigator Routes
export type KitchensStackParamList = {
  KitchensList: undefined;
  KitchenDetails: { kitchenId: string };
  KitchenCreate: undefined;
  KitchenEdit: { kitchenId: string };
};

// Navigation Prop Types (for screens)
export type DashboardNavigationProp = DrawerNavigationProp<DrawerParamList, 'Dashboard'>;
export type OrdersListNavigationProp = StackNavigationProp<OrdersStackParamList, 'OrdersList'>;
export type OrderDetailsNavigationProp = StackNavigationProp<OrdersStackParamList, 'OrderDetails'>;

// Route Prop Types (for screens)
export type OrderDetailsRouteProp = RouteProp<OrdersStackParamList, 'OrderDetails'>;
export type UserDetailsRouteProp = RouteProp<UsersStackParamList, 'UserDetails'>;
export type KitchenDetailsRouteProp = RouteProp<KitchensStackParamList, 'KitchenDetails'>;

// Combined navigation prop (for components that need drawer + stack)
export type NavigationProps = DrawerNavigationProp<DrawerParamList>;
