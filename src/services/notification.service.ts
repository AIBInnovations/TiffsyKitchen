import { apiService } from './api.enhanced.service';

export interface InAppNotification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  entityType?: string | null;
  entityId?: string | null;
  deliveryStatus: string;
  isRead: boolean;
  readAt: string | null;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: InAppNotification[];
    unreadCount: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface LatestNotificationResponse {
  success: boolean;
  message: string;
  data: {
    notification: InAppNotification | null;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
  };
}

export interface MenuAnnouncementPayload {
  title: string;
  message: string;
}

export interface MenuAnnouncementResponse {
  success: boolean;
  message: string;
  data: {
    subscribersNotified: number;
    title: string;
    message: string;
  };
}

export interface KitchenReminderPayload {
  mealWindow: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  kitchenId?: string;
}

export interface KitchenReminderResponse {
  success: boolean;
  message: string;
  data: {
    kitchensNotified: number;
    mealWindow: string;
    minutesUntilCutoff: number;
    cutoffTime: string;
    details: Array<{
      kitchenId: string;
      kitchenName: string;
      orderCount: number;
      staffNotified: number;
    }>;
  };
}

export interface AdminPushPayload {
  title: string;
  body: string;
  targetType: 'ALL_CUSTOMERS' | 'ACTIVE_SUBSCRIBERS' | 'SPECIFIC_USERS' | 'ROLE';
  targetIds?: string[];
  targetRole?: 'DRIVER' | 'KITCHEN_STAFF' | 'CUSTOMER';
  data?: Record<string, any>;
}

export interface AdminPushResponse {
  success: boolean;
  message: string;
  data: {
    targetType: string;
    usersNotified: number;
    sentCount?: number;
  };
}

export interface RecipientCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export interface BroadcastNotification {
  _id: string;
  title: string;
  body: string;
  targetType: string;
  targetRole?: string;
  recipientCount: number;
  sentByName: string;
  createdAt: string;
}

export interface NotificationHistoryResponse {
  success: boolean;
  data: {
    broadcasts: BroadcastNotification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

class NotificationService {
  /**
   * Get all notifications with pagination
   */
  async getNotifications(
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<NotificationsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unreadOnly: unreadOnly.toString(),
    });

    return apiService.get<NotificationsResponse>(`/api/notifications?${params.toString()}`);
  }

  /**
   * Get latest unread notification for popup
   */
  async getLatestUnread(): Promise<LatestNotificationResponse> {
    return apiService.get<LatestNotificationResponse>('/api/notifications/latest-unread');
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return apiService.get<UnreadCountResponse>('/api/notifications/unread-count');
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    return apiService.patch(`/api/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{
    success: boolean;
    message: string;
    data: { updatedCount: number };
  }> {
    return apiService.post('/api/notifications/mark-all-read');
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    return apiService.delete(`/api/notifications/${notificationId}`);
  }

  /**
   * Send menu announcement (Kitchen Staff only)
   */
  async sendMenuAnnouncement(payload: MenuAnnouncementPayload): Promise<MenuAnnouncementResponse> {
    return apiService.post<MenuAnnouncementResponse>('/api/menu/my-kitchen/announcement', payload);
  }

  /**
   * Send kitchen batch reminder (Admin only)
   */
  async sendKitchenReminder(payload: KitchenReminderPayload): Promise<KitchenReminderResponse> {
    return apiService.post<KitchenReminderResponse>('/api/delivery/kitchen-reminder', payload);
  }

  /**
   * Send push notification (Admin only)
   */
  async sendAdminPush(payload: AdminPushPayload): Promise<AdminPushResponse> {
    return apiService.post<AdminPushResponse>('/api/admin/push-notification', payload);
  }

  /**
   * Get recipient count for a notification target (Admin only)
   */
  async getRecipientCount(
    targetType: string,
    targetRole?: string
  ): Promise<RecipientCountResponse> {
    const params = new URLSearchParams({ targetType });
    if (targetRole) {
      params.append('targetRole', targetRole);
    }
    return apiService.get<RecipientCountResponse>(
      `/api/admin/notifications/recipient-count?${params.toString()}`
    );
  }

  /**
   * Get notification broadcast history (Admin only)
   */
  async getNotificationHistory(params: {
    page?: number;
    limit?: number;
    targetType?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<NotificationHistoryResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('page', (params.page || 1).toString());
    searchParams.append('limit', (params.limit || 20).toString());
    if (params.targetType) searchParams.append('targetType', params.targetType);
    if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) searchParams.append('dateTo', params.dateTo);
    return apiService.get<NotificationHistoryResponse>(
      `/api/admin/notifications/history?${searchParams.toString()}`
    );
  }
}

export const notificationService = new NotificationService();
