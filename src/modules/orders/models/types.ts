// Order Status Types
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type DeliveryStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED';

export type MealType = 'lunch' | 'dinner';

export type PackagingType = 'DISPOSABLE' | 'STEEL_DABBA';

export type SubscriptionPlan = 'BASIC_SAVER' | 'BALANCED_DAILY' | 'PREMIUM_COMBO';

export type DietaryPreference = 'VEG' | 'NON_VEG' | 'VEGAN' | 'JAIN' | 'EGGETARIAN';

// Customer/User Summary (admin-facing)
export interface UserSummary {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: DeliveryAddress;
  dietaryPreferences: DietaryPreference[];
  totalOrders: number;
  memberSince: string;
}

export interface DeliveryAddress {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Subscription & Voucher
export interface Subscription {
  id: string;
  planName: SubscriptionPlan;
  planDisplayName: string;
  startDate: string;
  endDate: string;
  totalVouchers: number;
  usedVouchers: number;
  remainingVouchers: number;
  mealType: MealType | 'both';
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CANCELLED';
}

export interface Voucher {
  id: string;
  subscriptionId: string;
  sequenceNumber: number;
  redeemedAt?: string;
  restoredAt?: string;
  status: 'AVAILABLE' | 'REDEEMED' | 'EXPIRED' | 'RESTORED';
  ruleExplanation?: string;
}

// Order Items
export interface OrderItem {
  id: string;
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  mealType: MealType;
  dietaryTags: string[];
  isAddon: boolean;
  notes?: string;
}

// Pricing Breakdown
export interface PricingBreakdown {
  itemsSubtotal: number;
  addonsTotal: number;
  packagingFee: number;
  deliveryFee: number;
  discount: number;
  discountCode?: string;
  tax: number;
  taxRate: number;
  finalTotal: number;
}

// Payment
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method: 'UPI' | 'CARD' | 'WALLET' | 'CASH' | 'NET_BANKING';
  transactionRef?: string;
  paidAt?: string;
  failureReason?: string;
}

// Refund
export interface Refund {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  reason: 'CUSTOMER_COMPLAINT' | 'PLATFORM_FAILURE' | 'DELIVERY_FAILURE' | 'QUALITY_ISSUE' | 'OTHER';
  reasonText?: string;
  refundRef?: string;
  processedAt: string;
  processedBy: string;
}

// Delivery Partner
export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'BIKE' | 'SCOOTER' | 'BICYCLE';
  vehicleNumber?: string;
  zone: string;
  rating: number;
  onTimePercentage: number;
  totalDeliveries: number;
  isOnline: boolean;
}

// Delivery Assignment
export interface DeliveryAssignment {
  id: string;
  orderId: string;
  partnerId: string;
  partner: DeliveryPartner;
  status: DeliveryStatus;
  assignedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  failureReason?: string;
  deliveryInstructions: string[];
  estimatedDeliveryTime?: string;
}

// Kitchen
export interface Kitchen {
  id: string;
  name: string;
  city: string;
  zone: string;
  address: string;
}

// Delivery Slot
export interface DeliverySlot {
  id: string;
  mealType: MealType;
  startTime: string;
  endTime: string;
  label: string;
}

// Customer Feedback
export interface CustomerFeedback {
  id: string;
  orderId: string;
  rating: number;
  tags: string[];
  comment?: string;
  createdAt: string;
}

// Support Ticket (linked)
export interface LinkedTicket {
  id: string;
  ticketNumber: string;
  title: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

// Audit Log Entry
export interface AuditLogEntry {
  id: string;
  orderId: string;
  timestamp: string;
  actor: 'SYSTEM' | 'KITCHEN' | 'ADMIN' | 'DELIVERY_PARTNER' | 'CUSTOMER';
  actorName?: string;
  action: string;
  description: string;
  previousValue?: string;
  newValue?: string;
}

// Status Timeline Step
export interface StatusTimelineStep {
  status: OrderStatus;
  label: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isPending: boolean;
  note?: string;
}

// Main Order Interface
export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;

  // Status
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];

  // Customer
  customer: UserSummary;

  // Meal & Items
  mealType: MealType;
  items: OrderItem[];
  packagingType: PackagingType;

  // Pricing
  pricing: PricingBreakdown;

  // Subscription & Voucher
  subscription?: Subscription;
  voucher?: Voucher;

  // Payment
  payment: Payment;
  refund?: Refund;

  // Delivery
  deliverySlot: DeliverySlot;
  deliveryAssignment?: DeliveryAssignment;
  deliveryAddress: DeliveryAddress;

  // Kitchen
  kitchen: Kitchen;

  // Feedback & Support
  feedback?: CustomerFeedback;
  linkedTickets: LinkedTicket[];

  // Audit
  auditLog: AuditLogEntry[];

  // Failure Info
  failureReason?: string;
  failureBanner?: string;
}

// Filter Types for Orders List
export type OrderSortOption =
  | 'newest_first'
  | 'oldest_first'
  | 'amount_high'
  | 'amount_low'
  | 'by_status';

export type DateRangeOption = 'today' | 'yesterday' | 'last_7_days' | 'custom';

export interface OrdersFilter {
  searchQuery: string;
  mealType: MealType | 'all';
  orderStatus: OrderStatus | 'all';
  paymentStatus: PaymentStatus | 'all';
  packagingType: PackagingType | 'all';
  subscriptionPlan: SubscriptionPlan | 'all';
  city: string | 'all';
  kitchen: string | 'all';
  zone: string | 'all';
  dateRange: DateRangeOption;
  customDateStart?: string;
  customDateEnd?: string;
  sortBy: OrderSortOption;
}

// Summary Stats
export interface OrdersSummaryStats {
  totalOrders: number;
  lunchOrders: number;
  dinnerOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  totalRevenue: number;
  previousPeriodOrders?: number;
  revenueChange?: number;
}
