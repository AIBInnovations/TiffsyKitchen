import "./global.css";

import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneAuthScreen } from './src/screens/admin/PhoneAuthScreen';
import { AdminLoginScreen } from './src/screens/admin/AdminLoginScreen';
import { DashboardScreen } from './src/screens/admin/DashboardScreen';
import { UsersScreen } from './src/screens/admin/UsersScreen';
import OrdersListScreen from './src/screens/orders/OrdersListScreen';
import MenuManagementScreen from './src/modules/menu/screens/MenuManagementScreen';
import { ZonesManagementScreen } from './src/modules/zones';
import { Sidebar } from './src/components/common/Sidebar';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationProvider, useNavigation } from './src/context/NavigationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './src/services/auth.service';
import { apiService } from './src/services/api.enhanced.service';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Placeholder component for unimplemented screens
const PlaceholderScreen: React.FC<{
  title: string;
  onMenuPress: () => void;
}> = ({ title, onMenuPress }) => (
  <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
    {/* Header */}
    <View style={{ backgroundColor: '#f97316', padding: 16, flexDirection: 'row', alignItems: 'center' }}>
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
  const { currentScreen } = useNavigation();

  const handleUserPress = (userId: string) => {
    console.log('User pressed:', userId);
    // Navigate to user details if needed
  };

  switch (currentScreen) {
    case 'Dashboard':
      return <DashboardScreen onMenuPress={onMenuPress} onLogout={onLogout} />;

    case 'Orders':
      return <OrdersListScreen onMenuPress={onMenuPress} onLogout={onLogout} />;

    case 'Users':
      return <UsersScreen onMenuPress={onMenuPress} onUserPress={handleUserPress} />;

    case 'MenuManagement':
      return <MenuManagementScreen onMenuPress={onMenuPress} />;

    case 'Zones':
      return <ZonesManagementScreen onMenuPress={onMenuPress} />;

    case 'Subscriptions':
      return <PlaceholderScreen title="Subscriptions" onMenuPress={onMenuPress} />;

    case 'Deliveries':
      return <PlaceholderScreen title="Deliveries" onMenuPress={onMenuPress} />;

    case 'Analytics':
      return <PlaceholderScreen title="Analytics" onMenuPress={onMenuPress} />;

    case 'Settings':
      return <PlaceholderScreen title="Settings" onMenuPress={onMenuPress} />;

    default:
      return <DashboardScreen onMenuPress={onMenuPress} onLogout={onLogout} />;
  }
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null);
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

  const handleVerificationComplete = (token: string) => {
    console.log('========== APP.TSX: OTP VERIFIED ==========');
    console.log('Firebase Token Received:', token ? 'YES' : 'NO');
    console.log('Token Length:', token?.length);
    console.log('Setting firebaseToken state...');
    console.log('===========================================');
    setFirebaseToken(token);
  };

  const handleLoginSuccess = async (responseData: string) => {
    try {
      // Parse the response data
      const data = JSON.parse(responseData);

      // Validate the response data
      if (!data.token || !data.user || !data.user.role) {
        console.error('Invalid response data received');
        return;
      }

      // Verify user role is ADMIN
      if (data.user.role !== 'ADMIN') {
        console.error('User role is not ADMIN:', data.user.role);
        return;
      }

      console.log('Clearing old session data...');
      // FIRST: Clear all old data
      await authService.clearAdminData();
      await apiService.logout();

      console.log('Storing new session data...');
      console.log('Backend JWT Token (first 50 chars):', data.token.substring(0, 50));

      // SECOND: Store new auth token and update API service cache
      await apiService.login(data.token);

      // Verify token was stored correctly
      const storedToken = await AsyncStorage.getItem('authToken');
      console.log('Verified stored token (first 50 chars):', storedToken?.substring(0, 50));
      console.log('Token match:', storedToken === data.token);

      // Store admin user data as JSON
      await AsyncStorage.setItem('adminUser', JSON.stringify(data.user));

      // Store individual user fields for easy access
      await AsyncStorage.setItem('adminUserId', data.user._id);
      await AsyncStorage.setItem('adminUsername', data.user.username);
      await AsyncStorage.setItem('adminEmail', data.user.email);
      await AsyncStorage.setItem('adminName', data.user.name);
      await AsyncStorage.setItem('adminRole', data.user.role);
      await AsyncStorage.setItem('adminPhone', data.user.phone);

      // Store token expiry
      if (data.expiresIn) {
        await AsyncStorage.setItem('tokenExpiresIn', String(data.expiresIn));
      }

      // Store session if remember me is checked
      if (data.rememberMe) {
        await AsyncStorage.setItem('@admin_session_indicator', 'admin_session_active');
      }

      // Always store remember me preference
      await AsyncStorage.setItem('@admin_remember_me', String(data.rememberMe));

      console.log('All data stored successfully, navigating to dashboard...');

      // Navigate to dashboard
      setIsAuthenticated(true);

    } catch (error) {
      console.error('Error in handleLoginSuccess:', error);
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
    setFirebaseToken(null);
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
  console.log('firebaseToken:', firebaseToken ? 'EXISTS' : 'NULL');
  console.log('Current Screen:', isAuthenticated ? 'DASHBOARD' : !firebaseToken ? 'PHONE_AUTH' : 'ADMIN_LOGIN');
  console.log('====================================');

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          {isAuthenticated ? (
            <>
              <MainContent onMenuPress={handleMenuPress} onLogout={handleLogout} />
              <Sidebar visible={sidebarVisible} onClose={handleCloseSidebar} />
            </>
          ) : !firebaseToken ? (
            <PhoneAuthScreen onVerificationComplete={handleVerificationComplete} />
          ) : (
            <AdminLoginScreen firebaseToken={firebaseToken} onLoginSuccess={handleLoginSuccess} />
          )}
        </NavigationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
