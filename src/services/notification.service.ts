import { apiService } from './api.service';

interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: string;
  isRead: boolean;
}

class NotificationService {
  async registerDevice(token: string, platform: 'ios' | 'android'): Promise<void> {
    await apiService.post('/notifications/register', { token, platform });
  }

  async unregisterDevice(token: string): Promise<void> {
    await apiService.post('/notifications/unregister', { token });
  }

  async getNotifications(): Promise<PushNotification[]> {
    return apiService.get<PushNotification[]>('/notifications');
  }

  async markAsRead(notificationId: string): Promise<void> {
    await apiService.patch(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await apiService.post('/notifications/mark-all-read');
  }

  async getUnreadCount(): Promise<{ count: number }> {
    return apiService.get('/notifications/unread-count');
  }
}

export const notificationService = new NotificationService();
