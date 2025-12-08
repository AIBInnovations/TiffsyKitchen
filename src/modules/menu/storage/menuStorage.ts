import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MenusByKey,
  MenuSelectionState,
  PersistedMenuData,
  formatDateForKey,
} from '../models/types';
import { defaultSelectionState, sampleMenusByKey } from '../models/mockData';

// Storage keys
const MENU_DATA_KEY = '@TiffsyKitchen:MenuData';
const MENU_SELECTION_KEY = '@TiffsyKitchen:MenuSelection';

// Debounce timer reference
let saveTimeout: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 500; // ms

// Load all menu data from storage
export const loadMenuData = async (): Promise<{
  menusByKey: MenusByKey;
  selectionState: MenuSelectionState;
}> => {
  try {
    const [menuDataStr, selectionStr] = await Promise.all([
      AsyncStorage.getItem(MENU_DATA_KEY),
      AsyncStorage.getItem(MENU_SELECTION_KEY),
    ]);

    let menusByKey: MenusByKey = {};
    let selectionState: MenuSelectionState = {
      ...defaultSelectionState,
      selectedDate: formatDateForKey(new Date()),
    };

    // Parse menus data
    if (menuDataStr) {
      try {
        const parsed: PersistedMenuData = JSON.parse(menuDataStr);
        menusByKey = parsed.menusByKey || {};
      } catch (e) {
        console.warn('Failed to parse menu data, using defaults');
        menusByKey = { ...sampleMenusByKey };
      }
    } else {
      // First time load - use sample data
      menusByKey = { ...sampleMenusByKey };
    }

    // Parse selection state
    if (selectionStr) {
      try {
        const parsed = JSON.parse(selectionStr);
        selectionState = {
          ...selectionState,
          ...parsed,
          // Always default to today's date if saved date is in the past
          selectedDate: formatDateForKey(new Date()),
        };
      } catch (e) {
        console.warn('Failed to parse selection state, using defaults');
      }
    }

    return { menusByKey, selectionState };
  } catch (error) {
    console.error('Error loading menu data:', error);
    return {
      menusByKey: { ...sampleMenusByKey },
      selectionState: {
        ...defaultSelectionState,
        selectedDate: formatDateForKey(new Date()),
      },
    };
  }
};

// Save menu data with debouncing
export const saveMenuData = async (
  menusByKey: MenusByKey,
  onSaveStart?: () => void,
  onSaveComplete?: () => void,
  onSaveError?: (error: Error) => void
): Promise<void> => {
  // Clear any pending save
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // Notify save starting
  onSaveStart?.();

  // Debounced save
  saveTimeout = setTimeout(async () => {
    try {
      const dataToSave: PersistedMenuData = {
        menusByKey,
        selectionState: defaultSelectionState, // This will be overwritten by separate selection save
        lastSavedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(MENU_DATA_KEY, JSON.stringify(dataToSave));
      onSaveComplete?.();
    } catch (error) {
      console.error('Error saving menu data:', error);
      onSaveError?.(error as Error);
    }
  }, DEBOUNCE_DELAY);
};

// Save selection state (immediate, no debounce)
export const saveSelectionState = async (
  selectionState: MenuSelectionState
): Promise<void> => {
  try {
    await AsyncStorage.setItem(MENU_SELECTION_KEY, JSON.stringify(selectionState));
  } catch (error) {
    console.error('Error saving selection state:', error);
  }
};

// Debounced save for selection state
let selectionSaveTimeout: NodeJS.Timeout | null = null;

export const debouncedSaveSelectionState = (
  selectionState: MenuSelectionState
): void => {
  if (selectionSaveTimeout) {
    clearTimeout(selectionSaveTimeout);
  }

  selectionSaveTimeout = setTimeout(async () => {
    await saveSelectionState(selectionState);
  }, 300);
};

// Clear all menu data (for testing/reset)
export const clearMenuData = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(MENU_DATA_KEY),
      AsyncStorage.removeItem(MENU_SELECTION_KEY),
    ]);
  } catch (error) {
    console.error('Error clearing menu data:', error);
  }
};

// Generate unique ID for menu dish
export const generateMenuDishId = (): string => {
  return `md-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
