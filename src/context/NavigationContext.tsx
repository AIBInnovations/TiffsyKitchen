import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ScreenName =
  | 'Dashboard'
  | 'Orders'
  | 'Kitchens'
  | 'Zones'
  | 'MenuManagement'
  | 'Subscriptions'
  | 'Users'
  | 'Reports'
  | 'AuditLogs'
  | 'SystemConfig'
  | 'DeliveryConfig';

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
    setScreenHistory(prev => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop();
      setScreenHistory(newHistory);
      setCurrentScreen(newHistory[newHistory.length - 1]);
    }
  };

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
