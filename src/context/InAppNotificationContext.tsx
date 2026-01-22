import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  InAppNotification,
  notificationService,
  NotificationsResponse,
} from '../services/notification.service';
import { fcmService } from '../services/fcm.service';

interface InAppNotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  currentPage: number;
  popupNotification: InAppNotification | null;
  fetchNotifications: (page?: number, append?: boolean) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  showPopup: (notification: InAppNotification) => void;
  hidePopup: () => void;
  checkLatestNotification: () => Promise<void>;
}

const InAppNotificationContext = createContext<InAppNotificationContextType | undefined>(undefined);

// Flag to show backend error only once
let backendErrorShown = false;

/**
 * Helper to check if error is due to backend not being ready
 */
const isBackendNotReadyError = (error: any): boolean => {
  return (
    error?.message === 'Invalid response from server' ||
    error?.rawResponse?.includes('<!DOCTYPE html>')
  );
};

/**
 * Helper to log backend errors silently (only once)
 */
const logBackendError = (context: string) => {
  if (!backendErrorShown) {
    console.warn('╔═══════════════════════════════════════════════════════════');
    console.warn('║ ⚠️  NOTIFICATION ENDPOINTS NOT AVAILABLE');
    console.warn('╠═══════════════════════════════════════════════════════════');
    console.warn('║ The notification features are ready on the frontend,');
    console.warn('║ but the backend endpoints are not implemented yet.');
    console.warn('║');
    console.warn('║ This is EXPECTED behavior if backend is not ready.');
    console.warn('║');
    console.warn('║ The app will work normally for all other features.');
    console.warn('║ Notifications will work once backend implements the endpoints.');
    console.warn('║');
    console.warn('║ See NOTIFICATIONS_IMPLEMENTATION.md for endpoint specs.');
    console.warn('╚═══════════════════════════════════════════════════════════');
    backendErrorShown = true;
  }
};

export const InAppNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [popupNotification, setPopupNotification] = useState<InAppNotification | null>(null);

  /**
   * Fetch notifications with pagination
   */
  const fetchNotifications = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        const response: NotificationsResponse = await notificationService.getNotifications(
          page,
          20,
          false
        );

        if (response.success && response.data) {
          const newNotifications = response.data.notifications;

          if (append) {
            setNotifications((prev) => [...prev, ...newNotifications]);
          } else {
            setNotifications(newNotifications);
          }

          setUnreadCount(response.data.unreadCount);
          setCurrentPage(page);
          setHasMore(response.data.pagination.page < response.data.pagination.pages);
        }
      } catch (error: any) {
        if (isBackendNotReadyError(error)) {
          logBackendError('fetchNotifications');
          // Silently handle - backend not ready
        } else {
          console.error('Error fetching notifications:', error);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  /**
   * Refresh notifications (pull to refresh)
   */
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications(1, false);
  }, [fetchNotifications]);

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error: any) {
      if (isBackendNotReadyError(error)) {
        logBackendError('fetchUnreadCount');
        // Silently handle - backend not ready
      } else {
        console.error('Error fetching unread count:', error);
      }
    }
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const response = await notificationService.markAsRead(notificationId);
        if (response.success) {
          // Update local state
          setNotifications((prev) =>
            prev.map((notif) =>
              notif._id === notificationId ? { ...notif, isRead: true, readAt: new Date().toISOString() } : notif
            )
          );

          // Decrement unread count
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error: any) {
        if (isBackendNotReadyError(error)) {
          logBackendError('markAsRead');
          // Silently handle - backend not ready
        } else {
          console.error('Error marking notification as read:', error);
        }
      }
    },
    []
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) => ({
            ...notif,
            isRead: true,
            readAt: new Date().toISOString(),
          }))
        );

        setUnreadCount(0);
      }
    } catch (error: any) {
      if (isBackendNotReadyError(error)) {
        logBackendError('markAllAsRead');
        // Silently handle - backend not ready
      } else {
        console.error('Error marking all as read:', error);
      }
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const response = await notificationService.deleteNotification(notificationId);
        if (response.success) {
          // Update local state
          const notificationToDelete = notifications.find((n) => n._id === notificationId);
          setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));

          // Decrement unread count if notification was unread
          if (notificationToDelete && !notificationToDelete.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      } catch (error: any) {
        if (isBackendNotReadyError(error)) {
          logBackendError('deleteNotification');
          // Silently handle - backend not ready
        } else {
          console.error('Error deleting notification:', error);
        }
      }
    },
    [notifications]
  );

  /**
   * Show popup notification
   */
  const showPopup = useCallback((notification: InAppNotification) => {
    setPopupNotification(notification);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setPopupNotification(null);
    }, 5000);
  }, []);

  /**
   * Hide popup notification
   */
  const hidePopup = useCallback(() => {
    setPopupNotification(null);
  }, []);

  /**
   * Check for latest unread notification (on app open)
   */
  const checkLatestNotification = useCallback(async () => {
    try {
      const response = await notificationService.getLatestUnread();
      if (response.success && response.data.notification) {
        showPopup(response.data.notification);
      }
    } catch (error: any) {
      if (isBackendNotReadyError(error)) {
        logBackendError('checkLatestNotification');
        // Silently handle - backend not ready
      } else {
        console.error('Error checking latest notification:', error);
      }
    }
  }, [showPopup]);

  /**
   * Setup FCM foreground listener
   */
  useEffect(() => {
    // Setup foreground notification handler
    fcmService.setupForegroundListener((notification) => {
      console.log('Foreground notification received:', notification);

      // Create InAppNotification object
      const inAppNotif: InAppNotification = {
        _id: `temp-${Date.now()}`,
        userId: '',
        type: notification.data?.type || 'UNKNOWN',
        title: notification.title,
        body: notification.body,
        data: notification.data,
        entityType: null,
        entityId: null,
        deliveryStatus: 'SENT',
        isRead: false,
        readAt: null,
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Show popup
      showPopup(inAppNotif);

      // Refresh notifications and unread count
      fetchNotifications(1, false);
      fetchUnreadCount();
    });

    return () => {
      fcmService.cleanup();
    };
  }, [showPopup, fetchNotifications, fetchUnreadCount]);

  const value: InAppNotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    currentPage,
    popupNotification,
    fetchNotifications,
    refreshNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    showPopup,
    hidePopup,
    checkLatestNotification,
  };

  return (
    <InAppNotificationContext.Provider value={value}>
      {children}
    </InAppNotificationContext.Provider>
  );
};

export const useInAppNotifications = (): InAppNotificationContextType => {
  const context = useContext(InAppNotificationContext);
  if (!context) {
    throw new Error('useInAppNotifications must be used within InAppNotificationProvider');
  }
  return context;
};
