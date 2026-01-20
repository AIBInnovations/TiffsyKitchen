/**
 * Drawer Navigator
 *
 * Side menu navigation for main app sections
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createDrawerNavigator, DrawerContentComponentProps, DrawerActions } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerParamList } from './types';
import DashboardScreen from '../screens/admin/DashboardScreen.enhanced';
import OrdersNavigator from './OrdersNavigator';
import KitchenNavigator from './KitchenNavigator';
import { KitchensManagementScreen, KitchenDetailScreen, BatchManagementScreen, BatchManagementLandingScreen } from '../modules/kitchens/screens';
import { ZonesManagementScreen } from '../modules/zones/screens/ZonesManagementScreen';
import { SubscriptionsScreen, SubscriptionsScreenSimple } from '../modules/subscriptions';
import { DriversManagementScreen } from '../modules/drivers/screens/DriversManagementScreen';
import { DriverDeliveriesScreen, DriverOrdersBatchesScreen } from '../modules/drivers/screens';
import { UserRole } from '../types/user';
import { getMenuItemsForRole, MenuItem } from '../utils/rbac';

const Drawer = createDrawerNavigator<DrawerParamList>();
const Stack = createStackNavigator();

const PRIMARY_COLOR = '#F56B4C';

/**
 * Kitchens Stack Navigator
 * Handles navigation between kitchen list and detail screens
 */
function KitchensNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="KitchensList" component={KitchensManagementScreen} />
      <Stack.Screen name="KitchenDetail" component={KitchenDetailScreen} />
      <Stack.Screen name="BatchManagement" component={BatchManagementScreen} />
    </Stack.Navigator>
  );
}

/**
 * Custom Drawer Content
 * Displays menu items with icons - filtered by user role
 */
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { navigation, state } = props;
  const currentRoute = state.routeNames[state.index];
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [menuItems, setMenuItems] = useState<Array<{name: string; icon: string; route: string}>>([]);

  // Load user role and filter menu items
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        console.log('🔍 [DrawerNavigator] Loaded user role:', role);
        setUserRole(role as UserRole);

        // Get menu items for this role from RBAC
        const allowedMenuItems = getMenuItemsForRole(role as UserRole);
        console.log('🔍 [DrawerNavigator] Allowed menu items:', allowedMenuItems);

        // Map RBAC menu items to drawer menu items format
        const drawerItems = allowedMenuItems.map((item: MenuItem) => ({
          name: item.label,
          icon: item.icon,
          route: item.screen,
        }));

        setMenuItems(drawerItems);
      } catch (error) {
        console.error('❌ [DrawerNavigator] Error loading user role:', error);
      }
    };

    loadUserRole();
  }, []);

  // Determine header based on role
  const getHeaderConfig = () => {
    switch (userRole) {
      case 'ADMIN':
        return {
          icon: 'admin-panel-settings',
          title: 'Admin Panel',
        };
      case 'KITCHEN_STAFF':
        return {
          icon: 'restaurant',
          title: 'Kitchen Panel',
        };
      case 'DRIVER':
        return {
          icon: 'local-shipping',
          title: 'Driver Panel',
        };
      default:
        return {
          icon: 'dashboard',
          title: 'TiffsyKitchen',
        };
    }
  };

  const headerConfig = getHeaderConfig();

  return (
    <View style={styles.drawerContainer}>
      {/* Drawer Header */}
      <View style={styles.drawerHeader}>
        <Icon name={headerConfig.icon} size={48} color="#ffffff" />
        <Text style={styles.drawerTitle}>{headerConfig.title}</Text>
        <Text style={styles.drawerSubtitle}>TiffsyKitchen</Text>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => {
                console.log('Drawer menu clicked:', item.route);
                navigation.navigate(item.route as any);
              }}
            >
              <Icon
                name={item.icon}
                size={24}
                color={isActive ? PRIMARY_COLOR : '#6b7280'}
              />
              <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Drawer Footer */}
      <View style={styles.drawerFooter}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

/**
 * Main Drawer Navigator
 */
export default function DrawerNavigator({ onLogout }: { onLogout: () => void }) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen name="Dashboard">
        {(props) => <DashboardScreen {...props} onLogout={onLogout} />}
      </Drawer.Screen>

      <Drawer.Screen name="Orders" component={OrdersNavigator} />

      <Drawer.Screen name="KitchenOrders" component={KitchenNavigator} />

      {/* Placeholder screens - we'll implement these next */}
      <Drawer.Screen name="Users">
        {() => <PlaceholderScreen title="Users Management" />}
      </Drawer.Screen>

      <Drawer.Screen name="Drivers">
        {(props) => <DriversManagementScreen onMenuPress={() => props.navigation.toggleDrawer()} />}
      </Drawer.Screen>

      <Drawer.Screen name="Kitchens" component={KitchensNavigator} />

      <Drawer.Screen name="BatchManagement">
        {(props) => <BatchManagementLandingScreen {...props} />}
      </Drawer.Screen>

      <Drawer.Screen name="DriverDeliveries" component={DriverDeliveriesScreen} />

      <Drawer.Screen name="DriverOrdersBatches" component={DriverOrdersBatchesScreen} />

      <Drawer.Screen name="Zones" component={ZonesManagementScreen} />

      <Drawer.Screen name="Subscriptions" component={SubscriptionsScreenSimple} />

      <Drawer.Screen name="Coupons">
        {() => <PlaceholderScreen title="Coupons Management" />}
      </Drawer.Screen>

      <Drawer.Screen name="Settings">
        {() => <PlaceholderScreen title="Settings" />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

/**
 * Placeholder Screen Component
 * Used for sections not yet implemented
 */
function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={styles.placeholderContainer}>
      <Icon name="construction" size={64} color="#9ca3af" />
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderText}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Drawer Container
  drawerContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // Drawer Header
  drawerHeader: {
    backgroundColor: PRIMARY_COLOR,
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
  },

  // Menu Items
  menuContainer: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#fff7ed',
  },
  menuText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 16,
    fontWeight: '500',
  },
  menuTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },

  // Drawer Footer
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },

  // Placeholder Screen
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 32,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
});
