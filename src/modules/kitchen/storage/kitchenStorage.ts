// Kitchen Storage - AsyncStorage persistence layer
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  KitchenStatus,
  KitchenTab,
  CapacitySettings,
  CutoffSettings,
  ServiceArea,
  PackagingStats,
  PersistedKitchenSettings,
  StaffMember,
  DeliveryBatch,
} from '../models/types';
import {
  defaultCapacitySettings,
  defaultCutoffSettings,
  defaultServiceAreas,
  defaultPackagingStats,
  mockStaffMembers,
  mockDeliveryBatches,
} from '../models/mockData';

const STORAGE_KEYS = {
  KITCHEN_SETTINGS: '@tiffsy_kitchen_settings',
  STAFF_MEMBERS: '@tiffsy_kitchen_staff',
  DELIVERY_BATCHES: '@tiffsy_kitchen_batches',
};

// Default persisted settings
export const getDefaultPersistedSettings = (): PersistedKitchenSettings => ({
  lastSelectedTab: 'Overview',
  kitchenStatus: 'Online',
  capacitySettings: defaultCapacitySettings,
  cutoffSettings: defaultCutoffSettings,
  serviceAreas: defaultServiceAreas,
  packagingStats: defaultPackagingStats,
  lastSelectedDate: new Date().toISOString().split('T')[0],
});

/**
 * Load kitchen settings from AsyncStorage
 */
export const loadKitchenSettings = async (): Promise<PersistedKitchenSettings> => {
  try {
    const storedData = await AsyncStorage.getItem(STORAGE_KEYS.KITCHEN_SETTINGS);

    if (storedData) {
      const settings = JSON.parse(storedData) as PersistedKitchenSettings;
      // Merge with defaults to handle any new fields
      return {
        ...getDefaultPersistedSettings(),
        ...settings,
      };
    }

    // No data found, return defaults
    const defaults = getDefaultPersistedSettings();
    await saveKitchenSettings(defaults);
    return defaults;
  } catch (error) {
    console.error('Error loading kitchen settings:', error);
    return getDefaultPersistedSettings();
  }
};

/**
 * Save kitchen settings to AsyncStorage
 */
export const saveKitchenSettings = async (settings: PersistedKitchenSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.KITCHEN_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving kitchen settings:', error);
    throw error;
  }
};

/**
 * Update specific kitchen setting
 */
export const updateKitchenSetting = async <K extends keyof PersistedKitchenSettings>(
  key: K,
  value: PersistedKitchenSettings[K]
): Promise<void> => {
  try {
    const currentSettings = await loadKitchenSettings();
    const updatedSettings = { ...currentSettings, [key]: value };
    await saveKitchenSettings(updatedSettings);
  } catch (error) {
    console.error('Error updating kitchen setting:', error);
    throw error;
  }
};

/**
 * Save kitchen status
 */
export const saveKitchenStatus = async (status: KitchenStatus): Promise<void> => {
  await updateKitchenSetting('kitchenStatus', status);
};

/**
 * Save selected tab
 */
export const saveSelectedTab = async (tab: KitchenTab): Promise<void> => {
  await updateKitchenSetting('lastSelectedTab', tab);
};

/**
 * Save capacity settings
 */
export const saveCapacitySettings = async (settings: CapacitySettings): Promise<void> => {
  await updateKitchenSetting('capacitySettings', settings);
};

/**
 * Save cut-off settings
 */
export const saveCutoffSettings = async (settings: CutoffSettings): Promise<void> => {
  await updateKitchenSetting('cutoffSettings', settings);
};

/**
 * Save service areas
 */
export const saveServiceAreas = async (areas: ServiceArea[]): Promise<void> => {
  await updateKitchenSetting('serviceAreas', areas);
};

/**
 * Save packaging stats
 */
export const savePackagingStats = async (stats: PackagingStats): Promise<void> => {
  await updateKitchenSetting('packagingStats', stats);
};

/**
 * Load staff members from storage
 */
export const loadStaffMembers = async (): Promise<StaffMember[]> => {
  try {
    const storedData = await AsyncStorage.getItem(STORAGE_KEYS.STAFF_MEMBERS);

    if (storedData) {
      return JSON.parse(storedData) as StaffMember[];
    }

    // No data found, seed with mock data
    await saveStaffMembers(mockStaffMembers);
    return mockStaffMembers;
  } catch (error) {
    console.error('Error loading staff members:', error);
    return mockStaffMembers;
  }
};

/**
 * Save staff members to storage
 */
export const saveStaffMembers = async (staff: StaffMember[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.STAFF_MEMBERS, JSON.stringify(staff));
  } catch (error) {
    console.error('Error saving staff members:', error);
    throw error;
  }
};

/**
 * Update staff member
 */
export const updateStaffMember = async (updatedMember: StaffMember): Promise<StaffMember[]> => {
  const staff = await loadStaffMembers();
  const updatedStaff = staff.map(member =>
    member.id === updatedMember.id ? updatedMember : member
  );
  await saveStaffMembers(updatedStaff);
  return updatedStaff;
};

/**
 * Load delivery batches from storage
 */
export const loadDeliveryBatches = async (): Promise<DeliveryBatch[]> => {
  try {
    const storedData = await AsyncStorage.getItem(STORAGE_KEYS.DELIVERY_BATCHES);

    if (storedData) {
      return JSON.parse(storedData) as DeliveryBatch[];
    }

    // No data found, seed with mock data
    await saveDeliveryBatches(mockDeliveryBatches);
    return mockDeliveryBatches;
  } catch (error) {
    console.error('Error loading delivery batches:', error);
    return mockDeliveryBatches;
  }
};

/**
 * Save delivery batches to storage
 */
export const saveDeliveryBatches = async (batches: DeliveryBatch[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DELIVERY_BATCHES, JSON.stringify(batches));
  } catch (error) {
    console.error('Error saving delivery batches:', error);
    throw error;
  }
};

/**
 * Update batch status
 */
export const updateBatchStatus = async (
  batchId: string,
  newStatus: DeliveryBatch['status']
): Promise<DeliveryBatch[]> => {
  const batches = await loadDeliveryBatches();
  const updatedBatches = batches.map(batch =>
    batch.id === batchId ? { ...batch, status: newStatus } : batch
  );
  await saveDeliveryBatches(updatedBatches);
  return updatedBatches;
};

/**
 * Debounced save helper
 */
let saveTimeout: NodeJS.Timeout | null = null;

export const debouncedSaveSettings = (settings: PersistedKitchenSettings, delay: number = 500): void => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveKitchenSettings(settings);
  }, delay);
};

/**
 * Clear all kitchen storage (for testing/reset)
 */
export const clearKitchenStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.KITCHEN_SETTINGS,
      STORAGE_KEYS.STAFF_MEMBERS,
      STORAGE_KEYS.DELIVERY_BATCHES,
    ]);
  } catch (error) {
    console.error('Error clearing kitchen storage:', error);
    throw error;
  }
};
