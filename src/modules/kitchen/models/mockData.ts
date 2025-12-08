// Kitchen Management Mock Data
import {
  MealSummary,
  OrderStatusCount,
  DeliveryBatch,
  InventoryItem,
  ConsumptionEntry,
  StaffMember,
  OperationalContact,
  CapacitySettings,
  CutoffSettings,
  ServiceArea,
  PackagingStats,
  ActivityLogEntry,
} from './types';

// Today's date helpers
const today = new Date();
const formatDate = (date: Date): string => date.toISOString().split('T')[0];

// Meal summaries
export const mockMealSummaries: MealSummary[] = [
  {
    mealType: 'lunch',
    totalOrders: 324,
    vegCount: 280,
    nonVegCount: 32,
    specialCount: 12,
    steelDabbaCount: 198,
    disposableCount: 126,
    isFrozen: true,
    cutoffTime: '11:00 AM',
  },
  {
    mealType: 'dinner',
    totalOrders: 286,
    vegCount: 245,
    nonVegCount: 28,
    specialCount: 13,
    steelDabbaCount: 172,
    disposableCount: 114,
    isFrozen: false,
    cutoffTime: '7:00 PM',
  },
];

// Order status counts
export const mockOrderStatusCounts: OrderStatusCount[] = [
  { status: 'Preparing', count: 45, color: '#3b82f6' },
  { status: 'Packed', count: 78, color: '#8b5cf6' },
  { status: 'Out for delivery', count: 156, color: '#f97316' },
  { status: 'Delivered', count: 312, color: '#22c55e' },
  { status: 'Failed', count: 8, color: '#ef4444' },
];

// Delivery batches
export const mockDeliveryBatches: DeliveryBatch[] = [
  {
    id: 'BATCH-L01',
    mealType: 'lunch',
    timeSlot: '12:00 – 1:00 PM',
    orderCount: 85,
    status: 'Completed',
    riderName: 'Rahul Sharma',
    orders: [
      { orderId: 'ORD-1234', customerName: 'Amit Kumar', address: 'C-45, Malviya Nagar' },
      { orderId: 'ORD-1235', customerName: 'Priya Singh', address: 'B-12, Vaishali Nagar' },
      { orderId: 'ORD-1236', customerName: 'Rajesh Gupta', address: 'A-78, Mansarovar' },
    ],
  },
  {
    id: 'BATCH-L02',
    mealType: 'lunch',
    timeSlot: '1:00 – 2:00 PM',
    orderCount: 92,
    status: 'Dispatched',
    riderName: 'Vikram Yadav',
    orders: [
      { orderId: 'ORD-1240', customerName: 'Sunita Devi', address: 'D-23, Raja Park' },
      { orderId: 'ORD-1241', customerName: 'Mohit Verma', address: 'E-56, Jagatpura' },
    ],
  },
  {
    id: 'BATCH-L03',
    mealType: 'lunch',
    timeSlot: '2:00 – 3:00 PM',
    orderCount: 68,
    status: 'Ready for pickup',
    riderName: 'Suresh Kumar',
    orders: [
      { orderId: 'ORD-1250', customerName: 'Anita Sharma', address: 'F-89, Tonk Road' },
    ],
  },
  {
    id: 'BATCH-D01',
    mealType: 'dinner',
    timeSlot: '7:00 – 8:00 PM',
    orderCount: 95,
    status: 'Preparing',
    riderName: 'Deepak Meena',
    orders: [
      { orderId: 'ORD-1260', customerName: 'Vikas Jain', address: 'G-12, Sodala' },
      { orderId: 'ORD-1261', customerName: 'Neha Agarwal', address: 'H-34, Jhotwara' },
    ],
  },
  {
    id: 'BATCH-D02',
    mealType: 'dinner',
    timeSlot: '8:00 – 9:00 PM',
    orderCount: 88,
    status: 'Preparing',
    riderName: 'Ramesh Saini',
    orders: [
      { orderId: 'ORD-1270', customerName: 'Pooja Sharma', address: 'I-56, Pratap Nagar' },
    ],
  },
];

// Inventory items
export const mockInventoryItems: InventoryItem[] = [
  { id: 'inv-1', name: 'Rice (Basmati)', currentStock: 45, unit: 'kg', status: 'OK', daysRemaining: 5, lastUpdated: '2025-12-08 08:00 AM' },
  { id: 'inv-2', name: 'Wheat Flour', currentStock: 12, unit: 'kg', status: 'Low', daysRemaining: 2, lastUpdated: '2025-12-08 08:00 AM' },
  { id: 'inv-3', name: 'Cooking Oil', currentStock: 8, unit: 'L', status: 'Low', daysRemaining: 2, lastUpdated: '2025-12-08 07:30 AM' },
  { id: 'inv-4', name: 'Dal (Toor)', currentStock: 25, unit: 'kg', status: 'OK', daysRemaining: 6, lastUpdated: '2025-12-08 08:00 AM' },
  { id: 'inv-5', name: 'Onions', currentStock: 5, unit: 'kg', status: 'Critical', daysRemaining: 1, lastUpdated: '2025-12-08 09:00 AM' },
  { id: 'inv-6', name: 'Tomatoes', currentStock: 8, unit: 'kg', status: 'Low', daysRemaining: 2, lastUpdated: '2025-12-08 08:30 AM' },
  { id: 'inv-7', name: 'Potatoes', currentStock: 30, unit: 'kg', status: 'OK', daysRemaining: 4, lastUpdated: '2025-12-08 08:00 AM' },
  { id: 'inv-8', name: 'Green Chilies', currentStock: 2, unit: 'kg', status: 'Critical', daysRemaining: 1, lastUpdated: '2025-12-08 09:15 AM' },
  { id: 'inv-9', name: 'Ginger', currentStock: 3, unit: 'kg', status: 'OK', daysRemaining: 3, lastUpdated: '2025-12-08 08:00 AM' },
  { id: 'inv-10', name: 'Garlic', currentStock: 4, unit: 'kg', status: 'OK', daysRemaining: 4, lastUpdated: '2025-12-08 08:00 AM' },
  { id: 'inv-11', name: 'Paneer', currentStock: 3, unit: 'kg', status: 'Critical', daysRemaining: 1, lastUpdated: '2025-12-08 09:30 AM' },
  { id: 'inv-12', name: 'Curd', currentStock: 15, unit: 'kg', status: 'OK', daysRemaining: 3, lastUpdated: '2025-12-08 08:00 AM' },
];

// Daily consumption
export const mockConsumptionEntries: ConsumptionEntry[] = [
  { ingredientId: 'inv-1', ingredientName: 'Rice (Basmati)', plannedUsage: 25, actualUsage: 27, unit: 'kg', variancePercent: 8 },
  { ingredientId: 'inv-2', ingredientName: 'Wheat Flour', plannedUsage: 15, actualUsage: 14, unit: 'kg', variancePercent: -7 },
  { ingredientId: 'inv-3', ingredientName: 'Cooking Oil', plannedUsage: 8, actualUsage: 9, unit: 'L', variancePercent: 12.5 },
  { ingredientId: 'inv-4', ingredientName: 'Dal (Toor)', plannedUsage: 10, actualUsage: 10, unit: 'kg', variancePercent: 0 },
  { ingredientId: 'inv-5', ingredientName: 'Onions', plannedUsage: 12, actualUsage: 15, unit: 'kg', variancePercent: 25 },
  { ingredientId: 'inv-6', ingredientName: 'Tomatoes', plannedUsage: 8, actualUsage: 7, unit: 'kg', variancePercent: -12.5 },
  { ingredientId: 'inv-11', ingredientName: 'Paneer', plannedUsage: 6, actualUsage: 8, unit: 'kg', variancePercent: 33 },
];

// Staff members
export const mockStaffMembers: StaffMember[] = [
  { id: 'staff-1', name: 'Ramesh Choudhary', role: 'Kitchen Manager', phone: '+91 98765 43210', email: 'ramesh.c@tiffsy.com', notes: 'In charge of overall operations', isActive: true },
  { id: 'staff-2', name: 'Sunita Sharma', role: 'Head Chef', phone: '+91 98765 43211', email: 'sunita.s@tiffsy.com', notes: 'Specializes in North Indian cuisine', isActive: true },
  { id: 'staff-3', name: 'Mohan Lal', role: 'Chef', phone: '+91 98765 43212', email: 'mohan.l@tiffsy.com', notes: 'Evening shift lead', isActive: true },
  { id: 'staff-4', name: 'Geeta Devi', role: 'Prep Staff', phone: '+91 98765 43213', email: 'geeta.d@tiffsy.com', notes: 'Morning shift', isActive: true },
  { id: 'staff-5', name: 'Rakesh Kumar', role: 'Prep Staff', phone: '+91 98765 43214', email: 'rakesh.k@tiffsy.com', notes: 'Vegetable preparation specialist', isActive: true },
  { id: 'staff-6', name: 'Pinki Verma', role: 'Packaging Staff', phone: '+91 98765 43215', email: 'pinki.v@tiffsy.com', notes: 'Quality control for packaging', isActive: false },
  { id: 'staff-7', name: 'Dinesh Meena', role: 'Kitchen Helper', phone: '+91 98765 43216', email: 'dinesh.m@tiffsy.com', notes: 'General assistance', isActive: true },
];

// Operational contacts
export const mockOperationalContacts: OperationalContact[] = [
  { id: 'contact-1', type: 'phone', label: 'Kitchen Hotline', value: '+91 141 234 5678', icon: 'phone' },
  { id: 'contact-2', type: 'phone', label: 'Emergency Contact', value: '+91 98765 00000', icon: 'phone-in-talk' },
  { id: 'contact-3', type: 'email', label: 'Kitchen Support', value: 'kitchen.jaipur@tiffsy.com', icon: 'email' },
  { id: 'contact-4', type: 'whatsapp', label: 'Staff WhatsApp Group', value: 'https://chat.whatsapp.com/xyz', icon: 'chat' },
];

// Default capacity settings
export const defaultCapacitySettings: CapacitySettings = {
  maxLunchMeals: 400,
  maxDinnerMeals: 400,
  currentLunchOrders: 324,
  currentDinnerOrders: 286,
};

// Default cut-off settings
export const defaultCutoffSettings: CutoffSettings = {
  useGlobalDefaults: true,
  lunchSlot: '12:00 PM – 3:00 PM',
  lunchCutoff: '11:00 AM',
  dinnerSlot: '7:00 PM – 10:00 PM',
  dinnerCutoff: '7:00 PM',
};

// Default service areas
export const defaultServiceAreas: ServiceArea[] = [
  { id: 'area-1', name: 'Malviya Nagar', pincode: '302017' },
  { id: 'area-2', name: 'Vaishali Nagar', pincode: '302021' },
  { id: 'area-3', name: 'Mansarovar', pincode: '302020' },
  { id: 'area-4', name: 'Raja Park', pincode: '302004' },
  { id: 'area-5', name: 'Jagatpura', pincode: '302025' },
  { id: 'area-6', name: 'Tonk Road', pincode: '302015' },
  { id: 'area-7', name: 'Sodala', pincode: '302006' },
  { id: 'area-8', name: 'Jhotwara', pincode: '302012' },
  { id: 'area-9', name: 'Pratap Nagar', pincode: '302033' },
  { id: 'area-10', name: 'C-Scheme', pincode: '302001' },
];

// Default packaging stats
export const defaultPackagingStats: PackagingStats = {
  totalIssued: 1250,
  withCustomers: 892,
  expectedReturnsToday: 45,
  lostDamagedThisMonth: 12,
  allowDisposableOverride: false,
};

// Activity log entries
export const mockActivityLog: ActivityLogEntry[] = [
  { id: 'log-1', timestamp: '2025-12-08 10:45 AM', actor: 'Admin Priya', description: 'Kitchen status changed from Paused to Online', category: 'status', icon: 'power-settings-new' },
  { id: 'log-2', timestamp: '2025-12-08 10:30 AM', actor: 'Admin Rahul', description: 'Lunch cut-off extended from 11:00 AM to 11:30 AM', category: 'cutoff', icon: 'schedule' },
  { id: 'log-3', timestamp: '2025-12-08 09:15 AM', actor: 'Admin Priya', description: 'Capacity updated: Lunch 380 → 400', category: 'capacity', icon: 'trending-up' },
  { id: 'log-4', timestamp: '2025-12-08 09:00 AM', actor: 'System', description: 'Daily operations started', category: 'status', icon: 'play-circle-filled' },
  { id: 'log-5', timestamp: '2025-12-07 08:00 PM', actor: 'Admin Vikram', description: 'Staff member Pinki Verma marked as inactive', category: 'staff', icon: 'person-off' },
  { id: 'log-6', timestamp: '2025-12-07 06:30 PM', actor: 'Admin Rahul', description: 'New service area added: Pratap Nagar (302033)', category: 'settings', icon: 'add-location' },
  { id: 'log-7', timestamp: '2025-12-07 02:15 PM', actor: 'Admin Priya', description: 'Dinner capacity reduced: 450 → 400', category: 'capacity', icon: 'trending-down' },
  { id: 'log-8', timestamp: '2025-12-07 11:00 AM', actor: 'System', description: 'Lunch orders frozen at cut-off time', category: 'cutoff', icon: 'lock' },
  { id: 'log-9', timestamp: '2025-12-06 09:30 AM', actor: 'Admin Vikram', description: 'Kitchen status changed to Maintenance for equipment check', category: 'status', icon: 'build' },
  { id: 'log-10', timestamp: '2025-12-06 08:45 AM', actor: 'Admin Rahul', description: 'Disposable override enabled temporarily', category: 'settings', icon: 'settings' },
];

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
};
