import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api.enhanced.service';

const FCM_TOKEN_KEY = 'fcm_token';
const DEVICE_ID_KEY = 'device_id';

export interface FCMTokenRegistration {
  fcmToken: string;
  deviceType: 'ANDROID' | 'IOS';
  deviceId: string;
}

export interface NotificationData {
  type?: string;
  orderId?: string;
  orderNumber?: string;
  kitchenId?: string;
  mealWindow?: string;
  screen?: string;
  [key: string]: any;
}

export interface InAppNotification {
  title: string;
  body: string;
  data?: NotificationData;
}

class FCMService {
  private unsubscribeTokenRefresh: (() => void) | null = null;
  private unsubscribeForeground: (() => void) | null = null;
  private onNotificationCallback: ((notification: InAppNotification) => void) | null = null;

  /**
   * Request notification permission (iOS)
   */
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('FCM: Notification permission granted');
      } else {
        console.log('FCM: Notification permission denied');
      }

      return enabled;
    } catch (error) {
      console.error('FCM: Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    try {
      // Check if permission is granted (iOS only)
      if (Platform.OS === 'ios') {
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
          console.log('FCM: No permission granted');
          return null;
        }
      }

      // Get FCM token
      const token = await messaging().getToken();
      console.log('FCM: Token retrieved:', token.substring(0, 20) + '...');

      // Save token locally
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);

      return token;
    } catch (error) {
      console.error('FCM: Error getting token:', error);
      return null;
    }
  }

  /**
   * Generate or retrieve device ID
   */
  async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

      if (!deviceId) {
        // Generate UUID-like device ID
        deviceId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      }

      return deviceId;
    } catch (error) {
      console.error('FCM: Error getting device ID:', error);
      return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
  }

  /**
   * Register FCM token with backend
   */
  async registerToken(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.log('FCM: No token available for registration');
        return false;
      }

      const deviceId = await this.getDeviceId();
      const deviceType = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';

      const payload: FCMTokenRegistration = {
        fcmToken: token,
        deviceType,
        deviceId,
      };

      console.log('FCM: Registering token with backend...');
      console.log('FCM: Device Type:', deviceType);

      const response = await apiService.post('/api/auth/fcm-token', payload);

      if (response.success) {
        console.log('FCM: Token registered successfully');
        return true;
      } else {
        console.error('FCM: Token registration failed:', response.message);
        return false;
      }
    } catch (error: any) {
      console.error('FCM: Error registering token');
      console.error('FCM: Error type:', typeof error);
      console.error('FCM: Error message:', error?.message);
      console.error('FCM: Error success:', error?.success);
      console.error('FCM: Error data:', error?.data);
      console.error('FCM: Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

      // Check if it's a network or endpoint issue
      if (error?.message?.includes('JSON Parse error') || error?.message?.includes('Unexpected character')) {
        console.warn('⚠️  ============================================');
        console.warn('⚠️  FCM: Backend endpoint not implemented yet');
        console.warn('⚠️  ============================================');
        console.warn('⚠️  The /api/auth/fcm-token endpoint needs to be implemented on the backend.');
        console.warn('⚠️  The app will continue to work normally for all other features.');
        console.warn('⚠️  Push notifications will work once backend is ready.');
        console.warn('⚠️  See FCM_ERROR_HANDLING_FIX.md for details.');
        console.warn('⚠️  ============================================');
      } else if (error?.message === 'Server error' || error?.success === false) {
        console.warn('⚠️  ============================================');
        console.warn('⚠️  FCM: Backend returned error:', error?.message);
        console.warn('⚠️  This is a backend issue that needs investigation');
        console.warn('⚠️  The app will continue to work for other features');
        console.warn('⚠️  ============================================');
      }

      return false;
    }
  }

  /**
   * Remove FCM token from backend
   */
  async removeToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      if (!token) {
        console.log('FCM: No token to remove');
        return true;
      }

      console.log('FCM: Removing token from backend...');

      // Use query parameter instead of body for DELETE request
      const response = await apiService.delete(`/api/auth/fcm-token?fcmToken=${encodeURIComponent(token)}`);

      if (response.success) {
        console.log('FCM: Token removed successfully from backend');
        await AsyncStorage.removeItem(FCM_TOKEN_KEY);
        return true;
      } else {
        console.warn('⚠️  FCM: Backend returned error when removing token:', response.message);
        console.warn('⚠️  FCM: This may indicate the backend endpoint has an issue');
        console.warn('⚠️  FCM: Clearing local token anyway for clean logout');

        // Clear local token even if backend fails
        await AsyncStorage.removeItem(FCM_TOKEN_KEY);
        return true; // Consider it successful locally
      }
    } catch (error: any) {
      console.error('FCM: Error removing token:', error);

      // Check for specific backend errors
      if (error?.message === 'Server error' || error?.message?.includes('Server error')) {
        console.warn('⚠️  ============================================');
        console.warn('⚠️  FCM: Backend encountered an error removing token');
        console.warn('⚠️  Backend message:', error?.message);
        console.warn('⚠️  This is a backend issue, not a frontend issue');
        console.warn('⚠️  Clearing local token for clean logout anyway');
        console.warn('⚠️  ============================================');
      } else if (error?.message?.includes('JSON Parse error') || error?.message?.includes('Unexpected character')) {
        console.warn('⚠️  ============================================');
        console.warn('⚠️  FCM: Backend endpoint may not be fully implemented');
        console.warn('⚠️  ============================================');
      }

      // Even if removal fails, clear local token
      try {
        await AsyncStorage.removeItem(FCM_TOKEN_KEY);
        console.log('FCM: Local token cleared despite backend error');
      } catch (e) {
        console.error('FCM: Failed to clear local token:', e);
      }

      return true; // Consider it successful locally since we cleared the token
    }
  }

  /**
   * Setup foreground notification listener
   */
  setupForegroundListener(callback: (notification: InAppNotification) => void): void {
    this.onNotificationCallback = callback;

    // Listen for foreground messages
    this.unsubscribeForeground = messaging().onMessage(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('FCM: Foreground notification received:', remoteMessage);

        if (remoteMessage.notification && this.onNotificationCallback) {
          const notification: InAppNotification = {
            title: remoteMessage.notification.title || 'Notification',
            body: remoteMessage.notification.body || '',
            data: remoteMessage.data as NotificationData,
          };

          this.onNotificationCallback(notification);
        }
      }
    );
  }

  /**
   * Setup background notification handler
   */
  setupBackgroundHandler(): void {
    messaging().setBackgroundMessageHandler(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('FCM: Background notification received:', remoteMessage);
        // Background notifications are handled by the system
        // You can perform background tasks here if needed
      }
    );
  }

  /**
   * Setup token refresh listener
   */
  setupTokenRefreshListener(): void {
    this.unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
      console.log('FCM: Token refreshed:', newToken.substring(0, 20) + '...');

      // Save new token locally
      await AsyncStorage.setItem(FCM_TOKEN_KEY, newToken);

      // Register new token with backend
      await this.registerToken();
    });
  }

  /**
   * Initialize FCM service
   */
  async initialize(): Promise<void> {
    try {
      console.log('FCM: Initializing service...');

      // Setup background handler (must be called at the top level)
      this.setupBackgroundHandler();

      // Setup token refresh listener
      this.setupTokenRefreshListener();

      // Register token with backend
      await this.registerToken();

      console.log('FCM: Service initialized successfully');
    } catch (error) {
      console.error('FCM: Error initializing service:', error);
    }
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    if (this.unsubscribeTokenRefresh) {
      this.unsubscribeTokenRefresh();
      this.unsubscribeTokenRefresh = null;
    }

    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
      this.unsubscribeForeground = null;
    }

    this.onNotificationCallback = null;
  }

  /**
   * Handle notification tap (when app is opened from notification)
   */
  async getInitialNotification(): Promise<FirebaseMessagingTypes.RemoteMessage | null> {
    try {
      const remoteMessage = await messaging().getInitialNotification();
      if (remoteMessage) {
        console.log('FCM: App opened from notification:', remoteMessage);
      }
      return remoteMessage;
    } catch (error) {
      console.error('FCM: Error getting initial notification:', error);
      return null;
    }
  }

  /**
   * Setup notification open listener (when app is in background)
   */
  setupNotificationOpenListener(
    callback: (notification: FirebaseMessagingTypes.RemoteMessage) => void
  ): () => void {
    return messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('FCM: Notification opened app:', remoteMessage);
      callback(remoteMessage);
    });
  }
}

export const fcmService = new FCMService();
