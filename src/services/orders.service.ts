/**
 * Orders Service
 *
 * Handles all API operations related to orders management
 */

import { apiService } from './api.service';
import {
  Order,
  OrderListResponse,
  OrderStatistics,
  OrderStatus,
  PaginationParams,
} from '../types/api.types';

export interface GetOrdersParams extends PaginationParams {
  status?: OrderStatus;
  kitchenId?: string;
  zoneId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  menuType?: 'MEAL_MENU' | 'ON_DEMAND_MENU';
}

export interface UpdateOrderStatusParams {
  status: OrderStatus;
  notes?: string;
}

class OrdersService {
  /**
   * Get paginated list of orders with optional filters
   */
  async getOrders(params?: GetOrdersParams): Promise<OrderListResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/orders/admin/all${queryString ? `?${queryString}` : ''}`;

    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: OrderListResponse;
    }>(endpoint);

    return response.data;
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: { order: Order };
    }>(`/api/orders/admin/${orderId}`);

    return response.data.order;
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(): Promise<OrderStatistics> {
    const response = await apiService.get<{
      success: boolean;
      message: string;
      data: OrderStatistics;
    }>('/api/orders/admin/statistics');

    return response.data;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    params: UpdateOrderStatusParams
  ): Promise<Order> {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: { order: Order };
    }>(`/api/orders/admin/${orderId}/status`, params);

    return response.data.order;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: { order: Order };
    }>(`/api/orders/admin/${orderId}/cancel`, {
      cancellationReason: reason,
    });

    return response.data.order;
  }

  /**
   * Assign order to kitchen staff
   */
  async assignOrderToStaff(orderId: string, staffId: string): Promise<Order> {
    const response = await apiService.post<{
      success: boolean;
      message: string;
      data: { order: Order };
    }>(`/api/orders/admin/${orderId}/assign`, {
      staffId,
    });

    return response.data.order;
  }

  /**
   * Get orders that need action (PLACED status)
   */
  async getActionNeededOrders(params?: PaginationParams): Promise<OrderListResponse> {
    return this.getOrders({
      ...params,
      status: 'PLACED',
    });
  }

  /**
   * Get orders by kitchen
   */
  async getOrdersByKitchen(
    kitchenId: string,
    params?: PaginationParams
  ): Promise<OrderListResponse> {
    return this.getOrders({
      ...params,
      kitchenId,
    });
  }

  /**
   * Get orders by zone
   */
  async getOrdersByZone(
    zoneId: string,
    params?: PaginationParams
  ): Promise<OrderListResponse> {
    return this.getOrders({
      ...params,
      zoneId,
    });
  }

  /**
   * Get orders by user/customer
   */
  async getOrdersByUser(
    userId: string,
    params?: PaginationParams
  ): Promise<OrderListResponse> {
    return this.getOrders({
      ...params,
      userId,
    });
  }

  /**
   * Get orders for today
   */
  async getTodayOrders(params?: PaginationParams): Promise<OrderListResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getOrders({
      ...params,
      dateFrom: today.toISOString(),
      dateTo: tomorrow.toISOString(),
    });
  }

  /**
   * Search orders by order ID, user ID, or kitchen ID
   */
  async searchOrders(query: string, params?: PaginationParams): Promise<Order[]> {
    const response = await this.getOrders(params);

    if (!query) return response.orders;

    const lowercaseQuery = query.toLowerCase();
    return response.orders.filter(
      (order) =>
        order._id.toLowerCase().includes(lowercaseQuery) ||
        order.userId.toLowerCase().includes(lowercaseQuery) ||
        order.kitchenId.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export const ordersService = new OrdersService();
