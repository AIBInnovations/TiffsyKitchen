// City
export interface City {
  id: string;
  name: string;
}

// Kitchen
export interface Kitchen {
  id: string;
  name: string;
  cityId: string;
}

// Meal Type
export type MealType = 'LUNCH' | 'DINNER';

// Dish Tags
export type DishTag = 'VEG' | 'NON_VEG' | 'VEGAN' | 'JAIN_FRIENDLY' | 'SPICY' | 'GLUTEN_FREE';

// Tag display configuration
export const dishTagConfig: Record<DishTag, { label: string; color: string; bgColor: string; icon: string }> = {
  VEG: { label: 'Veg', color: '#16a34a', bgColor: '#dcfce7', icon: 'eco' },
  NON_VEG: { label: 'Non-Veg', color: '#dc2626', bgColor: '#fee2e2', icon: 'restaurant' },
  VEGAN: { label: 'Vegan', color: '#059669', bgColor: '#d1fae5', icon: 'spa' },
  JAIN_FRIENDLY: { label: 'Jain', color: '#7c3aed', bgColor: '#ede9fe', icon: 'verified' },
  SPICY: { label: 'Spicy', color: '#ea580c', bgColor: '#ffedd5', icon: 'whatshot' },
  GLUTEN_FREE: { label: 'GF', color: '#0891b2', bgColor: '#cffafe', icon: 'check-circle' },
};

// Dish from catalog
export interface Dish {
  id: string;
  name: string;
  description?: string;
  tags: DishTag[];
  thumbnailUrl?: string;
  category?: string;
}

// Dish as configured in a menu
export interface MenuDish {
  id: string;
  dishId: string;
  sortOrder: number;
  isFeatured?: boolean;
  addedAt: string;
}

// Menu for a specific date/meal/kitchen/city combination
export interface Menu {
  menuDishes: MenuDish[];
  lastUpdated: string;
}

// Map of all menus by key
export type MenusByKey = Record<string, Menu>;

// Menu key generation helper
export const generateMenuKey = (
  cityId: string,
  kitchenId: string,
  date: string,
  mealType: MealType
): string => {
  return `${cityId}__${kitchenId}__${date}__${mealType}`;
};

// Parse menu key back to components
export const parseMenuKey = (menuKey: string): {
  cityId: string;
  kitchenId: string;
  date: string;
  mealType: MealType;
} | null => {
  const parts = menuKey.split('__');
  if (parts.length !== 4) return null;
  return {
    cityId: parts[0],
    kitchenId: parts[1],
    date: parts[2],
    mealType: parts[3] as MealType,
  };
};

// User's last selection state
export interface MenuSelectionState {
  selectedCityId: string | null;
  selectedKitchenId: string | null;
  selectedDate: string; // YYYY-MM-DD format
  selectedMealType: MealType;
}

// Persisted data structure
export interface PersistedMenuData {
  menusByKey: MenusByKey;
  selectionState: MenuSelectionState;
  lastSavedAt: string;
}

// Date helper for formatting
export const formatDateForKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Date display formatting
export const formatDateDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

// Get day name short
export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-IN', { weekday: 'short' });
};

// Get day number
export const getDayNumber = (date: Date): number => {
  return date.getDate();
};

// Check if same day
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDateForKey(date1) === formatDateForKey(date2);
};

// Get week dates centered around a date
export const getWeekDates = (centerDate: Date, daysCount: number = 7): Date[] => {
  const dates: Date[] = [];
  const halfDays = Math.floor(daysCount / 2);

  for (let i = -halfDays; i <= halfDays; i++) {
    const date = new Date(centerDate);
    date.setDate(centerDate.getDate() + i);
    dates.push(date);
  }

  return dates;
};
