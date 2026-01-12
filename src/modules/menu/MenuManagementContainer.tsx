import React, { useState } from 'react';
import { MenuListScreenNew } from './screens/MenuListScreenNew';
import { MenuDetailScreen } from './screens/MenuDetailScreen';
import { AddonManagementModal } from './components/AddonManagementModal';

interface MenuManagementContainerProps {
  kitchenId: string;
  userRole: 'ADMIN' | 'KITCHEN_STAFF';
  onBack?: () => void;
}

type Screen = 'list' | 'detail' | 'addonManagement';

/**
 * MenuManagementContainer
 *
 * Central container that manages navigation between menu management screens.
 * Handles screen transitions, state management, and data refresh coordination.
 *
 * Usage:
 * ```tsx
 * <MenuManagementContainer
 *   kitchenId={selectedKitchen._id}
 *   userRole={currentUser.role}
 * />
 * ```
 */
export const MenuManagementContainer: React.FC<MenuManagementContainerProps> = ({
  kitchenId,
  userRole,
  onBack,
}) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('list');
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Navigate to menu item detail screen
   * @param itemId - The menu item ID to edit, or undefined to create new
   */
  const handleNavigateToDetail = (itemId?: string) => {
    setSelectedItemId(itemId);
    setCurrentScreen('detail');
  };

  /**
   * Navigate back to list screen and trigger refresh
   */
  const handleNavigateToList = () => {
    setCurrentScreen('list');
    setSelectedItemId(undefined);
    setRefreshKey(prev => prev + 1);
  };

  /**
   * Navigate to addon management for a specific menu item
   */
  const handleNavigateToAddonManagement = (itemId: string) => {
    setSelectedItemId(itemId);
    setCurrentScreen('addonManagement');
  };

  /**
   * Navigate to addon library (placeholder for future implementation)
   */
  const handleNavigateToAddonLibrary = () => {
    // TODO: Implement addon library screen
    console.log('Navigate to addon library');
  };

  /**
   * Handle data save/update - triggers refresh
   */
  const handleSaved = () => {
    setRefreshKey(prev => prev + 1);
  };

  /**
   * Close addon management modal and return to detail screen
   */
  const handleCloseAddonManagement = () => {
    setCurrentScreen('detail');
  };

  // Render detail/edit screen
  if (currentScreen === 'detail') {
    return (
      <MenuDetailScreen
        itemId={selectedItemId}
        kitchenId={kitchenId}
        userRole={userRole}
        onBack={handleNavigateToList}
        onSaved={handleSaved}
        onNavigateToAddonManagement={handleNavigateToAddonManagement}
      />
    );
  }

  // Render list screen with addon management modal
  return (
    <>
      <MenuListScreenNew
        key={refreshKey} // Force re-mount on data changes
        kitchenId={kitchenId}
        userRole={userRole}
        onNavigateToDetail={handleNavigateToDetail}
        onNavigateToCreate={() => handleNavigateToDetail(undefined)}
        onNavigateToAddons={handleNavigateToAddonLibrary}
      />

      {/* Addon Management Modal - overlays on top of current screen */}
      <AddonManagementModal
        visible={currentScreen === 'addonManagement' && !!selectedItemId}
        menuItemId={selectedItemId || ''}
        onClose={handleCloseAddonManagement}
        onSaved={handleSaved}
        onCreateNewAddon={() => {
          // TODO: Navigate to addon creation
          console.log('Create new addon');
        }}
      />
    </>
  );
};

export default MenuManagementContainer;
