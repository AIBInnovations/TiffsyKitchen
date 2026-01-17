import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { BackHandler } from 'react-native';

export type ScreenName =
  | 'Dashboard'
  | 'Orders'
  | 'Kitchens'
  | 'Zones'
  | 'MenuManagement'
  | 'Subscriptions'
  | 'Users'
  | 'DriverApprovals'
  | 'Reports'
  | 'AuditLogs'
  | 'SystemConfig'
  | 'DeliveryConfig'
  | 'BatchManagement';

interface NavigationContextType {
  currentScreen: ScreenName;
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
  screenHistory: ScreenName[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Dashboard');
  const [screenHistory, setScreenHistory] = useState<ScreenName[]>(['Dashboard']);

  const navigate = (screen: ScreenName) => {
    // Avoid pushing the same screen multiple times consecutively
    setScreenHistory(prev => {
      if (prev[prev.length - 1] === screen) return prev;
      return [...prev, screen];
    });
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop();
      const previousScreen = newHistory[newHistory.length - 1];
      setScreenHistory(newHistory);
      setCurrentScreen(previousScreen);
      return true;
    }
    return false;
  };

  useEffect(() => {
    const backAction = () => {
      return goBack();
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [screenHistory]);

  return (
    <NavigationContext.Provider
      value={{
        currentScreen,
        navigate,
        goBack,
        screenHistory,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
