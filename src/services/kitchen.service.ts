import { apiService } from './api.enhanced.service';
import {
  Kitchen,
  KitchenListResponse,
  KitchenDetailsResponse,
  KitchenStatus,
  KitchenType,
  ApiResponse,
  Address,
  OperatingHours,
} from '../types/api.types';

/**
 * Kitchen Service
 * Handles all kitchen management API calls
 */

export interface GetKitchensParams {
  type?: KitchenType;
  status?: KitchenStatus;
  zoneId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateKitchenRequest {
  name: string;
  type: KitchenType;
  authorizedFlag?: boolean;
  premiumFlag?: boolean;
  gourmetFlag?: boolean;
  logo?: string;
  coverImage?: string;
  description?: string;
  cuisineTypes: string[];
  address: Address;
  zonesServed: string[];
  operatingHours: OperatingHours;
  contactPhone?: string;
  contactEmail?: string;
  ownerName?: string;
  ownerPhone?: string;
}

export interface UpdateKitchenRequest {
  name?: string;
  description?: string;
  cuisineTypes?: string[];
  operatingHours?: OperatingHours;
  contactPhone?: string;
  contactEmail?: string;
  logo?: string;
  coverImage?: string;
}

export interface UpdateFlagsRequest {
  authorizedFlag?: boolean;
  premiumFlag?: boolean;
  gourmetFlag?: boolean;
}

export interface UpdateZonesRequest {
  zonesServed: string[];
}

export interface SuspendKitchenRequest {
  reason: string;
}

export interface ToggleOrdersRequest {
  isAcceptingOrders: boolean;
}

class KitchenService {
  /**
   * Get all kitchens with optional filters
   */
  async getKitchens(params?: GetKitchensParams): Promise<KitchenListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.zoneId) queryParams.append('zoneId', params.zoneId);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const endpoint = `/api/kitchens${queryString ? `?${queryString}` : ''}`;

      const response = await apiService.get<ApiResponse<KitchenListResponse>>(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching kitchens:', error);
      throw error;
    }
  }

  /**
   * Get kitchen by ID
   */
  async getKitchenById(kitchenId: string): Promise<KitchenDetailsResponse> {
    try {
      const response = await apiService.get<ApiResponse<KitchenDetailsResponse>>(
        `/api/kitchens/${kitchenId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching kitchen:', error);
      throw error;
    }
  }

  /**
   * Create a new kitchen
   */
  async createKitchen(data: CreateKitchenRequest): Promise<Kitchen> {
    try {
      const response = await apiService.post<ApiResponse<{ kitchen: Kitchen }>>(
        '/api/kitchens',
        data
      );
      return response.data.kitchen;
    } catch (error) {
      console.error('Error creating kitchen:', error);
      throw error;
    }
  }

  /**
   * Update kitchen details
   */
  async updateKitchen(kitchenId: string, data: UpdateKitchenRequest): Promise<Kitchen> {
    try {
      const response = await apiService.put<ApiResponse<{ kitchen: Kitchen }>>(
        `/api/kitchens/${kitchenId}`,
        data
      );
      return response.data.kitchen;
    } catch (error) {
      console.error('Error updating kitchen:', error);
      throw error;
    }
  }

  /**
   * Update kitchen type (TIFFSY/PARTNER)
   */
  async updateKitchenType(kitchenId: string, type: KitchenType): Promise<Kitchen> {
    try {
      const response = await apiService.patch<ApiResponse<{ kitchen: Kitchen }>>(
        `/api/kitchens/${kitchenId}/type`,
        { type }
      );
      return response.data.kitchen;
    } catch (error) {
      console.error('Error updating kitchen type:', error);
      throw error;
    }
  }

  /**
   * Update kitchen flags (authorized/premium/gourmet)
   */
  async updateFlags(kitchenId: string, data: UpdateFlagsRequest): Promise<Kitchen> {
    try {
      const response = await apiService.patch<ApiResponse<{ kitchen: Kitchen }>>(
        `/api/kitchens/${kitchenId}/flags`,
        data
      );
      return response.data.kitchen;
    } catch (error) {
      console.error('Error updating kitchen flags:', error);
      throw error;
    }
  }

  /**
   * Update zones served by kitchen
   */
  async updateZones(kitchenId: string, data: UpdateZonesRequest): Promise<Kitchen> {
    try {
      const response = await apiService.patch<ApiResponse<{ kitchen: Kitchen }>>(
        `/api/kitchens/${kitchenId}/zones`,
        data
      );
      return response.data.kitchen;
    } catch (error) {
      console.error('Error updating kitchen zones:', error);
      throw error;
    }
  }

  /**
   * Activate kitchen
   */
  async activateKitchen(kitchenId: string): Promise<Kitchen> {
    try {
      const response = await apiService.patch<ApiResponse<{ kitchen: Kitchen }>>(
        `/api/kitchens/${kitchenId}/activate`
      );
      return response.data.kitchen;
    } catch (error) {
      console.error('Error activating kitchen:', error);
      throw error;
    }
  }

  /**
   * Deactivate kitchen
   */
  async deactivateKitchen(kitchenId: string): Promise<Kitchen> {
    try {
      const response = await apiService.patch<ApiResponse<{ kitchen: Kitchen }>>(
        `/api/kitchens/${kitchenId}/deactivate`
      );
      return response.data.kitchen;
    } catch (error) {
      console.error('Error deactivating kitchen:', error);
      throw error;
    }
  }

  /**
   * Suspend kitchen with reason
   */
  async suspendKitchen(kitchenId: string, data: SuspendKitchenRequest): Promise<Kitchen> {
    try {
      const response = await apiService.patch<ApiResponse<{ kitchen: Kitchen }>>(
        `/api/kitchens/${kitchenId}/suspend`,
        data
      );
      return response.data.kitchen;
    } catch (error) {
      console.error('Error suspending kitchen:', error);
      throw error;
    }
  }

  /**
   * Toggle order acceptance
   */
  async toggleAcceptingOrders(kitchenId: string, isAcceptingOrders: boolean): Promise<Kitchen> {
    try {
      const response = await apiService.patch<ApiResponse<{ kitchen: Kitchen }>>(
        `/api/kitchens/${kitchenId}/accepting-orders`,
        { isAcceptingOrders }
      );
      return response.data.kitchen;
    } catch (error) {
      console.error('Error toggling order acceptance:', error);
      throw error;
    }
  }

  /**
   * Delete kitchen (soft delete)
   */
  async deleteKitchen(kitchenId: string): Promise<void> {
    try {
      await apiService.delete(`/api/kitchens/${kitchenId}`);
    } catch (error) {
      console.error('Error deleting kitchen:', error);
      throw error;
    }
  }

  /**
   * Get kitchens for a specific zone (public endpoint)
   */
  async getKitchensForZone(zoneId: string, menuType?: 'MEAL_MENU' | 'ON_DEMAND_MENU'): Promise<Kitchen[]> {
    try {
      const queryParams = menuType ? `?menuType=${menuType}` : '';
      const response = await apiService.get<ApiResponse<{ kitchens: Kitchen[] }>>(
        `/api/kitchens/zone/${zoneId}${queryParams}`
      );
      return response.data.kitchens;
    } catch (error) {
      console.error('Error fetching kitchens for zone:', error);
      throw error;
    }
  }

  /**
   * Helper: Get active kitchens only
   */
  async getActiveKitchens(params?: Omit<GetKitchensParams, 'status'>): Promise<KitchenListResponse> {
    return this.getKitchens({ ...params, status: 'ACTIVE' });
  }

  /**
   * Helper: Get TIFFSY kitchens only
   */
  async getTiffsyKitchens(params?: Omit<GetKitchensParams, 'type'>): Promise<KitchenListResponse> {
    return this.getKitchens({ ...params, type: 'TIFFSY' });
  }

  /**
   * Helper: Get PARTNER kitchens only
   */
  async getPartnerKitchens(params?: Omit<GetKitchensParams, 'type'>): Promise<KitchenListResponse> {
    return this.getKitchens({ ...params, type: 'PARTNER' });
  }
}

// Export singleton instance
const kitchenService = new KitchenService();
export default kitchenService;
