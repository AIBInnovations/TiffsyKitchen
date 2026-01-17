/**
 * Address Management Service
 *
 * Handles all API operations for address management
 * Based on API endpoint: /api/address
 */

import { apiService } from './api.service';

export interface Zone {
  _id: string;
  name: string;
  city: string;
  pincode: string;
  status: string;
}

export interface UserInfo {
  _id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface Address {
  _id: string;
  userId: UserInfo;
  zoneId: Zone;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetAddressesResponse {
  addresses: Address[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class AddressService {
  /**
   * Get all addresses for a specific user (Admin endpoint)
   * GET /api/address/admin/all?userId={userId}
   */
  async getAllUserAddresses(userId: string): Promise<GetAddressesResponse> {
    const response = await apiService.get<any>(
      `/api/address/admin/all?userId=${userId}`
    );

    // Handle incorrect API response structure
    if (response.error && response.error.addresses) {
      return response.error as GetAddressesResponse;
    }

    return response.data;
  }
}

export const addressService = new AddressService();
