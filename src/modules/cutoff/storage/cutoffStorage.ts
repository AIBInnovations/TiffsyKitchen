import AsyncStorage from '@react-native-async-storage/async-storage';
import { CutoffTimesSettings, DEFAULT_SETTINGS } from '../models/types';

// Storage key
const CUTOFF_SETTINGS_KEY = '@TiffsyKitchen:CutoffTimesSettings';

// Load settings from storage
export const loadCutoffSettings = async (): Promise<CutoffTimesSettings> => {
  try {
    const storedData = await AsyncStorage.getItem(CUTOFF_SETTINGS_KEY);

    if (storedData) {
      const parsed = JSON.parse(storedData) as CutoffTimesSettings;
      // Merge with defaults to ensure all fields exist (in case of schema updates)
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        operationalBehavior: {
          ...DEFAULT_SETTINGS.operationalBehavior,
          ...parsed.operationalBehavior,
        },
        capacity: {
          ...DEFAULT_SETTINGS.capacity,
          ...parsed.capacity,
        },
        emergencyOverride: {
          ...DEFAULT_SETTINGS.emergencyOverride,
          ...parsed.emergencyOverride,
        },
      };
    }

    return { ...DEFAULT_SETTINGS };
  } catch (error) {
    console.error('Error loading cutoff settings:', error);
    return { ...DEFAULT_SETTINGS };
  }
};

// Save settings to storage
export const saveCutoffSettings = async (
  settings: CutoffTimesSettings
): Promise<boolean> => {
  try {
    const dataToSave: CutoffTimesSettings = {
      ...settings,
      lastSavedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(CUTOFF_SETTINGS_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Error saving cutoff settings:', error);
    return false;
  }
};

// Clear settings (reset to defaults)
export const clearCutoffSettings = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(CUTOFF_SETTINGS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing cutoff settings:', error);
    return false;
  }
};
