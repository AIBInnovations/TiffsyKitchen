export interface User {
  id: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
  isVerified: boolean;
  addresses?: UserAddress[];
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;

  // Statistics
  totalOrders?: number;
  totalSpent?: number;
  averageRating?: number;

  // Related data
  subscriptions?: SubscriptionSummary[];
  orders?: OrderSummary[];
  supportTickets?: SupportTicketSummary[];
  feedback?: FeedbackSummary[];
}

// Note: Backend uses UPPERCASE for roles (ADMIN, KITCHEN_STAFF, DRIVER, CUSTOMER)
export type UserRole = 'ADMIN' | 'KITCHEN_STAFF' | 'DRIVER' | 'CUSTOMER';

export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'PENDING' | 'UNVERIFIED';

export interface UserAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isDefault: boolean;
}

export interface Driver extends User {
  role: 'DRIVER';
  vehicleType?: string;
  vehiclePlate?: string;
  licenseNumber?: string;
  isOnline: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
  totalDeliveries: number;
  rating: number;
  earnings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface Customer extends User {
  role: 'CUSTOMER';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'paused' | 'cancelled';
}

// Subscription types
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';

export interface SubscriptionSummary {
  id: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  mealType: 'lunch' | 'dinner' | 'both';
  daysRemaining: number;
  totalMeals: number;
  deliveredMeals: number;
  amount: number;
}

// Order types
export type OrderStatus = 'PENDING' | 'PREPARING' | 'PACKED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface OrderSummary {
  id: string;
  orderNumber: string;
  date: string;
  mealType: 'lunch' | 'dinner';
  status: OrderStatus;
  amount: number;
  deliveryAddress: string;
  items?: string[];
}

// Support ticket types
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SupportTicketSummary {
  id: string;
  ticketNumber: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  category: string;
  description?: string;
}

// Feedback types
export interface FeedbackSummary {
  id: string;
  date: string;
  rating: number;
  comment: string;
  mealType: 'lunch' | 'dinner';
  orderId: string;
  response?: string;
}

// Filter types for Users screen
export type SortOption = 'name_asc' | 'name_desc' | 'date_asc' | 'date_desc' | 'orders_high' | 'orders_low';

export interface UsersFilter {
  userRoles: UserRole[];
  statuses: UserStatus[];
  sortBy: SortOption;
  searchQuery: string;
}

// Tab types for UserDetails screen
export type UserDetailTab = 'overview' | 'subscriptions' | 'orders' | 'support';
