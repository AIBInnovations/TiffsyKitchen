/**
 * Permission Guard Component
 *
 * Wraps components to ensure the user has the required role to access them.
 * If unauthorized, shows an error screen with message.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { UserRole } from '../../types/user';
import { canAccessScreen, ScreenName } from '../../utils/rbac';
import { colors } from '../../theme/colors';
import { SafeAreaScreen } from './SafeAreaScreen';
import { Header } from './Header';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRoles: UserRole[];
  screenName?: ScreenName;
  onMenuPress?: () => void;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRoles,
  screenName,
  onMenuPress,
  fallback,
}) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setUserRole(role as UserRole);
      } catch (error) {
        console.error('Error loading user role:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserRole();
  }, []);

  if (loading) {
    return null; // Or loading spinner
  }

  // Check if user has required role
  const hasPermission = userRole && requiredRoles.includes(userRole);

  // Alternative: Check via RBAC utility if screenName is provided
  const canAccess = screenName ? canAccessScreen(userRole, screenName) : hasPermission;

  if (!canAccess) {
    // If fallback is provided, render it
    if (fallback) {
      return <>{fallback}</>;
    }

    // Otherwise, show default unauthorized screen
    return (
      <SafeAreaScreen
        topBackgroundColor={colors.primary}
        bottomBackgroundColor={colors.background}
      >
        {onMenuPress && <Header title="Access Denied" onMenuPress={onMenuPress} />}
        <View style={styles.container}>
          <MaterialIcons name="block" size={64} color={colors.error} />
          <Text style={styles.title}>Access Denied</Text>
          <Text style={styles.message}>
            You don't have permission to access this screen.
          </Text>
          <Text style={styles.roleText}>
            Your role: {userRole || 'Unknown'}
          </Text>
          <Text style={styles.requiredText}>
            Required: {requiredRoles.join(' or ')}
          </Text>
        </View>
      </SafeAreaScreen>
    );
  }

  // User has permission, render children
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: 24,
  },
  roleText: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: 4,
  },
  requiredText: {
    fontSize: 14,
    color: colors.gray500,
  },
});
