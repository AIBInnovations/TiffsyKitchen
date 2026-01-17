/**
 * Kitchen Approval Service
 * Handles kitchen approval system API calls
 */

import { apiService } from './api.enhanced.service';
import type {
  Kitchen,
  KitchenListResponse,
  KitchenDetailsResponse,
} from '../types/api.types';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface RejectKitchenRequest {
  reason: string;
}

export interface KitchenApprovalResponse {
  success: boolean;
  message: string;
  data: {
    kitchen: Kitchen;
  };
}

export interface GetKitchensFilters {
  status?: string;
  type?: string;
  zone?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class KitchenApprovalService {
  private readonly BASE_PATH = '/api/admin/kitchens';

  /**
   * Get pending kitchen registrations
   */
  async getPendingKitchens(params?: PaginationParams): Promise<KitchenListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const endpoint = `${this.BASE_PATH}/pending${queryParams.toString() ? `?${queryParams}` : ''}`;
      console.log('🟡 Fetching pending kitchens from:', endpoint);
      const response = await apiService.get<KitchenListResponse>(endpoint);
      console.log('🟡 Pending kitchens response:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch pending kitchens:', error);
      throw error;
    }
  }

  /**
   * Get kitchen by ID
   */
  async getKitchenById(kitchenId: string): Promise<KitchenDetailsResponse> {
    try {
      const endpoint = `/api/kitchens/${kitchenId}`;
      const response = await apiService.get<KitchenDetailsResponse>(endpoint);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch kitchen details:', error);
      throw error;
    }
  }

  /**
   * Approve a pending kitchen registration
   */
  async approveKitchen(kitchenId: string): Promise<KitchenApprovalResponse> {
    try {
      const endpoint = `${this.BASE_PATH}/${kitchenId}/approve`;
      console.log('✅ Approving kitchen at:', endpoint);
      const response = await apiService.patch<KitchenApprovalResponse>(endpoint);
      console.log('✅ Approve kitchen response:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error('❌ Failed to approve kitchen:', error);
      throw error;
    }
  }

  /**
   * Reject a pending kitchen registration
   */
  async rejectKitchen(
    kitchenId: string,
    reason: string
  ): Promise<KitchenApprovalResponse> {
    try {
      const endpoint = `${this.BASE_PATH}/${kitchenId}/reject`;
      const data: RejectKitchenRequest = { reason };
      console.log('❌ Rejecting kitchen at:', endpoint, 'with reason:', reason);
      const response = await apiService.patch<KitchenApprovalResponse>(endpoint, data);
      console.log('❌ Reject kitchen response:', JSON.stringify(response, null, 2));
      return response;
    } catch (error) {
      console.error('❌ Failed to reject kitchen:', error);
      throw error;
    }
  }

  /**
   * Get all kitchens with filters
   */
  async getAllKitchens(filters?: GetKitchensFilters): Promise<KitchenListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.zone) queryParams.append('zone', filters.zone);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const endpoint = `/api/kitchens${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await apiService.get<KitchenListResponse>(endpoint);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch kitchens:', error);
      throw error;
    }
  }

  /**
   * Get statistics for dashboard
   */
  async getKitchenStatistics(): Promise<{
    pending: number;
    active: number;
    suspended: number;
    total: number;
  }> {
    try {
      // Fetch kitchens with different statuses in parallel
      const [pendingResponse, activeResponse, suspendedResponse] = await Promise.all([
        this.getAllKitchens({ status: 'PENDING_APPROVAL', limit: 100 }),
        this.getAllKitchens({ status: 'ACTIVE', limit: 100 }),
        this.getAllKitchens({ status: 'SUSPENDED', limit: 100 }),
      ]);

      const pendingCount = pendingResponse.data?.pagination?.total || 0;
      const activeCount = activeResponse.data?.pagination?.total || 0;
      const suspendedCount = suspendedResponse.data?.pagination?.total || 0;

      console.log(`📊 Kitchen Stats - Pending: ${pendingCount}, Active: ${activeCount}, Suspended: ${suspendedCount}`);

      return {
        pending: pendingCount,
        active: activeCount,
        suspended: suspendedCount,
        total: pendingCount + activeCount + suspendedCount,
      };
    } catch (error) {
      console.error('❌ Failed to fetch kitchen statistics:', error);
      return { pending: 0, active: 0, suspended: 0, total: 0 };
    }
  }

  /**
   * Activate kitchen
   */
  async activateKitchen(kitchenId: string): Promise<Kitchen> {
    try {
      const endpoint = `/api/kitchens/${kitchenId}/activate`;
      const response = await apiService.patch<{ success: boolean; data: { kitchen: Kitchen } }>(endpoint);
      return response.data.kitchen;
    } catch (error) {
      console.error('❌ Failed to activate kitchen:', error);
      throw error;
    }
  }

  /**
   * Deactivate kitchen
   */
  async deactivateKitchen(kitchenId: string): Promise<Kitchen> {
    try {
      const endpoint = `/api/kitchens/${kitchenId}/deactivate`;
      const response = await apiService.patch<{ success: boolean; data: { kitchen: Kitchen } }>(endpoint);
      return response.data.kitchen;
    } catch (error) {
      console.error('❌ Failed to deactivate kitchen:', error);
      throw error;
    }
  }

  /**
   * Suspend kitchen with reason
   */
  async suspendKitchen(kitchenId: string, reason: string): Promise<Kitchen> {
    try {
      const endpoint = `/api/kitchens/${kitchenId}/suspend`;
      const response = await apiService.patch<{ success: boolean; data: { kitchen: Kitchen } }>(endpoint, { reason });
      return response.data.kitchen;
    } catch (error) {
      console.error('❌ Failed to suspend kitchen:', error);
      throw error;
    }
  }
}

export const kitchenApprovalService = new KitchenApprovalService();
