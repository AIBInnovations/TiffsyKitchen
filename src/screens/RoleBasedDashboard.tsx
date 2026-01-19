/**
 * Role-Based Dashboard Router
 *
 * This component routes users to the appropriate dashboard based on their role:
 * - ADMIN -> Admin Dashboard (system-wide data)
 * - KITCHEN_STAFF -> Kitchen Dashboard (kitchen-specific data)
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '../types/user';
import { DashboardScreen } from './admin/DashboardScreen';
import { KitchenDashboardScreen } from '../modules/kitchens/screens/KitchenDashboardScreen';
import { colors } from '../theme/colors';

interface RoleBasedDashboardProps {
  onMenuPress: () => void;
  onNotificationPress?: () => void;
  onLogout?: () => void;
}

export const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = (props) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        console.log('========== ROLE-BASED DASHBOARD ==========');
        console.log('User Role:', role);
        console.log('=========================================');

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

  // Route to appropriate dashboard based on role
  if (userRole === 'ADMIN') {
    console.log('Rendering Admin Dashboard...');
    return <DashboardScreen {...props} />;
  } else if (userRole === 'KITCHEN_STAFF') {
    console.log('Rendering Kitchen Staff Dashboard...');
    return <KitchenDashboardScreen {...props} />;
  }

  // Fallback to admin dashboard if role is unknown
  console.warn('Unknown user role, defaulting to Admin Dashboard');
  return <DashboardScreen {...props} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
