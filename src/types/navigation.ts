import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  OTPVerification: { phone: string };
};

// Kitchen Stack
export type KitchenStackParamList = {
  Dashboard: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  MenuManagement: undefined;
  Addons: undefined;
  Subscriptions: undefined;
  Users: undefined;
  UserDetail: { userId: string };
  Deliveries: undefined;
  Analytics: undefined;
  Settings: undefined;
};

// Driver Stack
export type DriverStackParamList = {
  Deliveries: undefined;
  DeliveryDetail: { deliveryId: string };
  Earnings: undefined;
  Profile: undefined;
};

// Admin Stack
export type AdminStackParamList = {
  AdminLogin: undefined;
  AdminDashboard: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  Kitchen: undefined;
  Driver: undefined;
  Admin: undefined;
};

// Navigation Props
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type KitchenNavigationProp = NativeStackNavigationProp<KitchenStackParamList>;
export type DriverNavigationProp = NativeStackNavigationProp<DriverStackParamList>;
export type AdminNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

// Route Props
export type OTPVerificationRouteProp = RouteProp<AuthStackParamList, 'OTPVerification'>;
export type OrderDetailRouteProp = RouteProp<KitchenStackParamList, 'OrderDetail'>;
export type UserDetailRouteProp = RouteProp<KitchenStackParamList, 'UserDetail'>;
export type DeliveryDetailRouteProp = RouteProp<DriverStackParamList, 'DeliveryDetail'>;
