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
}

export const deliveryService = new DeliveryService();
