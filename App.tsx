import "./global.css";

import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View, Text, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PhoneAuthScreen } from './src/screens/admin/PhoneAuthScreen';
import { DashboardScreen } from './src/screens/admin/DashboardScreen';
import { RoleBasedDashboard } from './src/screens/RoleBasedDashboard';
import { RoleBasedOrdersScreen } from './src/screens/RoleBasedOrdersScreen';
import { RoleBasedBatchesScreen } from './src/screens/RoleBasedBatchesScreen';
import OrdersManagementContainer from './src/modules/orders/screens/OrdersManagementContainer';
import { MenuManagementMain } from './src/modules/menu/screens/MenuManagementMain';
import { ZonesManagementScreen } from './src/modules/zones';
import { KitchensManagementScreen } from './src/modules/kitchens/screens';
import { SubscriptionsScreen } from './src/modules/subscriptions';
import { BatchManagementLandingScreen } from './src/modules/kitchens/screens';
import { UsersManagementScreen } from './src/modules/users/screens/UsersManagementScreen';
import { UserDetailAdminScreen } from './src/modules/users/screens/UserDetailAdminScreen';
import { CreateUserModal } from './src/modules/users/components/CreateUserModal';
import { DriversManagementScreen, DriverProfileManagementScreen, DriverOrdersBatchesScreen } from './src/modules/drivers/screens';
import { KitchenApprovalsScreen } from './src/modules/kitchens/screens/KitchenApprovalsScreen';
import { KitchenPendingScreen } from './src/modules/kitchens/screens/KitchenPendingScreen';
import { KitchenRejectionScreen } from './src/modules/kitchens/screens/KitchenRejectionScreen';
import { KitchenDashboardScreen } from './src/modules/kitchens/screens/KitchenDashboardScreen';
import { KitchenProfileScreen } from './src/modules/kitchens/screens/KitchenProfileScreen';
import { Sidebar } from './src/components/common/Sidebar';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationProvider, useNavigation } from './src/context/NavigationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './src/services/auth.service';
import { apiService } from './src/services/api.enhanced.service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { User } from './src/types/api.types';
import { UserRole } from './src/types/user';
import { mapBackendRoleToAppRole } from './src/utils/rbac';
import { PermissionGuard } from './src/components/common/PermissionGuard';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
    },
  },
});

// Placeholder component for unimplemented screens
const PlaceholderScreen: React.FC<{
  title: string;
  onMenuPress: () => void;
}> = ({ title, onMenuPress }) => (
  <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
    {/* Header */}
    <View style={{ backgroundColor: '#F56B4C', padding: 16, flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity onPress={onMenuPress} style={{ marginRight: 16 }}>
        <Icon name="menu" size={24} color="#ffffff" />
      </TouchableOpacity>
      <Text style={{ fontSize: 20, fontWeight: '600', color: '#ffffff' }}>
        {title}
      </Text>
    </View>

    {/* Content */}
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 16, color: '#6b7280' }}>
        Coming soon...
      </Text>
    </View>
  </View>
);

// Main Content Router Component
const MainContent: React.FC<{
  onMenuPress: () => void;
  onLogout: () => void;
}> = ({ onMenuPress, onLogout }) => {
  const { currentScreen, goBack } = useNavigation();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (currentScreen === 'Users' && selectedUserId) {
        setSelectedUserId(null);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [currentScreen, selectedUserId]);

  const handleUserPress = (user: User) => {
    setSelectedUserId(user._id);
  };

  const handleBackFromUserDetail = () => {
    setSelectedUserId(null);
  };

  const handleCreateUserPress = () => {
    setShowCreateUserModal(true);
  };

  const handleCreateUserSuccess = () => {
    setShowCreateUserModal(false);
    // Refresh users list by toggling state
  };

  // If viewing user details
  if (currentScreen === 'Users' && selectedUserId) {
    return (
      <UserDetailAdminScreen
        userId={selectedUserId}
        onBack={handleBackFromUserDetail}
      />
    );
  }

  switch (currentScreen) {
    case 'Dashboard':
      return <RoleBasedDashboard onMenuPress={onMenuPress} onLogout={onLogout} />;

    case 'Orders':
      return <RoleBasedOrdersScreen onMenuPress={onMenuPress} />;

    case 'Users':
      return (
        <PermissionGuard requiredRoles={['ADMIN']} screenName="Users" onMenuPress={onMenuPress}>
          <UsersManagementScreen
            onMenuPress={onMenuPress}
            onUserPress={handleUserPress}
            onCreateUserPress={handleCreateUserPress}
          />
          <CreateUserModal
            visible={showCreateUserModal}
            onClose={() => setShowCreateUserModal(false)}
            onSuccess={handleCreateUserSuccess}
          />
        </PermissionGuard>
      );

    case 'Kitchens':
      return (
        <PermissionGuard requiredRoles={['ADMIN']} screenName="KitchenManagement" onMenuPress={onMenuPress}>
          <KitchensManagementScreen onMenuPress={onMenuPress} />
        </PermissionGuard>
      );

    case 'Zones':
      return (
        <PermissionGuard requiredRoles={['ADMIN']} screenName="Zones" onMenuPress={onMenuPress}>
          <ZonesManagementScreen onMenuPress={onMenuPress} />
        </PermissionGuard>
      );

    case 'MenuManagement':
      return <MenuManagementMain onMenuPress={onMenuPress} />;

    case 'Subscriptions':
      return (
        <PermissionGuard requiredRoles={['ADMIN']} screenName="Subscriptions" onMenuPress={onMenuPress}>
          <SubscriptionsScreen onMenuPress={onMenuPress} />
        </PermissionGuard>
      );

    case 'DriverApprovals':
      return (
        <PermissionGuard requiredRoles={['ADMIN']} screenName="DriverApprovals" onMenuPress={onMenuPress}>
          <DriversManagementScreen onMenuPress={onMenuPress} />
        </PermissionGuard>
      );

    case 'DriverProfileManagement':
      return (
        <PermissionGuard requiredRoles={['ADMIN']} onMenuPress={onMenuPress}>
          <DriverProfileManagementScreen onMenuPress={onMenuPress} />
        </PermissionGuard>
      );

    case 'DriverOrdersBatches':
      return (
        <PermissionGuard requiredRoles={['ADMIN']} onMenuPress={onMenuPress}>
          <DriverOrdersBatchesScreen onMenuPress={onMenuPress} />
        </PermissionGuard>
      );

    case 'KitchenApprovals':
      return (
        <PermissionGuard requiredRoles={['ADMIN']} screenName="KitchenApprovals" onMenuPress={onMenuPress}>
          <KitchenApprovalsScreen onMenuPress={onMenuPress} />
        </PermissionGuard>
      );

    case 'KitchenPending':
      return <KitchenPendingScreen onMenuPress={onMenuPress} />;

    case 'KitchenRejected':
      return <KitchenRejectionScreen onMenuPress={onMenuPress} />;

    case 'KitchenDashboard':
      return <KitchenDashboardScreen onMenuPress={onMenuPress} />;

    case 'KitchenProfile':
      return <KitchenProfileScreen onMenuPress={onMenuPress} />;

    case 'BatchManagement':
      return <RoleBasedBatchesScreen onMenuPress={onMenuPress} />;

    default:
      return <RoleBasedDashboard onMenuPress={onMenuPress} onLogout={onLogout} />;
  }
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('========== APP.TSX: CHECKING AUTH ==========');

      const token = await AsyncStorage.getItem('authToken');
      console.log('Auth Token exists:', token ? 'YES' : 'NO');

      const userRole = await AsyncStorage.getItem('userRole');
      console.log('User Role:', userRole);

      // Authenticate if token exists and user has a valid role (ADMIN or KITCHEN_STAFF)
      const hasValidRole = userRole === 'ADMIN' || userRole === 'KITCHEN_STAFF';
      const isValidUser = !!token && hasValidRole;
      console.log('Is Valid User:', isValidUser);
      console.log('Has Valid Role:', hasValidRole);

      if (token && !hasValidRole) {
        console.log('⚠️  Token exists but role is invalid. Clearing data...');
        await authService.clearAdminData();
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(isValidUser);
      }

      console.log('============================================');
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = async (token: string) => {
    console.log('========== APP.TSX: OTP VERIFIED ==========');
    console.log('Firebase Token Received:', token ? 'YES' : 'NO');
    console.log('Token Length:', token?.length);
    console.log('===========================================');

    try {
      // Store auth token first
      await AsyncStorage.setItem('authToken', token);

      // Update API service with the token
      await apiService.login(token);

      // ⚠️ CRITICAL: Call /api/auth/sync IMMEDIATELY after Firebase authentication
      // This links the Firebase UID to the database user record
      console.log('⚠️  CRITICAL: Calling /api/auth/sync to link Firebase UID...');
      const syncResponse = await authService.syncWithBackend();

      console.log('========== SYNC RESPONSE RECEIVED ==========');
      console.log('Is New User:', syncResponse.data?.isNewUser);
      console.log('User Role:', syncResponse.data?.user?.role);
      console.log('Kitchen Approval Status:', syncResponse.data?.kitchenApprovalStatus);
      console.log('===========================================');

      // Check if new user (needs registration)
      if (syncResponse.data?.isNewUser) {
        console.log('⚠️  New user detected - registration required');
        // TODO: Navigate to registration screen
        // For now, clear data and show login again
        await authService.clearAdminData();
        setIsAuthenticated(false);
        return;
      }

      // Get user from sync response
      const backendUser = syncResponse.data?.user;
      if (!backendUser) {
        console.error('⚠️  No user data in sync response');
        await authService.clearAdminData();
        setIsAuthenticated(false);
        return;
      }

      // Map backend user to app user format
      const userProfile = {
        id: backendUser._id,
        phone: backendUser.phone,
        email: backendUser.email || '',
        firstName: backendUser.name?.split(' ')[0] || 'User',
        lastName: backendUser.name?.split(' ').slice(1).join(' ') || '',
        fullName: backendUser.name || 'User',
        role: backendUser.role,
        status: backendUser.status,
        isActive: backendUser.isActive,
        isVerified: backendUser.isVerified,
        kitchenId: backendUser.kitchenId, // Include kitchenId for Kitchen Staff
        createdAt: backendUser.createdAt,
        updatedAt: backendUser.updatedAt,
      };

      console.log('========== USER PROFILE MAPPED ==========');
      console.log('User ID:', userProfile.id);
      console.log('User Name:', userProfile.fullName);
      console.log('User Role (Backend):', userProfile.role);
      console.log('Kitchen ID:', userProfile.kitchenId || 'N/A');
      console.log('=========================================');

      // Map backend role to app role
      const appRole = mapBackendRoleToAppRole(userProfile.role);
      console.log('Mapped App Role:', appRole);

      if (!appRole) {
        console.error('⚠️  Invalid role received from backend:', userProfile.role);
        await authService.clearAdminData();
        throw new Error('Invalid user role');
      }

      // Store user role
      await AsyncStorage.setItem('userRole', appRole);

      // Store user data
      await AsyncStorage.setItem('userData', JSON.stringify(userProfile));

      // Get phone number that was stored during OTP verification
      const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      if (phoneNumber) {
        await AsyncStorage.setItem('adminPhone', phoneNumber);
      }

      console.log('✅ User authenticated successfully with role:', appRole);
      console.log('✅ Firebase UID linked to database user');
      console.log('Navigating to appropriate dashboard...');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Error during authentication:', error);
      await authService.clearAdminData();
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    console.log('========== APP.TSX: LOGOUT ==========');
    console.log('Clearing all admin data...');

    // Clear all admin data using auth service
    await authService.clearAdminData();

    console.log('Admin data cleared');
    console.log('Resetting authentication state...');
    console.log('=====================================');

    setIsAuthenticated(false);
    setSidebarVisible(false);
  };

  const handleMenuPress = () => {
    setSidebarVisible(true);
  };

  const handleCloseSidebar = () => {
    setSidebarVisible(false);
  };

  if (loading) {
    return null;
  }

  console.log('========== APP.TSX RENDER ==========');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('Current Screen:', isAuthenticated ? 'DASHBOARD' : 'PHONE_AUTH');
  console.log('====================================');

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            {isAuthenticated ? (
              <>
                <MainContent onMenuPress={handleMenuPress} onLogout={handleLogout} />
                <Sidebar visible={sidebarVisible} onClose={handleCloseSidebar} onLogout={handleLogout} />
              </>
            ) : (
              <PhoneAuthScreen onVerificationComplete={handleVerificationComplete} />
            )}
          </NavigationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
