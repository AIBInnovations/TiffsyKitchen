/**
 * Cron Job Management Type Definitions
 *
 * Types for cron job status, auto-order logs, and manual triggers
 */

// ============================================================================
// Cron Status Types
// ============================================================================

export interface CronJobInfo {
  schedule: string;
  cronExpression: string;
  timezone: string;
  status: string;
  description: string;
  lastRun: string | null;
  nextRun: string | null;
}

export interface CronStatusResponse {
  jobs: Record<string, CronJobInfo>;
}

export interface CronHistoryResponse {
  message: string;
  note: string;
}

// ============================================================================
// Trigger Response Types
// ============================================================================

export interface AutoOrderTriggerResponse {
  mealWindow: string;
  dryRun: boolean;
  cronRunId: string;
  processedDate: string;
  startedAt: string;
  completedAt: string;
  totalEligible: number;
  processed: number;
  ordersCreated: number;
  skipped: number;
  failed: number;
  addonPaymentPending: number;
  disabled?: boolean;
  errors: Array<{
    subscriptionId: string;
    userId: string;
    failureCategory: string;
    failureReason: string;
  }>;
}

export interface PromoteScheduledMealsResponse {
  mealWindow: string;
  processedDate: string;
  total: number;
  promoted: number;
  failed: number;
  errors: Array<{
    orderId: string;
    orderNumber: string;
    reason: string;
  }>;
}

export interface AutoCancelUnpaidResponse {
  windowMinutes: number;
  cutoffTime: string;
  found: number;
  cancelled: number;
  errors: any[];
}

export interface VoucherExpiryResponse {
  duration: string;
  stats: Record<string, any>;
}

// ============================================================================
// Auto-Order Log Types
// ============================================================================

export type AutoOrderLogStatus = 'SUCCESS' | 'SKIPPED' | 'FAILED';

export type FailureCategory =
  | 'NO_VOUCHERS'
  | 'NO_ADDRESS'
  | 'NO_ZONE'
  | 'NO_KITCHEN'
  | 'NO_MENU'
  | 'ORDER_CREATION_FAILED'
  | 'KITCHEN_NOT_SERVING_ZONE';

export interface AutoOrderLog {
  _id: string;
  userId: { _id: string; name: string; phone: string };
  subscriptionId: { _id: string; planId: string; status: string };
  orderId: { _id: string; orderNumber: string; status: string } | null;
  mealWindow: 'LUNCH' | 'DINNER';
  status: AutoOrderLogStatus;
  failureCategory?: FailureCategory;
  failureReason?: string;
  cronRunId: string;
  processedDate: string;
  createdAt: string;
}

export interface AutoOrderLogsResponse {
  logs: AutoOrderLog[];
  stats: {
    success: number;
    skipped: number;
    failed: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AutoOrderLogFilters {
  subscriptionId?: string;
  userId?: string;
  status?: AutoOrderLogStatus;
  mealWindow?: 'LUNCH' | 'DINNER';
  failureCategory?: FailureCategory;
  cronRunId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Failure Summary Types
// ============================================================================

export interface FailureSummaryCategory {
  total: number;
  LUNCH: number;
  DINNER: number;
}

export interface AutoOrderFailureSummaryResponse {
  summary: Record<string, FailureSummaryCategory>;
  overallStats: {
    success: number;
    skipped: number;
    failed: number;
    total: number;
  };
  dateRange: {
    from: string;
    to: string;
  };
}
