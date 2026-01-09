import "./global.css";

import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PhoneAuthScreen } from './src/screens/admin/PhoneAuthScreen';
import { AdminLoginScreen } from './src/screens/admin/AdminLoginScreen';
import DashboardScreen from './src/screens/admin/DashboardScreen.enhanced';
import AsyncStorage from '@react-native-async-storage/async-storage';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = (token: string) => {
    setFirebaseToken(token);
  };

  const handleLoginSuccess = async (token: string) => {
    await AsyncStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setFirebaseToken(null);
  };

  if (loading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {isAuthenticated ? (
        <DashboardScreen onLogout={handleLogout} />
      ) : !firebaseToken ? (
        <PhoneAuthScreen onVerificationComplete={handleVerificationComplete} />
      ) : (
        <AdminLoginScreen firebaseToken={firebaseToken} onLoginSuccess={handleLoginSuccess} />
      )}
    </SafeAreaProvider>
  );
}

export default App;
