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

  /**
   * Get all drivers with filters
   */
  async getAllDrivers(filters?: {
    status?: string;
    approvalStatus?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<DriverListResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('role', 'DRIVER');
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.approvalStatus) queryParams.append('approvalStatus', filters.approvalStatus);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const endpoint = `/api/admin/users?${queryParams.toString()}`;
      const response = await apiService.get<any>(endpoint);

      return {
        success: response.success,
        message: response.message || 'Drivers retrieved',
        data: {
          drivers: response.data?.users || [],
          pagination: response.data?.pagination || {
            page: filters?.page || 1,
            limit: filters?.limit || 20,
            total: 0,
            pages: 0,
          },
        },
      };
    } catch (error) {
      console.error('❌ Failed to fetch drivers:', error);
      throw error;
    }
  }

  /**
   * Update driver profile
   */
  async updateDriver(
    driverId: string,
    updates: { name?: string; email?: string }
  ): Promise<DriverDetailsResponse> {
    try {
      const endpoint = `/api/admin/users/${driverId}`;
      const response = await apiService.put<DriverDetailsResponse>(endpoint, updates);
      return response;
    } catch (error) {
      console.error('❌ Failed to update driver:', error);
      throw error;
    }
  }

  /**
   * Update vehicle details
   */
  async updateVehicle(updates: {
    vehicleName?: string;
    vehicleNumber?: string;
    vehicleType?: string;
  }): Promise<any> {
    try {
      const endpoint = '/api/driver/vehicle';
      const response = await apiService.patch(endpoint, updates);
      return response;
    } catch (error) {
      console.error('❌ Failed to update vehicle:', error);
      throw error;
    }
  }

  /**
   * Activate driver
   */
  async activateDriver(driverId: string): Promise<DriverDetailsResponse> {
    try {
      const endpoint = `/api/admin/users/${driverId}/activate`;
      const response = await apiService.patch<DriverDetailsResponse>(endpoint);
      return response;
    } catch (error) {
      console.error('❌ Failed to activate driver:', error);
      throw error;
    }
  }

  /**
   * Deactivate driver
   */
  async deactivateDriver(driverId: string): Promise<DriverDetailsResponse> {
    try {
      const endpoint = `/api/admin/users/${driverId}/deactivate`;
      const response = await apiService.patch<DriverDetailsResponse>(endpoint);
      return response;
    } catch (error) {
      console.error('❌ Failed to deactivate driver:', error);
      throw error;
    }
  }

  /**
   * Suspend driver with reason
   */
  async suspendDriver(driverId: string, reason: string): Promise<DriverDetailsResponse> {
    try {
      const endpoint = `/api/admin/users/${driverId}/suspend`;
      const response = await apiService.patch<DriverDetailsResponse>(endpoint, { reason });
      return response;
    } catch (error) {
      console.error('❌ Failed to suspend driver:', error);
      throw error;
    }
  }

  /**
   * Delete driver (soft delete)
   */
  async deleteDriver(driverId: string): Promise<any> {
    try {
      const endpoint = `/api/admin/users/${driverId}`;
      const response = await apiService.delete(endpoint);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete driver:', error);
      throw error;
    }
  }

  /**
   * Get driver delivery statistics
   */
  async getDriverStats(driverId: string): Promise<{
    totalDeliveries: number;
    deliveredCount: number;
    failedCount: number;
    activeCount: number;
    successRate: string;
  }> {
    try {
      // Use delivery admin stats endpoint with driver filter
      const endpoint = `/api/delivery/admin/stats?driverId=${driverId}`;
      console.log('📊 Fetching driver stats from:', endpoint);
      const response = await apiService.get<any>(endpoint);
      console.log('📊 Driver stats response:', JSON.stringify(response, null, 2));

      const stats = response.data;

      // Extract stats from the response
      return {
        totalDeliveries: stats?.totalOrders || 0,
        deliveredCount: stats?.successfulDeliveries || 0,
        failedCount: stats?.failedDeliveries || 0,
        activeCount: 0, // Not provided by this endpoint
        successRate: stats?.successRate?.toFixed(1) || '0',
      };
    } catch (error) {
      console.error('❌ Failed to fetch driver stats:', error);
      throw error;
    }
  }

  /**
   * Get audit logs for driver
   */
  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.userId) queryParams.append('userId', filters.userId);
      if (filters?.action) queryParams.append('action', filters.action);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const endpoint = `/api/admin/audit-logs?${queryParams.toString()}`;
      const response = await apiService.get<any>(endpoint);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch audit logs:', error);
      throw error;
    }
  }
}

export const adminDriversService = new AdminDriversService();