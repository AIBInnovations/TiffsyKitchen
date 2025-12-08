// Kitchen Management Types

export type KitchenStatus = 'Online' | 'Paused' | 'Maintenance';

export type MealType = 'lunch' | 'dinner';

export type OrderStatusType = 'Preparing' | 'Packed' | 'Out for delivery' | 'Delivered' | 'Failed';

export type BatchStatus = 'Preparing' | 'Ready for pickup' | 'Dispatched' | 'Completed';

export type StockStatus = 'OK' | 'Low' | 'Critical';

export type KitchenTab = 'Overview' | 'Inventory' | 'Staff' | 'Settings' | 'Activity';

export type ActivityCategory = 'status' | 'capacity' | 'cutoff' | 'staff' | 'settings' | 'all';

// Kitchen state
export interface KitchenState {
  status: KitchenStatus;
  pauseNewOrders: boolean;
  selectedDate: string; // ISO date string
  selectedTab: KitchenTab;
}

// Meal summary for a specific meal type
export interface MealSummary {
  mealType: MealType;
  totalOrders: number;
  vegCount: number;
  nonVegCount: number;
  specialCount: number; // Jain, etc.
  steelDabbaCount: number;
  disposableCount: number;
  isFrozen: boolean;
  cutoffTime: string; // e.g., "11:00 AM"
}

// Order counts by status
export interface OrderStatusCount {
  status: OrderStatusType;
  count: number;
  color: string;
}

// Delivery batch
export interface DeliveryBatch {
  id: string;
  mealType: MealType;
  timeSlot: string;
  orderCount: number;
  status: BatchStatus;
  riderName: string;
  orders: BatchOrder[];
}

export interface BatchOrder {
  orderId: string;
  customerName: string;
  address: string;
}

// Inventory item
export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  unit: string;
  status: StockStatus;
  daysRemaining: number;
  lastUpdated: string;
}

// Daily consumption entry
export interface ConsumptionEntry {
  ingredientId: string;
  ingredientName: string;
  plannedUsage: number;
  actualUsage: number;
  unit: string;
  variancePercent: number;
}

// Staff member
export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  notes: string;
  isActive: boolean;
}

// Operational contact
export interface OperationalContact {
  id: string;
  type: 'phone' | 'email' | 'whatsapp' | 'other';
  label: string;
  value: string;
  icon: string;
}

// Capacity settings
export interface CapacitySettings {
  maxLunchMeals: number;
  maxDinnerMeals: number;
  currentLunchOrders: number;
  currentDinnerOrders: number;
}

// Cut-off settings
export interface CutoffSettings {
  useGlobalDefaults: boolean;
  lunchSlot: string;
  lunchCutoff: string;
  dinnerSlot: string;
  dinnerCutoff: string;
}

// Service area
export interface ServiceArea {
  id: string;
  name: string;
  pincode?: string;
}

// Packaging stats
export interface PackagingStats {
  totalIssued: number;
  withCustomers: number;
  expectedReturnsToday: number;
  lostDamagedThisMonth: number;
  allowDisposableOverride: boolean;
}

// Activity log entry
export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  description: string;
  category: Exclude<ActivityCategory, 'all'>;
  icon: string;
}

// Persisted kitchen settings
export interface PersistedKitchenSettings {
  lastSelectedTab: KitchenTab;
  kitchenStatus: KitchenStatus;
  capacitySettings: CapacitySettings;
  cutoffSettings: CutoffSettings;
  serviceAreas: ServiceArea[];
  packagingStats: PackagingStats;
  lastSelectedDate?: string;
}

// Theme colors
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  white: string;
  black: string;
  overlay: string;
}

// Status colors mapping
export const statusColors: Record<KitchenStatus, { bg: string; text: string }> = {
  Online: { bg: '#dcfce7', text: '#16a34a' },
  Paused: { bg: '#fef3c7', text: '#d97706' },
  Maintenance: { bg: '#fee2e2', text: '#dc2626' },
};

export const orderStatusColors: Record<OrderStatusType, string> = {
  Preparing: '#3b82f6',
  Packed: '#8b5cf6',
  'Out for delivery': '#f97316',
  Delivered: '#22c55e',
  Failed: '#ef4444',
};

export const stockStatusColors: Record<StockStatus, { bg: string; text: string }> = {
  OK: { bg: '#dcfce7', text: '#16a34a' },
  Low: { bg: '#fef3c7', text: '#d97706' },
  Critical: { bg: '#fee2e2', text: '#dc2626' },
};

export const batchStatusColors: Record<BatchStatus, { bg: string; text: string }> = {
  Preparing: { bg: '#dbeafe', text: '#2563eb' },
  'Ready for pickup': { bg: '#fef3c7', text: '#d97706' },
  Dispatched: { bg: '#fce7f3', text: '#db2777' },
  Completed: { bg: '#dcfce7', text: '#16a34a' },
};
