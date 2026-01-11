/**
 * Subscription Plans API Service
 *
 * Handles all API calls related to subscription plans and customer subscriptions
 */

import { apiService } from './api.enhanced.service';
import {
  SubscriptionPlan,
  PlanListResponse,
  CreatePlanRequest,
  UpdatePlanRequest,
  PlanFilters,
  Subscription,
  SubscriptionListResponse,
  SubscriptionDetail,
  SubscriptionFilters,
  CancelSubscriptionRequest,
} from '../types/subscription.types';

// ============================================================================
// Plan Management
// ============================================================================

/**
 * Get all subscription plans with filters
 */
export const getPlans = async (filters?: PlanFilters): Promise<PlanListResponse> => {
  const queryParams = new URLSearchParams();

  if (filters?.status) {
    queryParams.append('status', filters.status);
  }
  if (filters?.page) {
    queryParams.append('page', filters.page.toString());
  }
  if (filters?.limit) {
    queryParams.append('limit', filters.limit.toString());
  }

  const queryString = queryParams.toString();
  const endpoint = `/api/subscriptions/plans${queryString ? `?${queryString}` : ''}`;

  const response = await apiService.get<{ plans: SubscriptionPlan[]; pagination: any }>(endpoint);
  return response.data;
};

/**
 * Get single plan by ID
 */
export const getPlanById = async (planId: string): Promise<SubscriptionPlan> => {
  const response = await apiService.get<{ plan: SubscriptionPlan }>(`/api/subscriptions/plans/${planId}`);
  return response.data.plan;
};

/**
 * Create new subscription plan
 */
export const createPlan = async (planData: CreatePlanRequest): Promise<SubscriptionPlan> => {
  const response = await apiService.post<{ plan: SubscriptionPlan }>('/api/subscriptions/plans', planData);
  return response.data.plan;
};

/**
 * Update existing plan
 */
export const updatePlan = async (planId: string, planData: UpdatePlanRequest): Promise<SubscriptionPlan> => {
  const response = await apiService.put<{ plan: SubscriptionPlan }>(`/api/subscriptions/plans/${planId}`, planData);
  return response.data.plan;
};

/**
 * Activate plan
 */
export const activatePlan = async (planId: string): Promise<SubscriptionPlan> => {
  const response = await apiService.patch<{ plan: SubscriptionPlan }>(`/api/subscriptions/plans/${planId}/activate`);
  return response.data.plan;
};

/**
 * Deactivate plan
 */
export const deactivatePlan = async (planId: string): Promise<SubscriptionPlan> => {
  const response = await apiService.patch<{ plan: SubscriptionPlan }>(`/api/subscriptions/plans/${planId}/deactivate`);
  return response.data.plan;
};

/**
 * Archive plan (permanent)
 */
export const archivePlan = async (planId: string): Promise<SubscriptionPlan> => {
  const response = await apiService.patch<{ plan: SubscriptionPlan }>(`/api/subscriptions/plans/${planId}/archive`);
  return response.data.plan;
};

/**
 * Get active plans (public-facing)
 */
export const getActivePlans = async (zoneId?: string): Promise<SubscriptionPlan[]> => {
  const endpoint = zoneId ? `/api/subscriptions/plans/active?zoneId=${zoneId}` : '/api/subscriptions/plans/active';
  const response = await apiService.get<{ plans: SubscriptionPlan[] }>(endpoint);
  return response.data.plans;
};

// ============================================================================
// Subscription Management (Admin)
// ============================================================================

/**
 * Get all customer subscriptions (admin)
 */
export const getAllSubscriptions = async (filters?: SubscriptionFilters): Promise<SubscriptionListResponse> => {
  const queryParams = new URLSearchParams();

  if (filters?.userId) {
    queryParams.append('userId', filters.userId);
  }
  if (filters?.planId) {
    queryParams.append('planId', filters.planId);
  }
  if (filters?.status) {
    queryParams.append('status', filters.status);
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
  const endpoint = `/api/subscriptions/admin/all${queryString ? `?${queryString}` : ''}`;

  const response = await apiService.get<{ subscriptions: Subscription[]; pagination: any }>(endpoint);
  return response.data;
};

/**
 * Get subscription by ID
 */
export const getSubscriptionById = async (subscriptionId: string): Promise<SubscriptionDetail> => {
  const response = await apiService.get<{ subscription: SubscriptionDetail }>(`/api/subscriptions/${subscriptionId}`);
  return response.data.subscription;
};

/**
 * Cancel subscription with refund options (admin)
 */
export const cancelSubscription = async (
  subscriptionId: string,
  cancelData: CancelSubscriptionRequest
): Promise<{ subscription: Subscription; refund?: any }> => {
  const response = await apiService.post<{ subscription: Subscription; refund?: any }>(
    `/api/subscriptions/${subscriptionId}/admin-cancel`,
    cancelData
  );
  return response.data;
};

// ============================================================================
// Export default service object
// ============================================================================

export const subscriptionsService = {
  // Plans
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  activatePlan,
  deactivatePlan,
  archivePlan,
  getActivePlans,

  // Subscriptions
  getAllSubscriptions,
  getSubscriptionById,
  cancelSubscription,
};
