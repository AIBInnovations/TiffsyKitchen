import {
  Order,
  OrderStatus,
  PaymentStatus,
  DeliveryStatus,
  OrdersFilter,
  OrdersSummaryStats,
  StatusTimelineStep,
  DateRangeOption,
} from '../models/types';
import { colors } from '../../../theme';

// Status labels
export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  PACKED: 'Packed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Payment Pending',
  PAID: 'Paid',
  FAILED: 'Payment Failed',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partially Refunded',
};

export const deliveryStatusLabels: Record<DeliveryStatus, string> = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  RETURNED: 'Returned',
};

// Status colors
export const orderStatusColors: Record<OrderStatus, { bg: string; text: string }> = {
  PENDING: { bg: '#f3f4f6', text: '#6b7280' },
  CONFIRMED: { bg: '#dbeafe', text: '#2563eb' },
  PREPARING: { bg: '#fef3c7', text: '#d97706' },
  PACKED: { bg: '#e0e7ff', text: '#4f46e5' },
  OUT_FOR_DELIVERY: { bg: '#ffedd5', text: '#ea580c' },
  DELIVERED: { bg: '#dcfce7', text: '#16a34a' },
  FAILED: { bg: '#fee2e2', text: '#dc2626' },
  CANCELLED: { bg: '#f3f4f6', text: '#6b7280' },
  REFUNDED: { bg: '#fce7f3', text: '#db2777' },
};

export const paymentStatusColors: Record<PaymentStatus, { bg: string; text: string }> = {
  PENDING: { bg: '#fef3c7', text: '#d97706' },
  PAID: { bg: '#dcfce7', text: '#16a34a' },
  FAILED: { bg: '#fee2e2', text: '#dc2626' },
  REFUNDED: { bg: '#fce7f3', text: '#db2777' },
  PARTIALLY_REFUNDED: { bg: '#fce7f3', text: '#db2777' },
};

export const deliveryStatusColors: Record<DeliveryStatus, { bg: string; text: string }> = {
  PENDING: { bg: '#f3f4f6', text: '#6b7280' },
  ASSIGNED: { bg: '#dbeafe', text: '#2563eb' },
  PICKED_UP: { bg: '#e0e7ff', text: '#4f46e5' },
  IN_TRANSIT: { bg: '#ffedd5', text: '#ea580c' },
  DELIVERED: { bg: '#dcfce7', text: '#16a34a' },
  FAILED: { bg: '#fee2e2', text: '#dc2626' },
  RETURNED: { bg: '#f3f4f6', text: '#6b7280' },
};

// Status icons (MaterialIcons names)
export const orderStatusIcons: Record<OrderStatus, string> = {
  PENDING: 'schedule',
  CONFIRMED: 'check-circle-outline',
  PREPARING: 'restaurant',
  PACKED: 'inventory-2',
  OUT_FOR_DELIVERY: 'delivery-dining',
  DELIVERED: 'check-circle',
  FAILED: 'error',
  CANCELLED: 'cancel',
  REFUNDED: 'currency-exchange',
};

// Date filtering
export const isWithinDateRange = (orderDate: string, dateRange: DateRangeOption, customStart?: string, customEnd?: string): boolean => {
  const order = new Date(orderDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (dateRange) {
    case 'today':
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      return order >= today && order <= endOfToday;

    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      return order >= yesterday && order <= endOfYesterday;

    case 'last_7_days':
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return order >= sevenDaysAgo;

    case 'custom':
      if (customStart && customEnd) {
        const start = new Date(customStart);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        return order >= start && order <= end;
      }
      return true;

    default:
      return true;
  }
};

// Filter orders
export const filterOrders = (orders: Order[], filter: OrdersFilter): Order[] => {
  return orders.filter((order) => {
    // Search query
    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase();
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.phone.includes(query);
      if (!matchesSearch) return false;
    }

    // Date range
    if (!isWithinDateRange(order.createdAt, filter.dateRange, filter.customDateStart, filter.customDateEnd)) {
      return false;
    }

    // Meal type
    if (filter.mealType !== 'all' && order.mealType !== filter.mealType) {
      return false;
    }

    // Order status
    if (filter.orderStatus !== 'all' && order.status !== filter.orderStatus) {
      return false;
    }

    // Payment status
    if (filter.paymentStatus !== 'all' && order.payment.status !== filter.paymentStatus) {
      return false;
    }

    // Packaging type
    if (filter.packagingType !== 'all' && order.packagingType !== filter.packagingType) {
      return false;
    }

    // Subscription plan
    if (filter.subscriptionPlan !== 'all' && order.subscription?.planName !== filter.subscriptionPlan) {
      return false;
    }

    // City
    if (filter.city !== 'all' && order.kitchen.city !== filter.city) {
      return false;
    }

    // Kitchen
    if (filter.kitchen !== 'all' && order.kitchen.id !== filter.kitchen) {
      return false;
    }

    // Zone
    if (filter.zone !== 'all' && order.kitchen.zone !== filter.zone) {
      return false;
    }

    return true;
  });
};

// Sort orders
export const sortOrders = (orders: Order[], sortBy: OrdersFilter['sortBy']): Order[] => {
  const sorted = [...orders];

  switch (sortBy) {
    case 'newest_first':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    case 'oldest_first':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    case 'amount_high':
      return sorted.sort((a, b) => b.pricing.finalTotal - a.pricing.finalTotal);

    case 'amount_low':
      return sorted.sort((a, b) => a.pricing.finalTotal - b.pricing.finalTotal);

    case 'by_status':
      const statusOrder: Record<OrderStatus, number> = {
        PENDING: 0,
        CONFIRMED: 1,
        PREPARING: 2,
        PACKED: 3,
        OUT_FOR_DELIVERY: 4,
        DELIVERED: 5,
        FAILED: 6,
        CANCELLED: 7,
        REFUNDED: 8,
      };
      return sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    default:
      return sorted;
  }
};

// Calculate summary stats
export const calculateSummaryStats = (orders: Order[]): OrdersSummaryStats => {
  const stats: OrdersSummaryStats = {
    totalOrders: orders.length,
    lunchOrders: orders.filter(o => o.mealType === 'lunch').length,
    dinnerOrders: orders.filter(o => o.mealType === 'dinner').length,
    deliveredOrders: orders.filter(o => o.status === 'DELIVERED').length,
    failedOrders: orders.filter(o => o.status === 'FAILED' || o.status === 'REFUNDED').length,
    totalRevenue: orders.reduce((sum, o) => sum + o.pricing.finalTotal, 0),
  };

  return stats;
};

// Generate status timeline steps
export const generateStatusTimeline = (order: Order): StatusTimelineStep[] => {
  const baseSteps: { status: OrderStatus; label: string }[] = [
    { status: 'PENDING', label: 'Order Placed' },
    { status: 'CONFIRMED', label: 'Confirmed' },
    { status: 'PREPARING', label: 'Preparing' },
    { status: 'PACKED', label: 'Packed' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { status: 'DELIVERED', label: 'Delivered' },
  ];

  const statusHistory = order.statusHistory;
  const currentStatus = order.status;

  // Handle failed/cancelled/refunded orders
  if (['FAILED', 'CANCELLED', 'REFUNDED'].includes(currentStatus)) {
    const failedStep = baseSteps.findIndex(s =>
      s.status === 'OUT_FOR_DELIVERY' || s.status === 'DELIVERED'
    );
    if (failedStep !== -1) {
      baseSteps[failedStep] = {
        status: currentStatus,
        label: orderStatusLabels[currentStatus],
      };
      baseSteps.splice(failedStep + 1);
    }
  }

  return baseSteps.map((step) => {
    const historyEntry = statusHistory.find(h => h.status === step.status);
    const isCompleted = statusHistory.some(h => h.status === step.status);
    const isCurrent = currentStatus === step.status;
    const isPending = !isCompleted && !isCurrent;

    return {
      status: step.status,
      label: step.label,
      timestamp: historyEntry?.timestamp,
      isCompleted: isCompleted && !isCurrent,
      isCurrent,
      isPending,
      note: historyEntry?.note,
    };
  });
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format date
export const formatDate = (dateString: string, includeTime = false): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return date.toLocaleDateString('en-IN', options);
};

// Format time only
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format relative time
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(dateString);
};

// Get plan display name
export const getPlanDisplayName = (planName: string): string => {
  const names: Record<string, string> = {
    BASIC_SAVER: 'Basic Saver',
    BALANCED_DAILY: 'Balanced Daily',
    PREMIUM_COMBO: 'Premium Combo',
  };
  return names[planName] || planName;
};

// Get packaging display name
export const getPackagingDisplayName = (type: string): string => {
  return type === 'STEEL_DABBA' ? 'Steel Dabba' : 'Disposable';
};

// Check if order can be edited
export const canEditOrder = (status: OrderStatus): boolean => {
  return ['PENDING', 'CONFIRMED'].includes(status);
};

// Check if order can be cancelled
export const canCancelOrder = (status: OrderStatus): boolean => {
  return ['PENDING', 'CONFIRMED', 'PREPARING'].includes(status);
};
