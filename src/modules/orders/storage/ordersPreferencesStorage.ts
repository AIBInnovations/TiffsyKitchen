import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrdersFilter, OrderSortOption, DateRangeOption } from '../models/types';

const STORAGE_KEYS = {
  ORDERS_FILTERS: '@tiffsy/orders_filters',
  ORDERS_SORT: '@tiffsy/orders_sort',
  ORDERS_CITY: '@tiffsy/orders_context_city',
  ORDERS_DATE_RANGE: '@tiffsy/orders_context_dateRange',
  ORDERS_CUSTOM_DATE_START: '@tiffsy/orders_custom_date_start',
  ORDERS_CUSTOM_DATE_END: '@tiffsy/orders_custom_date_end',
};

export const defaultFilters: OrdersFilter = {
  searchQuery: '',
  mealType: 'all',
  orderStatus: 'all',
  paymentStatus: 'all',
  packagingType: 'all',
  subscriptionPlan: 'all',
  city: 'all',
  kitchen: 'all',
  zone: 'all',
  dateRange: 'today',
  sortBy: 'newest_first',
};

// Save filters
export const saveOrdersFilters = async (filters: Partial<OrdersFilter>): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS_FILTERS, JSON.stringify(filters));
  } catch (error) {
    console.error('Error saving orders filters:', error);
  }
};

// Load filters
export const loadOrdersFilters = async (): Promise<Partial<OrdersFilter>> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS_FILTERS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading orders filters:', error);
  }
  return {};
};

// Save sort option
export const saveOrdersSort = async (sortBy: OrderSortOption): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS_SORT, sortBy);
  } catch (error) {
    console.error('Error saving orders sort:', error);
  }
};

// Load sort option
export const loadOrdersSort = async (): Promise<OrderSortOption> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS_SORT);
    if (stored) {
      return stored as OrderSortOption;
    }
  } catch (error) {
    console.error('Error loading orders sort:', error);
  }
  return 'newest_first';
};

// Save city preference
export const saveOrdersCity = async (city: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS_CITY, city);
  } catch (error) {
    console.error('Error saving orders city:', error);
  }
};

// Load city preference
export const loadOrdersCity = async (): Promise<string> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS_CITY);
    if (stored) {
      return stored;
    }
  } catch (error) {
    console.error('Error loading orders city:', error);
  }
  return 'all';
};

// Save date range preference
export const saveOrdersDateRange = async (dateRange: DateRangeOption): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS_DATE_RANGE, dateRange);
  } catch (error) {
    console.error('Error saving orders date range:', error);
  }
};

// Load date range preference
export const loadOrdersDateRange = async (): Promise<DateRangeOption> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.ORDERS_DATE_RANGE);
    if (stored) {
      return stored as DateRangeOption;
    }
  } catch (error) {
    console.error('Error loading orders date range:', error);
  }
  return 'today';
};

// Save all preferences at once
export const saveAllOrdersPreferences = async (
  filters: OrdersFilter
): Promise<void> => {
  try {
    await Promise.all([
      saveOrdersFilters(filters),
      saveOrdersSort(filters.sortBy),
      saveOrdersCity(filters.city),
      saveOrdersDateRange(filters.dateRange),
    ]);
  } catch (error) {
    console.error('Error saving all orders preferences:', error);
  }
};

// Load all preferences at once
export const loadAllOrdersPreferences = async (): Promise<OrdersFilter> => {
  try {
    const [filters, sortBy, city, dateRange] = await Promise.all([
      loadOrdersFilters(),
      loadOrdersSort(),
      loadOrdersCity(),
      loadOrdersDateRange(),
    ]);

    return {
      ...defaultFilters,
      ...filters,
      sortBy,
      city,
      dateRange,
    };
  } catch (error) {
    console.error('Error loading all orders preferences:', error);
    return defaultFilters;
  }
};

// Clear all preferences
export const clearOrdersPreferences = async (): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ORDERS_FILTERS),
      AsyncStorage.removeItem(STORAGE_KEYS.ORDERS_SORT),
      AsyncStorage.removeItem(STORAGE_KEYS.ORDERS_CITY),
      AsyncStorage.removeItem(STORAGE_KEYS.ORDERS_DATE_RANGE),
    ]);
  } catch (error) {
    console.error('Error clearing orders preferences:', error);
  }
};
