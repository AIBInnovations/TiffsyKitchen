// AsyncStorage Keys for the application

export const STORAGE_KEYS = {
  // Users
  USERS_DATA: '@tiffsy/users_data',
  USERS_FILTER: '@tiffsy/users_filter',
  USERS_LAST_SYNC: '@tiffsy/users_last_sync',

  // User preferences
  USER_PREFERENCES: '@tiffsy/user_preferences',

  // Auth
  AUTH_TOKEN: '@tiffsy/auth_token',
  CURRENT_USER: '@tiffsy/current_user',

  // Settings
  APP_SETTINGS: '@tiffsy/app_settings',
  NOTIFICATION_SETTINGS: '@tiffsy/notification_settings',

  // Cache
  DASHBOARD_CACHE: '@tiffsy/dashboard_cache',
  ORDERS_CACHE: '@tiffsy/orders_cache',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
