import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  ToastAndroid,
  Platform,
} from 'react-native';
import { useAlert } from '../../../hooks/useAlert';
import { SafeAreaScreen } from '../../../components/common/SafeAreaScreen';
import {
  MenusByKey,
  Menu,
  MenuDish,
  MealType,
  generateMenuKey,
  formatDateForKey,
} from '../models/types';
import {
  mockCities,
  mockKitchens,
  mockDishCatalog,
  getKitchensForCity,
} from '../models/mockData';
import {
  loadMenuData,
  saveMenuData,
  debouncedSaveSelectionState,
  generateMenuDishId,
} from '../storage/menuStorage';
import {
  MenuHeader,
  CityKitchenSelector,
  DateStrip,
  MealToggle,
  SavingIndicator,
  CurrentMenuSection,
  DishCatalogSheet,
} from '../components';
import { colors, spacing } from '../../../theme';

interface MenuManagementScreenProps {
  onMenuPress: () => void;
}

// Toast helper
const showToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // For iOS, we could use a custom toast component
    // For now, just log it
    console.log('Toast:', message);
  }
};

export const MenuManagementScreen: React.FC<MenuManagementScreenProps> = ({
  onMenuPress,
}) => {
  const { showError } = useAlert();
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Selection state
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [selectedKitchenId, setSelectedKitchenId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMealType, setSelectedMealType] = useState<MealType>('LUNCH');

  // Menu data
  const [menusByKey, setMenusByKey] = useState<MenusByKey>({});

  // Dish catalog sheet
  const [showDishCatalog, setShowDishCatalog] = useState(false);

  // Undo state for removed dishes
  const [lastRemovedDish, setLastRemovedDish] = useState<{
    menuKey: string;
    menuDish: MenuDish;
  } | null>(null);

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Save selection state on changes
  useEffect(() => {
    if (!isLoading && selectedCityId && selectedKitchenId) {
      debouncedSaveSelectionState({
        selectedCityId,
        selectedKitchenId,
        selectedDate: formatDateForKey(selectedDate),
        selectedMealType,
      });
    }
  }, [selectedCityId, selectedKitchenId, selectedDate, selectedMealType, isLoading]);

  // Save menus on changes
  useEffect(() => {
    if (!isLoading) {
      saveMenuData(
        menusByKey,
        () => {
          setIsSaving(true);
          setSaveError(false);
        },
        () => {
          setIsSaving(false);
          setSaveError(false);
        },
        () => {
          setIsSaving(false);
          setSaveError(true);
        }
      );
    }
  }, [menusByKey, isLoading]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const { menusByKey: loadedMenus, selectionState } = await loadMenuData();

      setMenusByKey(loadedMenus);

      if (selectionState.selectedCityId) {
        setSelectedCityId(selectionState.selectedCityId);
      } else if (mockCities.length > 0) {
        setSelectedCityId(mockCities[0].id);
      }

      if (selectionState.selectedKitchenId) {
        setSelectedKitchenId(selectionState.selectedKitchenId);
      } else {
        const cityId = selectionState.selectedCityId || mockCities[0]?.id;
        if (cityId) {
          const kitchens = getKitchensForCity(cityId);
          if (kitchens.length > 0) {
            setSelectedKitchenId(kitchens[0].id);
          }
        }
      }

      setSelectedMealType(selectionState.selectedMealType);

      // Always use today's date for initial load
      setSelectedDate(new Date());
    } catch (error) {
      console.error('Error loading menu data:', error);
      showError('Error', 'Failed to load menu data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current menu key
  const currentMenuKey = useMemo(() => {
    if (!selectedCityId || !selectedKitchenId) return null;
    return generateMenuKey(
      selectedCityId,
      selectedKitchenId,
      formatDateForKey(selectedDate),
      selectedMealType
    );
  }, [selectedCityId, selectedKitchenId, selectedDate, selectedMealType]);

  // Get current menu
  const currentMenu = useMemo((): Menu | null => {
    if (!currentMenuKey) return null;
    return menusByKey[currentMenuKey] || null;
  }, [currentMenuKey, menusByKey]);

  // Get existing dish IDs in current menu
  const existingDishIds = useMemo(() => {
    return currentMenu?.menuDishes.map((md) => md.dishId) || [];
  }, [currentMenu]);

  // Handle city change
  const handleCityChange = useCallback((cityId: string) => {
    setSelectedCityId(cityId);
    // Reset kitchen to first one in new city
    const kitchens = getKitchensForCity(cityId);
    if (kitchens.length > 0) {
      setSelectedKitchenId(kitchens[0].id);
    } else {
      setSelectedKitchenId(null);
    }
  }, []);

  // Handle kitchen change
  const handleKitchenChange = useCallback((kitchenId: string) => {
    setSelectedKitchenId(kitchenId);
  }, []);

  // Handle date change
  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  // Handle meal type change
  const handleMealTypeChange = useCallback((mealType: MealType) => {
    setSelectedMealType(mealType);
  }, []);

  // Add dishes to current menu
  const handleAddDishes = useCallback((dishIds: string[]) => {
    if (!currentMenuKey) return;

    setMenusByKey((prev) => {
      const existingMenu = prev[currentMenuKey] || { menuDishes: [], lastUpdated: '' };
      const maxSortOrder = existingMenu.menuDishes.reduce(
        (max, md) => Math.max(max, md.sortOrder),
        0
      );

      const newMenuDishes: MenuDish[] = dishIds.map((dishId, index) => ({
        id: generateMenuDishId(),
        dishId,
        sortOrder: maxSortOrder + index + 1,
        isFeatured: false,
        addedAt: new Date().toISOString(),
      }));

      return {
        ...prev,
        [currentMenuKey]: {
          menuDishes: [...existingMenu.menuDishes, ...newMenuDishes],
          lastUpdated: new Date().toISOString(),
        },
      };
    });

    setShowDishCatalog(false);
    showToast(`${dishIds.length} dish${dishIds.length > 1 ? 'es' : ''} added`);
  }, [currentMenuKey]);

  // Remove dish from current menu
  const handleRemoveDish = useCallback((menuDishId: string) => {
    if (!currentMenuKey) return;

    const menuDish = currentMenu?.menuDishes.find((md) => md.id === menuDishId);
    if (menuDish) {
      setLastRemovedDish({ menuKey: currentMenuKey, menuDish });
    }

    setMenusByKey((prev) => {
      const existingMenu = prev[currentMenuKey];
      if (!existingMenu) return prev;

      return {
        ...prev,
        [currentMenuKey]: {
          menuDishes: existingMenu.menuDishes.filter((md) => md.id !== menuDishId),
          lastUpdated: new Date().toISOString(),
        },
      };
    });

    showToast('Dish removed');

    // Auto-clear undo after 5 seconds
    setTimeout(() => {
      setLastRemovedDish(null);
    }, 5000);
  }, [currentMenuKey, currentMenu]);

  // Toggle featured status
  const handleToggleFeatured = useCallback((menuDishId: string) => {
    if (!currentMenuKey) return;

    setMenusByKey((prev) => {
      const existingMenu = prev[currentMenuKey];
      if (!existingMenu) return prev;

      return {
        ...prev,
        [currentMenuKey]: {
          menuDishes: existingMenu.menuDishes.map((md) =>
            md.id === menuDishId ? { ...md, isFeatured: !md.isFeatured } : md
          ),
          lastUpdated: new Date().toISOString(),
        },
      };
    });

    showToast('Featured status updated');
  }, [currentMenuKey]);

  // Reorder dishes
  const handleReorderDishes = useCallback((reorderedDishes: MenuDish[]) => {
    if (!currentMenuKey) return;

    setMenusByKey((prev) => ({
      ...prev,
      [currentMenuKey]: {
        menuDishes: reorderedDishes.map((md, index) => ({
          ...md,
          sortOrder: index + 1,
        })),
        lastUpdated: new Date().toISOString(),
      },
    }));
  }, [currentMenuKey]);

  // Undo remove
  const handleUndoRemove = useCallback(() => {
    if (!lastRemovedDish) return;

    setMenusByKey((prev) => {
      const existingMenu = prev[lastRemovedDish.menuKey] || { menuDishes: [], lastUpdated: '' };

      return {
        ...prev,
        [lastRemovedDish.menuKey]: {
          menuDishes: [...existingMenu.menuDishes, lastRemovedDish.menuDish],
          lastUpdated: new Date().toISOString(),
        },
      };
    });

    setLastRemovedDish(null);
    showToast('Dish restored');
  }, [lastRemovedDish]);

  // Get available kitchens for selected city
  const availableKitchens = useMemo(() => {
    if (!selectedCityId) return [];
    return getKitchensForCity(selectedCityId);
  }, [selectedCityId]);

  if (isLoading) {
    return (
      <SafeAreaScreen style={{ flex: 1 }} topBackgroundColor={colors.primary} bottomBackgroundColor={colors.background}>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaScreen>
    );
  }

  return (
    <SafeAreaScreen style={{ flex: 1 }} topBackgroundColor={colors.primary} bottomBackgroundColor={colors.background}>
      {/* Header */}
      <MenuHeader onMenuPress={onMenuPress} />

      {/* Saving Indicator */}
      <View style={styles.savingIndicatorContainer}>
        <SavingIndicator isSaving={isSaving} hasError={saveError} />
      </View>
      <View style={{ flex: 1, backgroundColor: colors.background }}>

        {/* City & Kitchen Selector */}
        <CityKitchenSelector
          cities={mockCities}
          kitchens={mockKitchens}
          selectedCityId={selectedCityId}
          selectedKitchenId={selectedKitchenId}
          onCityChange={handleCityChange}
          onKitchenChange={handleKitchenChange}
        />

        {/* Date Strip */}
        <DateStrip
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />

        {/* Meal Toggle */}
        <MealToggle
          selectedMeal={selectedMealType}
          onMealChange={handleMealTypeChange}
        />

        {/* Current Menu Section */}
        {selectedCityId && selectedKitchenId ? (
          <CurrentMenuSection
            selectedDate={selectedDate}
            selectedMealType={selectedMealType}
            menuDishes={currentMenu?.menuDishes || []}
            dishCatalog={mockDishCatalog}
            onAddDishes={() => setShowDishCatalog(true)}
            onRemoveDish={handleRemoveDish}
            onToggleFeatured={handleToggleFeatured}
            onReorderDishes={handleReorderDishes}
          />
        ) : (
          <View style={styles.noSelectionContainer}>
            <View style={styles.noSelectionContent}>
              <View style={styles.noSelectionIcon}>
                <View style={styles.noSelectionIconCircle} />
              </View>
            </View>
          </View>
        )}

        {/* Dish Catalog Sheet */}
        <DishCatalogSheet
          visible={showDishCatalog}
          dishes={mockDishCatalog}
          existingDishIds={existingDishIds}
          selectedDate={selectedDate}
          mealType={selectedMealType}
          onClose={() => setShowDishCatalog(false)}
          onAddDishes={handleAddDishes}
        />
      </View>
    </SafeAreaScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  savingIndicatorContainer: {
    position: 'absolute',
    top: 60,
    right: spacing.md,
    zIndex: 100,
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  noSelectionContent: {
    alignItems: 'center',
  },
  noSelectionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSelectionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: colors.divider,
    borderStyle: 'dashed',
  },
});

export default MenuManagementScreen;
