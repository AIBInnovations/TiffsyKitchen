/**
 * Cron Job Management API Service
 *
 * Handles all API calls for cron job status, auto-order triggers,
 * scheduled meal promotion, and auto-order log monitoring.
 */

import { apiService } from './api.enhanced.service';
import {
  CronStatusResponse,
  CronHistoryResponse,
  AutoOrderTriggerResponse,
  PromoteScheduledMealsResponse,
  AutoCancelUnpaidResponse,
  VoucherExpiryResponse,
  AutoOrderLogsResponse,
  AutoOrderLogFilters,
  AutoOrderFailureSummaryResponse,
} from '../types/cron.types';

// ============================================================================
// Cron Status
// ============================================================================

export const getCronStatus = async (): Promise<CronStatusResponse> => {
  const response = await apiService.get<CronStatusResponse>('/api/admin/cron/status');
  return response.data;
};

export const getCronHistory = async (): Promise<CronHistoryResponse> => {
  const response = await apiService.get<CronHistoryResponse>('/api/admin/cron/history');
  return response.data;
};

// ============================================================================
// Cron Triggers
// ============================================================================

export const triggerAutoOrders = async (
  mealWindow: 'LUNCH' | 'DINNER',
  dryRun = false,
): Promise<AutoOrderTriggerResponse> => {
  const response = await apiService.post<AutoOrderTriggerResponse>(
    '/api/admin/cron/auto-orders',
    { mealWindow, dryRun },
  );
  return response.data;
};

export const triggerLunchAutoOrders = async (
  dryRun = false,
): Promise<AutoOrderTriggerResponse> => {
  const response = await apiService.post<AutoOrderTriggerResponse>(
    '/api/admin/cron/auto-orders/lunch',
    { dryRun },
  );
  return response.data;
};

export const triggerDinnerAutoOrders = async (
  dryRun = false,
): Promise<AutoOrderTriggerResponse> => {
  const response = await apiService.post<AutoOrderTriggerResponse>(
    '/api/admin/cron/auto-orders/dinner',
    { dryRun },
  );
  return response.data;
};

export const promoteScheduledMeals = async (
  mealWindow: 'LUNCH' | 'DINNER',
): Promise<PromoteScheduledMealsResponse> => {
  const response = await apiService.post<PromoteScheduledMealsResponse>(
    '/api/admin/cron/promote-scheduled-meals',
    { mealWindow },
  );
  return response.data;
};

export const autoCancelUnpaid = async (): Promise<AutoCancelUnpaidResponse> => {
  const response = await apiService.post<AutoCancelUnpaidResponse>(
    '/api/admin/cron/auto-cancel-unpaid',
  );
  return response.data;
};

export const triggerVoucherExpiry = async (): Promise<VoucherExpiryResponse> => {
  const response = await apiService.post<VoucherExpiryResponse>(
    '/api/admin/cron/voucher-expiry',
  );
  return response.data;
};

// ============================================================================
// Auto-Order Logs
// ============================================================================

export const getAutoOrderLogs = async (
  filters?: AutoOrderLogFilters,
): Promise<AutoOrderLogsResponse> => {
  const queryParams = new URLSearchParams();

  if (filters?.subscriptionId) {
    queryParams.append('subscriptionId', filters.subscriptionId);
  }
  if (filters?.userId) {
    queryParams.append('userId', filters.userId);
  }
  if (filters?.status) {
    queryParams.append('status', filters.status);
  }
  if (filters?.mealWindow) {
    queryParams.append('mealWindow', filters.mealWindow);
  }
  if (filters?.failureCategory) {
    queryParams.append('failureCategory', filters.failureCategory);
  }
  if (filters?.cronRunId) {
    queryParams.append('cronRunId', filters.cronRunId);
  }
  if (filters?.dateFrom) {
    queryParams.append('dateFrom', filters.dateFrom);
  }
  if (filters?.dateTo) {
    queryParams.append('dateTo', filters.dateTo);
  }
  if (filters?.page) {
    queryParams.append('page', filters.page.toString());
  }
  if (filters?.limit) {
    queryParams.append('limit', filters.limit.toString());
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/admin/cron/auto-order-logs${queryString ? `?${queryString}` : ''}`;

  const response = await apiService.get<AutoOrderLogsResponse>(endpoint);
  return response.data;
};

export const getAutoOrderLogsSummary = async (
  dateFrom?: string,
  dateTo?: string,
): Promise<AutoOrderFailureSummaryResponse> => {
  const queryParams = new URLSearchParams();

  if (dateFrom) {
    queryParams.append('dateFrom', dateFrom);
  }
  if (dateTo) {
    queryParams.append('dateTo', dateTo);
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/admin/cron/auto-order-logs/summary${queryString ? `?${queryString}` : ''}`;

  const response = await apiService.get<AutoOrderFailureSummaryResponse>(endpoint);
  return response.data;
};

// ============================================================================
// Grouped Export
// ============================================================================

export const cronService = {
  getCronStatus,
  getCronHistory,
  triggerAutoOrders,
  triggerLunchAutoOrders,
  triggerDinnerAutoOrders,
  promoteScheduledMeals,
  autoCancelUnpaid,
  triggerVoucherExpiry,
  getAutoOrderLogs,
  getAutoOrderLogsSummary,
};
