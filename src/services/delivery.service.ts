import { apiService } from './api.service';
import { Delivery, DeliveryStats } from '../types/delivery';

class DeliveryService {
  async getDeliveries(status?: string): Promise<Delivery[]> {
    const query = status ? `?status=${status}` : '';
    return apiService.get<Delivery[]>(`/deliveries${query}`);
  }

  async getDeliveryById(deliveryId: string): Promise<Delivery> {
    return apiService.get<Delivery>(`/deliveries/${deliveryId}`);
  }

  async getDriverDeliveries(): Promise<Delivery[]> {
    return apiService.get<Delivery[]>('/deliveries/driver');
  }

  async acceptDelivery(deliveryId: string): Promise<Delivery> {
    return apiService.post<Delivery>(`/deliveries/${deliveryId}/accept`);
  }

  async startDelivery(deliveryId: string): Promise<Delivery> {
    return apiService.post<Delivery>(`/deliveries/${deliveryId}/start`);
  }

  async completeDelivery(
    deliveryId: string,
    data: { notes?: string; proofImageUrl?: string }
  ): Promise<Delivery> {
    return apiService.post<Delivery>(`/deliveries/${deliveryId}/complete`, data);
  }

  async updateLocation(
    deliveryId: string,
    location: { latitude: number; longitude: number }
  ): Promise<void> {
    await apiService.post(`/deliveries/${deliveryId}/location`, location);
  }

  async getDeliveryStats(period?: string): Promise<DeliveryStats> {
    const query = period ? `?period=${period}` : '';
    return apiService.get<DeliveryStats>(`/deliveries/stats${query}`);
  }

  async getDriverEarnings(period?: string): Promise<{
    totalEarnings: number;
    deliveriesCount: number;
    averagePerDelivery: number;
  }> {
    const query = period ? `?period=${period}` : '';
    return apiService.get(`/deliveries/earnings${query}`);
  }

  async autoBatchOrders(data: {
    mealWindow: 'LUNCH' | 'DINNER';
    kitchenId: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      batchesCreated: number;
      batchesUpdated?: number;
      ordersProcessed: number;
      batches?: any[];
    };
    error: null;
  }> {
    return apiService.post('/api/delivery/auto-batch', data);
  }

  async dispatchBatches(data: {
    mealWindow: 'LUNCH' | 'DINNER';
    forceDispatch?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      batchesDispatched: number;
      batches?: any[];
    };
    error: null;
  }> {
    return apiService.post('/api/delivery/dispatch', data);
  }

  async getBatches(params?: {
    kitchenId?: string;
    zoneId?: string;
    status?: string;
    mealWindow?: 'LUNCH' | 'DINNER';
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      batches: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
    error: null;
  }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString());
        }
      });
    }
    return apiService.get(`/api/delivery/admin/batches?${query.toString()}`);
  }

  async getDeliveryStats(params?: {
    dateFrom?: string;
    dateTo?: string;
    zoneId?: string;
    driverId?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      totalBatches: number;
      totalOrders: number;
      successfulDeliveries: number;
      failedDeliveries: number;
      successRate: number;
      avgDeliveriesPerBatch: number;
      byZone?: Array<{
        zone: { _id: string; name: string };
        batches: number;
        orders: number;
        successful: number;
        failed: number;
        successRate: number;
      }>;
      byDriver?: Array<{
        driver: { _id: string; name: string; phone: string };
        batches: number;
        orders: number;
        successful: number;
        failed: number;
        successRate: number;
      }>;
    };
    error: null;
  }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString());
        }
      });
    }
    return apiService.get(`/api/delivery/admin/stats?${query.toString()}`);
  }
}

export const deliveryService = new DeliveryService();
