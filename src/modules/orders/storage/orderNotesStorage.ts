import AsyncStorage from '@react-native-async-storage/async-storage';

const ORDER_NOTES_PREFIX = '@tiffsy/order_notes_';
const ORDER_SECTIONS_PREFIX = '@tiffsy/order_sections_';

// Get storage key for order notes
const getNotesKey = (orderId: string): string => `${ORDER_NOTES_PREFIX}${orderId}`;

// Get storage key for order sections visibility
const getSectionsKey = (orderId: string): string => `${ORDER_SECTIONS_PREFIX}${orderId}`;

// Save admin notes for an order
export const saveOrderNotes = async (orderId: string, notes: string): Promise<void> => {
  try {
    const key = getNotesKey(orderId);
    if (notes.trim()) {
      await AsyncStorage.setItem(key, notes);
    } else {
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error saving order notes:', error);
  }
};

// Load admin notes for an order
export const loadOrderNotes = async (orderId: string): Promise<string> => {
  try {
    const key = getNotesKey(orderId);
    const stored = await AsyncStorage.getItem(key);
    return stored || '';
  } catch (error) {
    console.error('Error loading order notes:', error);
    return '';
  }
};

// Delete admin notes for an order
export const deleteOrderNotes = async (orderId: string): Promise<void> => {
  try {
    const key = getNotesKey(orderId);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting order notes:', error);
  }
};

// Sections visibility state
export interface OrderSectionsState {
  customer: boolean;
  items: boolean;
  subscription: boolean;
  delivery: boolean;
  payment: boolean;
  support: boolean;
  notes: boolean;
  audit: boolean;
}

const defaultSectionsState: OrderSectionsState = {
  customer: true,
  items: true,
  subscription: true,
  delivery: true,
  payment: true,
  support: true,
  notes: true,
  audit: true,
};

// Save sections visibility state
export const saveOrderSections = async (
  orderId: string,
  sections: OrderSectionsState
): Promise<void> => {
  try {
    const key = getSectionsKey(orderId);
    await AsyncStorage.setItem(key, JSON.stringify(sections));
  } catch (error) {
    console.error('Error saving order sections:', error);
  }
};

// Load sections visibility state
export const loadOrderSections = async (orderId: string): Promise<OrderSectionsState> => {
  try {
    const key = getSectionsKey(orderId);
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      return { ...defaultSectionsState, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading order sections:', error);
  }
  return defaultSectionsState;
};

// Get all orders that have notes saved
export const getAllOrdersWithNotes = async (): Promise<string[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys
      .filter(key => key.startsWith(ORDER_NOTES_PREFIX))
      .map(key => key.replace(ORDER_NOTES_PREFIX, ''));
  } catch (error) {
    console.error('Error getting orders with notes:', error);
    return [];
  }
};

// Clear all order notes
export const clearAllOrderNotes = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const noteKeys = keys.filter(key => key.startsWith(ORDER_NOTES_PREFIX));
    if (noteKeys.length > 0) {
      await AsyncStorage.multiRemove(noteKeys);
    }
  } catch (error) {
    console.error('Error clearing all order notes:', error);
  }
};
