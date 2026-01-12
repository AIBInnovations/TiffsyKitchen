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
      message: boolean;
      data: string;
      error: OrderListResponse;
    }>(endpoint);

    // Backend returns data in 'error' field
    return response.error;
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 REQUEST START: Get Order By ID');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📍 Endpoint: /api/orders/' + orderId);
    console.log('🆔 Order ID:', orderId);
    console.log('⏰ Timestamp:', new Date().toISOString());

    try {
      const response = await apiService.get<any>(`/api/orders/${orderId}`);

      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📥 RESPONSE RECEIVED');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📦 Response Type:', typeof response);
      console.log('📦 Response Keys:', Object.keys(response));
      console.log('');
      console.log('🔍 Full Response Structure:');
      console.log(JSON.stringify(response, null, 2));
      console.log('');

      // Check all possible response structures
      // Backend quirk: actual order data is in response.error.order
      let orderData = null;

      if (response.error?.order) {
        console.log('✅ Path: response.error.order (backend quirk)');
        orderData = response.error.order;
      } else if (response.data?.order) {
        console.log('✅ Path: response.data.order');
        orderData = response.data.order;
      } else if (response.data && typeof response.data === 'object' && response.data._id) {
        console.log('✅ Path: response.data (object with _id)');
        orderData = response.data;
      } else if (response.order) {
        console.log('✅ Path: response.order');
        orderData = response.order;
      } else if (response.error && typeof response.error === 'object' && response.error._id) {
        console.log('✅ Path: response.error (object with _id)');
        orderData = response.error;
      } else {
        console.error('❌ PARSING FAILED - Could not find order data');
        console.error('Available paths:', {
          'response.data': !!response.data,
          'response.data type': typeof response.data,
          'response.order': !!response.order,
          'response.error': !!response.error,
          'response.error.order': !!response.error?.order,
          'response keys': Object.keys(response),
        });
        throw new Error('Invalid order response structure');
      }

      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📊 ORDER DATA EXTRACTED');
      console.log('═══════════════════════════════════════════════════════');
      console.log('Order Summary:');
      console.log('  - _id:', orderData._id || 'MISSING');
      console.log('  - orderNumber:', orderData.orderNumber || 'MISSING');
      console.log('  - status:', orderData.status || 'MISSING');
      console.log('  - placedAt:', orderData.placedAt || 'MISSING');
      console.log('  - menuType:', orderData.menuType || 'MISSING');
      console.log('');
      console.log('Nested Objects:');
      console.log('  - userId:', orderData.userId ? (typeof orderData.userId === 'object' ? 'Object' : orderData.userId) : 'MISSING');
      console.log('  - kitchenId:', orderData.kitchenId ? (typeof orderData.kitchenId === 'object' ? 'Object' : orderData.kitchenId) : 'MISSING');
      console.log('  - zoneId:', orderData.zoneId ? (typeof orderData.zoneId === 'object' ? 'Object' : orderData.zoneId) : 'MISSING');
      console.log('  - deliveryAddress:', orderData.deliveryAddress ? 'Object' : 'MISSING');
      console.log('');
      console.log('Arrays:');
      console.log('  - items:', Array.isArray(orderData.items) ? `${orderData.items.length} items` : 'MISSING');
      console.log('  - statusTimeline:', Array.isArray(orderData.statusTimeline) ? `${orderData.statusTimeline.length} entries` : 'MISSING');
      console.log('');
      console.log('Pricing:');
      console.log('  - subtotal:', orderData.subtotal || 0);
      console.log('  - grandTotal:', orderData.grandTotal || 0);
      console.log('  - amountPaid:', orderData.amountPaid || 0);
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ REQUEST END');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');

      return orderData;
    } catch (error: any) {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('❌ REQUEST FAILED');
      console.log('═══════════════════════════════════════════════════════');
      console.error('Error Type:', error?.name);
      console.error('Error Message:', error?.message);
      console.error('Error Stack:', error?.stack);
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
      throw error;
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(): Promise<OrderStatistics> {
    const response = await apiService.get<{
      message: boolean;
      data: string;
      error: any;
    }>('/api/orders/admin/stats');

    // Backend returns data in 'error' field with different structure
    const statsData = response.error;

    // Transform the backend response to match our OrderStatistics interface
    return {
      today: {
        total: statsData.totalOrders || 0,
        placed: statsData.byStatus?.PLACED || 0,
        accepted: statsData.byStatus?.ACCEPTED || 0,
        preparing: statsData.byStatus?.PREPARING || 0,
        ready: statsData.byStatus?.READY || 0,
        pickedUp: statsData.byStatus?.PICKED_UP || 0,
        outForDelivery: statsData.byStatus?.OUT_FOR_DELIVERY || 0,
        delivered: statsData.byStatus?.DELIVERED || 0,
        cancelled: statsData.byStatus?.CANCELLED || 0,
        rejected: statsData.byStatus?.REJECTED || 0,
      },
      byMenuType: {
        MEAL_MENU: statsData.byMenuType?.MEAL_MENU || 0,
        ON_DEMAND_MENU: statsData.byMenuType?.ON_DEMAND_MENU || 0,
      },
      byMealWindow: {
        LUNCH: statsData.byMealWindow?.LUNCH || 0,
        DINNER: statsData.byMealWindow?.DINNER || 0,
      },
      revenue: {
        today: statsData.totalRevenue || 0,
        thisWeek: 0, // Not provided by backend
        thisMonth: 0, // Not provided by backend
      },
      averageOrderValue: {
        MEAL_MENU: statsData.avgOrderValue || 0,
        ON_DEMAND_MENU: 0, // Not provided by backend
      },
    };
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
  async cancelOrder(
    orderId: string,
    data: {
      reason: string;
      issueRefund: boolean;
      restoreVouchers?: boolean;
    }
  ): Promise<{
    order: Order;
    refund?: {
      amount: number;
      status: string;
      refundId: string;
    };
    vouchersRestored?: number;
  }> {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: {
        order: Order;
        refund?: {
          amount: number;
          status: string;
          refundId: string;
        };
        vouchersRestored?: number;
      };
    }>(`/api/orders/${orderId}/admin-cancel`, data);

    return response.data;
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

  /**
   * Accept order (Kitchen)
   */
  async acceptOrder(
    orderId: string,
    estimatedPrepTime: number
  ): Promise<Order> {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: { order: Order };
    }>(`/api/orders/${orderId}/accept`, {
      estimatedPrepTime,
    });

    return response.data.order;
  }

  /**
   * Reject order (Kitchen)
   */
  async rejectOrder(
    orderId: string,
    reason: string
  ): Promise<Order> {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: { order: Order };
    }>(`/api/orders/${orderId}/reject`, {
      reason,
    });

    return response.data.order;
  }

  /**
   * Update delivery status (Driver)
   */
  async updateDeliveryStatus(
    orderId: string,
    data: {
      status: 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
      notes?: string;
      proofOfDelivery?: {
        type: 'OTP' | 'SIGNATURE' | 'PHOTO';
        value: string;
      };
    }
  ): Promise<Order> {
    const response = await apiService.patch<{
      success: boolean;
      message: string;
      data: { order: Order };
    }>(`/api/orders/${orderId}/delivery-status`, data);

    return response.data.order;
  }

  /**
   * Track order (Customer/Admin)
   */
  async trackOrder(orderId: string): Promise<{
    order: {
      _id: string;
      orderNumber: string;
      status: OrderStatus;
      statusTimeline: any[];
      estimatedDeliveryTime?: string;
      driver?: {
        _id: string;
        name: string;
        phone: string;
      };
      deliveryAddress: any;
    };
  }> {
    const response = await apiService.get<{
      success: boolean;
      data: {
        order: {
          _id: string;
          orderNumber: string;
          status: OrderStatus;
          statusTimeline: any[];
          estimatedDeliveryTime?: string;
          driver?: {
            _id: string;
            name: string;
            phone: string;
          };
          deliveryAddress: any;
        };
      };
    }>(`/api/orders/${orderId}/track`);

    return response.data;
  }
}

export const ordersService = new OrdersService();
