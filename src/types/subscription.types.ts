/**
 * Subscription and Plan Type Definitions
 *
 * Types for subscription plan management and customer subscriptions
 */

// ============================================================================
// Plan Types
// ============================================================================

export type PlanStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface CoverageRules {
  includesAddons: boolean;
  addonValuePerVoucher: number | null;
  mealTypes: ('LUNCH' | 'DINNER' | 'BOTH')[];
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  description?: string;
  durationDays: 7 | 14 | 30 | 60;
  vouchersPerDay: number; // 1-4
  voucherValidityDays: number; // Default: 90
  price: number;
  originalPrice?: number; // For showing discount
  totalVouchers: number; // Virtual: durationDays * vouchersPerDay
  coverageRules: CoverageRules;
  applicableZoneIds: string[]; // Empty = all zones
  displayOrder: number;
  badge?: string; // e.g., "BEST VALUE", "POPULAR"
  features: string[]; // Bullet points
  status: PlanStatus;
  validFrom?: string; // Sale start date
  validTill?: string; // Sale end date
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanListResponse {
  plans: SubscriptionPlan[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreatePlanRequest {
  name: string;
  description?: string;
  durationDays: 7 | 14 | 30 | 60;
  vouchersPerDay: number;
  voucherValidityDays: number;
  price: number;
  originalPrice?: number;
  coverageRules: CoverageRules;
  applicableZoneIds?: string[];
  displayOrder: number;
  badge?: string;
  features: string[];
  status?: PlanStatus;
  validFrom?: string;
  validTill?: string;
}

export interface UpdatePlanRequest extends Partial<Omit<CreatePlanRequest, 'durationDays' | 'vouchersPerDay'>> {}

// ============================================================================
// Subscription Types
// ============================================================================

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface Subscription {
  _id: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
  };
  planId: {
    _id: string;
    name: string;
    durationDays: number;
    vouchersPerDay: number;
  };
  status: SubscriptionStatus;
  purchasedAt: string;
  expiresAt: string;
  vouchersIssued: number;
  vouchersUsed: number;
  vouchersRemaining: number;
  amountPaid: number;
  paymentId?: string;
  paymentMethod?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface SubscriptionListResponse {
  subscriptions: Subscription[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface VoucherDetail {
  _id: string;
  status: 'USED' | 'AVAILABLE' | 'EXPIRED';
  usedAt?: string;
  orderId?: string;
  expiresAt: string;
}

export interface SubscriptionDetail extends Subscription {
  voucherDetails: VoucherDetail[];
}

export interface CancelSubscriptionRequest {
  reason: string;
  issueRefund: boolean;
  refundAmount?: number;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface PlanFilters {
  status?: PlanStatus;
  page?: number;
  limit?: number;
}

export interface SubscriptionFilters {
  userId?: string;
  planId?: string;
  status?: SubscriptionStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
