/**
 * MenuManagementExample.tsx
 *
 * Complete example showing how to integrate all menu management screens
 * This file demonstrates navigation between all screens in the menu module
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MenuListScreenNew } from './screens/MenuListScreenNew';
import { MenuDetailScreen } from './screens/MenuDetailScreen';
import { AddonLibraryScreen } from './screens/AddonLibraryScreen';
import { AddonDetailScreen } from './screens/AddonDetailScreen';
import { DisabledItemsScreen } from './screens/DisabledItemsScreen';
import { AddonManagementModal } from './components/AddonManagementModal';
import { colors } from '../../theme/colors';

interface MenuManagementExampleProps {
  kitchenId: string;
  userRole: 'ADMIN' | 'KITCHEN_STAFF';
  onExit?: () => void;
}

type Screen =
  | 'menuList'
  | 'menuDetail'
  | 'addonLibrary'
  | 'addonDetail'
  | 'disabledItems'
  | 'addonManagement';

/**
 * Complete Menu Management Flow
 *
 * Handles navigation between:
 * - Menu List (with search/filters)
 * - Menu Detail (create/edit menu items)
 * - Addon Library (manage all add-ons)
 * - Addon Detail (create/edit add-ons)
 * - Disabled Items (admin-only)
 * - Addon Management Modal (attach/detach add-ons)
 */
export const MenuManagementExample: React.FC<MenuManagementExampleProps> = ({
  kitchenId,
  userRole,
  onExit,
}) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menuList');
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [selectedAddonId, setSelectedAddonId] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  // Navigation handlers
  const handleNavigateToMenuList = () => {
    setCurrentScreen('menuList');
    setSelectedItemId(undefined);
    setRefreshKey(k => k + 1);
  };

  const handleNavigateToMenuDetail = (itemId?: string) => {
    setSelectedItemId(itemId);
    setCurrentScreen('menuDetail');
  };

  const handleNavigateToAddonLibrary = () => {
    setCurrentScreen('addonLibrary');
  };

  const handleNavigateToAddonDetail = (addonId?: string) => {
    setSelectedAddonId(addonId);
    setCurrentScreen('addonDetail');
  };

  const handleNavigateToDisabledItems = () => {
    setCurrentScreen('disabledItems');
  };

  const handleNavigateToAddonManagement = (itemId: string) => {
    setSelectedItemId(itemId);
    setCurrentScreen('addonManagement');
  };

  const handleSaved = () => {
    setRefreshKey(k => k + 1);
  };

  // Render Menu List Screen
  if (currentScreen === 'menuList') {
    return (
      <View style={styles.container}>
        <MenuListScreenNew
          key={refreshKey}
          kitchenId={kitchenId}
          userRole={userRole}
          onNavigateToDetail={handleNavigateToMenuDetail}
          onNavigateToCreate={() => handleNavigateToMenuDetail(undefined)}
          onNavigateToAddons={handleNavigateToAddonLibrary}
          onBack={onExit}
        />
      </View>
    );
  }

  // Render Menu Detail Screen
  if (currentScreen === 'menuDetail') {
    return (
      <View style={styles.container}>
        <MenuDetailScreen
          itemId={selectedItemId}
          kitchenId={kitchenId}
          userRole={userRole}
          onBack={handleNavigateToMenuList}
          onSaved={handleSaved}
          onNavigateToAddonManagement={handleNavigateToAddonManagement}
        />
      </View>
    );
  }

  // Render Addon Library Screen
  if (currentScreen === 'addonLibrary') {
    return (
      <View style={styles.container}>
        <AddonLibraryScreen
          kitchenId={kitchenId}
          onNavigateToDetail={handleNavigateToAddonDetail}
          onBack={handleNavigateToMenuList}
        />
      </View>
    );
  }

  // Render Addon Detail Screen
  if (currentScreen === 'addonDetail') {
    return (
      <View style={styles.container}>
        <AddonDetailScreen
          addonId={selectedAddonId}
          kitchenId={kitchenId}
          onBack={handleNavigateToAddonLibrary}
          onSaved={handleSaved}
        />
      </View>
    );
  }

  // Render Disabled Items Screen (Admin only)
  if (currentScreen === 'disabledItems' && userRole === 'ADMIN') {
    return (
      <View style={styles.container}>
        <DisabledItemsScreen
          kitchenId={kitchenId}
          onBack={handleNavigateToMenuList}
          onNavigateToDetail={handleNavigateToMenuDetail}
        />
      </View>
    );
  }

  // Render with Addon Management Modal
  return (
    <View style={styles.container}>
      <MenuListScreenNew
        key={refreshKey}
        kitchenId={kitchenId}
        userRole={userRole}
        onNavigateToDetail={handleNavigateToMenuDetail}
        onNavigateToCreate={() => handleNavigateToMenuDetail(undefined)}
        onNavigateToAddons={handleNavigateToAddonLibrary}
      />

      <AddonManagementModal
        visible={currentScreen === 'addonManagement' && !!selectedItemId}
        menuItemId={selectedItemId || ''}
        onClose={() => setCurrentScreen('menuDetail')}
        onSaved={handleSaved}
        onCreateNewAddon={() => handleNavigateToAddonDetail(undefined)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

/**
 * USAGE EXAMPLE:
 *
 * In your App.tsx or navigation file:
 *
 * ```typescript
 * import { MenuManagementExample } from './src/modules/menu/MenuManagementExample';
 *
 * function KitchenManagementScreen() {
 *   const kitchen = useSelectedKitchen();
 *   const user = useCurrentUser();
 *
 *   return (
 *     <MenuManagementExample
 *       kitchenId={kitchen._id}
 *       userRole={user.role}
 *       onExit={() => navigation.goBack()}
 *     />
 *   );
 * }
 * ```
 *
 * Or use individual screens with React Navigation:
 *
 * ```typescript
 * import {
 *   MenuListScreenNew,
 *   MenuDetailScreen,
 *   AddonLibraryScreen
 * } from './src/modules/menu';
 *
 * <Stack.Navigator>
 *   <Stack.Screen name="MenuList" component={MenuListScreenNew} />
 *   <Stack.Screen name="MenuDetail" component={MenuDetailScreen} />
 *   <Stack.Screen name="AddonLibrary" component={AddonLibraryScreen} />
 * </Stack.Navigator>
 * ```
 */

export default MenuManagementExample;
