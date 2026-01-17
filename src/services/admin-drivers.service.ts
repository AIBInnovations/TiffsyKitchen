/**
 * Admin Drivers Service
 * Handles driver approval system API calls
 */

import { apiService } from './api.service';
import type {
  Driver,
  DriverListResponse,
  DriverDetailsResponse,
  DriverApprovalResponse,
  PaginationParams,
  RejectDriverRequest,
} from '../types/driver.types';

class AdminDriversService {
  private readonly BASE_PATH = '/api/admin/drivers';

  /**
   * Get pending driver registrations
   */
  async getPendingDrivers(params?: PaginationParams): Promise<DriverListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const endpoint = `${this.BASE_PATH}/pending${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await apiService.get<DriverListResponse>(endpoint);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch pending drivers:', error);
      throw error;
    }
  }

  /**
   * Get approved drivers
   */
  async getApprovedDrivers(params?: PaginationParams): Promise<DriverListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      queryParams.append('role', 'DRIVER');
      queryParams.append('approvalStatus', 'APPROVED');

      const endpoint = `/api/admin/users?${queryParams.toString()}`;
      console.log('🟢 Fetching APPROVED drivers from:', endpoint);
      const response = await apiService.get<any>(endpoint);
      console.log('🟢 APPROVED drivers response:', JSON.stringify(response, null, 2));

      // Get users and apply client-side filtering as backup
      const allUsers = response.data?.users || [];
      const approvedDrivers = allUsers.filter(
        (user: any) => user.role === 'DRIVER' && user.approvalStatus === 'APPROVED'
      );

      console.log(`🟢 Filtered ${approvedDrivers.length} approved drivers from ${allUsers.length} total users`);

      // Transform response to match DriverListResponse structure
      return {
        success: response.success,
        message: response.message || 'Approved drivers retrieved',
        data: {
          drivers: approvedDrivers,
          pagination: response.data?.pagination || {
            page: params?.page || 1,
            limit: params?.limit || 20,
            total: approvedDrivers.length,
            pages: Math.ceil(approvedDrivers.length / (params?.limit || 20)),
          },
        },
      };
    } catch (error) {
      console.error('❌ Failed to fetch approved drivers:', error);
      throw error;
    }
  }

  /**
   * Get rejected drivers
   */
  async getRejectedDrivers(params?: PaginationParams): Promise<DriverListResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      queryParams.append('role', 'DRIVER');
      queryParams.append('approvalStatus', 'REJECTED');

      const endpoint = `/api/admin/users?${queryParams.toString()}`;
      console.log('🔴 Fetching REJECTED drivers from:', endpoint);
      const response = await apiService.get<any>(endpoint);
      console.log('🔴 REJECTED drivers response:', JSON.stringify(response, null, 2));

      // Get users and apply client-side filtering as backup
      const allUsers = response.data?.users || [];
      const rejectedDrivers = allUsers.filter(
        (user: any) => user.role === 'DRIVER' && user.approvalStatus === 'REJECTED'
      );

      console.log(`🔴 Filtered ${rejectedDrivers.length} rejected drivers from ${allUsers.length} total users`);

      // Transform response to match DriverListResponse structure
      return {
        success: response.success,
        message: response.message || 'Rejected drivers retrieved',
        data: {
          drivers: rejectedDrivers,
          pagination: response.data?.pagination || {
            page: params?.page || 1,
            limit: params?.limit || 20,
            total: rejectedDrivers.length,
            pages: Math.ceil(rejectedDrivers.length / (params?.limit || 20)),
          },
        },
      };
    } catch (error) {
      console.error('❌ Failed to fetch rejected drivers:', error);
      throw error;
    }
  }

  /**
   * Get driver by ID
   */
  async getDriverById(driverId: string): Promise<DriverDetailsResponse> {
    try {
      const endpoint = `/api/admin/users/${driverId}`;
      const response = await apiService.get<DriverDetailsResponse>(endpoint);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch driver details:', error);
      throw error;
    }
  }

  /**
   * Approve a pending driver registration
   */
  async approveDriver(driverId: string): Promise<DriverApprovalResponse> {
    try {
      const endpoint = `${this.BASE_PATH}/${driverId}/approve`;
      const response = await apiService.patch<DriverApprovalResponse>(endpoint);
      return response;
    } catch (error) {
      console.error('❌ Failed to approve driver:', error);
      throw error;
    }
  }

  /**
   * Reject a pending driver registration
   */
  async rejectDriver(
    driverId: string,
    reason: string
  ): Promise<DriverApprovalResponse> {
    try {
      const endpoint = `${this.BASE_PATH}/${driverId}/reject`;
      const data: RejectDriverRequest = { reason };
      const response = await apiService.patch<DriverApprovalResponse>(endpoint, data);
      return response;
    } catch (error) {
      console.error('❌ Failed to reject driver:', error);
      throw error;
    }
  }

  /**
   * Get statistics for dashboard
   */
  async getDriverStatistics(): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }> {
    try {
      // Fetch all drivers in parallel (backend max limit is 100)
      const [pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
        this.getPendingDrivers({ limit: 100 }),
        this.getApprovedDrivers({ limit: 100 }),
        this.getRejectedDrivers({ limit: 100 }),
      ]);

      // Use actual filtered array lengths instead of pagination totals
      const pendingCount = pendingResponse.data.drivers.length;
      const approvedCount = approvedResponse.data.drivers.length;
      const rejectedCount = rejectedResponse.data.drivers.length;

      console.log(`📊 Driver Stats - Pending: ${pendingCount}, Approved: ${approvedCount}, Rejected: ${rejectedCount}`);

      return {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        total: pendingCount + approvedCount + rejectedCount,
      };
    } catch (error) {
      console.error('❌ Failed to fetch driver statistics:', error);
      return { pending: 0, approved: 0, rejected: 0, total: 0 };
    }
  }
}

export const adminDriversService = new AdminDriversService();