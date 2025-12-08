import { City, Kitchen, Dish, MenusByKey, MenuSelectionState, formatDateForKey } from './types';

// Mock Cities
export const mockCities: City[] = [
  { id: 'city-jaipur', name: 'Jaipur' },
  { id: 'city-indore', name: 'Indore' },
  { id: 'city-delhi', name: 'Delhi' },
];

// Mock Kitchens
export const mockKitchens: Kitchen[] = [
  // Jaipur Kitchens
  { id: 'kitchen-jaipur-central', name: 'Jaipur Central Kitchen', cityId: 'city-jaipur' },
  { id: 'kitchen-jaipur-north', name: 'Jaipur North Kitchen', cityId: 'city-jaipur' },
  { id: 'kitchen-jaipur-south', name: 'Jaipur South Kitchen', cityId: 'city-jaipur' },
  // Indore Kitchens
  { id: 'kitchen-indore-main', name: 'Indore Main Kitchen', cityId: 'city-indore' },
  { id: 'kitchen-indore-west', name: 'Indore West Kitchen', cityId: 'city-indore' },
  // Delhi Kitchens
  { id: 'kitchen-delhi-central', name: 'Delhi Central Kitchen', cityId: 'city-delhi' },
];

// Mock Dish Catalog
export const mockDishCatalog: Dish[] = [
  // Main Courses - Veg
  {
    id: 'dish-dal-tadka',
    name: 'Dal Tadka',
    description: 'Yellow lentils tempered with cumin, garlic, and spices',
    tags: ['VEG', 'JAIN_FRIENDLY'],
    category: 'Main Course',
  },
  {
    id: 'dish-paneer-butter-masala',
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese cubes in rich creamy tomato gravy',
    tags: ['VEG'],
    category: 'Main Course',
  },
  {
    id: 'dish-palak-paneer',
    name: 'Palak Paneer',
    description: 'Cottage cheese in creamy spinach gravy',
    tags: ['VEG', 'GLUTEN_FREE'],
    category: 'Main Course',
  },
  {
    id: 'dish-mix-veg',
    name: 'Mix Vegetable',
    description: 'Seasonal vegetables cooked in mild spices',
    tags: ['VEG', 'VEGAN', 'JAIN_FRIENDLY'],
    category: 'Main Course',
  },
  {
    id: 'dish-aloo-gobi',
    name: 'Aloo Gobi',
    description: 'Potato and cauliflower dry curry with turmeric',
    tags: ['VEG', 'VEGAN', 'JAIN_FRIENDLY', 'GLUTEN_FREE'],
    category: 'Main Course',
  },
  {
    id: 'dish-chole',
    name: 'Chole Masala',
    description: 'Chickpeas cooked in spicy onion-tomato gravy',
    tags: ['VEG', 'VEGAN', 'SPICY'],
    category: 'Main Course',
  },
  {
    id: 'dish-kadhi-pakoda',
    name: 'Kadhi Pakoda',
    description: 'Yogurt curry with crispy gram flour fritters',
    tags: ['VEG'],
    category: 'Main Course',
  },
  {
    id: 'dish-malai-kofta',
    name: 'Malai Kofta',
    description: 'Cottage cheese dumplings in rich cream sauce',
    tags: ['VEG'],
    category: 'Main Course',
  },
  {
    id: 'dish-bhindi-masala',
    name: 'Bhindi Masala',
    description: 'Okra stir-fried with onions and spices',
    tags: ['VEG', 'VEGAN', 'GLUTEN_FREE'],
    category: 'Main Course',
  },
  {
    id: 'dish-dal-makhani',
    name: 'Dal Makhani',
    description: 'Creamy black lentils slow-cooked overnight',
    tags: ['VEG'],
    category: 'Main Course',
  },

  // Main Courses - Non-Veg
  {
    id: 'dish-butter-chicken',
    name: 'Butter Chicken',
    description: 'Tender chicken in creamy tomato-butter sauce',
    tags: ['NON_VEG'],
    category: 'Main Course',
  },
  {
    id: 'dish-chicken-curry',
    name: 'Chicken Curry',
    description: 'Traditional home-style chicken curry',
    tags: ['NON_VEG', 'SPICY'],
    category: 'Main Course',
  },
  {
    id: 'dish-mutton-rogan-josh',
    name: 'Mutton Rogan Josh',
    description: 'Kashmiri style slow-cooked lamb curry',
    tags: ['NON_VEG', 'SPICY'],
    category: 'Main Course',
  },
  {
    id: 'dish-egg-curry',
    name: 'Egg Curry',
    description: 'Boiled eggs in spiced onion-tomato gravy',
    tags: ['NON_VEG'],
    category: 'Main Course',
  },
  {
    id: 'dish-fish-curry',
    name: 'Fish Curry',
    description: 'Fresh fish in tangy coconut curry',
    tags: ['NON_VEG', 'GLUTEN_FREE'],
    category: 'Main Course',
  },
  {
    id: 'dish-chicken-biryani',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with spiced chicken',
    tags: ['NON_VEG', 'SPICY'],
    category: 'Rice',
  },

  // Rice
  {
    id: 'dish-jeera-rice',
    name: 'Jeera Rice',
    description: 'Cumin-flavored basmati rice',
    tags: ['VEG', 'VEGAN', 'JAIN_FRIENDLY', 'GLUTEN_FREE'],
    category: 'Rice',
  },
  {
    id: 'dish-steamed-rice',
    name: 'Steamed Rice',
    description: 'Plain steamed basmati rice',
    tags: ['VEG', 'VEGAN', 'JAIN_FRIENDLY', 'GLUTEN_FREE'],
    category: 'Rice',
  },
  {
    id: 'dish-veg-pulao',
    name: 'Veg Pulao',
    description: 'Fragrant rice with mixed vegetables',
    tags: ['VEG', 'VEGAN'],
    category: 'Rice',
  },
  {
    id: 'dish-lemon-rice',
    name: 'Lemon Rice',
    description: 'Tangy rice with peanuts and curry leaves',
    tags: ['VEG', 'VEGAN', 'GLUTEN_FREE'],
    category: 'Rice',
  },

  // Breads
  {
    id: 'dish-roti',
    name: 'Roti',
    description: 'Whole wheat flatbread',
    tags: ['VEG', 'VEGAN'],
    category: 'Bread',
  },
  {
    id: 'dish-naan',
    name: 'Butter Naan',
    description: 'Soft leavened bread brushed with butter',
    tags: ['VEG'],
    category: 'Bread',
  },
  {
    id: 'dish-paratha',
    name: 'Paratha',
    description: 'Layered whole wheat flatbread',
    tags: ['VEG'],
    category: 'Bread',
  },
  {
    id: 'dish-missi-roti',
    name: 'Missi Roti',
    description: 'Gram flour and wheat flatbread',
    tags: ['VEG', 'VEGAN'],
    category: 'Bread',
  },

  // Salads & Sides
  {
    id: 'dish-green-salad',
    name: 'Green Salad',
    description: 'Fresh cucumber, tomato, onion, and carrot',
    tags: ['VEG', 'VEGAN', 'JAIN_FRIENDLY', 'GLUTEN_FREE'],
    category: 'Salad',
  },
  {
    id: 'dish-raita',
    name: 'Boondi Raita',
    description: 'Yogurt with crispy boondi and spices',
    tags: ['VEG', 'GLUTEN_FREE'],
    category: 'Side',
  },
  {
    id: 'dish-papad',
    name: 'Roasted Papad',
    description: 'Crispy lentil wafer',
    tags: ['VEG', 'VEGAN', 'JAIN_FRIENDLY', 'GLUTEN_FREE'],
    category: 'Side',
  },
  {
    id: 'dish-pickle',
    name: 'Mixed Pickle',
    description: 'Assorted pickled vegetables',
    tags: ['VEG', 'VEGAN', 'SPICY', 'GLUTEN_FREE'],
    category: 'Side',
  },

  // Desserts
  {
    id: 'dish-gulab-jamun',
    name: 'Gulab Jamun',
    description: 'Deep-fried milk solids in sugar syrup',
    tags: ['VEG'],
    category: 'Dessert',
  },
  {
    id: 'dish-kheer',
    name: 'Rice Kheer',
    description: 'Creamy rice pudding with nuts',
    tags: ['VEG', 'GLUTEN_FREE'],
    category: 'Dessert',
  },
  {
    id: 'dish-fruit-custard',
    name: 'Fruit Custard',
    description: 'Fresh fruits in vanilla custard',
    tags: ['VEG', 'GLUTEN_FREE'],
    category: 'Dessert',
  },
  {
    id: 'dish-rasmalai',
    name: 'Rasmalai',
    description: 'Soft cottage cheese patties in saffron milk',
    tags: ['VEG', 'GLUTEN_FREE'],
    category: 'Dessert',
  },
];

// Default selection state
export const defaultSelectionState: MenuSelectionState = {
  selectedCityId: 'city-jaipur',
  selectedKitchenId: 'kitchen-jaipur-central',
  selectedDate: formatDateForKey(new Date()),
  selectedMealType: 'LUNCH',
};

// Sample pre-configured menus for demo
export const sampleMenusByKey: MenusByKey = {
  // Today's lunch for Jaipur Central Kitchen
  [`city-jaipur__kitchen-jaipur-central__${formatDateForKey(new Date())}__LUNCH`]: {
    menuDishes: [
      { id: 'md-1', dishId: 'dish-dal-tadka', sortOrder: 1, isFeatured: true, addedAt: new Date().toISOString() },
      { id: 'md-2', dishId: 'dish-paneer-butter-masala', sortOrder: 2, isFeatured: false, addedAt: new Date().toISOString() },
      { id: 'md-3', dishId: 'dish-jeera-rice', sortOrder: 3, isFeatured: false, addedAt: new Date().toISOString() },
      { id: 'md-4', dishId: 'dish-roti', sortOrder: 4, isFeatured: false, addedAt: new Date().toISOString() },
      { id: 'md-5', dishId: 'dish-green-salad', sortOrder: 5, isFeatured: false, addedAt: new Date().toISOString() },
    ],
    lastUpdated: new Date().toISOString(),
  },
  // Today's dinner for Jaipur Central Kitchen
  [`city-jaipur__kitchen-jaipur-central__${formatDateForKey(new Date())}__DINNER`]: {
    menuDishes: [
      { id: 'md-6', dishId: 'dish-butter-chicken', sortOrder: 1, isFeatured: true, addedAt: new Date().toISOString() },
      { id: 'md-7', dishId: 'dish-dal-makhani', sortOrder: 2, isFeatured: false, addedAt: new Date().toISOString() },
      { id: 'md-8', dishId: 'dish-veg-pulao', sortOrder: 3, isFeatured: false, addedAt: new Date().toISOString() },
      { id: 'md-9', dishId: 'dish-naan', sortOrder: 4, isFeatured: false, addedAt: new Date().toISOString() },
      { id: 'md-10', dishId: 'dish-raita', sortOrder: 5, isFeatured: false, addedAt: new Date().toISOString() },
      { id: 'md-11', dishId: 'dish-gulab-jamun', sortOrder: 6, isFeatured: false, addedAt: new Date().toISOString() },
    ],
    lastUpdated: new Date().toISOString(),
  },
};

// Helper to get kitchens for a city
export const getKitchensForCity = (cityId: string): Kitchen[] => {
  return mockKitchens.filter((k) => k.cityId === cityId);
};

// Helper to get dish by ID
export const getDishById = (dishId: string): Dish | undefined => {
  return mockDishCatalog.find((d) => d.id === dishId);
};

// Helper to get dishes by category
export const getDishesByCategory = (category: string): Dish[] => {
  return mockDishCatalog.filter((d) => d.category === category);
};

// Get unique categories
export const getDishCategories = (): string[] => {
  const categories = new Set(mockDishCatalog.map((d) => d.category).filter(Boolean));
  return Array.from(categories) as string[];
};
