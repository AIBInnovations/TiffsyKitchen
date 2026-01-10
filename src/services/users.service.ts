/**
 * Users/Customers Service
 *
 * Handles all API operations related to users/customers management
 * Based on API endpoint: /api/kitchen/customers
 */

import { apiService } from './api.service';
import {
  Customer,
  CustomersListResponse,
  CustomerOrdersResponse,
  CustomerVouchersResponse,
} from '../types/api.types';

export interface GetCustomersParams {
  search?: string;
  hasSubscription?: boolean;
  page?: number;
  limit?: number;
}

export interface GetCustomerOrdersParams {
  page?: number;
  limit?: number;
}

class UsersService {
  /**
   * Get list of customers with optional filters
   * GET /api/kitchen/customers
   */
  async getCustomers(params?: GetCustomersParams): Promise<CustomersListResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/kitchen/customers${queryString ? `?${queryString}` : ''}`;

    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: CustomersListResponse;
    }>(endpoint);

    return response.data;
  }

  /**
   * Get single customer details by ID
   * GET /api/kitchen/customers/:id
   */
  async getCustomerById(customerId: string): Promise<Customer> {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { customer: Customer };
    }>(`/api/kitchen/customers/${customerId}`);

    return response.data.customer;
  }

  /**
   * Get customer's order history
   * GET /api/kitchen/customers/:id/orders
   */
  async getCustomerOrders(
    customerId: string,
    params?: GetCustomerOrdersParams
  ): Promise<CustomerOrdersResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/kitchen/customers/${customerId}/orders${
      queryString ? `?${queryString}` : ''
    }`;

    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: CustomerOrdersResponse;
    }>(endpoint);

    return response.data;
  }

  /**
   * Get customer's voucher history
   * GET /api/kitchen/customers/:id/vouchers
   */
  async getCustomerVouchers(customerId: string): Promise<CustomerVouchersResponse> {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: CustomerVouchersResponse;
    }>(`/api/kitchen/customers/${customerId}/vouchers`);

    return response.data;
  }

  /**
   * Search customers by name or phone
   */
  async searchCustomers(query: string): Promise<Customer[]> {
    const response = await this.getCustomers({ search: query });
    return response.customers;
  }

  /**
   * Get customers with active subscriptions
   */
  async getCustomersWithSubscriptions(): Promise<Customer[]> {
    const response = await this.getCustomers({ hasSubscription: true });
    return response.customers;
  }

  /**
   * Get customers without subscriptions
   */
  async getCustomersWithoutSubscriptions(): Promise<Customer[]> {
    const response = await this.getCustomers({ hasSubscription: false });
    return response.customers;
  }
}

export const usersService = new UsersService();
