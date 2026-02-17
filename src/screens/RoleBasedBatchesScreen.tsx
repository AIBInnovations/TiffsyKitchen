/**
 * Role-Based Batches Screen Router
 *
 * Routes users to the appropriate batches screen based on their role:
 * - ADMIN -> BatchManagementLandingScreen (all batches, system-wide)
 * - KITCHEN_STAFF -> BatchManagementTab (kitchen-specific batches)
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRole } from '../types/user';
import { BatchManagementLandingScreen } from '../modules/kitchens/screens';
import { BatchManagementTab } from '../modules/kitchen/components/BatchManagementTab';
import { colors } from '../theme/colors';
import { SafeAreaScreen } from '../components/common/SafeAreaScreen';
import { Header } from '../components/common/Header';

interface RoleBasedBatchesScreenProps {
  onMenuPress: () => void;
  onBatchSelect?: (batchId: string) => void;
}

export const RoleBasedBatchesScreen: React.FC<RoleBasedBatchesScreenProps> = (props) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [kitchenId, setKitchenId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        const userData = await AsyncStorage.getItem('userData');

        console.log('========== ROLE-BASED BATCHES SCREEN ==========');
        console.log('User Role:', role);

        if (role) {
          setUserRole(role as UserRole);
        }

        // Get kitchenId for Kitchen Staff
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setKitchenId(parsedUserData.kitchenId);
          console.log('Kitchen ID:', parsedUserData.kitchenId);
        }

        console.log('===============================================');
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
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
    return (
      <SafeAreaScreen
        topBackgroundColor={colors.primary}
        bottomBackgroundColor={colors.background}
      >
        <Header title="Batches" onMenuPress={props.onMenuPress} />
        <BatchManagementTab kitchenId={kitchenId} onBatchSelect={props.onBatchSelect} />
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
});
