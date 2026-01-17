import "./global.css";

import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View, Text, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PhoneAuthScreen } from './src/screens/admin/PhoneAuthScreen';
import { DashboardScreen } from './src/screens/admin/DashboardScreen';
import OrdersManagementContainer from './src/modules/orders/screens/OrdersManagementContainer';
import { MenuManagementMain } from './src/modules/menu/screens/MenuManagementMain';
import { ZonesManagementScreen } from './src/modules/zones';
import { KitchensManagementScreen } from './src/modules/kitchens/screens';
import { SubscriptionsScreen } from './src/modules/subscriptions';
import { BatchManagementLandingScreen } from './src/modules/kitchens/screens';
import { UsersManagementScreen } from './src/modules/users/screens/UsersManagementScreen';
import { UserDetailAdminScreen } from './src/modules/users/screens/UserDetailAdminScreen';
import { CreateUserModal } from './src/modules/users/components/CreateUserModal';
import { DriversManagementScreen } from './src/modules/drivers/screens/DriversManagementScreen';
import { Sidebar } from './src/components/common/Sidebar';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationProvider, useNavigation } from './src/context/NavigationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './src/services/auth.service';
import { apiService } from './src/services/api.enhanced.service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { User } from './src/types/api.types';

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
      return <DashboardScreen onMenuPress={onMenuPress} onLogout={onLogout} />;

    case 'Orders':
      return <OrdersManagementContainer onMenuPress={onMenuPress} />;

    case 'Users':
      return (
        <>
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
        </>
      );

    case 'Kitchens':
      return <KitchensManagementScreen onMenuPress={onMenuPress} />;

    case 'Zones':
      return <ZonesManagementScreen onMenuPress={onMenuPress} />;

    case 'MenuManagement':
      return <MenuManagementMain onMenuPress={onMenuPress} />;

    case 'Subscriptions':
      return <SubscriptionsScreen onMenuPress={onMenuPress} />;

    case 'DriverApprovals':
      return <DriversManagementScreen onMenuPress={onMenuPress} />;

    case 'BatchManagement':
      return <BatchManagementLandingScreen onMenuPress={onMenuPress} />;

    default:
      return <DashboardScreen onMenuPress={onMenuPress} onLogout={onLogout} />;
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

      const adminRole = await AsyncStorage.getItem('adminRole');
      console.log('Admin Role:', adminRole);

      // Only authenticate if both token exists AND role is ADMIN
      const isValidAdmin = !!token && adminRole === 'ADMIN';
      console.log('Is Valid Admin:', isValidAdmin);

      if (token && adminRole !== 'ADMIN') {
        console.log('⚠️  Token exists but role is not ADMIN. Clearing data...');
        await authService.clearAdminData();
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(isValidAdmin);
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
    console.log('Authenticating user directly...');
    console.log('===========================================');

    try {
      // Store auth token and admin role
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('adminRole', 'ADMIN');

      // Get phone number that was stored during OTP verification
      const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      if (phoneNumber) {
        await AsyncStorage.setItem('adminPhone', phoneNumber);
      }

      // Update API service with the token
      await apiService.login(token);

      console.log('User authenticated successfully, navigating to dashboard...');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error during authentication:', error);
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
