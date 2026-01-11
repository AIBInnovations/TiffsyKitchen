/**
 * User Management Integration Example
 *
 * This file shows how to integrate the user management screens into your navigation
 */

import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  UsersManagementScreen,
  UserDetailAdminScreen,
  CreateUserModal,
} from './src/modules/users';

const Stack = createStackNavigator();

// ============================================================================
// Example 1: Stack Navigator Integration
// ============================================================================

export const UsersNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="UsersList"
        component={UsersManagementScreenContainer}
      />
      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreenContainer}
      />
    </Stack.Navigator>
  );
};

// ============================================================================
// Example 2: Container Component for List Screen
// ============================================================================

const UsersManagementScreenContainer = ({ navigation }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleUserPress = (user) => {
    navigation.navigate('UserDetail', { userId: user._id });
  };

  const handleMenuPress = () => {
    // If using drawer navigation
    navigation.openDrawer();
    // OR if using tab navigation
    // navigation.goBack();
  };

  const handleCreateUserPress = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    // Optionally show success message or refresh list
    // The list has pull-to-refresh, so user can manually refresh
  };

  return (
    <>
      <UsersManagementScreen
        onMenuPress={handleMenuPress}
        onUserPress={handleUserPress}
        onCreateUserPress={handleCreateUserPress}
      />
      <CreateUserModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
};

// ============================================================================
// Example 3: Container Component for Detail Screen
// ============================================================================

const UserDetailScreenContainer = ({ route, navigation }) => {
  const { userId } = route.params;

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <UserDetailAdminScreen
      userId={userId}
      onBack={handleBack}
    />
  );
};

// ============================================================================
// Example 4: Drawer Navigator Integration (if using drawer)
// ============================================================================

import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

export const MainDrawerNavigator = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          drawerIcon: ({ color }) => <Icon name="dashboard" color={color} />,
        }}
      />
      <Drawer.Screen
        name="Users"
        component={UsersNavigator}
        options={{
          drawerIcon: ({ color }) => <Icon name="people" color={color} />,
          drawerLabel: 'User Management',
        }}
      />
      <Drawer.Screen
        name="Kitchens"
        component={KitchensNavigator}
        options={{
          drawerIcon: ({ color }) => <Icon name="restaurant" color={color} />,
        }}
      />
      {/* Add other screens */}
    </Drawer.Navigator>
  );
};

// ============================================================================
// Example 5: Deep Linking Configuration
// ============================================================================

const linking = {
  prefixes: ['tiffsykitchen://'],
  config: {
    screens: {
      Main: {
        screens: {
          Users: {
            screens: {
              UsersList: 'users',
              UserDetail: 'users/:userId',
            },
          },
        },
      },
    },
  },
};

// ============================================================================
// Example 6: TypeScript Navigation Types (Recommended)
// ============================================================================

export type UsersStackParamList = {
  UsersList: undefined;
  UserDetail: { userId: string };
};

// Use in components:
// import { StackScreenProps } from '@react-navigation/stack';
// type Props = StackScreenProps<UsersStackParamList, 'UserDetail'>;

// ============================================================================
// Example 7: Standalone Usage (No Navigation)
// ============================================================================

// If you want to use the screens without navigation:

export const StandaloneUsersScreen = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (selectedUserId) {
    return (
      <UserDetailAdminScreen
        userId={selectedUserId}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  return (
    <>
      <UsersManagementScreen
        onMenuPress={() => {/* Handle menu */}}
        onUserPress={(user) => setSelectedUserId(user._id)}
        onCreateUserPress={() => setShowCreateModal(true)}
      />
      <CreateUserModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => setShowCreateModal(false)}
      />
    </>
  );
};

// ============================================================================
// Example 8: Role-Based Access Control
// ============================================================================

import { useAuth } from './src/context/AuthContext'; // Your auth context

const ProtectedUsersScreen = ({ navigation }) => {
  const { user, hasPermission } = useAuth();

  // Check if user has permission to manage users
  if (!hasPermission('users.manage')) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>You don't have permission to access this screen</Text>
      </View>
    );
  }

  return <UsersManagementScreenContainer navigation={navigation} />;
};

// ============================================================================
// Example 9: With React Query (if you're using it elsewhere)
// ============================================================================

import { useQueryClient } from '@tanstack/react-query';

const UsersScreenWithReactQuery = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    // Invalidate queries to refetch data
    queryClient.invalidateQueries(['users']);
  };

  return (
    <>
      <UsersManagementScreen
        onMenuPress={() => navigation.openDrawer()}
        onUserPress={(user) => navigation.navigate('UserDetail', { userId: user._id })}
        onCreateUserPress={() => setShowCreateModal(true)}
      />
      <CreateUserModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
};

// ============================================================================
// Notes:
// ============================================================================
// 1. The screens handle their own state management internally
// 2. Pull-to-refresh is built-in - no need to manage externally
// 3. All modals are self-contained with their own state
// 4. Loading, error, and empty states are handled automatically
// 5. The service layer (adminUsersService) can be used directly if needed
