/**
 * Role-Based Orders Screen Router
 *
 * Routes users to the appropriate orders screen based on their role:
 * - ADMIN -> OrdersManagementContainer (all orders, system-wide)
 * - KITCHEN_STAFF -> KitchenOrdersScreen (kitchen-specific orders)
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '../types/user';
import OrdersManagementContainer from '../modules/orders/screens/OrdersManagementContainer';
import KitchenOrdersScreen from '../modules/orders/screens/KitchenOrdersScreen';
import { colors } from '../theme/colors';

interface RoleBasedOrdersScreenProps {
  onMenuPress: () => void;
}

export const RoleBasedOrdersScreen: React.FC<RoleBasedOrdersScreenProps> = (props) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        console.log('========== ROLE-BASED ORDERS SCREEN ==========');
        console.log('User Role:', role);
        console.log('==============================================');

        if (role) {
          setUserRole(role as UserRole);
        }
      } catch (error) {
        console.error('Error loading user role:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserRole();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Route to appropriate orders screen based on role
  if (userRole === 'ADMIN') {
    console.log('Rendering Admin Orders Screen...');
    return <OrdersManagementContainer {...props} />;
  } else if (userRole === 'KITCHEN_STAFF') {
    console.log('Rendering Kitchen Orders Screen...');
    return <KitchenOrdersScreen {...props} />;
  }

  // Fallback to admin orders if role is unknown
  console.warn('Unknown user role, defaulting to Admin Orders');
  return <OrdersManagementContainer {...props} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
