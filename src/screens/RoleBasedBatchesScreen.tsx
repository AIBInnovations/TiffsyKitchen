/**
 * Role-Based Batches Screen Router
 *
 * Routes users to the appropriate batches screen based on their role:
 * - ADMIN -> BatchManagementLandingScreen (all batches, system-wide)
 * - KITCHEN_STAFF -> Kitchen-specific batches (to be implemented)
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '../types/user';
import { BatchManagementLandingScreen } from '../modules/kitchens/screens';
import { colors } from '../theme/colors';
import { SafeAreaScreen } from '../components/common/SafeAreaScreen';
import { Header } from '../components/common/Header';

interface RoleBasedBatchesScreenProps {
  onMenuPress: () => void;
}

export const RoleBasedBatchesScreen: React.FC<RoleBasedBatchesScreenProps> = (props) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        console.log('========== ROLE-BASED BATCHES SCREEN ==========');
        console.log('User Role:', role);
        console.log('===============================================');

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

  // Route to appropriate batches screen based on role
  if (userRole === 'ADMIN') {
    console.log('Rendering Admin Batches Screen...');
    return <BatchManagementLandingScreen {...props} />;
  } else if (userRole === 'KITCHEN_STAFF') {
    console.log('Rendering Kitchen Batches Screen...');
    // For now, show a placeholder - the Batches tab in KitchenDashboard handles this
    return (
      <SafeAreaScreen
        topBackgroundColor={colors.primary}
        bottomBackgroundColor={colors.background}
      >
        <Header title="Batches" onMenuPress={props.onMenuPress} />
        <View style={styles.container}>
          <Text style={styles.message}>
            Kitchen batches are managed from the Kitchen Dashboard.
          </Text>
          <Text style={styles.submessage}>
            Go to Dashboard → Batches tab to view and manage delivery batches for your kitchen.
          </Text>
        </View>
      </SafeAreaScreen>
    );
  }

  // Fallback to admin batches if role is unknown
  console.warn('Unknown user role, defaulting to Admin Batches');
  return <BatchManagementLandingScreen {...props} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  message: {
    fontSize: 16,
    color: colors.gray700,
    textAlign: 'center',
    marginBottom: 12,
  },
  submessage: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
  },
});
