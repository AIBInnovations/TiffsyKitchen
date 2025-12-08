import { apiService } from './api.service';
import { Order } from '../types/order';

class OrderService {
  async getOrders(status?: string): Promise<Order[]> {
    const query = status ? `?status=${status}` : '';
    return apiService.get<Order[]>(`/orders${query}`);
  }

  async getOrderById(orderId: string): Promise<Order> {
    return apiService.get<Order>(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return apiService.patch<Order>(`/orders/${orderId}/status`, { status });
  }

  async assignDriver(orderId: string, driverId: string): Promise<Order> {
    return apiService.post<Order>(`/orders/${orderId}/assign-driver`, { driverId });
  }

  async getOrderStats(period?: string): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
  }> {
    const query = period ? `?period=${period}` : '';
    return apiService.get(`/orders/stats${query}`);
  }
}

export const orderService = new OrderService();
