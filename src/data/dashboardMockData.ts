import {
  KpiMetric,
  OrderStatusFunnelItem,
  MealSlotSnapshot,
  ChartData,
  Plan,
  ActivityItem,
  DashboardData,
} from '../types/dashboard';

// KPI Metrics Mock Data
export const mockKpiMetrics: KpiMetric[] = [
  {
    id: 'total-meals',
    label: 'Total Meals Today',
    value: 248,
    changePercent: 12,
    changeDirection: 'up',
    icon: 'restaurant',
    color: '#f97316',
  },
  {
    id: 'active-orders',
    label: 'Active Orders',
    value: 45,
    changePercent: 8,
    changeDirection: 'up',
    icon: 'shopping-cart',
    color: '#3b82f6',
  },
  {
    id: 'revenue',
    label: 'Revenue Today',
    value: 15680,
    prefix: '₹',
    changePercent: 5,
    changeDirection: 'up',
    icon: 'attach-money',
    color: '#22c55e',
  },
  {
    id: 'active-subscriptions',
    label: 'Active Subscriptions',
    value: 128,
    changePercent: 3,
    changeDirection: 'down',
    icon: 'card-membership',
    color: '#8b5cf6',
  },
];

// Order Status Funnel Mock Data
export const mockOrderStatusFunnel: OrderStatusFunnelItem[] = [
  {
    status: 'ordered',
    label: 'Ordered',
    count: 45,
    color: '#6366f1',
    icon: 'receipt',
  },
  {
    status: 'preparing',
    label: 'Preparing',
    count: 32,
    color: '#f97316',
    icon: 'restaurant',
  },
  {
    status: 'packed',
    label: 'Packed',
    count: 28,
    color: '#eab308',
    icon: 'inventory-2',
  },
  {
    status: 'out_for_delivery',
    label: 'Out for Delivery',
    count: 18,
    color: '#3b82f6',
    icon: 'local-shipping',
  },
  {
    status: 'delivered',
    label: 'Delivered',
    count: 125,
    color: '#22c55e',
    icon: 'check-circle',
  },
  {
    status: 'failed',
    label: 'Failed',
    count: 3,
    color: '#ef4444',
    icon: 'cancel',
  },
];

// Meal Slot Snapshots Mock Data
export const mockMealSlots: MealSlotSnapshot[] = [
  {
    mealType: 'lunch',
    totalOrders: 145,
    preparing: 20,
    packed: 15,
    delivered: 98,
    pending: 12,
  },
  {
    mealType: 'dinner',
    totalOrders: 103,
    preparing: 12,
    packed: 13,
    delivered: 27,
    pending: 51,
  },
];

// Chart Data Mock (7-day revenue/meals trend)
export const mockChartData: ChartData = {
  title: '7-Day Trend',
  primaryLabel: 'Revenue (₹)',
  secondaryLabel: 'Meals',
  primaryColor: '#f97316',
  secondaryColor: '#3b82f6',
  points: [
    { date: '2024-12-02', label: 'Mon', value: 12500, secondaryValue: 198 },
    { date: '2024-12-03', label: 'Tue', value: 14200, secondaryValue: 215 },
    { date: '2024-12-04', label: 'Wed', value: 13800, secondaryValue: 208 },
    { date: '2024-12-05', label: 'Thu', value: 15100, secondaryValue: 232 },
    { date: '2024-12-06', label: 'Fri', value: 16800, secondaryValue: 256 },
    { date: '2024-12-07', label: 'Sat', value: 18500, secondaryValue: 278 },
    { date: '2024-12-08', label: 'Sun', value: 15680, secondaryValue: 248 },
  ],
};

// Plan Summary Mock Data
export const mockPlanSummary: Plan[] = [
  {
    id: 'basic-weekly',
    name: 'Basic Weekly',
    description: '1 meal per day for 7 days',
    price: 999,
    duration: 'weekly',
    mealsPerDay: 1,
    activeSubscribers: 45,
    totalRevenue: 44955,
  },
  {
    id: 'standard-weekly',
    name: 'Standard Weekly',
    description: '2 meals per day for 7 days',
    price: 1799,
    duration: 'weekly',
    mealsPerDay: 2,
    activeSubscribers: 38,
    totalRevenue: 68362,
  },
  {
    id: 'premium-monthly',
    name: 'Premium Monthly',
    description: '2 meals per day for 30 days',
    price: 5999,
    duration: 'monthly',
    mealsPerDay: 2,
    activeSubscribers: 28,
    totalRevenue: 167972,
  },
  {
    id: 'family-monthly',
    name: 'Family Monthly',
    description: '3 meals per day for 30 days',
    price: 8999,
    duration: 'monthly',
    mealsPerDay: 3,
    activeSubscribers: 17,
    totalRevenue: 152983,
  },
];

// Recent Activity Mock Data
export const mockRecentActivity: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'order',
    title: 'New Order Received',
    description: 'Order #1234 from Rahul Sharma - Lunch (2 items)',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    icon: 'shopping-cart',
    color: '#3b82f6',
  },
  {
    id: 'act-2',
    type: 'delivery',
    title: 'Order Delivered',
    description: 'Order #1228 delivered to Priya Patel',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    icon: 'check-circle',
    color: '#22c55e',
  },
  {
    id: 'act-3',
    type: 'subscription',
    title: 'New Subscription',
    description: 'Amit Kumar subscribed to Premium Monthly plan',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    icon: 'card-membership',
    color: '#8b5cf6',
  },
  {
    id: 'act-4',
    type: 'order',
    title: 'Order Preparing',
    description: 'Order #1232 started preparation',
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
    icon: 'restaurant',
    color: '#f97316',
  },
  {
    id: 'act-5',
    type: 'user',
    title: 'New User Registration',
    description: 'Sneha Gupta registered as a new customer',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    icon: 'person-add',
    color: '#06b6d4',
  },
  {
    id: 'act-6',
    type: 'delivery',
    title: 'Out for Delivery',
    description: 'Order #1230 picked up by driver Vikram',
    timestamp: new Date(Date.now() - 55 * 60 * 1000),
    icon: 'local-shipping',
    color: '#3b82f6',
  },
  {
    id: 'act-7',
    type: 'system',
    title: 'Low Stock Alert',
    description: 'Paneer stock running low - only 5 kg remaining',
    timestamp: new Date(Date.now() - 70 * 60 * 1000),
    icon: 'warning',
    color: '#eab308',
  },
];

// Combined Dashboard Data
export const mockDashboardData: DashboardData = {
  kpis: mockKpiMetrics,
  orderStatusFunnel: mockOrderStatusFunnel,
  mealSlots: mockMealSlots,
  chartData: mockChartData,
  planSummary: mockPlanSummary,
  recentActivity: mockRecentActivity,
};

// Helper function to format time ago
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};
